// Minimal .ics (iCalendar) reader plus "when am I free?" inference.
import { addDays, addMinutes, parse, startOfDay, toISO, dayKey } from "./dates.js";

const DAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
export const BUFFER_MIN = 15; // breathing room kept around classes and meetings
const HORIZON_DAYS = 120;
const MAX_EVENTS = 3000;

function unfold(text) {
  return text.replace(/\r?\n[ \t]/g, "").split(/\r?\n/);
}

function parseDate(value, params) {
  const m = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/);
  if (!m) return null;
  const [, y, mo, d, h, mi, s, z] = m;
  if (h === undefined) return { date: new Date(+y, +mo - 1, +d), allDay: true };
  // "Z" = UTC (converted to local time); floating or TZID times are taken as local time.
  const date = z ? new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +(s || 0))) : new Date(+y, +mo - 1, +d, +h, +mi, +(s || 0));
  return { date, allDay: false };
}

function parseDuration(v) {
  const m = v.match(/^P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?$/);
  if (!m) return 60;
  return (+m[1] || 0) * 10080 + (+m[2] || 0) * 1440 + (+m[3] || 0) * 60 + (+m[4] || 0);
}

const unescape = (s) => s.replace(/\\n/gi, " ").replace(/\\([,;\\])/g, "$1");

function readEvents(text) {
  const events = [];
  let cur = null;
  for (const line of unfold(text)) {
    if (line === "BEGIN:VEVENT") cur = { exdates: new Set() };
    else if (line === "END:VEVENT") {
      if (cur && cur.start) events.push(cur);
      cur = null;
    } else if (cur) {
      const i = line.indexOf(":");
      if (i < 0) continue;
      const [name, ...ps] = line.slice(0, i).split(";");
      const value = line.slice(i + 1);
      const params = Object.fromEntries(ps.map((p) => p.split("=")));
      switch (name.toUpperCase()) {
        case "DTSTART": cur.start = parseDate(value, params); break;
        case "DTEND": cur.end = parseDate(value, params); break;
        case "DURATION": cur.durMin = parseDuration(value); break;
        case "SUMMARY": cur.title = unescape(value); break;
        case "UID": cur.uid = value; break;
        case "STATUS": cur.status = value; break;
        case "TRANSP": cur.transp = value; break;
        case "RRULE": cur.rrule = Object.fromEntries(value.split(";").map((p) => p.split("="))); break;
        case "EXDATE": value.split(",").forEach((v) => { const d = parseDate(v, params); if (d) cur.exdates.add(dayKey(d.date)); }); break;
        case "RECURRENCE-ID": { const d = parseDate(value, params); if (d) cur.recurrenceDay = dayKey(d.date); break; }
        default:
      }
    }
  }
  return events;
}

