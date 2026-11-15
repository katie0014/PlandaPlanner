import { createContext, useContext, useEffect, useReducer, useRef, useState, useCallback } from "react";
import { generatePlan as apiGeneratePlan } from "../lib/api.js";
import { isPreserved } from "../lib/scheduler.js";
import { hoursBetween, toISO, uid } from "../lib/dates.js";
import { ITEM_BY_ID, START_EQUIPPED, START_OWNED } from "../lib/shop.js";
import { START_BAMBOO, taskReward } from "../lib/rewards.js";

const KEY = "panda-planner-v1";
const empty = { user: null, assignments: [], timeBlocks: [], suggestedDates: [], icsInfo: null, bamboo: START_BAMBOO, owned: START_OWNED, equipped: START_EQUIPPED, stats: { stalksGrown: 0, sessionsCompleted: 0, weekStart: null } };

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    // older saves have no bamboo/outfit fields, so fall back to the starting values
    return s ? { ...empty, ...s, equipped: { ...START_EQUIPPED, ...s.equipped }, owned: [...new Set([...START_OWNED, ...(s.owned || [])])] } : empty;
  } catch {
    return empty;
  }
}

function reducer(state, a) {
  switch (a.type) {
    case "set":
      return { ...state, ...a.payload };
    case "reset":
      return empty;
    case "toggleDone": {
      const b = state.timeBlocks.find((x) => x.id === a.id);
      if (!b) return state;
      const done = a.value ?? !b.done;
      if (done === b.done) return state;
      const hrs = hoursBetween(b.start, b.end);
      return {
        ...state,
        timeBlocks: state.timeBlocks.map((x) => (x.id === a.id ? { ...x, done } : x)),
        assignments:
          b.type === "study" && b.assignmentId
            ? state.assignments.map((x) =>
                x.id === b.assignmentId ? { ...x, hoursDone: Math.max(0, (x.hoursDone || 0) + (done ? hrs : -hrs)) } : x
              )
            : state.assignments,
      };
    }
    case "earn":
      return { ...state, bamboo: state.bamboo + Math.max(0, Math.round(a.amount)) };
    case "buy": {
      const item = ITEM_BY_ID[a.id];
      // checked here too, so a double click or stale UI can never overspend or buy twice
      if (!item || state.owned.includes(item.id) || state.bamboo < item.price) return state;
      return { ...state, bamboo: state.bamboo - item.price, owned: [...state.owned, item.id] };
    }
    case "equip": {
      const item = ITEM_BY_ID[a.id];
      if (!item || !state.owned.includes(item.id)) return state;
      return { ...state, equipped: { ...state.equipped, [item.slot]: item.id } };
    }
    case "unequip":
      return { ...state, equipped: { ...state.equipped, [a.slot]: null } };
    case "addStalks": {
      const stats = state.stats;
      return { ...state, stats: { ...stats, stalksGrown: stats.stalksGrown + a.stalks, sessionsCompleted: stats.sessionsCompleted + 1 } };
    }
    default:
      return state;
  }
}

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  const [planning, setPlanning] = useState(false);
  const [toast, setToast] = useState(null);
  const ref = useRef(state);
  ref.current = state;

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked */
    }
  }, [state]);

  const set = (payload) => dispatch({ type: "set", payload });

  // Calls the planner with the freshest state; `over` lets callers pass values that
  // were just dispatched and have not rendered yet.
  const generatePlan = useCallback(async (over = {}) => {
    const s = { ...ref.current, ...over };
    if (!s.user) return;
    setPlanning(true);
    try {
      const now = new Date();
      const keep = s.timeBlocks.filter((b) => isPreserved(b, now));
      const plan = await apiGeneratePlan({ user: s.user, assignments: s.assignments, lockedBlocks: keep, today: toISO(now) });
      const old = new Map(ref.current.suggestedDates.map((x) => [x.id, x]));
      const manual = ref.current.suggestedDates.filter((x) => x.accepted && !plan.suggestedDates.some((y) => y.id === x.id));
      const merged = plan.suggestedDates.map((x) => (old.get(x.id)?.accepted ? { ...x, accepted: true } : x));
      const ids = new Set(s.assignments.map((a) => a.id));
      set({
        timeBlocks: [...keep, ...plan.timeBlocks].sort((x, y) => new Date(x.start) - new Date(y.start)),
        suggestedDates: [...merged, ...manual].filter((x) => ids.has(x.assignmentId)),
      });
      return plan;
    } finally {
      setPlanning(false);
    }
  }, []);

  const notify = (text) => setToast({ id: Date.now(), text });

  const actions = {
    notify,
    earnBamboo: (amount, text) => {
      dispatch({ type: "earn", amount });
      if (text) notify(text);
    },
    buyItem: (id) => {
      const item = ITEM_BY_ID[id];
      const st = ref.current;
      if (!item || st.owned.includes(id)) return { ok: false, message: "You already own this." };
      if (st.bamboo < item.price) return { ok: false, message: `You need ${item.price - st.bamboo} more bamboo.` };
      dispatch({ type: "buy", id });
      notify(`Bought ${item.name}! −${item.price} 🎋`);
      return { ok: true };
    },
    equipItem: (id) => dispatch({ type: "equip", id }),
    unequipSlot: (slot) => dispatch({ type: "unequip", slot }),
    setUser: (user) => set({ user }),
    addAssignment: (a) => {
      const list = [...ref.current.assignments, { id: uid("a"), hoursDone: 0, status: "active", ...a }];
      set({ assignments: list });
      return generatePlan({ assignments: list });
    },
    // Add several assignments at once (CSV import) and plan only once.
    addAssignments: (items) => {
      const list = [...ref.current.assignments, ...items.map((a) => ({ id: uid("a"), hoursDone: 0, status: "active", ...a }))];
      set({ assignments: list });
      return generatePlan({ assignments: list });
    },
    updateAssignment: (id, patch) => {
      const cur = ref.current.assignments.find((x) => x.id === id);
      // finishing a task pays out once; reopening and finishing again doesn't pay twice
      if (cur && patch.status === "done" && cur.status !== "done" && !cur.bambooAwarded) {
        const r = taskReward(cur);
        patch = { ...patch, bambooAwarded: true };
        dispatch({ type: "earn", amount: r.total });
        notify(`Task complete! +${r.total} 🎋${r.daysEarly ? ` (${r.daysEarly} day${r.daysEarly > 1 ? "s" : ""} early)` : ""}`);
      }
      const list = ref.current.assignments.map((x) => (x.id === id ? { ...x, ...patch } : x));
      set({ assignments: list });
      return patch.status === undefined || patch.dueDate || patch.estHours ? generatePlan({ assignments: list }) : undefined;
    },
    deleteAssignment: (id) => {
      const list = ref.current.assignments.filter((x) => x.id !== id);
      const blocks = ref.current.timeBlocks.filter((b) => b.assignmentId !== id);
      set({ assignments: list, timeBlocks: blocks, suggestedDates: ref.current.suggestedDates.filter((x) => x.assignmentId !== id) });
    },
    setTimeBlocks: (timeBlocks) => set({ timeBlocks }),
    // Replace any earlier calendar import, then re-plan around the new fixed events.
    importIcs: (events, fileName) => {
      const timeBlocks = [...ref.current.timeBlocks.filter((b) => b.source !== "ics"), ...events];
      set({ timeBlocks, icsInfo: { fileName, count: events.length } });
      return generatePlan({ timeBlocks });
    },
    clearIcs: () => {
      const timeBlocks = ref.current.timeBlocks.filter((b) => b.source !== "ics");
      set({ timeBlocks, icsInfo: null });
      return generatePlan({ timeBlocks });
    },
    updateBlock: (id, patch) => set({ timeBlocks: ref.current.timeBlocks.map((b) => (b.id === id ? { ...b, ...patch } : b)) }),
    toggleBlockDone: (id, value) => dispatch({ type: "toggleDone", id, value }),
    acceptSuggestion: (id) => set({ suggestedDates: ref.current.suggestedDates.map((x) => (x.id === id ? { ...x, accepted: true } : x)) }),
    dismissSuggestion: (id) => set({ suggestedDates: ref.current.suggestedDates.filter((x) => x.id !== id) }),
    addStalks: (stalks) => dispatch({ type: "addStalks", stalks }),
    reset: () => dispatch({ type: "reset" }),
    generatePlan,
  };

  return <Ctx.Provider value={{ ...state, planning, toast, ...actions }}>{children}</Ctx.Provider>;
}
