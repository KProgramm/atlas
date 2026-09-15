import { prisma } from "@/lib/prisma";
import { openai, CHAT_MODEL } from "@/lib/ai";
import { applyReviewOutcome, type ReviewOutcome } from "@/services/mastery";

export type QuestionType = "pattern" | "approach" | "complexity" | "follow_up";

type ProblemInfo = {
  title: string;
  difficulty: string;
  pattern: string | null;
};

// ---- OpenAI calls -----------------------------------------------------
// Every call uses JSON mode + a hand-parsed, validated shape rather than
// trusting the model's output blindly. LLM JSON can come back malformed
// or missing fields -- these parsers throw a clear error instead of
// letting a bad response corrupt the DB or crash somewhere unrelated.

type GeneratedQuestion = { type: QuestionType; prompt: string };

function parseQuestions(raw: string | null): GeneratedQuestion[] {
  if (!raw) throw new Error("AI returned an empty response generating questions");
  const parsed = JSON.parse(raw);
  const questions = parsed.questions;
  if (!Array.isArray(questions) || questions.length !== 3) {
    throw new Error("AI did not return exactly 3 questions");
  }
  const validTypes = ["pattern", "approach", "complexity"];
  for (const q of questions) {
    if (!validTypes.includes(q.type) || typeof q.prompt !== "string" || !q.prompt.trim()) {
      throw new Error("AI returned a malformed question");
    }
  }
  return questions;
}

async function generateInitialQuestions(problem: ProblemInfo): Promise<GeneratedQuestion[]> {
  const response = await openai.chat.completions.create({
    model: CHAT_MODEL,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a technical interviewer helping someone practice explaining their solutions out loud, the way they would in a real interview. Ask short, direct questions -- one or two sentences each, no preamble.",
      },
      {
        role: "user",
        content: `The candidate just solved this problem:
Title: ${problem.title}
Difficulty: ${problem.difficulty}
Pattern: ${problem.pattern ?? "not specified"}

Write exactly 3 questions as a JSON object: {"questions": [...]}. Each item has "type" and "prompt".
- type "pattern": ask them to identify or justify the pattern/technique they used.
- type "approach": ask them to explain their approach and why they chose it over alternatives.
- type "complexity": ask them to state and justify the time/space complexity.
Return ONLY the JSON object, no other text.`,
      },
    ],
  });

  return parseQuestions(response.choices[0].message.content);
}

type GradeResult = { score: number; feedback: string };

function parseGrade(raw: string | null): GradeResult {
  if (!raw) throw new Error("AI returned an empty response grading an answer");
  const parsed = JSON.parse(raw);
  if (
    typeof parsed.score !== "number" ||
    parsed.score < 0 ||
    parsed.score > 100 ||
    typeof parsed.feedback !== "string"
  ) {
    throw new Error("AI returned a malformed grade");
  }
  return { score: parsed.score, feedback: parsed.feedback };
}

async function gradeAnswer(
  problem: ProblemInfo,
  questionPrompt: string,
  userAnswer: string
): Promise<GradeResult> {
  const response = await openai.chat.completions.create({
    model: CHAT_MODEL,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are grading a candidate's spoken-style answer in a technical interview practice session. Be encouraging but honest -- this is practice, mistakes are how they improve. Keep feedback to 2-3 sentences.",
      },
      {
        role: "user",
        content: `Problem: ${problem.title} (${problem.difficulty}${problem.pattern ? `, ${problem.pattern}` : ""})
Question asked: ${questionPrompt}
Candidate's answer: ${userAnswer}

Return ONLY a JSON object: {"score": <0-100 integer, correctness/completeness>, "feedback": "<2-3 sentences, specific and actionable>"}`,
      },
    ],
  });

  return parseGrade(response.choices[0].message.content);
}

function parseFollowUp(raw: string | null): string {
  if (!raw) throw new Error("AI returned an empty response generating the follow-up");
  const parsed = JSON.parse(raw);
  if (typeof parsed.prompt !== "string" || !parsed.prompt.trim()) {
    throw new Error("AI returned a malformed follow-up question");
  }
  return parsed.prompt;
}

