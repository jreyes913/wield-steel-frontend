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
 * @property {number | null} difficulty  Effort or fatigue cost, 1 (light) to 5 (very taxing).
 * @property {string | null} complexity  "Low", "Moderate" or "High": how much technique it needs.
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
 * @property {boolean | null} [is_public]  Visible to my friends and my coaches. Private unless true.
 * @property {number | null} [assigned_by]  The coach who sent me this program, if one did.
 * @property {string | null} [assigned_by_name]  That coach's name.
 * @property {boolean} [synced]  True while it follows the coach's program: read-only, always private.
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

// ---------- Friends ----------
// A friend sees only these fields. The backend never sends them a friend's body
// weight, date of birth, gender or height.

/**
 * What anyone else can see of an athlete.
 * @typedef {object} PublicProfile
 * @property {number} id
 * @property {string} username
 * @property {string | null} first_name
 * @property {string | null} last_name
 */

/**
 * An accepted friend. GET /friends returns a list of these.
 * @typedef {object} Friend
 * @property {PublicProfile} athlete
 * @property {string} since  When the request was accepted (ISO timestamp).
 * @property {boolean} hide_my_lifts  Whether I hide my lifts from this friend. Only my own setting.
 */

/**
 * One end of a coaching link. GET /coaching returns lists of these.
 * @typedef {object} CoachLink
 * @property {PublicProfile} athlete  The other person (my coach, or the athlete I coach).
 * @property {string} [since]  When coaching began (accepted links).
 * @property {string} [sent_at]  When the request was sent (pending requests).
 * @property {boolean} can_see_body_weight  Whether the coach may see the athlete's body weight.
 */

/**
 * GET /coaching.
 * @typedef {object} CoachingOverview
 * @property {CoachLink[]} coaches  People who coach me.
 * @property {CoachLink[]} athletes  Athletes I coach.
 * @property {CoachLink[]} incoming  Coaches asking to coach me.
 * @property {CoachLink[]} outgoing  Athletes I asked to coach.
 * @property {CoachGroup[]} groups  My own groups of athletes (only I see them), by name.
 */

/**
 * A coach's private group of the athletes they coach.
 * @typedef {object} CoachGroup
 * @property {Id} id
 * @property {string} name
 * @property {number[]} athlete_ids  Ids of the athletes in it.
 */

/**
 * A lift in an athlete's list, as a coach sees it.
 * @typedef {object} CoachedLiftSummary
 * @property {Id} id
 * @property {string} date
 * @property {number | null} [body_weight]  Present only when the athlete allowed it.
 */

/**
 * An athlete I've blocked. GET /blocks returns a list of these.
 * @typedef {object} BlockedAthlete
 * @property {PublicProfile} athlete
 * @property {string} since  When I blocked them (ISO timestamp).
 */

/**
 * A pending request, as listed by GET /friend-requests.
 * @typedef {object} FriendRequest
 * @property {PublicProfile} athlete  The other person: the sender if incoming, the receiver if outgoing.
 * @property {string} sent_at  When the request was sent (ISO timestamp).
 */

/**
 * @typedef {object} FriendRequests
 * @property {FriendRequest[]} incoming  Waiting for me to accept or decline.
 * @property {FriendRequest[]} outgoing  Sent by me. A declined one still shows here.
 */

/** A friend's lift: a Lift without body_weight. @typedef {Omit<Lift, "body_weight">} FriendLift */

/** A coached athlete's lift: body_weight is present only when they allowed it. @typedef {FriendLift & { body_weight?: number | null }} CoachedLift */

/** A friend's lift as listed by GET /athletes/{id}/lifts: just id and date. @typedef {Pick<Lift, "id" | "date">} FriendLiftSummary */

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
