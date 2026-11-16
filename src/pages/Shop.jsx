import { useApp } from "../context/AppContext.jsx";
import { BambooDecor, Card, PrimaryButton, TopNav } from "../components/ui.jsx";
import PandaMascot from "../components/PandaMascot.jsx";
import { CATEGORIES, EMPTY_EQUIPPED, SHOP_ITEMS } from "../lib/shop.js";
import { Link } from "react-router-dom";

const HINTS = {
  background: "Cheapest way to freshen up your panda's scene.",
  sticker: "Wear as many as you like. They shrink to fit.",
  mug: "Desk accessory. You can put 2 on the desk at once.",
  drink: "Desk accessory. You can put 2 on the desk at once.",
  object: "Desk accessory. You can put 2 on the desk at once.",
  plant: "Desk accessory. You can put 2 on the desk at once.",
  head: "One at a time.",
  clothes: "One at a time. The priciest gear.",
};

const jump = (id) => document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });

export default function Shop() {
  const { bamboo, owned, buyItem } = useApp();
  return (
    <>
      <TopNav />
      <main className="page wide">
        <BambooDecor />
        <div className="shop-head">
          <div>
            <h1>Bamboo Shop</h1>
            <p className="muted">Spend the bamboo you earn from study sessions and finished tasks. Equip what you buy on the <Link to="/customize">Customize</Link> page.</p>
          </div>
          <div className="balance">🎋 {bamboo} bamboo</div>
        </div>

        <div className="cat-nav" role="navigation" aria-label="Shop sections">
          {CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => jump(c.id)}>{c.emoji} {c.label}</button>
          ))}
        </div>

        {CATEGORIES.map((c) => {
          const items = SHOP_ITEMS.filter((i) => i.cat === c.id);
          return (
            <section key={c.id} id={`cat-${c.id}`} className="shop-section" aria-labelledby={`h-${c.id}`}>
              <h2 id={`h-${c.id}`}>{c.emoji} {c.label}</h2>
              <p className="sub">{HINTS[c.id]}</p>
              <div className="shop-grid">
                {items.map((i) => {
                  const has = owned.includes(i.id);
                  const short = i.price - bamboo;
                  const preview = { ...EMPTY_EQUIPPED, [i.slot]: [i.id] };
                  return (
                    <Card key={i.id} className={`shop-item ${has ? "owned" : ""}`}>
                      <PandaMascot equipped={preview} state="idle" size={170} />
                      <b>{i.name}</b>
                      <span className="price">🎋 {i.price}</span>
                      {has ? (
                        <span className="pill green">Bought ✓</span>
                      ) : (
                        <PrimaryButton variant="small" disabled={short > 0} onClick={() => buyItem(i.id)} title={short > 0 ? `Need ${short} more bamboo` : ""}>
                          {short > 0 ? `Need ${short} more 🎋` : "Buy"}
                        </PrimaryButton>
                      )}
                    </Card>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>
    </>
  );
}
