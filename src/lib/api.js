import { makePlanLocal, validatePlan } from "./scheduler.js";
import { randomEncouragement } from "./encouragements.js";

// GitHub Pages is static hosting, so there is no /api there. Set VITE_API_URL
// (e.g. https://my-panda-server.example.com) to use the Claude-powered backend;
// otherwise the built-in rule-based scheduler plans everything in the browser.
const API = import.meta.env.VITE_API_URL || "";

async function post(path, payload) {
  const r = await fetch(API + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30000),
  });
  if (!r.ok) throw new Error("bad response");
  return r.json();
}

export async function generatePlan(payload) {
  if (API) {
    try {
      return { ...validatePlan(await post("/api/plan", payload), payload), source: "ai" };
    } catch {
      /* fall through to the local scheduler */
    }
  }
  return { ...makePlanLocal(payload), source: "local" };
}

export async function getEncouragement(payload, prev) {
  if (API) {
    try {
      return (await post("/api/encouragement", payload)).message;
    } catch {
      /* ignore */
    }
  }
  return randomEncouragement(prev);
}
