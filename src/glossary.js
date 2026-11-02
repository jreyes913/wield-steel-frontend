// The plain-language explanations shown on the Get Started page and beside the
// Progress charts. Keep every entry short: say what it is, then what it means for you.
// The strength formulas below match the backend (wield-steel-backend/src/strength.py).

/** @typedef {{ term: string, meaning: string }} Entry */

/** Lifting terms, in the order someone new meets them. @type {Entry[]} */
export const TERMS = [
  { term: "Rep", meaning: "One full movement of an exercise, such as one squat." },
  {
    term: "Set",
    meaning: "A group of reps done without rest. Sets are numbered in the order you did them.",
  },
  {
    term: "Superset",
    meaning:
      "A set with more than one exercise, done back to back. Add a second exercise to a set to make one.",
  },
  {
    term: "Block",
    meaning:
      "Sets that contain the same exercises, grouped under a letter (A, B, C…). Display only; nothing is saved.",
  },
  {
    term: "Weight",
    meaning:
      "What you lifted. The app has no units, so use one (kg or lb) and keep to it. Decimals are fine.",
  },
  {
    term: "RIR (reps in reserve)",
    meaning:
      "Reps you could still have done. 0 means failure; 2 means you stopped with two left. Whole numbers only.",
  },
  {
    term: "1RM (one-rep max)",
    meaning: "The most weight you could lift for a single rep.",
  },
  {
    term: "Body weight",
    meaning: "Your own weight on the day, as a whole number. Optional; it feeds the Body weight chart.",
  },
  {
    term: "Program",
    meaning:
      "A plan: named days (such as Leg day), each with planned sets and reps. A plan has no weight or RIR.",
  },
];

/**
 * What each Strength chart metric means. Keys match the backend's metric names.
 * A set is charted only with weight and reps. A 1RM needs RIR 0–5. Intensity and load also
 * need an RIR and a 1RM from that day.
 * @type {Record<string, string>}
 */
export const METRIC_HELP = {
  weight: "The weight you lifted in each set.",
  e1rm: "The 1RM this set suggests: weight × (1 + (reps + RIR) ÷ 30). RIR above 3 uses ÷ 40. Needs RIR 0–5.",
  daily_1rm: "The day's best estimated 1RM. One point per day.",
  intensity: "Set weight ÷ that day's 1RM. 0.8 means 80% of your best that day.",
  load: "Intensity × weight × reps ÷ (1 + 0.5 × RIR). Rises with heavier weight, more reps, and fewer reps left in reserve.",
  volume: "Running total of load through the day. The last set's value is the day's total.",
};

// ---------- Exercise ratings ----------

/** @type {Entry} */
export const DIFFICULTY = {
  term: "Difficulty (1–5)",
  meaning: "How taxing the exercise is to train hard. Higher means more fatiguing.",
};

/** @type {Entry} */
export const COMPLEXITY = {
  term: "Complexity",
  meaning: "How much technique and coordination the exercise needs: Low, Moderate or High.",
};

/** @type {Entry} */
export const FATIGUE_SCORE = {
  term: "Fatigue score",
  meaning:
    "Total Difficulty of every set in the day. A rough measure of how taxing the day is. Ignores weight and reps.",
};

/** @type {Entry[]} */
export const EXERCISE_TERMS = [DIFFICULTY, COMPLEXITY, FATIGUE_SCORE];
