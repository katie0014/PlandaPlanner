import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { FREE, useSession } from "../context/SessionContext.jsx";
import { BambooForest, PrimaryButton, SpeechBubble, TopNav } from "../components/ui.jsx";
import PandaMascot from "../components/PandaMascot.jsx";
import { mmss } from "../components/MiniTimer.jsx";
import { getEncouragement } from "../lib/api.js";
import { randomEncouragement } from "../lib/encouragements.js";
import { fmtTime, parse } from "../lib/dates.js";

export default function Study() {
  const { timeBlocks, assignments, toggleBlockDone, stats } = useApp();
  const { session, selectTask, start, pause, reset, dismiss } = useSession();
  const loc = useLocation();
  const { blockId, block, isBreak, title, total, left, running, finished, progress } = session;
  const [msg, setMsg] = useState("Ready when you are. You've got this!");

  const options = useMemo(
    () => timeBlocks.filter((b) => b.type !== "fixed" && !b.done && parse(b.end) > new Date(Date.now() - 3600000)).sort((a, b) => parse(a.start) - parse(b.start)),
    [timeBlocks]
  );

  // On arrival: keep a session that is already under way (the timer keeps running while you browse);
  // otherwise start from the block chosen on Home, the current block, or the next study block.
  useEffect(() => {
    if (finished) dismiss(); // the finished session has been seen
    if (running || (blockId && (finished || left < total))) return;
    const n = new Date();
    const cur = options.find((b) => parse(b.start) <= n && parse(b.end) > n);
    const wanted = loc.state?.blockId && options.some((b) => b.id === loc.state.blockId) ? loc.state.blockId : null;
    const pick = wanted || (blockId && blockId !== FREE && options.some((b) => b.id === blockId) ? blockId : (cur || options.find((b) => b.type === "study") || options[0])?.id || FREE);
    if (pick !== blockId) selectTask(pick);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const assignmentName = block?.assignmentId && assignments.find((a) => a.id === block.assignmentId)?.name;
  const shownId = blockId || FREE;

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

  useEffect(() => {
    if (finished) setMsg(isBreak ? "Break's over. Ready for the next one?" : "Session complete! Time for a snack. 🎋");
  }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  const next = () => {
    const idx = options.findIndex((b) => b.id === blockId);
    const nxt = options.slice(idx + 1).find((b) => !b.done);
    selectTask(nxt ? nxt.id : FREE);
  };
  const onStart = () => { start(); say("start"); };
  const markDone = () => {
    if (block && !block.done) toggleBlockDone(block.id, true);
    pause();
    next();
  };
  const choose = (id) => {
    if ((running || left < total) && !finished && !window.confirm("Switch tasks? Your current timer will reset.")) return;
    selectTask(id);
  };

  const state = finished && !isBreak ? "happy" : isBreak ? "sleepy" : "focus";

  return (
    <>
      <TopNav />
      <main className="page study">
        <div className="banner">
          <span>Task to complete right now: <b>{isBreak ? "Take a break 🍵" : title}</b></span>
          {assignmentName && !isBreak && <span className="muted"> ({assignmentName})</span>}
          {block && <span className="muted small"> · {fmtTime(parse(block.start))}–{fmtTime(parse(block.end))}</span>}
          <select value={shownId} onChange={(e) => choose(e.target.value)} aria-label="Choose task">
            <option value={FREE}>Free study session (25 min)</option>
            {options.map((b) => (
              <option key={b.id} value={b.id}>{parse(b.start).toLocaleDateString([], { weekday: "short" })} {fmtTime(parse(b.start))} · {b.title}</option>
            ))}
            {block && !options.some((b) => b.id === block.id) && <option value={block.id}>{block.title}</option>}
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
              <PrimaryButton onClick={pause}>Pause</PrimaryButton>
            ) : (
              <PrimaryButton onClick={onStart}>{left < total ? "Resume" : "Start"}</PrimaryButton>
            )}
            <PrimaryButton variant="ghost" onClick={reset}>Reset</PrimaryButton>
            <PrimaryButton variant="green" onClick={markDone}>Mark task done</PrimaryButton>
          </div>
        </div>
      </main>
    </>
  );
}
