const pad = (n) => String(n).padStart(2, "0");
export const toISO = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
export const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
// Date-only strings would parse as UTC, so build them as local time.
export const parse = (s) => {
  if (s instanceof Date) return new Date(s);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(s);
};
export const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, d.getHours(), d.getMinutes());
export const addMinutes = (d, n) => new Date(d.getTime() + n * 60000);
export const sameDay = (a, b) => dayKey(a) === dayKey(b);
export const daysBetween = (a, b) => Math.round((startOfDay(b) - startOfDay(a)) / 86400000);
export const hoursBetween = (a, b) => (parse(b) - parse(a)) / 3600000;
export const startOfWeek = (d) => addDays(startOfDay(d), -d.getDay());
export const fmtTime = (d) => d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
export const fmtDate = (d) => d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
export const fmtLong = (d) => d.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
export const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
export const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
export function countdown(due, now = new Date()) {
  const ms = parse(due) - now;
  if (ms < 0) return "overdue";
  const days = Math.floor(ms / 86400000);
  if (days >= 1) return `${days} day${days > 1 ? "s" : ""} left`;
  const h = Math.floor(ms / 3600000);
  return h >= 1 ? `${h}h left` : "due very soon";
}
