import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import PandaMascot from "./PandaMascot.jsx";

export const Card = ({ className = "", children, ...rest }) => (
  <div className={`card ${className}`} {...rest}>{children}</div>
);

export const PrimaryButton = ({ className = "", variant = "", children, ...rest }) => (
  <button className={`btn ${variant} ${className}`} {...rest}>{children}</button>
);

export const SpeechBubble = ({ children, className = "" }) => (
  <div className={`bubble ${className}`} role="status" aria-live="polite">{children}</div>
);

export function Modal({ children, onClose, label }) {
  useEffect(() => {
    const k = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={label}>{children}</div>
    </div>
  );
}

export const Slider = (props) => <input type="range" className="slider" {...props} />;

export const Stars = ({ value, onChange }) => (
  <div className="stars" role="radiogroup" aria-label="Effort">
    {[1, 2, 3, 4, 5].map((n) => (
      <button type="button" key={n} className={n <= value ? "on" : ""} onClick={() => onChange?.(n)} disabled={!onChange} aria-label={`${n} of 5`}>
        ★
      </button>
    ))}
  </div>
);

export function BambooDecor() {
  const stalk = (x, h, flip) => (
    <g key={x} transform={`translate(${x} 0)`}>
      <rect x="0" y={300 - h} width="10" height={h} rx="5" fill="#7BC47F" />
      {Array.from({ length: Math.floor(h / 45) }, (_, i) => (
        <rect key={i} x="-1" y={300 - 45 * (i + 1)} width="12" height="4" rx="2" fill="#3E8E41" />
      ))}
      <ellipse cx={flip ? -12 : 22} cy={300 - h + 30} rx="16" ry="5" fill="#7BC47F" transform={`rotate(${flip ? 30 : -30} ${flip ? -12 : 22} ${300 - h + 30})`} />
    </g>
  );
  return (
    <>
      <svg className="bamboo-decor left" viewBox="0 0 70 300" aria-hidden="true">{[stalk(10, 250), stalk(40, 180, true)]}</svg>
      <svg className="bamboo-decor right" viewBox="0 0 70 300" aria-hidden="true">{[stalk(14, 200), stalk(44, 270, true)]}</svg>
    </>
  );
}

export function BambooForest({ progress, sway = false, count = 14 }) {
  const stalks = Array.from({ length: count }, (_, i) => {
    const start = (i / count) * 0.7;
    const g = Math.max(0, Math.min(1, (progress - start) / 0.3));
    const maxH = 70 + ((i * 37) % 40);
    return { i, h: g * maxH, g };
  });
  return (
    <svg className={`forest ${sway ? "sway" : ""}`} viewBox="0 0 280 120" preserveAspectRatio="xMidYMax meet" role="img" aria-label={`Bamboo forest ${Math.round(progress * 100)}% grown`}>
      <rect x="0" y="112" width="280" height="8" rx="4" fill="#3E8E41" />
      {stalks.map(({ i, h, g }) => {
        const x = 10 + i * (260 / (count - 1));
        return h > 1 ? (
          <g key={i} className="stalk" style={{ transformOrigin: `${x}px 112px`, animationDelay: `${i * 0.15}s` }}>
            <rect x={x - 3} y={112 - h} width="6" height={h} rx="3" fill="#7BC47F" />
            {Array.from({ length: Math.floor(h / 22) }, (_, k) => (
              <rect key={k} x={x - 4} y={112 - 22 * (k + 1)} width="8" height="2.5" rx="1" fill="#3E8E41" />
            ))}
            {g > 0.6 && <ellipse cx={x + 8} cy={112 - h + 6} rx="8" ry="3" fill="#7BC47F" transform={`rotate(-30 ${x + 8} ${112 - h + 6})`} />}
            {g > 0.8 && <ellipse cx={x - 8} cy={112 - h + 14} rx="8" ry="3" fill="#3E8E41" transform={`rotate(30 ${x - 8} ${112 - h + 14})`} />}
          </g>
        ) : null;
      })}
    </svg>
  );
}

export function TopNav() {
  return (
    <nav className="topnav" aria-label="Main">
      <NavLink to="/home">🐼 Panda Planner</NavLink>
      <div>
        <NavLink to="/home">Home</NavLink>
        <NavLink to="/calendar">Calendar</NavLink>
        <NavLink to="/study">Study</NavLink>
      </div>
    </nav>
  );
}

export const PlanningOverlay = ({ show }) =>
  show ? (
    <div className="modal-backdrop" style={{ zIndex: 200 }} role="status">
      <div className="card center loading-card">
        <PandaMascot state="focus" size={140} />
        <p><b>Panda is planning your schedule…</b></p>
      </div>
    </div>
  ) : null;
