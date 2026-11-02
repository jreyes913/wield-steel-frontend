// A one-line summary of a day's sets by exercise ratings: average Difficulty, Fatigue
// score and how many exercises are Low, Moderate or High Complexity. Used on the lift
// page and on each program day. Some exercises have no ratings yet, so it says how
// many were left out rather than passing off a partial average as the whole picture.

import { summarizeSets, MAX_DIFFICULTY } from "../exerciseInfo.js";

// 3 -> "3", 3.25 -> "3.3". Whole numbers show without a decimal.
/** @param {number} value */
function formatNumber(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

/**
 * @param {object} props
 * @param {import("../types.js").AnySet[]} props.sets  The day's sets.
 * @param {import("../types.js").Exercise[]} props.exercises  Every exercise, to look ratings up.
 */
function SetsSummary({ sets, exercises }) {
  // Nothing to say until the exercises have loaded, or while the day has no exercises.
  const summary = summarizeSets(sets, exercises);
  if (exercises.length === 0 || summary.exerciseCount === 0) {
    return null;
  }

  const parts = [
    `Average difficulty ${
      summary.averageDifficulty === null
        ? "–"
        : `${formatNumber(Math.round(summary.averageDifficulty * 10) / 10)}/${MAX_DIFFICULTY}`
    }`,
    `Fatigue score ${summary.fatigueScore === null ? "–" : formatNumber(summary.fatigueScore)}`,
  ];
  if (summary.complexityCounts.length > 0) {
    parts.push(summary.complexityCounts.map(({ level, count }) => `${count} ${level}`).join(", "));
  }

  // Say what was left out, so a partial average is not mistaken for the whole day.
  const notes = [];
  if (summary.withoutDifficulty > 0) {
    const verb = summary.withoutDifficulty === 1 ? "has" : "have";
    notes.push(`${summary.withoutDifficulty} of ${summary.exerciseCount} exercises ${verb} no difficulty`);
  }
  if (summary.withoutComplexity > 0) {
    const verb = summary.withoutComplexity === 1 ? "has" : "have";
    notes.push(`${summary.withoutComplexity} of ${summary.exerciseCount} exercises ${verb} no complexity`);
  }

  return (
    <div className="sets-summary">
      <p>{parts.join(" · ")}</p>
      {notes.length > 0 && <p className="sets-summary-note">{notes.join(" · ")}</p>}
    </div>
  );
}

export default SetsSummary;
