import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { BambooForest, PrimaryButton, SpeechBubble, TopNav } from "../components/ui.jsx";
import PandaMascot from "../components/PandaMascot.jsx";
import { getEncouragement } from "../lib/api.js";
import { randomEncouragement } from "../lib/encouragements.js";
import { fmtTime, parse } from "../lib/dates.js";

const FREE = "free";
const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export default function Study() {
  const { timeBlocks, assignments, toggleBlockDone, addStalks, stats } = useApp();
  const loc = useLocation();
  const now = new Date();

  const options = useMemo(
    () => timeBlocks.filter((b) => b.type !== "fixed" && !b.done && parse(b.end) > new Date(Date.now() - 3600000)).sort((a, b) => parse(a.start) - parse(b.start)),
    [timeBlocks]
  );
  const defaultId = useMemo(() => {
    const n = new Date();
    const cur = options.find((b) => parse(b.start) <= n && parse(b.end) > n);
    return loc.state?.blockId && options.some((b) => b.id === loc.state.blockId) ? loc.state.blockId : (cur || options.find((b) => b.type === "study") || options[0])?.id || FREE;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [blockId, setBlockId] = useState(defaultId);
  const block = options.find((b) => b.id === blockId) || timeBlocks.find((b) => b.id === blockId);
  const isBreak = block?.type === "break";
  const total = block ? Math.max(60, Math.round((parse(block.end) - parse(block.start)) / 1000)) : 25 * 60;

  const [left, setLeft] = useState(total);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const endAt = useRef(0);
  const [msg, setMsg] = useState("Ready when you are. You've got this!");

  const title = block ? block.title : "Free study session";
  const assignmentName = block?.assignmentId && assignments.find((a) => a.id === block.assignmentId)?.name;

  // reset when the task changes
  useEffect(() => { setRunning(false); setFinished(false); setLeft(total); }, [blockId, total]);

  // countdown
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      const l = Math.max(0, Math.round((endAt.current - Date.now()) / 1000));
      setLeft(l);
      if (l === 0) { setRunning(false); setFinished(true); }
    }, 250);
    return () => clearInterval(t);
  }, [running]);

  const say = async (state) => {
    const m = await getEncouragement({ task: title, minutesElapsed: Math.round((total - left) / 60), state }, msg);
    setMsg(m || randomEncouragement(msg));
  };

  // rotating encouragement every 60-90s while running
  useEffect(() => {
    if (!running) return;
    let t;
    const loop = () => { t = setTimeout(() => { say(); loop(); }, 60000 + Math.random() * 30000); };
    loop();
    return () => clearTimeout(t);
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

  // session end: log it, mark the block done, advance
  useEffect(() => {
    if (!finished) return;
    if (!isBreak) {
      addStalks(Math.max(1, Math.round(total / 300)));
      if (block && !block.done) toggleBlockDone(block.id, true);
    } else if (block && !block.done) toggleBlockDone(block.id, true);
    setMsg(isBreak ? "Break's over. Ready for the next one?" : "Session complete! Time for a snack. 🎋");
  }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = () => {
    if (left === 0) return;
    endAt.current = Date.now() + left * 1000;
    setRunning(true);
    say("start");
  };
  const reset = () => { setRunning(false); setFinished(false); setLeft(total); };
  const markDone = () => {
    if (block && !block.done) toggleBlockDone(block.id, true);
    setRunning(false);
    next();
  };
  const next = () => {
    const idx = options.findIndex((b) => b.id === blockId);
    const nxt = options.slice(idx + 1).find((b) => !b.done);
    setBlockId(nxt ? nxt.id : FREE);
  };

  const progress = 1 - left / total;
  const state = finished && !isBreak ? "happy" : isBreak ? "sleepy" : "focus";

  return (
    <>
      <TopNav />
      <main className="page study">
        <div className="banner">
          <span>Task to complete right now: <b>{isBreak ? "Take a break 🍵" : title}</b></span>
          {assignmentName && !isBreak && <span className="muted"> ({assignmentName})</span>}
          {block && <span className="muted small"> · {fmtTime(parse(block.start))}–{fmtTime(parse(block.end))}</span>}
          <select value={blockId} onChange={(e) => setBlockId(e.target.value)} aria-label="Choose task">
            <option value={FREE}>Free study session (25 min)</option>
            {options.map((b) => (
              <option key={b.id} value={b.id}>{parse(b.start).toLocaleDateString([], { weekday: "short" })} {fmtTime(parse(b.start))} · {b.title}</option>
            ))}
          </select>
        </div>

        <div className="study-center">
          <SpeechBubble>{msg}</SpeechBubble>
          <PandaMascot state={state} size={isBreak ? 240 : 340} />
        </div>

        <div className="timer-zone">
          <div className="timer-text" aria-live="off">
            <div className="time">{mmss(left)}</div>
            <div className="muted small">{finished ? "Complete!" : isBreak ? "Break time" : running ? "Focusing…" : "Paused"}</div>
            <div className="muted small">🎋 {stats.stalksGrown} stalks grown · {stats.sessionsCompleted} sessions</div>
          </div>
          <div className="forest-wrap"><BambooForest progress={finished ? 1 : progress} sway={isBreak} /></div>
          <div className="controls">
            {finished ? (
              <PrimaryButton onClick={next}>Next</PrimaryButton>
            ) : running ? (
              <PrimaryButton onClick={() => setRunning(false)}>Pause</PrimaryButton>
            ) : (
              <PrimaryButton onClick={start}>{left < total ? "Resume" : "Start"}</PrimaryButton>
            )}
            <PrimaryButton variant="ghost" onClick={reset}>Reset</PrimaryButton>
            <PrimaryButton variant="green" onClick={markDone}>Mark task done</PrimaryButton>
          </div>
        </div>
      </main>
    </>
  );
}
