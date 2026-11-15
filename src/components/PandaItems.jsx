// SVG drawings for the shop items, in the mascot's 240x200 coordinate space.
import { ITEM_BY_ID } from "../lib/shop.js";

const INK = "#1F1F1F";
const S = { stroke: INK, strokeWidth: 3 };
const colorOf = (id, fallback) => ITEM_BY_ID[id]?.color || fallback;

/* ---------- clothes ---------- */
// Collar drawn over the lower head edge, behind the laptop.
export function Collar({ id }) {
  if (!id) return null;
  const c = colorOf(id, "#FF8FB1");
  return (
    <g>
      <path d="M50 124 Q120 166 190 124 L188 142 Q120 184 52 142 Z" fill={c} {...S} />
      {id === "scarf-red" && <path d="M60 134 q60 26 120 0" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="4 5" opacity=".7" />}
    </g>
  );
}
export const sleeveColor = (id) => (id && id !== "scarf-red" ? colorOf(id, null) : null);
export function ScarfTail({ id }) {
  if (id !== "scarf-red") return null;
  return <path d="M176 140 l12 34 l-15 4 l-9 -30 z" fill="#E85D75" {...S} />;
}

/* ---------- head ---------- */
export function HeadItem({ id }) {
  switch (id) {
    case "bow":
      return (
        <g transform="translate(150 33) rotate(14)">
          <path d="M0 0 l-20 -11 v22 z M0 0 l20 -11 v22 z" fill="#FF8FB1" {...S} />
          <circle r="5.5" fill="#FF6B95" {...S} />
        </g>
      );
    case "flowers": {
      const cols = ["#FF8FB1", "#fff", "#FFD84D", "#C9A7F0", "#FF8FB1", "#fff", "#FFD84D"];
      return (
        <g>
          {cols.map((c, i) => {
            const a = ((-158 + i * 22.7) * Math.PI) / 180;
            const x = 120 + 68 * Math.cos(a), y = 88 + 55 * Math.sin(a);
            return (
              <g key={i}>
                <ellipse cx={x + (i % 2 ? 6 : -6)} cy={y + 3} rx="6" ry="2.6" fill="#7BC47F" stroke={INK} strokeWidth="1.5" />
                <circle cx={x} cy={y} r="7.5" fill={c} stroke={INK} strokeWidth="2.2" />
                <circle cx={x} cy={y} r="2.6" fill="#FFB703" />
              </g>
            );
          })}
        </g>
      );
    }
    case "party":
      return (
        <g transform="rotate(10 120 40)">
          <path d="M94 42 L120 6 L146 42 Z" fill="#FFD84D" {...S} />
          <path d="M104 28 l22 -6 M99 36 l32 -8" stroke="#FF8FB1" strokeWidth="4" />
          <circle cx="120" cy="6" r="6" fill="#FF8FB1" {...S} />
        </g>
      );
    case "straw":
      return (
        <g>
          <path d="M88 40 L120 8 L152 40 Z" fill="#EFCF8A" {...S} />
          <path d="M96 30 h48" stroke="#7BC47F" strokeWidth="5" />
          <ellipse cx="120" cy="40" rx="50" ry="9" fill="#F5DDA0" {...S} />
        </g>
      );
    case "crown":
      return (
        <g>
          <path d="M88 44 L92 14 L106 30 L120 8 L134 30 L148 14 L152 44 Z" fill="#FFD84D" {...S} />
          <circle cx="120" cy="30" r="4" fill="#FF6B95" stroke={INK} strokeWidth="1.8" />
          <circle cx="102" cy="38" r="3" fill="#8EC5FF" stroke={INK} strokeWidth="1.5" />
          <circle cx="138" cy="38" r="3" fill="#8EC5FF" stroke={INK} strokeWidth="1.5" />
        </g>
      );
    default:
      return null;
  }
}

