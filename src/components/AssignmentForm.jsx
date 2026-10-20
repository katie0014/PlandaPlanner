import { useState } from "react";
import { PrimaryButton, Stars } from "./ui.jsx";
import { dayKey, parse } from "../lib/dates.js";

const blank = { name: "", date: "", time: "23:59", estHours: 2, effort: 3 };

export default function AssignmentForm({ initial, onSubmit, onCancel }) {
  const [f, setF] = useState(() => {
    if (!initial) return blank;
    const d = parse(initial.dueDate);
    return {
      name: initial.name,
      date: dayKey(d),
      time: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
      estHours: initial.estHours,
      effort: initial.effort,
    };
  });
  const up = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const valid = f.name.trim() && f.date && Number(f.estHours) > 0;

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    onSubmit({
      name: f.name.trim(),
      dueDate: `${f.date}T${f.time || "23:59"}:00`,
      estHours: Number(f.estHours),
      effort: f.effort,
    });
    if (!initial) setF(blank);
  };

  return (
    <form className="card form-grid" onSubmit={submit}>
      <h3>{initial ? "Edit assignment" : "Add an assignment"}</h3>
      <label>Name
        <input value={f.name} onChange={up("name")} placeholder="Biology essay" required />
      </label>
      <div className="row">
        <label>Due date
          <input type="date" value={f.date} onChange={up("date")} required />
        </label>
        <label>Time (optional)
          <input type="time" value={f.time} onChange={up("time")} />
        </label>
      </div>
      <label>Estimated time needed (hours)
        <input type="number" min="0.25" step="0.25" value={f.estHours} onChange={up("estHours")} required />
      </label>
      <div>
        <div className="label">Estimated effort needed (1 = easy, 5 = very hard)</div>
        <Stars value={f.effort} onChange={(effort) => setF({ ...f, effort })} />
      </div>
      <div className="row">
        <PrimaryButton type="submit" disabled={!valid}>{initial ? "Save" : "Add assignment"}</PrimaryButton>
        {onCancel && <PrimaryButton type="button" variant="ghost" onClick={onCancel}>Cancel</PrimaryButton>}
      </div>
    </form>
  );
}
