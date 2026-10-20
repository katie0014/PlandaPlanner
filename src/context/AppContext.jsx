import { createContext, useContext, useEffect, useReducer, useRef, useState, useCallback } from "react";
import { generatePlan as apiGeneratePlan } from "../lib/api.js";
import { isPreserved } from "../lib/scheduler.js";
import { hoursBetween, toISO, uid } from "../lib/dates.js";

const KEY = "panda-planner-v1";
const empty = { user: null, assignments: [], timeBlocks: [], suggestedDates: [], icsInfo: null, stats: { stalksGrown: 0, sessionsCompleted: 0, weekStart: null } };

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    return s ? { ...empty, ...s } : empty;
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

  const actions = {
    setUser: (user) => set({ user }),
    addAssignment: (a) => {
      const list = [...ref.current.assignments, { id: uid("a"), hoursDone: 0, status: "active", ...a }];
      set({ assignments: list });
      return generatePlan({ assignments: list });
    },
    updateAssignment: (id, patch) => {
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

  return <Ctx.Provider value={{ ...state, planning, ...actions }}>{children}</Ctx.Provider>;
}
