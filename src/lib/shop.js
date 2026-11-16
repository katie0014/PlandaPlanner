// Shop catalog. `cat` is the shop section; `slot` decides how many can be worn at once.
//
// Price tiers (every price is above the 50-bamboo starting balance):
//   backgrounds 60 < stickers 70 < mugs/drinks/plants/desk objects 90-130 < head 140-190 < clothes 200-260

// Equip rules per slot. Stickers shrink to fit as more are added.
export const SLOT_RULES = {
  background: { max: 1 },
  sticker: { max: Infinity },
  desk: { max: 2 },
  head: { max: 1 },
  clothes: { max: 1 },
};

// Slots as shown on the Customize page.
export const SLOTS = [
  { id: "background", label: "Background Color", emoji: "🎨" },
  { id: "sticker", label: "Laptop Stickers (As Many as You Like)", emoji: "⭐" },
  { id: "desk", label: "Desk Accessories (Max 2)", emoji: "📚" },
  { id: "head", label: "Head Accessory (1)", emoji: "🎀" },
  { id: "clothes", label: "Clothes (1)", emoji: "🧥" },
];

// Sections of the shop page, in display order.
export const CATEGORIES = [
  { id: "background", label: "Background Colors", emoji: "🎨", slot: "background" },
  { id: "sticker", label: "Laptop Stickers", emoji: "⭐", slot: "sticker" },
  { id: "mug", label: "Mugs", emoji: "☕", slot: "desk" },
  { id: "drink", label: "Drinks", emoji: "🧋", slot: "desk" },
  { id: "object", label: "Desk Objects", emoji: "📚", slot: "desk" },
  { id: "plant", label: "Plants", emoji: "🪴", slot: "desk" },
  { id: "head", label: "Head Accessories", emoji: "🎀", slot: "head" },
  { id: "clothes", label: "Clothes", emoji: "🧥", slot: "clothes" },
];
const SLOT_OF = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.slot]));

const RAW = [
  { id: "bg-mint", cat: "background", name: "Mint", price: 60, color: "#D8F3DC" },
  { id: "bg-lavender", cat: "background", name: "Lavender", price: 60, color: "#E6DAFB" },
  { id: "bg-sky", cat: "background", name: "Sky blue", price: 60, color: "#D6ECFF" },
  { id: "bg-butter", cat: "background", name: "Butter yellow", price: 60, color: "#FFF3C4" },
  { id: "bg-peach", cat: "background", name: "Peach", price: 60, color: "#FFD9C7" },
  { id: "bg-sunset", cat: "background", name: "Sunset", price: 60, colors: ["#FFE0A8", "#FFB5C8"] },

  { id: "st-heart", cat: "sticker", name: "Heart", price: 70 },
  { id: "st-star", cat: "sticker", name: "Star", price: 70 },
  { id: "st-smile", cat: "sticker", name: "Smiley", price: 70 },
  { id: "st-bolt", cat: "sticker", name: "Lightning", price: 70 },
  { id: "st-rainbow", cat: "sticker", name: "Rainbow", price: 70 },
  { id: "st-panda", cat: "sticker", name: "Mini panda", price: 70 },

  { id: "mug-pink", cat: "mug", name: "Pink mug", price: 90, color: "#FF8FB1", starter: true },
  { id: "mug-mint", cat: "mug", name: "Mint mug", price: 90, color: "#9BE3B5" },
  { id: "mug-blue", cat: "mug", name: "Sky mug", price: 90, color: "#8EC5FF" },
  { id: "mug-yellow", cat: "mug", name: "Sunny mug", price: 90, color: "#FFD84D" },
  { id: "mug-purple", cat: "mug", name: "Lilac mug", price: 90, color: "#C9A7F0" },
  { id: "mug-panda", cat: "mug", name: "Panda mug", price: 100, color: "#FFFFFF" },

  { id: "boba", cat: "drink", name: "Boba drink", price: 100 },
  { id: "soda", cat: "drink", name: "Soda", price: 95 },

  { id: "books", cat: "object", name: "Book stack", price: 110 },
  { id: "lamp", cat: "object", name: "Desk lamp", price: 120 },
  { id: "globe", cat: "object", name: "Little globe", price: 125 },
  { id: "trophy", cat: "object", name: "Gold trophy", price: 130 },

  { id: "succulent", cat: "plant", name: "Succulent", price: 100 },
  { id: "cactus", cat: "plant", name: "Tiny cactus", price: 105 },
  { id: "tulip", cat: "plant", name: "Tulip", price: 110 },
  { id: "lucky-bamboo", cat: "plant", name: "Lucky bamboo", price: 115 },

  { id: "bow", cat: "head", name: "Pink bow", price: 140 },
  { id: "party", cat: "head", name: "Party hat", price: 150 },
  { id: "straw", cat: "head", name: "Straw hat", price: 160 },
  { id: "flowers", cat: "head", name: "Flower crown", price: 170 },
  { id: "crown", cat: "head", name: "Golden crown", price: 190 },
  { id: "headphones", cat: "head", name: "Headphones", price: 195 },

  { id: "scarf-red", cat: "clothes", name: "Cozy scarf", price: 200, color: "#E85D75" },
  { id: "hoodie-pink", cat: "clothes", name: "Pink hoodie", price: 220, color: "#FF8FB1" },
  { id: "hoodie-blue", cat: "clothes", name: "Sky hoodie", price: 220, color: "#8EC5FF" },
  { id: "sweater-green", cat: "clothes", name: "Bamboo sweater", price: 240, color: "#7BC47F" },
  { id: "raincoat", cat: "clothes", name: "Yellow raincoat", price: 260, color: "#FFD84D" },
];

export const ITEMS = RAW.map((i) => ({ ...i, slot: SLOT_OF[i.cat] }));
export const ITEM_BY_ID = Object.fromEntries(ITEMS.map((i) => [i.id, i]));
// The pink mug is the free starter item: owned and equipped from the start, never sold.
export const SHOP_ITEMS = ITEMS.filter((i) => !i.starter);
export const START_OWNED = ["mug-pink"];
export const EMPTY_EQUIPPED = { background: [], sticker: [], desk: [], head: [], clothes: [] };
export const START_EQUIPPED = { ...EMPTY_EQUIPPED, desk: ["mug-pink"] };

// Rebuilds a saved outfit into the current shape: older saves kept one string per slot and had
// separate mug/plant slots, and removed items must not linger.
export function normalizeEquipped(raw, owned) {
  const out = { background: [], sticker: [], desk: [], head: [], clothes: [] };
  const old = raw || {};
  const add = (slot, v) =>
    [].concat(v || []).forEach((id) => {
      const it = ITEM_BY_ID[id];
      if (it && it.slot === slot && owned.includes(id) && !out[slot].includes(id) && out[slot].length < SLOT_RULES[slot].max) out[slot].push(id);
    });
  ["background", "sticker", "head", "clothes"].forEach((s) => add(s, old[s]));
  add("desk", old.desk);
  add("desk", old.mug);
  add("desk", old.plant);
  return out;
}

// Result of trying to equip an item; shared by the UI and the reducer.
export function equipRule(equipped, id) {
  const it = ITEM_BY_ID[id];
  if (!it) return { ok: false, message: "Unknown item." };
  const cur = equipped[it.slot] || [];
  if (cur.includes(id)) return { ok: true, next: cur };
  const max = SLOT_RULES[it.slot].max;
  if (max === 1) return { ok: true, next: [id] };
  if (cur.length >= max) return { ok: false, message: `You can only use ${max} at a time. Unequip one first.` };
  return { ok: true, next: [...cur, id] };
}