async function generateFollowUp(
  problem: ProblemInfo,
  gradedQuestions: { prompt: string; userAnswer: string; score: number }[]
): Promise<string> {
  const weakest = gradedQuestions.reduce((min, q) => (q.score < min.score ? q : min));

  // The model only saw the weakest Q&A here originally, so on an easy
  // problem where every answer already covered similar ground (e.g. time
  // complexity coming up in both the approach and complexity answers) it
  // had no way to know that and would ask about it a third time. Passing
  // the full transcript plus an explicit "don't repeat" instruction fixes
  // that -- flagged during Krish's first live test on Two Sum.
  const transcript = gradedQuestions
    .map((q, i) => `Q${i + 1} (${q.score}/100): ${q.prompt}\nA${i + 1}: ${q.userAnswer}`)
    .join("\n\n");

  const response = await openai.chat.completions.create({
    model: CHAT_MODEL,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a technical interviewer asking one adaptive follow-up question based on how the candidate did so far. Never repeat ground already covered in an earlier answer -- if they already explained time/space complexity well, do not ask them to restate it.",
      },
      {
        role: "user",
        content: `Problem: ${problem.title} (${problem.difficulty})

Everything they've answered so far:
${transcript}

Their weakest answer was to: "${weakest.prompt}" (scored ${weakest.score}/100)

Write ONE follow-up question that builds on this session without repeating a topic they've already covered well. If ${weakest.score} is below 70, probe deeper on that specific weak spot in a NEW way, don't just re-ask the same question. If everything scored well, push into new territory: a variation of the problem, a tricky edge case, or a "what if the input were streamed / much larger" twist.
Return ONLY JSON: {"prompt": "<the question>"}`,
      },
    ],
  });

  return parseFollowUp(response.choices[0].message.content);
}

type CommunicationResult = { score: number };

function parseCommunication(raw: string | null): CommunicationResult {
  if (!raw) throw new Error("AI returned an empty response scoring communication");
  const parsed = JSON.parse(raw);
  if (typeof parsed.score !== "number" || parsed.score < 0 || parsed.score > 100) {
    throw new Error("AI returned a malformed communication score");
  }
  return { score: parsed.score };
}

async function scoreCommunication(
  problem: ProblemInfo,
  qa: { prompt: string; userAnswer: string }[]
): Promise<CommunicationResult> {
  const transcript = qa
    .map((q, i) => `Q${i + 1}: ${q.prompt}\nA${i + 1}: ${q.userAnswer}`)
    .join("\n\n");

  const response = await openai.chat.completions.create({
    model: CHAT_MODEL,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are scoring how clearly a candidate communicated across a full interview practice session -- not whether they were correct, just how clear, structured, and confident their explanations were.",
      },
      {
        role: "user",
        content: `Problem: ${problem.title}\n\n${transcript}\n\nReturn ONLY JSON: {"score": <0-100 integer, clarity of communication across all answers>}`,
      },
    ],
  });

  return parseCommunication(response.choices[0].message.content);
}

// ---- Session orchestration ---------------------------------------------

export async function startReviewSession(dbUserId: string, userProblemId: string) {
  const userProblem = await prisma.userProblem.findFirst({
    where: { id: userProblemId, userId: dbUserId },
    include: { problem: true },
  });
  if (!userProblem) return null;

  const questions = await generateInitialQuestions(userProblem.problem);

  return prisma.reviewSession.create({
    data: {
      userProblemId: userProblem.id,
      aiModel: CHAT_MODEL,
      promptVersion: "v1",
      questions: {
        create: questions.map((q) => ({ type: q.type, prompt: q.prompt })),
      },
    },
    include: { questions: true, userProblem: { include: { problem: true } } },
  });
}

type SubmitResult =
  | { sessionComplete: false; nextQuestion: { id: string; type: string; prompt: string } | null }
  | {
      sessionComplete: true;
      scores: {
        recognitionScore: number | null;
        approachScore: number | null;
        complexityScore: number | null;
        adaptabilityScore: number | null;
        communicationScore: number;
        overallConfidence: number;
      };
      questions: {
        type: string;
        prompt: string;
        userAnswer: string | null;
        aiScore: number | null;
        aiFeedback: string | null;
      }[];
      // Milestone 5's result, surfaced so the results screen can show it
      // directly instead of it only existing on the UserProblem row.
      mastery: ReviewOutcome;
    };

