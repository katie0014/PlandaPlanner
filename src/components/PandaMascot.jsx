// Cartoon panda at a desk, in a side-on view looking at its laptop (like the reference art).
// state: idle | happy | focus | sleepy. Pupils always glance toward the laptop unless asleep.
const INK = "#2a2320";

export default function PandaMascot({ state = "idle", size = 260, className = "" }) {
  const happy = state === "happy";
  const sleepy = state === "sleepy";
  const focus = state === "focus";
  return (
    <svg className={`panda panda-${state} ${className}`} width={size} height={size * 0.8} viewBox="0 0 300 240" role="img" aria-label={`Panda mascot, ${state}`}>
      {/* chair back */}
      <g>
        <rect x="6" y="70" width="34" height="150" rx="6" fill="#A8744A" stroke="#7a5233" strokeWidth="2.5" />
        <rect x="14" y="80" width="6" height="130" fill="#8e5f3b" />
      </g>

      {/* desk */}
      <rect x="0" y="198" width="300" height="42" fill="#B98558" />
      <rect x="0" y="198" width="300" height="9" fill="#D2A074" />
      <path d="M0 222 H300" stroke="#9c6c44" strokeWidth="2" />

      {/* body: white belly, dark shoulders */}
      <ellipse cx="92" cy="172" rx="62" ry="58" fill="#FBF6EE" stroke={INK} strokeWidth="3" />
      <path d="M32 150 Q40 108 98 112 Q150 116 158 160 Q150 176 120 178 Q60 182 32 150 Z" fill="#2b2b2b" stroke={INK} strokeWidth="3" strokeLinejoin="round" />

      {/* left ear and head */}
      <circle cx="66" cy="48" r="19" fill="#2b2b2b" stroke={INK} strokeWidth="3" />
      <circle cx="146" cy="48" r="19" fill="#2b2b2b" stroke={INK} strokeWidth="3" />
      <ellipse cx="106" cy="88" rx="58" ry="50" fill="#FBF6EE" stroke={INK} strokeWidth="3" />

      {/* eye patches */}
      <ellipse cx="86" cy="90" rx="15" ry="19" fill="#2b2b2b" transform="rotate(18 86 90)" />
      <ellipse cx="132" cy="90" rx="15" ry="19" fill="#2b2b2b" transform="rotate(-14 132 90)" />

      {/* eyes: glance toward the laptop (right and slightly down) */}
      {sleepy ? (
        <g stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M79 91 q7 5 14 0" />
          <path d="M125 91 q7 5 14 0" />
        </g>
      ) : happy ? (
        <g stroke="#fff" strokeWidth="3.5" strokeLinecap="round" fill="none">
          <path d="M79 94 q7 -9 14 0" />
          <path d="M125 94 q7 -9 14 0" />
        </g>
      ) : (
        <g className="eyes">
          <circle cx="86" cy="90" r="8" fill="#fff" />
          <circle cx="132" cy="90" r="8" fill="#fff" />
          <circle cx="89" cy="92" r="5" fill="#3b2418" />
          <circle cx="135" cy="92" r="5" fill="#3b2418" />
          <circle cx="90.5" cy="90" r="1.8" fill="#fff" />
          <circle cx="136.5" cy="90" r="1.8" fill="#fff" />
        </g>
      )}
      {/* round glasses */}
      {!sleepy && (
        <g fill="none" stroke="#6b4a36" strokeWidth="2.5">
          <circle cx="86" cy="90" r="17" />
          <circle cx="132" cy="90" r="17" />
          <path d="M103 88 q5 -4 12 0" />
        </g>
      )}

      {/* cheeks, nose, mouth: face turned slightly toward the laptop */}
      <circle cx="70" cy="112" r="7" fill="#FFC8DD" opacity=".85" />
      <circle cx="146" cy="112" r="7" fill="#FFC8DD" opacity=".85" />
      <ellipse cx="116" cy="108" rx="8" ry="5.5" fill={INK} />
      {sleepy ? (
        <ellipse cx="116" cy="123" rx="5" ry="7" fill={INK} />
      ) : (
        <path d={happy ? "M103 116 q13 17 26 0 z" : "M107 117 q9 8 18 0"} fill={happy ? "#FF8FB1" : "none"} stroke={INK} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      )}

      {/* headphones for focus */}
      {focus && (
        <g>
          <path d="M52 86 Q52 28 106 28 Q160 28 160 86" fill="none" stroke="#FF8FB1" strokeWidth="7" strokeLinecap="round" />
          <rect x="43" y="74" width="17" height="30" rx="8" fill="#FFC8DD" stroke={INK} strokeWidth="3" />
          <rect x="152" y="74" width="17" height="30" rx="8" fill="#FFC8DD" stroke={INK} strokeWidth="3" />
        </g>
      )}

      {/* notebook, plant, mug on the desk */}
      <g>
        <rect x="14" y="205" width="62" height="16" rx="3" fill="#F7B6CB" stroke="#c98099" strokeWidth="2" />
        <path d="M38 208 l22 -3" stroke="#c76a8c" strokeWidth="3" strokeLinecap="round" />
        <path d="M100 222 l4 -16 h22 l4 16 z" fill="#C98562" stroke="#a96a49" strokeWidth="2" />
        <path d="M115 206 q-10 -12 -4 -22 q8 8 4 22 M115 206 q4 -16 14 -18 q0 12 -14 18 M115 206 q-2 -14 8 -22 q-1 12 -8 22" fill="#7BC47F" stroke="#3E8E41" strokeWidth="1.5" />
      </g>
      <g>
        <rect x="262" y="176" width="26" height="28" rx="5" fill="#FBF6EE" stroke={INK} strokeWidth="2.5" />
        <path d="M288 182 q12 2 0 14" fill="none" stroke={INK} strokeWidth="2.5" />
        <circle cx="275" cy="190" r="6" fill="#2b2b2b" />
        <circle cx="275" cy="190" r="3" fill="#fff" />
        <path d="M270 176 q-2 -8 2 -14" stroke="#e8d9c8" strokeWidth="2.5" fill="none" className="steam" />
      </g>

      {/* laptop (back of the screen faces us, like the reference) */}
      {!happy && (
        <g>
          <path d="M178 132 L250 120 L258 196 L190 202 Z" fill="#C9CDD2" stroke="#8a8f96" strokeWidth="3" strokeLinejoin="round" />
          <path d="M178 132 L250 120" stroke="#e5e8eb" strokeWidth="4" />
          <g transform="translate(212 168) rotate(-6)" fill="#6FAE5F" stroke="#3E8E41" strokeWidth="1.2">
            <path d="M0 -20 q10 8 8 24 q-8 6 -16 0 q-2 -16 8 -24 z" />
            <path d="M-8 2 q-8 -4 -12 -10 q9 -2 12 10 M8 2 q8 -4 12 -10 q-9 -2 -12 10" />
          </g>
          <path d="M150 204 L232 198 L252 205 L170 212 Z" fill="#B4B8BE" stroke="#8a8f96" strokeWidth="2.5" strokeLinejoin="round" />
        </g>
      )}

      {/* arms and paws */}
      {happy ? (
        <g fill="#2b2b2b" stroke={INK} strokeWidth="3">
          <ellipse className="arm-up l" cx="48" cy="120" rx="14" ry="32" transform="rotate(-28 48 120)" />
          <ellipse className="arm-up r" cx="166" cy="116" rx="14" ry="32" transform="rotate(28 166 116)" />
        </g>
      ) : (
        <g stroke="#2b2b2b" strokeLinecap="round" fill="none">
          <path d="M122 140 Q150 170 176 190" strokeWidth="26" />
          <path d="M104 148 Q138 182 168 198" strokeWidth="24" opacity=".92" />
          <g className="paws" fill="#2b2b2b" stroke={INK} strokeWidth="2">
            <ellipse className="paw l" cx="178" cy="194" rx="13" ry="10" />
            <ellipse className="paw r" cx="166" cy="203" rx="12" ry="9" />
          </g>
        </g>
      )}

      {sleepy && (
        <g className="zzz" fill="#FF8FB1" fontWeight="800" fontFamily="Nunito, sans-serif">
          <text x="170" y="40" fontSize="20">z</text>
          <text x="184" y="24" fontSize="15">z</text>
        </g>
      )}
      {happy && <text x="196" y="50" fontSize="24" className="zzz">✨</text>}
    </svg>
  );
}