// Parse an .ics file into "fixed" time blocks from today up to ~4 months out.
export function parseIcs(text, now = new Date()) {
  const raw = readEvents(text);
  const from = startOfDay(now);
  const until = addDays(from, HORIZON_DAYS);
  const overridden = new Set(raw.filter((e) => e.recurrenceDay).map((e) => `${e.uid}|${e.recurrenceDay}`));
  const out = [];

  const push = (e, start, durMin) => {
    const end = addMinutes(start, durMin);
    if (end <= from || start >= until || out.length >= MAX_EVENTS) return;
    out.push({
      id: `ics-${out.length}-${start.getTime().toString(36)}`,
      type: "fixed",
      title: e.title || "Busy",
      start: toISO(start),
      end: toISO(end),
      locked: false,
      done: false,
      source: "ics",
    });
  };

  for (const e of raw) {
    if (e.status === "CANCELLED" || e.transp === "TRANSPARENT" || e.start.allDay) continue;
    const s0 = e.start.date;
    const durMin = e.end && !e.end.allDay ? Math.round((e.end.date - s0) / 60000) : e.durMin ?? 60;
    if (durMin <= 0 || durMin >= 20 * 60) continue; // treat very long events as all-day
    if (!e.rrule) { push(e, s0, durMin); continue; }

    const r = e.rrule;
    const interval = Math.max(1, +r.INTERVAL || 1);
    const limit = r.COUNT ? +r.COUNT : Infinity;
    const stop = r.UNTIL ? parseDate(r.UNTIL.replace(/Z$/, ""), {}).date : until;
    const end = stop < until ? addDays(stop, 1) : until;
    const byday = r.BYDAY ? r.BYDAY.split(",").map((d) => DAYS.indexOf(d.slice(-2))) : [s0.getDay()];
    const at = (day) => new Date(day.getFullYear(), day.getMonth(), day.getDate(), s0.getHours(), s0.getMinutes());
    const weekStart = addDays(startOfDay(s0), -s0.getDay());
    let n = 0;
    for (let day = startOfDay(s0), guard = 0; day < end && n < limit && guard < 3700; day = addDays(day, 1), guard++) {
      let hit = false;
      if (r.FREQ === "DAILY") hit = Math.round((day - startOfDay(s0)) / 86400000) % interval === 0;
      else if (r.FREQ === "WEEKLY") hit = byday.includes(day.getDay()) && Math.round((addDays(day, -day.getDay()) - weekStart) / 604800000) % interval === 0;
      else if (r.FREQ === "MONTHLY") hit = day.getDate() === s0.getDate() && ((day.getFullYear() - s0.getFullYear()) * 12 + day.getMonth() - s0.getMonth()) % interval === 0;
      else if (r.FREQ === "YEARLY") hit = day.getDate() === s0.getDate() && day.getMonth() === s0.getMonth();
      if (!hit || day < startOfDay(s0)) continue;
      n++;
      const key = dayKey(day);
      if (e.exdates.has(key) || overridden.has(`${e.uid}|${key}`)) continue;
      push(e, at(day), durMin);
    }
  }
  // rescheduled instances of recurring events
  raw.filter((e) => e.recurrenceDay && !e.rrule && e.status !== "CANCELLED" && !e.start.allDay).forEach((e) => {
    const dur = e.end && !e.end.allDay ? Math.round((e.end.date - e.start.date) / 60000) : e.durMin ?? 60;
    if (dur > 0 && dur < 20 * 60 && !out.some((o) => o.start === toISO(e.start.date) && o.title === (e.title || "Busy"))) push(e, e.start.date, dur);
  });
  return out.sort((a, b) => parse(a.start) - parse(b.start));
}

// For each weekday, find the hours that are usually free over the next 4 weeks and fall inside
// the student's preferred (chronotype) window. Returns 7 arrays of [startHour, endHour] ranges.
export function inferGoodHours(events, [ws, we], now = new Date()) {
  const busy = events.map((b) => [addMinutes(parse(b.start), -BUFFER_MIN), addMinutes(parse(b.end), BUFFER_MIN)]);
  const today = startOfDay(now);
  const result = Array.from({ length: 7 }, () => []);
  for (let w = 0; w < 7; w++) {
    const dates = [];
    for (let i = 0; i < 28; i++) {
      const d = addDays(today, i);
      if (d.getDay() === w) dates.push(d);
    }
    let run = null;
    for (let h = ws; h < Math.min(we, 24); h++) {
      const freeCount = dates.filter((d) => {
        const s = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h);
        const e = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h + 1);
        return !busy.some(([bs, be]) => s < be && e > bs);
      }).length;
      const good = dates.length > 0 && freeCount / dates.length >= 0.75;
      if (good) run = run ? [run[0], h + 1] : [h, h + 1];
      if ((!good || h === Math.min(we, 24) - 1) && run) {
        if (run[1] - run[0] >= 1) result[w].push(run);
        run = null;
      }
    }
  }
  return result;
}

const hr = (h) => `${((h + 11) % 12) + 1}${h % 24 >= 12 && h < 24 ? " PM" : " AM"}`;
const NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Short human-readable list of the longest free windows, e.g. "Mon 4 PM–8 PM".
export function describeGoodHours(good, limit = 4) {
  const all = [];
  good.forEach((ranges, w) => ranges.forEach(([s, e]) => all.push({ w, s, e, len: e - s })));
  return all
    .sort((a, b) => b.len - a.len || a.w - b.w)
    .slice(0, limit)
    .map(({ w, s, e }) => `${NAMES[w]} ${hr(s)}–${hr(e)}`);
}
