import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { makePlan, makeEncouragement } from "./agent.js";
import { makePlanLocal, validatePlan } from "../src/lib/scheduler.js";
import { randomEncouragement } from "../src/lib/encouragements.js";

const app = express();
app.use(cors({ origin: ["https://katie0014.github.io", "http://localhost:5173"] }));
app.use(express.json({ limit: "1mb" }));
app.use("/api", rateLimit({ windowMs: 60_000, limit: 30 }));

let lastPlan = null; // cache so the client can load instantly

app.post("/api/plan", async (req, res) => {
  try {
    lastPlan = validatePlan(await makePlan(req.body), req.body);
  } catch (e) {
    console.error("AI plan failed, using rule-based fallback:", e.message);
    lastPlan = makePlanLocal(req.body);
  }
  res.json(lastPlan);
});

// A skipped block or a late day is just a regenerate that keeps what is done/locked.
app.post("/api/replan", async (req, res) => {
  try {
    res.json(validatePlan(await makePlan(req.body), req.body));
  } catch {
    res.json(makePlanLocal(req.body));
  }
});

app.post("/api/encouragement", async (req, res) => {
  try {
    res.json({ message: await makeEncouragement(req.body) });
  } catch {
    res.json({ message: randomEncouragement() });
  }
});

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`Panda server on :${port}`));
