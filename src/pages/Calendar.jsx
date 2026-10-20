import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { BambooDecor, Card, PrimaryButton, Stars, TopNav, PlanningOverlay } from "../components/ui.jsx";
import AssignmentForm from "../components/AssignmentForm.jsx";
import { WeekGrid, DayTimeline } from "../components/TimeGrid.jsx";
import { parseTasksCsv } from "../lib/csv.js";
import { parseIcs, inferGoodHours, describeGoodHours } from "../lib/ics.js";
import { WINDOWS } from "../lib/scheduler.js";
import { addDays, countdown, dayKey, fmtDate, fmtLong, fmtTime, parse, sameDay, startOfDay, startOfWeek } from "../lib/dates.js";

const TABS = ["Assignments", "Calendar", "Time Blocking"];

export default function CalendarPage() {
  const [tab, setTab] = useState(0);
  const app = useApp();
  return (
    <>
      <TopNav />
      <main className="page wide">
        <BambooDecor />
        <h1>Calendar &amp; planning</h1>
        <div className="tabs" role="tablist">
          {TABS.map((t, i) => (
            <button key={t} role="tab" aria-selected={tab === i} className={tab === i ? "on" : ""} onClick={() => setTab(i)}>{t}</button>
          ))}
        </div>
        {tab === 0 && <Assignments app={app} />}
        {tab === 1 && <CalendarTab app={app} />}
        {tab === 2 && <TimeBlocking app={app} />}
      </main>
      <PlanningOverlay show={app.planning} />
    </>
  );
}

function useGoodHours(app) {
  const events = app.timeBlocks.filter((b) => b.type === "fixed");
  return useMemo(
    () => (events.length ? inferGoodHours(events, WINDOWS[app.user.answers.chronotype] || WINDOWS.neither) : null),
    [app.timeBlocks, app.user] // eslint-disable-line react-hooks/exhaustive-deps
  );
}

function IcsUpload({ app }) {
  const [error, setError] = useState("");
  const good = useGoodHours(app);
  const onFile = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    try {
      const events = parseIcs(await file.text());
      if (!events.length) return setError("No upcoming timed events found in that file.");
      await app.importIcs(events, file.name);
    } catch {
      setError("Couldn't read that file. Please upload a valid .ics calendar.");
    }
  };
  const best = good ? describeGoodHours(good) : [];
  return (
    <Card className="ics-card">
      <h3>Import your calendar</h3>
      <p className="hint">Upload an .ics file (export it from Google Calendar, Apple Calendar or Outlook). Your classes and meetings become fixed events, and Panda plans study time around them.</p>
      <input type="file" accept=".ics,text/calendar" onChange={onFile} aria-label="Upload .ics file" />
      {error && <p role="alert" style={{ color: "#b3261e" }}>{error}</p>}
      {app.icsInfo && (
        <div className="insight">
          <b>{app.icsInfo.fileName}</b>: {app.icsInfo.count} upcoming events imported.
          {best.length > 0 && (<><br />Your best study windows:<ul>{best.map((b) => <li key={b}>{b}</li>)}</ul></>)}
          <PrimaryButton type="button" variant="small ghost" onClick={() => app.clearIcs()}>Remove calendar</PrimaryButton>
        </div>
      )}
    </Card>
  );
}

