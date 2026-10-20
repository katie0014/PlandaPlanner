import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { BambooDecor, Card, PrimaryButton, PlanningOverlay } from "../components/ui.jsx";
import PandaMascot from "../components/PandaMascot.jsx";
import OnboardingModal from "../components/OnboardingModal.jsx";

export default function Signup() {
  const { user, setUser, generatePlan, planning, reset } = useApp();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [occupation, setOccupation] = useState("");
  const [open, setOpen] = useState(false);

  const finish = async (answers) => {
    const profile = { name: name.trim(), occupation, answers };
    setUser(profile);
    setOpen(false);
    await generatePlan({ user: profile });
    nav("/home");
  };

  return (
    <main className="page signup">
      <BambooDecor />
      <div className="signup-wrap">
        <PandaMascot state="idle" size={280} />
        <Card className="signup-card">
          <h1>Sign up here</h1>
          <form onSubmit={(e) => { e.preventDefault(); setOpen(true); }} className="form-grid">
            <label>Name
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
            </label>
            <label>Occupation
              <select value={occupation} onChange={(e) => setOccupation(e.target.value)} required>
                <option value="" disabled>Choose one…</option>
                <option value="student">Student</option>
                <option value="startup_founder">Startup founder</option>
              </select>
            </label>
            <PrimaryButton type="submit" disabled={!name.trim() || !occupation}>Continue</PrimaryButton>
          </form>
          {user && (
            <p className="muted center">
              Welcome back, {user.name}!{" "}
              <a href="#/home">Go to Home</a> ·{" "}
              <button className="linkish" onClick={() => confirm("Erase your saved profile and plan?") && reset()}>Start over</button>
            </p>
          )}
        </Card>
      </div>
      {open && <OnboardingModal onFinish={finish} onClose={() => setOpen(false)} />}
      <PlanningOverlay show={planning} />
    </main>
  );
}
