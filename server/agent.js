import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from .env
const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-5-5";

export const SYSTEM_PROMPT = `You are the planning brain of Panda Planner, a friendly study coach.
Create a time-blocked schedule from the student's profile and assignments.
Rules:
- Never schedule work after an assignment's due date.
- Keep blocks inside the student's preferred hours (chronotype: early_bird 6-12, night_owl 17-24, neither 9-18).
- Total break time per day should match breakHours; add breaks between study blocks.
- High procrastination or startTiming=due_date: start earlier and use smaller daily chunks.
- focusStyle=single: one assignment per block. focusStyle=mixed: rotate 2-3 assignments.
- Split big or high-effort assignments over more days.
- Never move or overlap blocks in lockedBlocks. Blocks with type=fixed are calendar events (classes, meetings): keep 15 minutes clear around them and prefer the longest free gaps, at times the student is usually free.
- answers.goals is a list: honor every goal in it.
- Times are local ISO strings like 2026-10-20T19:00:00. Block types: study, break. Study blocks need assignmentId.
- Also return suggested start-by and internal-deadline dates (kind: start_by | internal_deadline, date: YYYY-MM-DD).
Return only by calling submit_plan.`;

const planTool = {
  name: "submit_plan",
  description: "Return the study plan",
  input_schema: {
    type: "object",
    properties: {
      timeBlocks: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            type: { type: "string", enum: ["study", "break"] },
            assignmentId: { type: "string" },
            title: { type: "string" },
            start: { type: "string" },
            end: { type: "string" },
          },
          required: ["type", "title", "start", "end"],
        },
      },
      suggestedDates: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            assignmentId: { type: "string" },
            kind: { type: "string", enum: ["start_by", "internal_deadline"] },
            date: { type: "string" },
          },
          required: ["assignmentId", "kind", "date"],
        },
      },
    },
    required: ["timeBlocks", "suggestedDates"],
  },
};

export async function makePlan({ user, assignments, lockedBlocks, today }) {
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    tools: [planTool],
    tool_choice: { type: "tool", name: "submit_plan" },
    messages: [{ role: "user", content: JSON.stringify({ user, assignments, lockedBlocks, today }) }],
  });
  return res.content.find((b) => b.type === "tool_use").input;
}

export async function makeEncouragement({ task, minutesElapsed }) {
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 60,
    system: "You are a cheerful panda study buddy. Reply with one short encouraging sentence (under 15 words), no quotes.",
    messages: [{ role: "user", content: `Task: ${task}. Minutes studied so far: ${minutesElapsed}.` }],
  });
  return res.content.find((b) => b.type === "text")?.text.trim();
}