function CsvUpload({ app }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const onFile = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setError(""); setDone("");
    try {
      const r = parseTasksCsv(await file.text());
      if (r.error) { setResult(null); return setError(r.error); }
      // skip tasks that are already in the list
      const have = new Set(app.assignments.map((a) => `${a.name.toLowerCase()}|${a.dueDate}`));
      const fresh = r.tasks.filter((t) => !have.has(`${t.name.toLowerCase()}|${t.dueDate}`));
      setResult({ ...r, tasks: fresh, dupes: r.tasks.length - fresh.length });
    } catch {
      setResult(null);
      setError("Couldn't read that file. Please upload a .csv file.");
    }
  };
  const add = async () => {
    await app.addAssignments(result.tasks.map(({ key, guessed, ...t }) => t));
    setDone(`Added ${result.tasks.length} assignments.`);
    setResult(null);
  };
  return (
    <Card className="ics-card">
      <h3>Import assignments from a .csv</h3>
      <p className="hint">Columns: name and due date (required), plus optional time, hours and effort (1-5). Dates like 2026-10-21, 10/21, Oct 21 or "Friday" all work. Panda reads the due dates and schedules around them.</p>
      <input type="file" accept=".csv,text/csv" onChange={onFile} aria-label="Upload .csv file" />
      {error && <p role="alert" style={{ color: "#b3261e" }}>{error}</p>}
      {done && <p className="insight">{done}</p>}
      {result && (
        <div className="insight">
          <b>{result.tasks.length} assignments found</b>
          {result.dupes > 0 && ` (${result.dupes} already in your list, skipped)`}
          <ul>
            {result.tasks.map((t) => (
              <li key={t.key}>{t.name}: due {fmtDate(parse(t.dueDate))}, {fmtTime(parse(t.dueDate))} · {t.estHours}h{t.guessed ? " (estimated)" : ""} · effort {t.effort}</li>
            ))}
          </ul>
          {result.skipped.length > 0 && <p style={{ color: "#b3261e" }}>Skipped: {result.skipped.join("; ")}</p>}
          <div className="row">
            <PrimaryButton type="button" variant="small" disabled={!result.tasks.length} onClick={add}>Add {result.tasks.length} to my list</PrimaryButton>
            <PrimaryButton type="button" variant="small ghost" onClick={() => setResult(null)}>Cancel</PrimaryButton>
          </div>
        </div>
      )}
    </Card>
  );
}

