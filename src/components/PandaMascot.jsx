// Kawaii panda peeking over its laptop (flat sticker style, bold outlines).
// state: idle | happy | focus | sleepy. Pupils glance down at the laptop unless asleep/happy.
const INK = "#1F1F1F";
const W = 3.5;

export default function PandaMascot({ state = "idle", size = 260, className = "" }) {
  const happy = state === "happy";
  const sleepy = state === "sleepy";
  const focus = state === "focus";
  return (
    <svg className={`panda panda-${state} ${className}`} width={size} height={(size * 200) / 240} viewBox="0 0 240 200" role="img" aria-label={`Panda mascot, ${state}`} strokeLinecap="round" strokeLinejoin="round">
      {/* ears */}
      <circle cx="62" cy="42" r="21" fill={INK} stroke={INK} strokeWidth={W} />
      <circle cx="178" cy="42" r="21" fill={INK} stroke={INK} strokeWidth={W} />
      <circle cx="64" cy="45" r="8" fill="#FFC8DD" opacity=".9" />
      <circle cx="176" cy="45" r="8" fill="#FFC8DD" opacity=".9" />

      {/* head */}
      <ellipse cx="120" cy="88" rx="72" ry="58" fill="#fff" stroke={INK} strokeWidth={W} />

      {/* eye patches */}
      <ellipse cx="90" cy="86" rx="15" ry="20" fill={INK} transform="rotate(22 90 86)" />
      <ellipse cx="150" cy="86" rx="15" ry="20" fill={INK} transform="rotate(-22 150 86)" />

      {/* eyes */}
      {sleepy ? (
        <g stroke="#fff" strokeWidth="3.5" fill="none">
          <path d="M83 88 q7 6 14 0" />
          <path d="M143 88 q7 6 14 0" />
        </g>
      ) : happy ? (
        <g stroke="#fff" strokeWidth="3.5" fill="none">
          <path d="M83 91 q7 -9 14 0" />
          <path d="M143 91 q7 -9 14 0" />
        </g>
      ) : (
        <g className="eyes">
          <circle cx="90" cy="86" r="8" fill="#fff" />
          <circle cx="150" cy="86" r="8" fill="#fff" />
          <circle cx="90.5" cy="89" r="5" fill={INK} />
          <circle cx="149.5" cy="89" r="5" fill={INK} />
          <circle cx="92" cy="87" r="1.8" fill="#fff" />
          <circle cx="151" cy="87" r="1.8" fill="#fff" />
        </g>
      )}

      {/* cheeks and nose */}
      <ellipse cx="66" cy="110" rx="9" ry="6" fill="#FFC8DD" opacity=".85" />
      <ellipse cx="174" cy="110" rx="9" ry="6" fill="#FFC8DD" opacity=".85" />
      <ellipse cx="120" cy="106" rx="10" ry="6.5" fill={INK} />

      {/* headphones */}
      {focus && (
        <g>
          <path d="M52 86 Q52 24 120 24 Q188 24 188 86" fill="none" stroke="#FF8FB1" strokeWidth="8" />
          <path d="M52 86 Q52 24 120 24 Q188 24 188 86" fill="none" stroke={INK} strokeWidth="1.5" opacity=".35" />
          <rect x="41" y="72" width="19" height="34" rx="9" fill="#FFC8DD" stroke={INK} strokeWidth={W} />
          <rect x="180" y="72" width="19" height="34" rx="9" fill="#FFC8DD" stroke={INK} strokeWidth={W} />
        </g>
      )}

      {/* desk, mouse, mug */}
      <rect x="14" y="178" width="212" height="9" rx="4.5" fill="#F9D9B0" stroke={INK} strokeWidth={W} />
      <ellipse cx="40" cy="172" rx="13" ry="6.5" fill="#fff" stroke={INK} strokeWidth="3" />
      <path d="M40 166 v6" stroke={INK} strokeWidth="2" />
      <g>
        <rect x="190" y="152" width="26" height="26" rx="5" fill="#FF8FB1" stroke={INK} strokeWidth="3" />
        <path d="M216 158 q12 1 12 9 q0 8 -12 8" fill="none" stroke={INK} strokeWidth="3" />
        <path d="M198 144 q-3 -6 1 -11 M207 144 q-3 -6 1 -11" fill="none" stroke="#d8d8d8" strokeWidth="2.5" className="steam" />
      </g>

      {/* body hidden behind the laptop: just the little black arms at the sides */}
      <ellipse cx="66" cy="160" rx="13" ry="16" fill={INK} />
      <ellipse cx="174" cy="160" rx="13" ry="16" fill={INK} />

      {/* laptop, back of the lid facing us */}
      <rect x="68" y="116" width="104" height="58" rx="8" fill="#D6DCE8" stroke={INK} strokeWidth={W} />
      <path d="M76 124 h50" stroke="#fff" strokeWidth="4" opacity=".7" />
      <g transform="translate(120 146)" fill="#7BC47F" stroke={INK} strokeWidth="2">
        <path d="M0 -11 q8 5 6 15 q-6 4 -12 0 q-2 -10 6 -15 z" />
      </g>
      <rect x="60" y="172" width="120" height="8" rx="4" fill="#B9C0CE" stroke={INK} strokeWidth={W} />

      {/* paws on the laptop edge (typing), or waving when happy */}
      {happy ? (
        <g fill={INK}>
          <ellipse className="arm-up l" cx="46" cy="118" rx="12" ry="22" transform="rotate(-25 46 118)" />
          <ellipse className="arm-up r" cx="194" cy="118" rx="12" ry="22" transform="rotate(25 194 118)" />
        </g>
      ) : (
        <g fill={INK}>
          <ellipse className="paw l" cx="80" cy="118" rx="10" ry="7" />
          <ellipse className="paw r" cx="160" cy="118" rx="10" ry="7" />
        </g>
      )}

      {sleepy && (
        <g className="zzz" fill="#FF8FB1" fontWeight="800" fontFamily="Nunito, sans-serif">
          <text x="196" y="40" fontSize="22">z</text>
          <text x="210" y="22" fontSize="16">z</text>
        </g>
      )}
      {happy && <text x="196" y="40" fontSize="24" className="zzz">✨</text>}
    </svg>
  );
}
