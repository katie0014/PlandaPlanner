import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { BambooDecor, Card, PrimaryButton, SpeechBubble, TopNav, PlanningOverlay } from "../components/ui.jsx";
import PandaMascot from "../components/PandaMascot.jsx";
import { greeting } from "../lib/greeting.js";
import { fmtTime, parse, sameDay, fmtLong } from "../lib/dates.js";

export default function Home() {
  const { user, timeBlocks, toggleBlockDone, generatePlan, planning, assignments } = useApp();
  const nav = useNavigate();
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const today = timeBlocks.filter((b) => sameDay(parse(b.start), now));
  const nextBlock = timeBlocks.find((b) => b.type === "study" && !b.done && parse(b.end) > now);
  const mood = today.length && today.filter((b) => b.type === "study").every((b) => b.done) ? "happy" : "idle";

  return (
    <>
      <TopNav />
      <main className="page home">
        <BambooDecor />
        <h1 className="greet">{greeting(user.name, now)}</h1>
        <p className="muted">{fmtLong(now)}</p>
        <div className="home-grid">
          <Card className="schedule">
            <div className="row between">
              <h2>Today's schedule</h2>
              <PrimaryButton variant="small" onClick={() => generatePlan()} disabled={planning}>Regenerate plan</PrimaryButton>
            </div>
            {today.length === 0 ? (
              <div className="empty">
                <p>No plan yet. Add an assignment!</p>
                <PrimaryButton onClick={() => nav("/calendar")}>Add assignment</PrimaryButton>
                {assignments.length > 0 && <p className="muted">Nothing is scheduled for today. Try "Regenerate plan".</p>}
              </div>
            ) : (
              <ol className="timeline">
                {today.map((b) => {
                  const s = parse(b.start), e = parse(b.end);
                  const cls = now >= s && now < e ? "current" : e <= now ? "past" : "";
                  return (
                    <li key={b.id} className={`tl-item ${b.type} ${cls}`}>
                      <div className="tl-time">{fmtTime(s)}<br />{fmtTime(e)}</div>
                      <div className="tl-body">
                        <span className="tag">{b.type === "study" ? "Study" : b.type === "break" ? "Break" : "Fixed"}</span>
                        <span className={b.done ? "strike" : ""}>{b.title}</span>
                      </div>
                      {b.type === "study" && (
                        <input type="checkbox" checked={b.done} onChange={() => toggleBlockDone(b.id)} aria-label={`Mark ${b.title} done`} />
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </Card>

          <Card className="side center">
            <SpeechBubble>{mood === "happy" ? "All done for today. Amazing!" : "Let's get some bamboo-powered work done!"}</SpeechBubble>
            <PandaMascot state={mood} size={240} />
            <div className="stack">
              <PrimaryButton onClick={() => nav("/calendar")}>Open Calendar</PrimaryButton>
              <PrimaryButton onClick={() => nav("/study", { state: { blockId: nextBlock?.id } })}>Start Studying</PrimaryButton>
            </div>
            <p className="muted"><Link to="/">Edit profile / start over</Link></p>
          </Card>
        </div>
      </main>
      <PlanningOverlay show={planning} />
    </>
  );
}
