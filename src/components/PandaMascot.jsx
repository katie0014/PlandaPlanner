// SVG panda working at a laptop. state: idle | happy | focus | sleepy
export default function PandaMascot({ state = "idle", size = 260, className = "" }) {
  const happy = state === "happy";
  const sleepy = state === "sleepy";
  const focus = state === "focus";
  return (
    <svg className={`panda panda-${state} ${className}`} width={size} height={size} viewBox="0 0 200 200" role="img" aria-label={`Panda mascot, ${state}`}>
      {/* arms behind laptop when typing, raised when happy */}
      {happy && (
        <g fill="#1F1F1F">
          <ellipse className="arm-up l" cx="52" cy="105" rx="13" ry="28" transform="rotate(25 52 105)" />
          <ellipse className="arm-up r" cx="148" cy="105" rx="13" ry="28" transform="rotate(-25 148 105)" />
        </g>
      )}
      {/* body */}
      <ellipse cx="100" cy="150" rx="52" ry="42" fill="#fff" stroke="#1F1F1F" strokeWidth="4" />
      {/* ears */}
      <circle cx="53" cy="42" r="19" fill="#1F1F1F" />
      <circle cx="147" cy="42" r="19" fill="#1F1F1F" />
      <circle cx="53" cy="42" r="8" fill="#FFC8DD" />
      <circle cx="147" cy="42" r="8" fill="#FFC8DD" />
      {/* head */}
      <ellipse cx="100" cy="82" rx="58" ry="50" fill="#fff" stroke="#1F1F1F" strokeWidth="4" />
      {/* eye patches */}
      <ellipse cx="74" cy="80" rx="15" ry="19" fill="#1F1F1F" transform="rotate(18 74 80)" />
      <ellipse cx="126" cy="80" rx="15" ry="19" fill="#1F1F1F" transform="rotate(-18 126 80)" />
      {/* eyes */}
      {sleepy ? (
        <g stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M67 80 q7 5 14 0" />
          <path d="M119 80 q7 5 14 0" />
        </g>
      ) : (
        <g className="eyes">
          <circle cx="74" cy="79" r="6" fill="#fff" />
          <circle cx="126" cy="79" r="6" fill="#fff" />
          <circle cx="75" cy="80" r="3" fill="#1F1F1F" />
          <circle cx="125" cy="80" r="3" fill="#1F1F1F" />
        </g>
      )}
      {/* cheeks */}
      <circle cx="58" cy="103" r="7" fill="#FFC8DD" opacity=".8" />
      <circle cx="142" cy="103" r="7" fill="#FFC8DD" opacity=".8" />
      {/* nose + mouth */}
      <ellipse cx="100" cy="97" rx="8" ry="5.5" fill="#1F1F1F" />
      {sleepy ? (
        <ellipse cx="100" cy="112" rx="5" ry="7" fill="#1F1F1F" />
      ) : (
        <path d={happy ? "M88 105 q12 16 24 0 z" : "M91 106 q9 8 18 0"} fill={happy ? "#FF8FB1" : "none"} stroke="#1F1F1F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {/* headphones */}
      {focus && (
        <g>
          <path d="M40 80 Q40 22 100 22 Q160 22 160 80" fill="none" stroke="#FF8FB1" strokeWidth="7" strokeLinecap="round" />
          <rect x="31" y="68" width="18" height="30" rx="8" fill="#FFC8DD" stroke="#1F1F1F" strokeWidth="3" />
          <rect x="151" y="68" width="18" height="30" rx="8" fill="#FFC8DD" stroke="#1F1F1F" strokeWidth="3" />
        </g>
      )}
      {/* laptop */}
      {!happy && (
        <g>
          <rect x="52" y="124" width="96" height="46" rx="6" fill="#2d2d2d" stroke="#1F1F1F" strokeWidth="3" />
          <rect x="58" y="129" width="84" height="36" rx="3" fill="#FFE5EC" />
          <circle cx="100" cy="147" r="7" fill="#7BC47F" />
          <path d="M96 147 l3 3 l6 -6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M40 172 h120 l-8 -4 h-104 z" fill="#bdbdbd" stroke="#1F1F1F" strokeWidth="3" strokeLinejoin="round" />
        </g>
      )}
      {/* paws typing */}
      {!happy && (
        <g fill="#1F1F1F">
          <ellipse className="paw l" cx="78" cy="168" rx="11" ry="8" />
          <ellipse className="paw r" cx="122" cy="168" rx="11" ry="8" />
        </g>
      )}
      {sleepy && (
        <g className="zzz" fill="#FF8FB1" fontWeight="800" fontFamily="Nunito, sans-serif">
          <text x="150" y="40" fontSize="18">z</text>
          <text x="162" y="26" fontSize="14">z</text>
        </g>
      )}
      {happy && <text x="30" y="30" fontSize="20" className="zzz">✨</text>}
    </svg>
  );
}
