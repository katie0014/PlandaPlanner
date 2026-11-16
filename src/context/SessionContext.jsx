import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useApp } from "./AppContext.jsx";
import { parse } from "../lib/dates.js";
import { sessionReward } from "../lib/rewards.js";

// The study timer lives here, above the router, so it keeps counting down while you visit other
// pages. It stores an end timestamp instead of counting ticks, so it also stays accurate when the
// browser tab is in the background or the page is reloaded.
const KEY = "panda-session-v1";
export const FREE = "free";
const FREE_SECONDS = 25 * 60;
const idle = { blockId: null, total: FREE_SECONDS, running: false, endAt: 0, left: FREE_SECONDS, finished: false, rewarded: false, dismissed: false };

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (!s) return idle;
    // the timer ran out while the page was closed
    if (s.running && s.endAt <= Date.now()) return { ...idle, ...s, running: false, left: 0, finished: true };
    return { ...idle, ...s };
  } catch {
    return idle;
  }
}

const Ctx = createContext(null);
export const useSession = () => useContext(Ctx);

export function SessionProvider({ children }) {
  const app = useApp();
  const [s, setS] = useState(load);
  const [now, setNow] = useState(Date.now());
  const paid = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* storage blocked */
    }
  }, [s]);

  const block = s.blockId && s.blockId !== FREE ? app.timeBlocks.find((b) => b.id === s.blockId) : null;
  const isBreak = block?.type === "break";
  const title = block ? block.title : "Free study session";
  const left = s.running ? Math.max(0, Math.ceil((s.endAt - now) / 1000)) : s.left;

  // tick while running
  useEffect(() => {
    if (!s.running) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [s.running]);

  // time's up
  useEffect(() => {
    if (s.running && left === 0) setS((p) => ({ ...p, running: false, left: 0, finished: true }));
  }, [s.running, left]);

  // Pay out once per finished run. Breaks never earn bamboo, grow stalks or count as sessions;
  // they only get ticked off.
  useEffect(() => {
    if (!s.finished) return;
    const key = `${s.blockId}|${s.endAt}`;
    if (s.rewarded || paid.current === key) return;
    paid.current = key;
    setS((p) => ({ ...p, rewarded: true }));
    if (isBreak) {
      if (block && !block.done) app.toggleBlockDone(block.id, true);
      return;
    }
    app.addStalks(Math.max(1, Math.round(s.total / 300)));
    // a block that is already done earns nothing if you run it again
    if (!block || !block.done) {
      const amt = sessionReward(app.assignments.find((a) => a.id === block?.assignmentId)?.effort);
      app.earnBamboo(amt, `Session complete! +${amt} 🎋`);
    }
    if (block && !block.done) app.toggleBlockDone(block.id, true);
  }, [s.finished]); // eslint-disable-line react-hooks/exhaustive-deps

  // show the countdown in the browser tab's title
  useEffect(() => {
    if (!s.running) {
      document.title = "Panda Planner";
      return;
    }
    const m = String(Math.floor(left / 60)).padStart(2, "0");
    document.title = `${m}:${String(left % 60).padStart(2, "0")} · ${isBreak ? "Break" : "Studying"}`;
  }, [s.running, left, isBreak]);

  const selectTask = useCallback((id) => {
    const b = id && id !== FREE ? app.timeBlocks.find((x) => x.id === id) : null;
    const total = b ? Math.max(60, Math.round((parse(b.end) - parse(b.start)) / 1000)) : FREE_SECONDS;
    setS({ ...idle, blockId: id || FREE, total, left: total });
  }, [app.timeBlocks]);

  const start = useCallback(() => {
    setS((p) => (p.finished || p.left <= 0 ? p : { ...p, running: true, endAt: Date.now() + p.left * 1000, dismissed: false }));
    setNow(Date.now());
  }, []);
  const pause = useCallback(() => {
    setS((p) => (p.running ? { ...p, running: false, left: Math.max(0, Math.ceil((p.endAt - Date.now()) / 1000)) } : p));
  }, []);
  const reset = useCallback(() => {
    setS((p) => ({ ...p, running: false, finished: false, rewarded: false, left: p.total, endAt: 0, dismissed: false }));
  }, []);
  const dismiss = useCallback(() => setS((p) => ({ ...p, dismissed: true })), []);

  const session = {
    blockId: s.blockId, block, isBreak, title, total: s.total, left,
    running: s.running, finished: s.finished, dismissed: s.dismissed,
    progress: s.total ? 1 - left / s.total : 0,
  };
  return <Ctx.Provider value={{ session, selectTask, start, pause, reset, dismiss }}>{children}</Ctx.Provider>;
}
