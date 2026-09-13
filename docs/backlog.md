# Backlog / ideas

Not scheduled into a milestone yet. Logged here so they don't get lost.

## Problem descriptions/summaries for review context

Flagged during M4 live testing: once there are a lot of problems and it's
been a while since solving one, the title alone ("Two Sum") might not be
enough to remember what the problem actually asks. Idea: let a short
description live alongside each problem, shown as an expandable/dropdown
bit of context right before starting a review session.

The schema already has a home for this: `UserProblem.originalNotes`
(optional, currently unused in any UI). Two ways to fill it in:
- Manual: a textarea on the add-problem form.
- AI-assisted: generate a short summary when the problem is added (would
  need the problem statement, e.g. pasted in or looked up).

Worth doing once the core review loop (M4/M5) is fully proven out live.

## AI question-generation loading time

`POST /api/reviews/start` took about 3.2s in the first live test (waiting
on OpenAI to generate the 3 initial questions). Not broken, just slow
enough to notice. Worth keeping the number around, could be a good
"reduced latency by X%" resume line if optimized later (parallelizing the
question-generation call differently, streaming the response, or
switching model tier).
