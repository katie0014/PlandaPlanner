import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { BambooDecor, Card, TopNav } from "../components/ui.jsx";
import PandaMascot from "../components/PandaMascot.jsx";
import { ITEMS, SLOTS, SLOT_RULES } from "../lib/shop.js";

export default function Customize() {
  const { owned, equipped, equipItem, unequipItem, unequipSlot } = useApp();
  return (
    <>
      <TopNav />
      <main className="page wide">
        <BambooDecor />
        <h1>Customize your panda</h1>
        <p className="muted">Whatever you equip shows up on every panda in the app. Need more? Visit the <Link to="/shop">shop</Link>.</p>
        <div className="cust-grid">
          <Card className="cust-preview">
            <PandaMascot state="idle" size={340} />
          </Card>
          <Card>
            {SLOTS.map((slot) => {
              const mine = ITEMS.filter((i) => i.slot === slot.id && owned.includes(i.id));
              const on = equipped[slot.id] || [];
              const max = SLOT_RULES[slot.id].max;
              const full = on.length >= max && max > 1;
              return (
                <section className="slot-group" key={slot.id}>
                  <h3>{slot.emoji} {slot.label}{max > 1 && max !== Infinity ? ` · ${on.length}/${max}` : ""}</h3>
                  <div className="chips">
                    <button className={`chip ${on.length === 0 ? "on" : ""}`} aria-pressed={on.length === 0} onClick={() => unequipSlot(slot.id)}>None</button>
                    {mine.map((i) => {
                      const sel = on.includes(i.id);
                      return (
                        <button key={i.id} className={`chip ${sel ? "on" : ""}`} aria-pressed={sel}
                          disabled={!sel && full} title={!sel && full ? `Max ${max}: unequip one first` : ""}
                          onClick={() => (sel ? unequipItem(i.id) : equipItem(i.id))}>
                          {i.name}
                        </button>
                      );
                    })}
                  </div>
                  {mine.length === 0 && <p className="muted small">Nothing bought yet.</p>}
                  {full && <p className="muted small">You've reached the limit of {max}. Unequip one to swap.</p>}
                </section>
              );
            })}
          </Card>
        </div>
      </main>
    </>
  );
}
