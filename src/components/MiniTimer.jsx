import { Link, useLocation } from "react-router-dom";
import { useSession } from "../context/SessionContext.jsx";
import PandaMascot from "./PandaMascot.jsx";
import { BambooForest } from "./ui.jsx";

export const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

// Small floating copy of the Study page, shown on every other page while a session is under way.
export default function MiniTimer() {
  const { pathname } = useLocation();
  const { session, start, pause, dismiss } = useSession();
  const { blockId, running, finished, dismissed, left, total, isBreak, title, progress } = session;
  const active = blockId && !dismissed && (running || finished || left < total);
  if (!active || pathname === "/study" || pathname === "/") return null;

  return (
    <aside className="mini-timer" aria-label="Study session in progress">
      <div className="mini-top">
        <PandaMascot state={finished && !isBreak ? "happy" : isBreak ? "sleepy" : "focus"} size={84} />
        <div className="mini-info">
          <div className="mini-title">{isBreak ? "Break time" : title}</div>
          <div className="mini-time">{finished ? "Done!" : mmss(left)}</div>
        </div>
        {finished && <button className="mini-x" onClick={dismiss} aria-label="Dismiss">✕</button>}
      </div>
      <div className="mini-forest"><BambooForest progress={finished ? 1 : progress} sway={isBreak} count={10} /></div>
      <div className="mini-actions">
        {!finished && (running
          ? <button className="btn small" onClick={pause}>Pause</button>
          : <button className="btn small" onClick={start}>Resume</button>)}
        <Link className="btn small ghost" to="/study" onClick={finished ? dismiss : undefined}>Open</Link>
      </div>
    </aside>
  );
}
