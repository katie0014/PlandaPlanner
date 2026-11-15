// Shop catalog. Each item fits one slot on the mascot; one item per slot can be equipped.
export const SLOTS = [
  { id: "clothes", label: "Clothes", emoji: "🧥" },
  { id: "head", label: "Head accessories", emoji: "🎀" },
  { id: "sticker", label: "Laptop stickers", emoji: "⭐" },
  { id: "desk", label: "Desk objects", emoji: "📚" },
  { id: "mug", label: "Mugs", emoji: "☕" },
  { id: "plant", label: "Plants", emoji: "🪴" },
];

export const ITEMS = [
  { id: "hoodie-pink", slot: "clothes", name: "Pink hoodie", price: 70, color: "#FF8FB1" },
  { id: "sweater-green", slot: "clothes", name: "Bamboo sweater", price: 80, color: "#7BC47F" },
  { id: "hoodie-blue", slot: "clothes", name: "Sky hoodie", price: 70, color: "#8EC5FF" },
  { id: "raincoat", slot: "clothes", name: "Yellow raincoat", price: 90, color: "#FFD84D" },
  { id: "scarf-red", slot: "clothes", name: "Cozy scarf", price: 60, color: "#E85D75" },

  { id: "bow", slot: "head", name: "Pink bow", price: 40 },
  { id: "flowers", slot: "head", name: "Flower crown", price: 55 },
  { id: "party", slot: "head", name: "Party hat", price: 45 },
  { id: "straw", slot: "head", name: "Straw hat", price: 60 },
  { id: "grad", slot: "head", name: "Graduation cap", price: 90 },
  { id: "crown", slot: "head", name: "Golden crown", price: 100 },

  { id: "st-heart", slot: "sticker", name: "Heart sticker", price: 25 },
  { id: "st-star", slot: "sticker", name: "Star sticker", price: 25 },
  { id: "st-smile", slot: "sticker", name: "Smiley sticker", price: 30 },
  { id: "st-bolt", slot: "sticker", name: "Lightning sticker", price: 35 },
  { id: "st-rainbow", slot: "sticker", name: "Rainbow sticker", price: 40 },
  { id: "st-panda", slot: "sticker", name: "Mini panda sticker", price: 45 },

  { id: "books", slot: "desk", name: "Book stack", price: 40 },
  { id: "lamp", slot: "desk", name: "Desk lamp", price: 55 },
  { id: "globe", slot: "desk", name: "Little globe", price: 60 },
  { id: "trophy", slot: "desk", name: "Gold trophy", price: 70 },

  { id: "mug-pink", slot: "mug", name: "Pink mug", price: 0, color: "#FF8FB1" },
  { id: "mug-mint", slot: "mug", name: "Mint mug", price: 20, color: "#9BE3B5" },
  { id: "mug-blue", slot: "mug", name: "Sky mug", price: 20, color: "#8EC5FF" },
  { id: "mug-yellow", slot: "mug", name: "Sunny mug", price: 25, color: "#FFD84D" },
  { id: "mug-purple", slot: "mug", name: "Lilac mug", price: 25, color: "#C9A7F0" },
  { id: "mug-panda", slot: "mug", name: "Panda mug", price: 40, color: "#FFFFFF" },

  { id: "succulent", slot: "plant", name: "Succulent", price: 30 },
  { id: "cactus", slot: "plant", name: "Tiny cactus", price: 35 },
  { id: "tulip", slot: "plant", name: "Tulip", price: 40 },
  { id: "lucky-bamboo", slot: "plant", name: "Lucky bamboo", price: 45 },
];

export const ITEM_BY_ID = Object.fromEntries(ITEMS.map((i) => [i.id, i]));
export const START_OWNED = ["mug-pink"];
export const START_EQUIPPED = { clothes: null, head: null, sticker: null, desk: null, mug: "mug-pink", plant: null };
