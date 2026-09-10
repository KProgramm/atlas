import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Cheapest current model that's good enough for question generation and
// grading short technical explanations. Swap here if quality ever isn't
// cutting it -- nothing else in the codebase should hardcode a model name.
export const CHAT_MODEL = "gpt-5.6-luna";
