import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { BambooDecor, Card, PrimaryButton, TopNav } from "../components/ui.jsx";
import PandaMascot from "../components/PandaMascot.jsx";
import { ITEMS, SLOTS, START_EQUIPPED } from "../lib/shop.js";

export default function Shop() {
  const { bamboo, owned, buyItem, equipItem, equipped } = useApp();
  const [slot, setSlot] = useState("all");
  const [msg, setMsg] = useState("");
  const items = ITEMS.filter((i) => slot === "all" || i.slot === slot);

  const buy = (id) => {
    const r = buyItem(id);
    setMsg(r.ok ? "" : r.message);
  };

  return (
    <>
      <TopNav />
      <main className="page wide">
        <BambooDecor />
        <div className="shop-head">
          <div>
            <h1>Bamboo shop</h1>
            <p className="muted">Spend the bamboo you earn from study sessions and finished tasks.</p>
          </div>
          <div className="balance">🎋 {bamboo} bamboo</div>
        </div>
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={slot === "all"} className={slot === "all" ? "on" : ""} onClick={() => setSlot("all")}>All</button>
          {SLOTS.map((s) => (
            <button key={s.id} role="tab" aria-selected={slot === s.id} className={slot === s.id ? "on" : ""} onClick={() => setSlot(s.id)}>{s.emoji} {s.label}</button>
          ))}
        </div>
        {msg && <p role="alert" style={{ color: "#b3261e", fontWeight: 700 }}>{msg}</p>}
        <div className="shop-grid">
          {items.map((i) => {
            const has = owned.includes(i.id);
            const short = i.price - bamboo;
            // preview just this item on an otherwise plain panda
            const preview = { ...START_EQUIPPED, mug: i.slot === "mug" ? i.id : "mug-pink", [i.slot]: i.id };
            return (
              <Card key={i.id} className={`shop-item ${has ? "owned" : ""}`}>
                <PandaMascot equipped={preview} state="idle" size={170} />
                <b>{i.name}</b>
                <span className="price">{i.price === 0 ? "Free" : `🎋 ${i.price}`}</span>
                {has ? (
                  equipped[i.slot] === i.id ? (
                    <span className="pill green">Equipped ✓</span>
                  ) : (
                    <PrimaryButton variant="small green" onClick={() => equipItem(i.id)}>Owned: equip</PrimaryButton>
                  )
                ) : (
                  <PrimaryButton variant="small" disabled={short > 0} onClick={() => buy(i.id)} title={short > 0 ? `Need ${short} more bamboo` : ""}>
                    {short > 0 ? `Need ${short} more 🎋` : "Buy"}
                  </PrimaryButton>
                )}
              </Card>
            );
          })}
        </div>
      </main>
    </>
  );
}
