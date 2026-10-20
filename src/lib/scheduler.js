// Rule-based scheduler. Used as the fallback when no AI backend is reachable
// (and by the Express server when Claude fails), so it has no browser APIs.
import { parse, toISO, startOfDay, addDays, addMinutes, daysBetween, dayKey, clamp } from "./dates.js";

export const WINDOWS = { early_bird: [6, 12], night_owl: [17, 24], neither: [9, 18] };
const roundTo = (n, step) => Math.round(n / step) * step;
const at = (day, h) => new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, 0);

export function isPreserved(b, now) {
  return b.locked || b.type === "fixed" || b.done || parse(b.end) <= now;
}

export function makePlanLocal({ user, assignments, lockedBlocks = [], today }) {
  const now = today ? parse(today) : new Date();
  const a = user.answers;
  const [ws, we] = WINDOWS[a.chronotype] || WINDOWS.neither;
  const p = a.procrastination / 100;
  const single = a.focusStyle === "single";
  const breakTotal = a.breakHours;
  const breakLen = clamp(Math.round((breakTotal * 15) / 5) * 5, 5, 30);
  const front = 1 + p * 0.5 + (a.goal === "start_early" ? 0.15 : 0) + (a.startTiming === "due_date" ? 0.1 : 0);
  const baseChunk = Math.max(0.5, roundTo((single ? 2 : 1.5) * (1 - 0.4 * p), 0.25));

  const occupied = lockedBlocks.map((b) => [parse(b.start), parse(b.end)]);
  const sessionCount = {};
  lockedBlocks.forEach((b) => {
    if (b.type === "study" && b.assignmentId) sessionCount[b.assignmentId] = (sessionCount[b.assignmentId] || 0) + 1;
  });

  const work = assignments
    .filter((x) => x.status === "active")
    .map((x) => {
      const committed = lockedBlocks
        .filter((b) => b.assignmentId === x.id && b.type === "study" && !b.done && b.locked)
        .reduce((s, b) => s + (parse(b.end) - parse(b.start)) / 3600000, 0);
      const due = parse(x.dueDate);
      const spanDays = daysBetween(now, due);
      // procrastinators get an internal deadline a day before the real one
      const deadline = spanDays >= 4 && p > 0.5 ? startOfDay(due) : due;
      return {
        ...x,
        due,
        deadline,
        remaining: Math.max(0, x.estHours - (x.hoursDone || 0) - committed),
        chunk: roundTo(Math.min(baseChunk, x.effort >= 4 ? 1.5 : 99), 0.25) || 0.5,
        first: null,
        last: null,
      };
    })
    .filter((x) => x.due > now)
    .sort((x, y) => x.due - y.due);

  const free = (s, e) => !occupied.some(([os, oe]) => s < oe && e > os);
  function findSlot(day, mins, notBefore, limit) {
    const end = new Date(Math.min(at(day, we).getTime(), limit.getTime()));
    const t = new Date(Math.max(at(day, ws).getTime(), notBefore.getTime()));
    t.setMinutes(Math.ceil(t.getMinutes() / 15) * 15, 0, 0);
    for (let guard = 0; guard < 200; guard++) {
      const e = addMinutes(t, mins);
      if (e > end) return null;
      const hit = occupied.find(([os, oe]) => t < oe && e > os);
      if (!hit) return t;
      t.setTime(hit[1].getTime());
    }
    return null;
  }

  const blocks = [];
  let n = 0;
  const add = (type, title, s, e, assignmentId) => {
    occupied.push([s, e]);
    blocks.push({ id: `g${Date.now().toString(36)}${n++}`, type, assignmentId, title, start: toISO(s), end: toISO(e), locked: false, done: false });
  };

  const lastDay = work.reduce((m, x) => Math.max(m, daysBetween(now, x.deadline)), 0);
  for (let d = 0; d <= Math.min(lastDay, 60); d++) {
    const day = addDays(startOfDay(now), d);
    const active = work.filter((x) => x.remaining > 0.01 && day < x.deadline);
    const chosen = single ? active : active.slice(0, 3);
    const lists = chosen.map((x) => {
      const daysLeft = daysBetween(day, new Date(x.deadline.getTime() - 1)) + 1;
      const target = daysLeft <= 1 ? x.remaining : Math.min(x.remaining, Math.max(0.5, (x.remaining / daysLeft) * front));
      const pieces = [];
      let left = roundTo(target, 0.25) || 0.25;
      while (left > 0.01) {
        const len = Math.min(x.chunk, left);
        pieces.push({ x, len });
        left -= len;
      }
      return pieces;
    });
    // single: finish one assignment's pieces before the next; mixed: rotate
    const queue = [];
    if (single) lists.forEach((l) => queue.push(...l));
    else for (let i = 0; lists.some((l) => i < l.length); i++) lists.forEach((l) => l[i] && queue.push(l[i]));

    let breaksUsed = 0;
    let cursor = now;
    for (let i = 0; i < queue.length; i++) {
      const { x, len } = queue[i];
      const s = findSlot(day, len * 60, cursor, x.deadline);
      if (!s) continue;
      const e = addMinutes(s, len * 60);
      sessionCount[x.id] = (sessionCount[x.id] || 0) + 1;
      add("study", `${x.name}: session ${sessionCount[x.id]}`, s, e, x.id);
      x.remaining -= len;
      if (!x.first) x.first = day;
      x.last = day;
      cursor = e;
      if (i < queue.length - 1 && breakTotal > 0 && breaksUsed + breakLen / 60 <= breakTotal + 0.01) {
        const be = addMinutes(e, breakLen);
        if (free(e, be) && be <= at(day, we)) {
          add("break", "Break", e, be, undefined);
          breaksUsed += breakLen / 60;
          cursor = be;
        }
      }
    }
  }

  const suggestedDates = [];
  work.forEach((x) => {
    if (!x.first) return;
    suggestedDates.push({ id: `s-${x.id}-start_by`, assignmentId: x.id, kind: "start_by", date: dayKey(x.first), accepted: false });
    const dueDay = startOfDay(x.due);
    const internal = x.last && x.last < dueDay ? x.last : addDays(dueDay, -1);
    if (internal >= startOfDay(now) && internal < dueDay)
      suggestedDates.push({ id: `s-${x.id}-internal_deadline`, assignmentId: x.id, kind: "internal_deadline", date: dayKey(internal), accepted: false });
  });
  return { timeBlocks: blocks, suggestedDates };
}

// Drop anything that overlaps a preserved block, ends after its due date, or is malformed.
export function validatePlan(plan, { assignments = [], lockedBlocks = [] }) {
  const due = Object.fromEntries(assignments.map((a) => [a.id, parse(a.dueDate)]));
  const taken = lockedBlocks.map((b) => [parse(b.start), parse(b.end)]);
  const out = [];
  [...(plan.timeBlocks || [])]
    .filter((b) => b && b.start && b.end && parse(b.end) > parse(b.start))
    .sort((x, y) => parse(x.start) - parse(y.start))
    .forEach((b, i) => {
      const s = parse(b.start), e = parse(b.end);
      if (b.type === "study" && due[b.assignmentId] && e > due[b.assignmentId]) return;
      if (taken.some(([ts, te]) => s < te && e > ts)) return;
      taken.push([s, e]);
      out.push({ locked: false, done: false, ...b, id: b.id || `v${i}`, start: toISO(s), end: toISO(e) });
    });
  const ids = new Set(assignments.map((a) => a.id));
  const suggestedDates = (plan.suggestedDates || []).filter((s) => ids.has(s.assignmentId) && s.date);
  return { timeBlocks: out, suggestedDates };
}
