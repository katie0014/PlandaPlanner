import { useState } from "react";
import { Modal, PrimaryButton, Slider } from "./ui.jsx";
import PandaMascot from "./PandaMascot.jsx";

const Options = ({ options, value, onChange }) => (
  <div className="options" role="radiogroup">
    {options.map(([v, label, emoji]) => (
      <button type="button" key={v} role="radio" aria-checked={value === v} className={`option ${value === v ? "selected" : ""}`} onClick={() => onChange(v)}>
        <span className="emoji">{emoji}</span>
        {label}
      </button>
    ))}
  </div>
);

const STEPS = [
  {
    key: "procrastination",
    q: "How much do you procrastinate?",
    render: (v, set) => (
      <>
        <Slider min="0" max="100" value={v ?? 50} onChange={(e) => set(Number(e.target.value))} aria-label="Procrastination" />
        <div className="slider-labels"><span>None</span><b>{v ?? 50}</b><span>All the time</span></div>
      </>
    ),
    initial: 50,
  },
  {
    key: "chronotype",
    q: "Are you an early bird, night owl, or neither?",
    render: (v, set) => (
      <Options value={v} onChange={set} options={[["early_bird", "Early bird", "🌅"], ["night_owl", "Night owl", "🌙"], ["neither", "Neither", "⛅"]]} />
    ),
  },
  {
    key: "startTiming",
    q: "When do you usually start an assignment?",
    render: (v, set) => (
      <Options value={v} onChange={set} options={[["early", "Near the start", "🌱"], ["middle", "In the middle", "🌿"], ["due_date", "On the due date", "🔥"]]} />
    ),
  },
  {
    key: "goal",
    q: "What's your goal?",
    render: (v, set) => (
      <Options value={v} onChange={set} options={[["start_early", "Start assignments early", "⏰"], ["focus", "Improve focus", "🎯"], ["time_management", "Help time management", "🗓️"], ["other", "Other", "✨"]]} />
    ),
  },
  {
    key: "focusStyle",
    q: "Do you focus on one thing at a time or mix it up?",
    render: (v, set) => (
      <Options value={v} onChange={set} options={[["single", "One thing at a time", "1️⃣"], ["mixed", "Mix it up", "🔀"]]} />
    ),
  },
  {
    key: "breakHours",
    q: "How often do you take breaks?",
    render: (v, set) => (
      <>
        <Slider min="0" max="4" step="0.25" value={v ?? 1} onChange={(e) => set(Number(e.target.value))} aria-label="Break hours per day" />
        <div className="slider-labels"><span>0 h</span><b>{v ?? 1} h per day</b><span>4 h</span></div>
      </>
    ),
    initial: 1,
  },
];

export default function OnboardingModal({ onFinish, onClose }) {
  const [step, setStep] = useState(0);
  // sliders count as answered immediately, since they show a default value
  const [answers, setAnswers] = useState({ procrastination: 50, breakHours: 1 });
  const [mood, setMood] = useState("idle");
  const s = STEPS[step];
  const last = step === STEPS.length - 1;
  const answered = answers[s.key] !== undefined;

  const set = (v) => {
    setAnswers((a) => ({ ...a, [s.key]: v }));
    setMood("happy");
    clearTimeout(set.t);
    set.t = setTimeout(() => setMood("idle"), 900);
  };

  return (
    <Modal onClose={onClose} label="Onboarding questions">
      <div className="dots" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
        {STEPS.map((_, i) => (
          <span key={i} className={i === step ? "on" : i < step ? "done" : ""} />
        ))}
      </div>
      <h2>{s.q}</h2>
      <div className="step-body">{s.render(answers[s.key], set)}</div>
      <div className="modal-footer">
        <PrimaryButton variant="ghost" onClick={() => (step === 0 ? onClose() : setStep(step - 1))}>
          Back
        </PrimaryButton>
        <PrimaryButton disabled={!answered} onClick={() => (last ? onFinish(answers) : setStep(step + 1))}>
          {last ? "Finish" : "Next"}
        </PrimaryButton>
      </div>
      <div className="modal-panda"><PandaMascot state={mood} size={110} /></div>
    </Modal>
  );
}
