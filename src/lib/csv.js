// Reads a CSV of tasks and works out each task's due date, even from loose formats.
import { addDays, startOfDay, toISO } from "./dates.js";

export function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", q = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (q) {
      if (c === '"' && src[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === "," || c === ";" || c === "\t") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((x) => x.trim())) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x.trim())) rows.push(row);
  return rows;
}

const ALIASES = {
  name: ["name", "task", "tasks", "assignment", "title", "item", "homework"],
  due: ["due", "duedate", "due_date", "deadline", "date", "dueon", "due_by"],
  time: ["time", "duetime", "due_time"],
  hours: ["hours", "esthours", "estimatedhours", "estimated_hours", "estimate", "time_needed", "duration", "est"],
  effort: ["effort", "difficulty", "effort_1_to_5", "level"],
};
const norm = (h) => h.toLowerCase().replace(/[^a-z0-9_]/g, "");
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function findColumns(header) {
  const cols = {};
  header.forEach((h, i) => {
    const n = norm(h);
    for (const [key, names] of Object.entries(ALIASES)) {
      if (cols[key] === undefined && names.some((a) => norm(a) === n || (n.length > 3 && n.includes(norm(a)) && key !== "time"))) cols[key] = i;
    }
  });
  return cols;
}

function parseTime(s) {
  const m = s.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?/i);
  if (!m) return null;
  let h = +m[1];
  const min = +(m[2] || 0);
  const ap = m[3]?.toLowerCase();
  if (ap?.startsWith("p") && h < 12) h += 12;
  if (ap?.startsWith("a") && h === 12) h = 0;
  if (h > 23 || min > 59 || (!ap && !m[2])) return null;
  return [h, min];
}

// Returns a Date (local) or null. Missing time defaults to 11:59 PM.
export function inferDue(dateText, timeText = "", now = new Date()) {
  let s = String(dateText).trim().toLowerCase();
  if (!s) return null;
  const today = startOfDay(now);
  let time = null;
  const tm = s.match(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b|\b(\d{1,2}:\d{2})\b/);
  if (tm) { time = parseTime(tm[0]); s = s.replace(tm[0], " ").trim(); }
  if (!time && timeText) time = parseTime(String(timeText).trim());
  let d = null;
  let m;
  if ((m = s.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/))) d = new Date(+m[1], +m[2] - 1, +m[3]);
  else if ((m = s.match(/(\d{1,2})[-/.](\d{1,2})(?:[-/.](\d{2,4}))?/))) {
    let y = m[3] ? +m[3] : null;
    if (y !== null && y < 100) y += 2000;
    d = new Date(y ?? today.getFullYear(), +m[1] - 1, +m[2]);
    if (y === null && d < addDays(today, -60)) d.setFullYear(d.getFullYear() + 1);
  } else if ((m = s.match(/([a-z]{3})[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?/)) && MONTHS.includes(m[1])) {
    d = new Date(m[3] ? +m[3] : today.getFullYear(), MONTHS.indexOf(m[1]), +m[2]);
    if (!m[3] && d < addDays(today, -60)) d.setFullYear(d.getFullYear() + 1);
  } else if ((m = s.match(/(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]{3})[a-z]*(?:,?\s+(\d{4}))?/)) && MONTHS.includes(m[2])) {
    d = new Date(m[3] ? +m[3] : today.getFullYear(), MONTHS.indexOf(m[2]), +m[1]);
    if (!m[3] && d < addDays(today, -60)) d.setFullYear(d.getFullYear() + 1);
  } else if (/\btoday\b/.test(s)) d = today;
  else if (/\btomorrow\b/.test(s)) d = addDays(today, 1);
  else if ((m = s.match(/\b(sun|mon|tue|wed|thu|fri|sat)[a-z]*\b/))) {
    const diff = (WEEKDAYS.indexOf(m[1]) - today.getDay() + 7) % 7;
    d = addDays(today, /\bnext\b/.test(s) ? diff + 7 || 7 : diff);
  }
  if (!d || isNaN(d)) return null;
  const [h, min] = time || [23, 59];
  d.setHours(h, min, 0, 0);
  return d;
}

// Turns CSV text into { tasks, skipped }. Tasks use the same shape as the assignment form.
export function parseTasksCsv(text, now = new Date()) {
  const rows = parseCsv(text);
  if (rows.length < 2) return { tasks: [], skipped: [], error: "That file has no task rows." };
  let cols = findColumns(rows[0]);
  let body = rows.slice(1);
  if (cols.name === undefined || cols.due === undefined) {
    // no recognisable header: assume name, due date, hours, effort
    cols = { name: 0, due: 1, hours: 2, effort: 3 };
    body = rows;
  }
  const tasks = [], skipped = [];
  body.forEach((r, i) => {
    const name = (r[cols.name] || "").trim();
    if (!name) return;
    const due = inferDue(r[cols.due] || "", cols.time !== undefined ? r[cols.time] : "", now);
    if (!due) { skipped.push(`${name}: couldn't read the due date "${(r[cols.due] || "").trim()}"`); return; }
    const hrsNum = parseFloat((r[cols.hours] || "").replace(/[^\d.]/g, ""));
    const effNum = parseInt(r[cols.effort], 10);
    const effort = effNum >= 1 && effNum <= 5 ? effNum : 3;
    tasks.push({
      key: i,
      name,
      dueDate: toISO(due),
      estHours: hrsNum > 0 ? Math.round(hrsNum * 4) / 4 : effort * 1, // no estimate: guess ~1h per effort point
      effort,
      guessed: !(hrsNum > 0),
    });
  });
  return { tasks, skipped };
}
