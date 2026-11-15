import { clamp, parse } from "./dates.js";

export const START_BAMBOO = 100;
export const SESSION_BAMBOO = 25;
export const TASK_BASE = 50;
export const EARLY_DAY_BONUS = 10;
// Cap on the early bonus so a far-off due date can't be farmed for huge payouts.
export const MAX_EARLY_DAYS = 14;

// Harder tasks pay more: effort 1 = x1.0 up to effort 5 = x2.0.
export const priorityMultiplier = (effort) => 1 + (clamp(Number(effort) || 1, 1, 5) - 1) * 0.25;

// 25 bamboo per finished study session, scaled by the linked task's effort (free sessions: flat 25).
export const sessionReward = (effort) => Math.round(SESSION_BAMBOO * (effort ? priorityMultiplier(effort) : 1));

// 50 base + 10 for every full day before the due date, all scaled by effort.
export function taskReward(assignment, now = new Date()) {
  const daysEarly = clamp(Math.floor((parse(assignment.dueDate) - now) / 86400000), 0, MAX_EARLY_DAYS);
  const mult = priorityMultiplier(assignment.effort);
  const base = TASK_BASE;
  const early = daysEarly * EARLY_DAY_BONUS;
  return { base, early, daysEarly, mult, total: Math.round((base + early) * mult) };
}