function Assignments({ app }) {
  const { assignments, addAssignment, updateAssignment, deleteAssignment } = app;
  const [editing, setEditing] = useState(null);
  const sorted = [...assignments].sort((a, b) => parse(a.dueDate) - parse(b.dueDate));
  return (
    <div className="two-col">
      <div className="stack">
        <AssignmentForm key={editing?.id || "new"} initial={editing} onCancel={editing ? () => setEditing(null) : undefined}
          onSubmit={(v) => { if (editing) { updateAssignment(editing.id, v); setEditing(null); } else addAssignment(v); }} />
        <CsvUpload app={app} />
        <IcsUpload app={app} />
      </div>
      <div className="stack">
        {sorted.length === 0 && <Card className="center muted">No assignments yet. Add your first one!</Card>}
        {sorted.map((a) => {
          const pct = Math.min(100, Math.round(((a.hoursDone || 0) / a.estHours) * 100));
          return (
            <Card key={a.id} className={`assignment ${a.status === "done" ? "finished" : ""}`}>
              <div className="row between">
                <h3>{a.name}</h3>
                <span className="pill">{a.status === "done" ? "Done ✓" : countdown(a.dueDate)}</span>
              </div>
              <p className="muted">Due {fmtDate(parse(a.dueDate))}, {fmtTime(parse(a.dueDate))} · {a.estHours}h estimated</p>
              <Stars value={a.effort} />
              <div className="progress" aria-label={`${pct}% complete`}><div style={{ width: `${pct}%` }} /></div>
              <p className="muted small">{(a.hoursDone || 0).toFixed(2).replace(/\.?0+$/, "")} / {a.estHours} hours done</p>
              <div className="row">
                <PrimaryButton variant="small" onClick={() => setEditing(a)}>Edit</PrimaryButton>
                <PrimaryButton variant="small ghost" onClick={() => confirm(`Delete "${a.name}"?`) && deleteAssignment(a.id)}>Delete</PrimaryButton>
                <PrimaryButton variant="small green" onClick={() => updateAssignment(a.id, { status: a.status === "done" ? "active" : "done" })}>
                  {a.status === "done" ? "Reopen" : "Mark done"}
                </PrimaryButton>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function CalendarTab({ app }) {
  const { assignments, suggestedDates, timeBlocks, acceptSuggestion, dismissSuggestion } = app;
  const [cursor, setCursor] = useState(startOfDay(new Date()));
  const [view, setView] = useState("month");
  const [selected, setSelected] = useState(startOfDay(new Date()));
  const name = (id) => assignments.find((a) => a.id === id)?.name || "Assignment";

  const days = useMemo(() => {
    if (view === "week") return Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(cursor), i));
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = startOfWeek(first);
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
  }, [cursor, view]);

  const step = (n) => setCursor(view === "week" ? addDays(cursor, 7 * n) : new Date(cursor.getFullYear(), cursor.getMonth() + n, 1));
  const forDay = (d) => ({
    due: assignments.filter((a) => a.status === "active" && sameDay(parse(a.dueDate), d)),
    sugg: suggestedDates.filter((s) => s.date === dayKey(d) && assignments.some((a) => a.id === s.assignmentId)),
    blocks: timeBlocks.filter((b) => b.type === "study" && sameDay(parse(b.start), d)),
    events: timeBlocks.filter((b) => b.type === "fixed" && sameDay(parse(b.start), d)),
  });
  const sel = forDay(selected);
  const label = (k) => (k === "start_by" ? "Start by" : "Internal deadline");

  return (
    <div className="two-col cal">
      <Card>
        <div className="row between">
          <div className="row">
            <PrimaryButton variant="small" onClick={() => step(-1)} aria-label="Previous">‹</PrimaryButton>
            <PrimaryButton variant="small" onClick={() => step(1)} aria-label="Next">›</PrimaryButton>
            <PrimaryButton variant="small ghost" onClick={() => { setCursor(startOfDay(new Date())); setSelected(startOfDay(new Date())); }}>Today</PrimaryButton>
          </div>
          <h3>{cursor.toLocaleDateString([], { month: "long", year: "numeric" })}</h3>
          <div className="seg">
            {["month", "week"].map((v) => <button key={v} className={view === v ? "on" : ""} onClick={() => setView(v)}>{v}</button>)}
          </div>
        </div>
        <div className="month-grid">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i} className="dow">{d}</div>)}
          {days.map((d) => {
            const { due, sugg, blocks, events } = forDay(d);
            const other = view === "month" && d.getMonth() !== cursor.getMonth();
            return (
              <button key={+d} className={`cell ${other ? "other" : ""} ${sameDay(d, new Date()) ? "today" : ""} ${sameDay(d, selected) ? "sel" : ""} ${view === "week" ? "tall" : ""}`} onClick={() => setSelected(d)}>
                <span className="num">{d.getDate()}</span>
                {due.slice(0, 3).map((a) => <span key={a.id} className="mark due">{a.name}</span>)}
                {sugg.slice(0, 2).map((s) => <span key={s.id} className={`mark sugg ${s.accepted ? "accepted" : ""}`}>{label(s.kind)}</span>)}
                {events.length > 0 && <span className="mark fixed">{events.length} event{events.length > 1 ? "s" : ""}</span>}
                {blocks.length > 0 && <span className="dotrow">{blocks.slice(0, 5).map((b) => <i key={b.id} />)}</span>}
              </button>
            );
          })}
        </div>
        <p className="muted small"><span className="mark due inline">Due date</span> <span className="mark sugg inline">AI suggestion</span> <span className="mark sugg accepted inline">Accepted</span> <span className="mark fixed inline">Calendar events</span></p>
      </Card>

      <Card>
        <h3>{fmtLong(selected)}</h3>
        {!sel.due.length && !sel.sugg.length && !sel.blocks.length && !sel.events.length && <p className="muted">Nothing planned for this day.</p>}
        {sel.due.map((a) => <p key={a.id}>📌 <b>{a.name}</b> is due at {fmtTime(parse(a.dueDate))}</p>)}
        {sel.sugg.map((s) => (
          <div key={s.id} className="sugg-row">
            <span>🌱 {label(s.kind)}: <b>{name(s.assignmentId)}</b></span>
            {s.accepted ? <span className="pill green">Accepted</span> : (
              <span className="row">
                <PrimaryButton variant="small green" onClick={() => acceptSuggestion(s.id)}>Accept</PrimaryButton>
                <PrimaryButton variant="small ghost" onClick={() => dismissSuggestion(s.id)}>Dismiss</PrimaryButton>
              </span>
            )}
          </div>
        ))}
        {sel.events.map((b) => (
          <div key={b.id} className="side-block" style={{ background: "#e8e8e8" }}>📅 {fmtTime(parse(b.start))}–{fmtTime(parse(b.end))} · {b.title}</div>
        ))}
        {sel.blocks.map((b) => (
          <div key={b.id} className="side-block">{fmtTime(parse(b.start))}–{fmtTime(parse(b.end))} · {b.title}{b.done ? " ✓" : ""}</div>
        ))}
      </Card>
    </div>
  );
}

function TimeBlocking({ app }) {
  const { timeBlocks, assignments, updateBlock, generatePlan, planning, toggleBlockDone } = app;
  const [mode, setMode] = useState("weekly");
  const [day, setDay] = useState(startOfDay(new Date()));
  const titleOf = (b) => b.title || (b.type === "break" ? "Break" : assignments.find((a) => a.id === b.assignmentId)?.name || "Block");
  const shift = (n) => setDay(addDays(day, mode === "weekly" ? 7 * n : n));
  const dayBlocks = timeBlocks.filter((b) => sameDay(parse(b.start), day));
  const good = useGoodHours(app);
  const best = good ? describeGoodHours(good) : [];

  return (
    <Card>
      <div className="row between wrap">
        <div className="row">
          <PrimaryButton variant="small" onClick={() => shift(-1)} aria-label="Previous">‹</PrimaryButton>
          <PrimaryButton variant="small" onClick={() => shift(1)} aria-label="Next">›</PrimaryButton>
          <PrimaryButton variant="small ghost" onClick={() => setDay(startOfDay(new Date()))}>Today</PrimaryButton>
        </div>
        <h3>{mode === "weekly" ? `Week of ${fmtDate(startOfWeek(day))}` : fmtLong(day)}</h3>
        <div className="row">
          <div className="seg">
            {["weekly", "daily"].map((v) => <button key={v} className={mode === v ? "on" : ""} onClick={() => setMode(v)}>{v}</button>)}
          </div>
          <PrimaryButton onClick={() => generatePlan()} disabled={planning}>{timeBlocks.length ? "Regenerate" : "Generate plan"}</PrimaryButton>
        </div>
      </div>
      <div className="legend small muted">
        <span className="sw study" /> Study <span className="sw break" /> Break <span className="sw fixed" /> Fixed{good ? <><span className="sw good" /> Usually free</> : null} · drag a block to move it, drag its bottom edge to resize. Edited blocks get a 🔒 and stay put when you regenerate.
      </div>
      {best.length > 0 && <div className="insight">📅 Based on your calendar, you usually have time: {best.join(" · ")}</div>}
      {assignments.length === 0 && <p className="muted">Add an assignment first, then generate your plan.</p>}
      {mode === "weekly" ? (
        <WeekGrid weekStart={startOfWeek(day)} blocks={timeBlocks} titleOf={titleOf} good={good} onChange={updateBlock} onPickDay={(d) => { setDay(d); setMode("daily"); }} />
      ) : (
        <>
          <DayTimeline day={day} blocks={timeBlocks} titleOf={titleOf} good={good} onChange={updateBlock} />
          <ul className="day-list">
            {dayBlocks.filter((b) => b.type === "study").map((b) => (
              <li key={b.id}>
                <label><input type="checkbox" checked={b.done} onChange={() => toggleBlockDone(b.id)} /> {titleOf(b)}</label>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
