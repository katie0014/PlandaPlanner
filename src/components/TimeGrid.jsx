import { useRef, useState } from "react";
import { parse, toISO, addMinutes, sameDay, fmtTime, startOfDay, addDays, clamp } from "../lib/dates.js";

export const START_HOUR = 6;
export const END_HOUR = 24;
const ROW = 40; // px per hour
const SNAP = 15; // minutes

const minutesOf = (d) => d.getHours() * 60 + d.getMinutes();

// One day column. Blocks can be dragged vertically to move, or resized from the bottom edge.
// Any manual edit marks the block as locked so regeneration leaves it alone.
function DayColumn({ day, blocks, titleOf, onChange, detailed }) {
  const [drag, setDrag] = useState(null);
  const colRef = useRef(null);

  const start = (e, b, mode) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag({ id: b.id, mode, y0: e.clientY, s: parse(b.start), e: parse(b.end), ds: 0, de: 0 });
  };
  const move = (e) => {
    if (!drag) return;
    const dm = Math.round((((e.clientY - drag.y0) / ROW) * 60) / SNAP) * SNAP;
    setDrag({ ...drag, ds: drag.mode === "move" ? dm : 0, de: dm });
  };
  const end = () => {
    if (!drag) return;
    let s = addMinutes(drag.s, drag.ds);
    let e = addMinutes(drag.e, drag.de);
    if (e - s < SNAP * 60000) e = addMinutes(s, SNAP);
    const lo = new Date(day.getFullYear(), day.getMonth(), day.getDate(), START_HOUR);
    const hi = new Date(day.getFullYear(), day.getMonth(), day.getDate(), END_HOUR);
    if (s < lo) { e = addMinutes(e, (lo - s) / 60000); s = lo; }
    if (e > hi) { s = addMinutes(s, -(e - hi) / 60000); e = hi; }
    if (toISO(s) !== toISO(parse(blocks.find((b) => b.id === drag.id).start)) || toISO(e) !== toISO(parse(blocks.find((b) => b.id === drag.id).end)))
      onChange(drag.id, { start: toISO(s), end: toISO(e), locked: true });
    setDrag(null);
  };

  return (
    <div className="day-col" ref={colRef} style={{ height: (END_HOUR - START_HOUR) * ROW }} onPointerMove={move} onPointerUp={end} onPointerCancel={() => setDrag(null)}>
      {blocks.map((b) => {
        let s = parse(b.start), e = parse(b.end);
        if (drag?.id === b.id) { s = addMinutes(drag.s, drag.ds); e = addMinutes(drag.e, drag.de); }
        const top = ((minutesOf(s) - START_HOUR * 60) / 60) * ROW;
        const h = Math.max(14, ((e - s) / 3600000) * ROW - 2);
        const mins = Math.round((e - s) / 60000);
        return (
          <div
            key={b.id}
            className={`tblock ${b.type} ${b.done ? "done" : ""} ${b.locked ? "locked" : ""}`}
            style={{ top, height: h }}
            onPointerDown={(ev) => b.type !== "fixed" && start(ev, b, "move")}
            title={`${titleOf(b)} · ${fmtTime(s)}–${fmtTime(e)}`}
          >
            <div className="tb-title">{b.locked ? "🔒 " : ""}{titleOf(b)}</div>
            {(detailed || h > 38) && (
              <div className="tb-time">{fmtTime(s)}–{fmtTime(e)} · {mins >= 60 ? `${Math.floor(mins / 60)}h${mins % 60 ? ` ${mins % 60}m` : ""}` : `${mins}m`}</div>
            )}
            {b.type !== "fixed" && <div className="resize" onPointerDown={(ev) => start(ev, b, "resize")} aria-hidden="true" />}
          </div>
        );
      })}
    </div>
  );
}

export function HourLabels() {
  return (
    <div className="hours">
      {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (
        <div key={i} style={{ height: ROW }}>
          {new Date(2000, 0, 1, START_HOUR + i).toLocaleTimeString([], { hour: "numeric" })}
        </div>
      ))}
    </div>
  );
}

export function WeekGrid({ weekStart, blocks, titleOf, onChange, onPickDay }) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(startOfDay(weekStart), i));
  const today = new Date();
  return (
    <div className="timegrid week">
      <div className="tg-head">
        <div />
        {days.map((d) => (
          <button key={+d} className={`tg-day ${sameDay(d, today) ? "today" : ""}`} onClick={() => onPickDay?.(d)}>
            {d.toLocaleDateString([], { weekday: "short", day: "numeric" })}
          </button>
        ))}
      </div>
      <div className="tg-body">
        <HourLabels />
        {days.map((d) => (
          <DayColumn key={+d} day={d} blocks={blocks.filter((b) => sameDay(parse(b.start), d))} titleOf={titleOf} onChange={onChange} />
        ))}
      </div>
    </div>
  );
}

export function DayTimeline({ day, blocks, titleOf, onChange }) {
  return (
    <div className="timegrid daily">
      <div className="tg-body">
        <HourLabels />
        <DayColumn day={day} blocks={blocks.filter((b) => sameDay(parse(b.start), day))} titleOf={titleOf} onChange={onChange} detailed />
      </div>
    </div>
  );
}