export async function submitAnswer(
  dbUserId: string,
  questionId: string,
  userAnswer: string
): Promise<SubmitResult | null> {
  const question = await prisma.question.findFirst({
    where: { id: questionId },
    include: {
      reviewSession: {
        include: {
          questions: true,
          userProblem: { include: { problem: true } },
        },
      },
    },
  });

  if (!question || question.reviewSession.userProblem.userId !== dbUserId) return null;
  if (question.reviewSession.completedAt) return null;

  const problem = question.reviewSession.userProblem.problem;
  const grade = await gradeAnswer(problem, question.prompt, userAnswer);

  await prisma.question.update({
    where: { id: question.id },
    data: { userAnswer, aiScore: grade.score, aiFeedback: grade.feedback },
  });

  const sessionId = question.reviewSession.id;

  if (question.type === "follow_up") {
    return finalizeSession(sessionId, question.reviewSession.userProblem.id, problem);
  }

  const baseQuestions = question.reviewSession.questions.filter((q) => q.type !== "follow_up");
  const allBaseAnswered = baseQuestions.every(
    (q) => q.id === question.id || q.userAnswer !== null
  );

  if (!allBaseAnswered) {
    return { sessionComplete: false, nextQuestion: null };
  }

  const graded = await prisma.question.findMany({ where: { reviewSessionId: sessionId } });
  const followUpPrompt = await generateFollowUp(
    problem,
    graded.map((q) => ({
      prompt: q.prompt,
      userAnswer: q.userAnswer ?? "",
      score: q.aiScore ?? 0,
    }))
  );
  const followUpQuestion = await prisma.question.create({
    data: { reviewSessionId: sessionId, type: "follow_up", prompt: followUpPrompt },
  });

  return {
    sessionComplete: false,
    nextQuestion: {
      id: followUpQuestion.id,
      type: followUpQuestion.type,
      prompt: followUpQuestion.prompt,
    },
  };
}

async function finalizeSession(
  sessionId: string,
  userProblemId: string,
  problem: ProblemInfo
): Promise<SubmitResult> {
  const questions = await prisma.question.findMany({ where: { reviewSessionId: sessionId } });

  const scoreFor = (type: QuestionType) =>
    questions.find((q) => q.type === type)?.aiScore ?? null;

  const recognitionScore = scoreFor("pattern");
  const approachScore = scoreFor("approach");
  const complexityScore = scoreFor("complexity");
  const adaptabilityScore = scoreFor("follow_up");

  const communication = await scoreCommunication(
    problem,
    questions.map((q) => ({ prompt: q.prompt, userAnswer: q.userAnswer ?? "" }))
  );

  const dimensionScores = [
    recognitionScore,
    approachScore,
    complexityScore,
    adaptabilityScore,
    communication.score,
  ].filter((s): s is number => s !== null);
  const overallConfidence =
    dimensionScores.reduce((sum, s) => sum + s, 0) / dimensionScores.length;

  await prisma.reviewSession.update({
    where: { id: sessionId },
    data: {
      recognitionScore,
      approachScore,
      complexityScore,
      adaptabilityScore,
      communicationScore: communication.score,
      overallConfidence,
      completedAt: new Date(),
    },
  });

  // Milestone 5: push this session's result into the UserProblem's
  // spaced-repetition state (reviewStage, masteryScore, nextReviewAt).
  const mastery = await applyReviewOutcome(userProblemId, overallConfidence);

  return {
    sessionComplete: true,
    scores: {
      recognitionScore,
      approachScore,
      complexityScore,
      adaptabilityScore,
      communicationScore: communication.score,
      overallConfidence,
    },
    questions: questions.map((q) => ({
      type: q.type,
      prompt: q.prompt,
      userAnswer: q.userAnswer,
      aiScore: q.aiScore,
      aiFeedback: q.aiFeedback,
    })),
    mastery,
  };
}