/* ---------- laptop stickers (lid spans x 68-172, y 116-174; bamboo logo sits at centre) ---------- */
// Spots around the logo, in the order they fill up.
const STICKER_SPOTS = [[90, 147], [150, 147], [100, 126], [140, 126], [100, 162], [140, 162]];
const stickerScale = (n) => (n <= 1 ? 1 : n === 2 ? 0.9 : n <= 4 ? 0.75 : 0.62);

export function Stickers({ ids = [] }) {
  const list = ids.slice(0, STICKER_SPOTS.length);
  const s = stickerScale(list.length);
  return (
    <g>
      {list.map((id, i) => (
        <g key={id} transform={`translate(${STICKER_SPOTS[i][0]} ${STICKER_SPOTS[i][1]}) scale(${s})`}>
          <Sticker id={id} />
        </g>
      ))}
    </g>
  );
}

function Sticker({ id }) {
  switch (id) {
    case "st-heart":
      return <path transform="scale(1.2)" d="M0 8 C-16 -3 -9 -14 0 -6 C9 -14 16 -3 0 8 Z" fill="#FF6B8B" stroke={INK} strokeWidth="2" />;
    case "st-star":
      return <polygon points="0,-12 3.5,-4 12,-3.5 5.5,2.5 7.5,11 0,6.5 -7.5,11 -5.5,2.5 -12,-3.5 -3.5,-4" fill="#FFD84D" stroke={INK} strokeWidth="2" />;
    case "st-smile":
      return (
        <g>
          <circle r="11" fill="#FFE066" stroke={INK} strokeWidth="2" />
          <circle cx="-4" cy="-3" r="1.8" fill={INK} /><circle cx="4" cy="-3" r="1.8" fill={INK} />
          <path d="M-5 3 q5 6 10 0" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case "st-bolt":
      return <polygon points="3,-13 -8,2 -1,2 -4,13 8,-3 1,-3" fill="#FFD84D" stroke={INK} strokeWidth="2" strokeLinejoin="round" />;
    case "st-rainbow":
      return (
        <g fill="none" strokeWidth="3.2" strokeLinecap="round">
          <path d="M-12 8 a12 12 0 0 1 24 0" stroke="#FF6B8B" />
          <path d="M-8 8 a8 8 0 0 1 16 0" stroke="#FFD84D" />
          <path d="M-4 8 a4 4 0 0 1 8 0" stroke="#7BC47F" />
        </g>
      );
    case "st-panda":
      return (
        <g>
          <circle cx="-7" cy="-8" r="4" fill={INK} /><circle cx="7" cy="-8" r="4" fill={INK} />
          <circle r="10" fill="#fff" stroke={INK} strokeWidth="2" />
          <ellipse cx="-4" cy="-1" rx="2.6" ry="3.4" fill={INK} /><ellipse cx="4" cy="-1" rx="2.6" ry="3.4" fill={INK} />
          <ellipse cx="0" cy="4" rx="2" ry="1.4" fill={INK} />
        </g>
      );
    default:
      return null;
  }
}

/* ---------- desk objects (left of the laptop, standing on the desk at y=178) ---------- */
export function DeskItem({ id }) {
  switch (id) {
    case "books":
      return (
        <g {...{ stroke: INK, strokeWidth: 2.5 }}>
          <rect x="14" y="164" width="42" height="14" rx="3" fill="#FF8FB1" />
          <rect x="19" y="151" width="36" height="13" rx="3" fill="#7BC47F" />
          <rect x="16" y="139" width="38" height="12" rx="3" fill="#8EC5FF" />
          <path d="M22 171 h26 M26 157 h22" stroke="#fff" strokeWidth="2" />
        </g>
      );
    case "lamp":
      return (
        <g>
          <ellipse cx="32" cy="175" rx="15" ry="4.5" fill="#B9C0CE" {...S} />
          <path d="M32 173 L26 148 L46 136" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <path d="M36 126 l24 8 l-8 14 z" fill="#FFD84D" {...S} />
          <path d="M52 150 l4 12 l-14 -2 z" fill="#FFF3B0" opacity=".7" />
        </g>
      );
    case "globe":
      return (
        <g>
          <rect x="20" y="170" width="28" height="8" rx="3" fill="#C98562" {...S} />
          <path d="M16 148 a18 18 0 0 0 36 0" fill="none" stroke={INK} strokeWidth="3" />
          <path d="M34 166 v6" stroke={INK} strokeWidth="3" />
          <circle cx="34" cy="146" r="14" fill="#8EC5FF" {...S} />
          <path d="M26 142 q6 -6 10 0 q-2 6 -8 6 z M38 150 q6 -2 6 4 q-6 2 -6 -4 z" fill="#7BC47F" />
        </g>
      );
    case "trophy":
      return (
        <g>
          <rect x="20" y="170" width="28" height="8" rx="2.5" fill="#B9C0CE" {...S} />
          <path d="M31 168 h6 v-8 h-6 z" fill="#FFD84D" {...S} />
          <path d="M20 134 h28 q0 24 -14 26 q-14 -2 -14 -26 z" fill="#FFD84D" {...S} />
          <path d="M20 138 q-10 0 -8 8 q2 6 10 6 M48 138 q10 0 8 8 q-2 6 -10 6" fill="none" stroke={INK} strokeWidth="3" />
          <path d="M28 140 v10" stroke="#fff" strokeWidth="2.5" opacity=".8" strokeLinecap="round" />
        </g>
      );
    default:
      return null;
  }
}

/* ---------- mugs (x 184-206, standing on the desk) ---------- */
export function Mug({ id }) {
  if (!id) return null;
  const c = colorOf(id, "#FF8FB1");
  return (
    <g>
      <rect x="184" y="156" width="22" height="22" rx="5" fill={c} {...S} />
      <path d="M206 162 q11 1 11 8 q0 7 -11 7" fill="none" stroke={INK} strokeWidth="3" />
      {id === "mug-panda" && (
        <g>
          <circle cx="190" cy="164" r="2.6" fill={INK} /><circle cx="200" cy="164" r="2.6" fill={INK} />
          <circle cx="195" cy="168" r="5.5" fill="#fff" stroke={INK} strokeWidth="1.5" />
          <circle cx="193" cy="167" r="1.2" fill={INK} /><circle cx="197" cy="167" r="1.2" fill={INK} />
        </g>
      )}
      <path d="M191 150 q-3 -6 1 -11 M199 150 q-3 -6 1 -11" fill="none" stroke="#d8d8d8" strokeWidth="2.5" className="steam" />
    </g>
  );
}

/* ---------- plants (pot at the far right, x 220-238) ---------- */
export function Plant({ id }) {
  if (!id) return null;
  const pot = <path d="M221 164 h18 l-3 14 h-12 z" fill="#D98A63" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />;
  switch (id) {
    case "succulent":
      return (
        <g>
          {pot}
          <path d="M230 164 q-12 -4 -9 -14 q8 2 9 14 M230 164 q12 -4 9 -14 q-8 2 -9 14 M230 164 q-5 -10 0 -20 q5 10 0 20" fill="#7BC47F" stroke="#3E8E41" strokeWidth="1.8" />
        </g>
      );
    case "cactus":
      return (
        <g>
          {pot}
          <rect x="224" y="136" width="12" height="30" rx="6" fill="#7BC47F" stroke={INK} strokeWidth="2.5" />
          <path d="M224 150 q-8 0 -8 -8 M236 148 q8 0 8 -8" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M224 150 q-8 0 -8 -8 M236 148 q8 0 8 -8" fill="none" stroke="#7BC47F" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="230" cy="135" r="3.5" fill="#FF6B95" stroke={INK} strokeWidth="1.5" />
        </g>
      );
    case "tulip":
      return (
        <g>
          {pot}
          <path d="M230 164 V140" stroke="#3E8E41" strokeWidth="3" />
          <path d="M230 158 q-10 -2 -10 -12 q9 2 10 12" fill="#7BC47F" stroke="#3E8E41" strokeWidth="1.5" />
          <path d="M222 132 q0 12 8 12 q8 0 8 -12 l-4 4 l-4 -6 l-4 6 z" fill="#FF6B95" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
        </g>
      );
    case "lucky-bamboo":
      return (
        <g>
          {pot}
          {[[225, 128], [231, 120], [236, 132]].map(([x, top], i) => (
            <g key={i}>
              <rect x={x - 2} y={top} width="4" height={166 - top} rx="2" fill="#7BC47F" stroke="#3E8E41" strokeWidth="1.2" />
              <path d={`M${x - 2} ${top + 14} h4 M${x - 2} ${top + 28} h4`} stroke="#3E8E41" strokeWidth="1.6" />
              <ellipse cx={x + 6} cy={top + 3} rx="6" ry="2.4" fill="#7BC47F" stroke="#3E8E41" strokeWidth="1" transform={`rotate(-25 ${x + 6} ${top + 3})`} />
            </g>
          ))}
        </g>
      );
    default:
      return null;
  }
}

/* ---------- drinks (drawn around x=200, standing on the desk) ---------- */
export function Drink({ id }) {
  if (id === "boba")
    return (
      <g>
        <path d="M204 126 L198 156" stroke="#FF8FB1" strokeWidth="5" strokeLinecap="round" />
        <path d="M188 156 h24 l-3 22 h-18 z" fill="#F4F8FF" fillOpacity=".85" {...S} />
        <path d="M190 164 h20 l-2 14 h-16 z" fill="#C8956B" />
        {[[194, 174], [200, 172], [206, 174], [197, 177], [203, 177]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.2" fill="#3b2418" />)}
        <path d="M186 156 q14 -9 28 0 z" fill="#FFC8DD" {...S} />
      </g>
    );
  // a plain, unbranded soda can
  return (
    <g>
      <rect x="188" y="148" width="24" height="30" rx="5" fill="#E85D75" {...S} />
      <path d="M188 160 q6 -5 12 0 t12 0 v8 q-6 -5 -12 0 t-12 0 z" fill="#fff" />
      <rect x="190" y="146" width="20" height="4" rx="2" fill="#B9C0CE" stroke={INK} strokeWidth="2" />
      <path d="M200 146 l5 -3" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
    </g>
  );
}

// Places a desk accessory on the left or right half of the desk. Each kind is drawn around a
// native centre x, so it is shifted to the chosen spot.
const NATIVE_X = { object: 35, mug: 200, drink: 200, plant: 230 };
const SPOT_X = { left: 34, right: 205 };
export function DeskPiece({ id, spot }) {
  const cat = ITEM_BY_ID[id]?.cat;
  if (!cat) return null;
  const dx = SPOT_X[spot] - NATIVE_X[cat];
  return (
    <g transform={`translate(${dx} 0)`}>
      {cat === "object" && <DeskItem id={id} />}
      {cat === "mug" && <Mug id={id} />}
      {cat === "drink" && <Drink id={id} />}
      {cat === "plant" && <Plant id={id} />}
    </g>
  );
}

/* ---------- background behind the panda ---------- */
export function Background({ id }) {
  const it = ITEM_BY_ID[id];
  if (!it) return null;
  return (
    <g>
      {it.colors && (
        <defs>
          <linearGradient id="bg-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={it.colors[0]} />
            <stop offset="1" stopColor={it.colors[1]} />
          </linearGradient>
        </defs>
      )}
      <rect x="0" y="0" width="240" height="200" rx="26" fill={it.colors ? "url(#bg-grad)" : it.color} />
    </g>
  );
}
