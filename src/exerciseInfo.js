// Helpers for the two ratings an exercise can have: Difficulty (1 to 5, how taxing it
// is to train hard) and Complexity (Low, Moderate or High, how much technique it needs).
// Either can be missing, so everything here copes with null. Nothing is saved or sent
// to the backend; summaries are worked out again from the sets on every render.

/** The only Complexity values the app understands, lowest first. */
export const COMPLEXITY_LEVELS = ["Low", "Moderate", "High"];

/** The top of the Difficulty scale. */
export const MAX_DIFFICULTY = 5;

/**
 * The text of an exercise in a dropdown: "BB Bench Press · 4/5 · High".
 * A rating that is missing is left out, so with neither it is just the name.
 * @param {import("./types.js").Exercise} exercise
 * @returns {string}
 */
export function exerciseLabel(exercise) {
  const parts = [exercise.name];
  if (exercise.difficulty !== null && exercise.difficulty !== undefined) {
    parts.push(`${exercise.difficulty}/${MAX_DIFFICULTY}`);
  }
  if (exercise.complexity) {
    parts.push(exercise.complexity);
  }
  return parts.join(" · ");
}

/**
 * What summarizeSets works out for one day's sets.
 * An "exercise" here is one exercise in one set, so squats in three sets count three times.
 * @typedef {object} SetsSummaryData
 * @property {number} exerciseCount  Every exercise in every set.
 * @property {number} withoutDifficulty  How many of them have no Difficulty.
 * @property {number} withoutComplexity  How many have no Complexity (or one the app doesn't know).
 * @property {number | null} averageDifficulty  Mean over those with a Difficulty. Null if none.
 * @property {number | null} fatigueScore  Their Difficulty added up. Null if none.
 * @property {{ level: string, count: number }[]} complexityCounts  High first. Levels with no exercises are left out.
 */

/**
 * @param {import("./types.js").AnySet[]} sets  One day's sets.
 * @param {import("./types.js").Exercise[]} exercises  Every exercise, to look ratings up by id.
 * @returns {SetsSummaryData}
 */
export function summarizeSets(sets, exercises) {
  const exercisesById = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  const complexityTotals = new Map(COMPLEXITY_LEVELS.map((level) => [level, 0]));
  let exerciseCount = 0;
  let difficultyTotal = 0;
  let withDifficulty = 0;
  let withComplexity = 0;

  for (const set of sets) {
    for (const subset of set.subsets) {
      exerciseCount++;
      const exercise = exercisesById.get(subset.exercise.id);
      if (typeof exercise?.difficulty === "number") {
        difficultyTotal += exercise.difficulty;
        withDifficulty++;
      }
      if (exercise?.complexity && complexityTotals.has(exercise.complexity)) {
        complexityTotals.set(exercise.complexity, complexityTotals.get(exercise.complexity) + 1);
        withComplexity++;
      }
    }
  }

  return {
    exerciseCount,
    withoutDifficulty: exerciseCount - withDifficulty,
    withoutComplexity: exerciseCount - withComplexity,
    averageDifficulty: withDifficulty > 0 ? difficultyTotal / withDifficulty : null,
    fatigueScore: withDifficulty > 0 ? difficultyTotal : null,
    complexityCounts: [...COMPLEXITY_LEVELS]
      .reverse()
      .map((level) => ({ level, count: complexityTotals.get(level) }))
      .filter((item) => item.count > 0),
  };
}
