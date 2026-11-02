// The shapes of the data the backend sends, written as JSDoc types.
// Nothing here runs: the file exists so VS Code can show a type's fields when you
// hover or autocomplete. Use them in other files like this:
//
//   /** @param {import("./types.js").Lift} lift */
//
// The shapes come from the backend's routes (wield-steel-backend/src/routes/).
// Any number a person may leave blank is `number | null`.

// ---------- Reference data ----------

/** An id as the pages hold it: a number from the backend, or a string from the URL or a <select>. @typedef {number | string} Id */

/** @typedef {{ id: number, name: string }} MuscleGroup */

/**
 * @typedef {object} Exercise
 * @property {number} id
 * @property {string} name
 * @property {number} muscle_group_id
 */

/** An exercise as nested inside a subset: just its id and name. @typedef {{ id: number, name: string }} ExerciseRef */

// ---------- Lifts (what was done) ----------

/**
 * One exercise inside a set. Reps, RIR (reps in reserve) and weight can each be left blank.
 * @typedef {object} LiftSubset
 * @property {number} id
 * @property {number} position  Order within the set, starting at 1.
 * @property {ExerciseRef} exercise
 * @property {number | null} reps
 * @property {number | null} rir
 * @property {number | null} weight  May be a decimal.
 */

/**
 * One set: one or more exercises done together (for example a superset).
 * @typedef {object} LiftSet
 * @property {number} id
 * @property {number} position  Order within the lift, starting at 1. Shown as the set number.
 * @property {LiftSubset[]} subsets
 */

/**
 * One workout day, with its sets. GET /lifts/{id} returns this.
 * @typedef {object} Lift
 * @property {number} id
 * @property {string} date  YYYY-MM-DD.
 * @property {number | null} body_weight  Whole number.
 * @property {LiftSet[]} sets
 */

/** A lift as listed by GET /lifts: the same, but without its sets. @typedef {Omit<Lift, "sets">} LiftSummary */

// ---------- Programs (the plan) ----------

/**
 * One exercise inside a program set. A plan only has reps, no RIR or weight.
 * @typedef {object} ProgramSubset
 * @property {number} id
 * @property {number} position
 * @property {ExerciseRef} exercise
 * @property {number | null} reps
 */

/**
 * @typedef {object} ProgramSet
 * @property {number} id
 * @property {number} position
 * @property {ProgramSubset[]} subsets
 */

/**
 * One day of a program, such as "Leg day".
 * @typedef {object} ProgramDay
 * @property {number} id
 * @property {string} name
 * @property {ProgramSet[]} sets
 */

/**
 * @typedef {object} Program
 * @property {number} id
 * @property {string} name
 * @property {string | null} start_date  YYYY-MM-DD.
 * @property {string | null} end_date  YYYY-MM-DD.
 * @property {ProgramDay[]} days
 */

/** A program as listed by GET /programs: the same, but without its days. @typedef {Omit<Program, "days">} ProgramSummary */

// ---------- Either kind of set ----------
// Several components work on both lifts and programs. A set from either one has this shape.

/** @typedef {LiftSet | ProgramSet} AnySet */

// ---------- Profile ----------

/**
 * @typedef {object} Profile
 * @property {number} id
 * @property {string} username
 * @property {string | null} first_name
 * @property {string | null} last_name
 * @property {string | null} dob  YYYY-MM-DD.
 * @property {string | null} gender
 * @property {number | null} height  Whole number.
 */

// ---------- Progress ----------

/** @typedef {{ date: string, body_weight: number }} BodyWeightPoint */

/**
 * One set of the chosen exercise, with the numbers worked out from it.
 * Each is null when it can't be worked out (for example no RIR was recorded).
 * @typedef {object} StrengthSet
 * @property {string} date
 * @property {number} lift_id
 * @property {number} set_position
 * @property {number} subset_position
 * @property {number} weight
 * @property {number} reps
 * @property {number | null} rir
 * @property {number | null} e1rm  Estimated one-rep max from this set.
 * @property {number | null} daily_1rm  The day's best e1rm.
 * @property {number | null} intensity
 * @property {number | null} load
 * @property {number | null} volume  Running total of load within the day.
 */

/**
 * One day's summary of the chosen exercise.
 * @typedef {object} StrengthDay
 * @property {string} date
 * @property {number | null} daily_1rm
 * @property {number} top_weight
 * @property {number} set_count
 * @property {number | null} volume
 */

/**
 * @typedef {object} StrengthProgress
 * @property {ExerciseRef} exercise
 * @property {StrengthDay[]} days  One per day. Holds daily_1rm.
 * @property {StrengthSet[]} sets  One per set. Holds every other metric.
 */

// ---------- Values the frontend sends ----------
// These are the `fields` the create and update calls in api.js take.

/**
 * A subset in a request body. Send null, never "", for blanks.
 * @typedef {object} NewLiftSubset
 * @property {number} exercise_id
 * @property {number} position
 * @property {number | null} reps
 * @property {number | null} rir
 * @property {number | null} weight
 */

/** @typedef {{ exercise_id: number, position: number, reps: number | null }} NewProgramSubset */

// ---------- Shared component helpers ----------

/** Tells a page to reload its data after a change. @typedef {() => void} OnChanged */

/** Shows a message on the page. @typedef {(message: string) => void} OnError */

/**
 * A block of sets that contain the same exercises (see blocks.js).
 * @template [S=AnySet]
 * @typedef {object} Block
 * @property {string} key  The exercise ids joined together. Stays the same when the letter changes.
 * @property {string} label  "A", "B", ... "AA".
 * @property {S[]} sets
 */

export {};
