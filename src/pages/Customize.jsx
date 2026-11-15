import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { BambooDecor, Card, TopNav } from "../components/ui.jsx";
import PandaMascot from "../components/PandaMascot.jsx";
import { ITEMS, SLOTS } from "../lib/shop.js";

export default function Customize() {
  const { owned, equipped, equipItem, unequipSlot } = useApp();
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
              return (
                <section className="slot-group" key={slot.id}>
                  <h3>{slot.emoji} {slot.label}</h3>
                  <div className="chips">
                    <button className={`chip ${!equipped[slot.id] ? "on" : ""}`} aria-pressed={!equipped[slot.id]} onClick={() => unequipSlot(slot.id)}>None</button>
                    {mine.map((i) => (
                      <button key={i.id} className={`chip ${equipped[slot.id] === i.id ? "on" : ""}`} aria-pressed={equipped[slot.id] === i.id}
                        onClick={() => (equipped[slot.id] === i.id ? unequipSlot(slot.id) : equipItem(i.id))}>
                        {i.name}
                      </button>
                    ))}
                  </div>
                  {mine.length === 0 && <p className="muted small">Nothing owned yet.</p>}
                </section>
              );
            })}
          </Card>
        </div>
      </main>
    </>
  );
}
