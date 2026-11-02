// Every call to the backend lives in this file, one small function per endpoint.
// Pages import these functions; they never call fetch themselves.
//
// The backend works out who the user is from the access token, so the frontend
// never sends an athlete_id. Anything that isn't the user's comes back as 404.

import { fetchAuthSession } from "aws-amplify/auth";

/**
 * @typedef {import("./types.js").Id} Id
 * @typedef {import("./types.js").Exercise} Exercise
 * @typedef {import("./types.js").MuscleGroup} MuscleGroup
 * @typedef {import("./types.js").Lift} Lift
 * @typedef {import("./types.js").LiftSummary} LiftSummary
 * @typedef {import("./types.js").LiftSet} LiftSet
 * @typedef {import("./types.js").LiftSubset} LiftSubset
 * @typedef {import("./types.js").NewLiftSubset} NewLiftSubset
 * @typedef {import("./types.js").Program} Program
 * @typedef {import("./types.js").ProgramSummary} ProgramSummary
 * @typedef {import("./types.js").ProgramDay} ProgramDay
 * @typedef {import("./types.js").ProgramSet} ProgramSet
 * @typedef {import("./types.js").ProgramSubset} ProgramSubset
 * @typedef {import("./types.js").NewProgramSubset} NewProgramSubset
 * @typedef {import("./types.js").Profile} Profile
 * @typedef {import("./types.js").BodyWeightPoint} BodyWeightPoint
 * @typedef {import("./types.js").StrengthProgress} StrengthProgress
 * @typedef {import("./types.js").PublicProfile} PublicProfile
 * @typedef {import("./types.js").Friend} Friend
 * @typedef {import("./types.js").FriendRequests} FriendRequests
 * @typedef {import("./types.js").FriendLift} FriendLift
 * @typedef {import("./types.js").FriendLiftSummary} FriendLiftSummary
 * @typedef {import("./types.js").BlockedAthlete} BlockedAthlete
 */

// Remove a trailing slash so we can always write paths like "/lifts".
const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

// The one place that talks to the network. Returns the parsed JSON on success
// and throws an Error (with the backend's message) on failure.
// The endpoint functions below say what the JSON holds.
/**
 * @param {"GET" | "POST" | "PUT" | "DELETE"} method
 * @param {string} path  Starting with "/", for example "/lifts".
 * @param {object} [body]  Sent as JSON when given.
 * @returns {Promise<any>}
 */
async function request(method, path, body) {
  // fetchAuthSession() refreshes the token for us if it has expired.
  const session = await fetchAuthSession();
  const accessToken = session.tokens?.accessToken;
  if (!accessToken) {
    throw new Error("Not signed in");
  }

  const options = {
    method: method,
    headers: { Authorization: `Bearer ${accessToken.toString()}` },
  };
  // Only send a body (and its content type) when there is one.
  if (body !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${path}`, options);

  // If the body isn't JSON we still want a useful error below, so don't throw here.
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Our backend sends {"error": "..."}; API Gateway's own 401 sends {"message": "..."}.
    const message = data?.error ?? data?.message ?? `Request failed (${response.status})`;
    // Keep the status, so a page can tell "not found" from other failures.
    throw Object.assign(new Error(message), { status: response.status });
  }
  return data;
}

// Builds "?a=1&b=2" from an object, skipping empty values (null, undefined, "").
/** @param {Record<string, string | number | null | undefined>} params */
function buildQueryString(params) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== "") {
      query.append(key, String(value));
    }
  }
  const text = query.toString();
  return text ? `?${text}` : "";
}

// ---------- Profile ----------

/** @returns {Promise<Profile>} */
export const getMe = () => request("GET", "/me");

/**
 * @param {{ username?: string, first_name?: string | null, last_name?: string | null, dob?: string | null, gender?: string | null, height?: number | null }} fields
 *   Send only the fields that changed.
 * @returns {Promise<Profile>}
 */
export const updateMe = (fields) => request("PUT", "/me", fields);

/**
 * Everything the signed-in user owns, as the backend's JSON (never includes other people's data).
 * @returns {Promise<object>}
 */
export const exportMyData = () => request("GET", "/me/export");

/**
 * Deletes the signed-in user's data and sign-in. The backend does big accounts in several
 * rounds (it answers 202 until it is finished), so this repeats the request until it is done.
 * After it resolves the sign-in no longer exists: make no more API calls.
 * @param {string} username  The user's own username, typed to confirm.
 * @returns {Promise<void>}
 */
export async function deleteMyAccount(username) {
  for (;;) {
    const result = await request("DELETE", "/me", { confirm: username });
    if (result?.done) return;
  }
}

// ---------- Reference data ----------

/** @returns {Promise<MuscleGroup[]>} */
export const getMuscleGroups = () => request("GET", "/muscle-groups");

/** @returns {Promise<Exercise[]>} */
export const getExercises = () => request("GET", "/exercises");

// ---------- Lifts ----------

/** @returns {Promise<LiftSummary[]>} Newest first, without their sets. */
export const getLifts = () => request("GET", "/lifts");

/**
 * @param {Id} liftId
 * @returns {Promise<Lift>} The lift with all its sets and subsets.
 */
export const getLift = (liftId) => request("GET", `/lifts/${liftId}`);

/**
 * @param {{ date: string, body_weight: number | null }} fields
 * @returns {Promise<LiftSummary>}
 */
export const createLift = (fields) => request("POST", "/lifts", fields);

/**
 * @param {Id} liftId
 * @param {{ date?: string, body_weight?: number | null }} fields  Send only what changed.
 * @returns {Promise<LiftSummary>}
 */
export const updateLift = (liftId, fields) => request("PUT", `/lifts/${liftId}`, fields);

/** @param {Id} liftId */
export const deleteLift = (liftId) => request("DELETE", `/lifts/${liftId}`);

/**
 * Creates a set together with its subsets in one request.
 * @param {Id} liftId
 * @param {{ position: number, subsets: NewLiftSubset[] }} fields
 * @returns {Promise<LiftSet>}
 */
export const createLiftSet = (liftId, fields) => request("POST", `/lifts/${liftId}/sets`, fields);

/**
 * Copies a program day's sets into the lift.
 * @param {Id} liftId
 * @param {Id} programDayId
 * @returns {Promise<Lift>} The updated lift.
 */
export const applyProgramDay = (liftId, programDayId) =>
  request("POST", `/lifts/${liftId}/apply`, { program_day_id: programDayId });

/**
 * @param {Id} setId
 * @param {{ position: number }} fields
 * @returns {Promise<LiftSet>}
 */
export const updateLiftSet = (setId, fields) => request("PUT", `/sets/${setId}`, fields);

/** @param {Id} setId */
export const deleteLiftSet = (setId) => request("DELETE", `/sets/${setId}`);

/**
 * @param {Id} setId
 * @param {NewLiftSubset} fields
 * @returns {Promise<LiftSubset>}
 */
export const createLiftSubset = (setId, fields) =>
  request("POST", `/sets/${setId}/subsets`, fields);

/**
 * @param {Id} subsetId
 * @param {Partial<NewLiftSubset>} fields  Send only what changed.
 * @returns {Promise<LiftSubset>}
 */
export const updateLiftSubset = (subsetId, fields) =>
  request("PUT", `/subsets/${subsetId}`, fields);

/** @param {Id} subsetId */
export const deleteLiftSubset = (subsetId) => request("DELETE", `/subsets/${subsetId}`);

// ---------- Progress ----------

/**
 * @param {string} [start]  YYYY-MM-DD, optional.
 * @param {string} [end]  YYYY-MM-DD, optional.
 * @returns {Promise<BodyWeightPoint[]>} Only lifts that have a body weight.
 */
export const getBodyWeightProgress = (start, end) =>
  request("GET", `/progress/body-weight${buildQueryString({ start, end })}`);

/**
 * @param {Id} exerciseId
 * @param {string} [start]  YYYY-MM-DD, optional.
 * @param {string} [end]  YYYY-MM-DD, optional.
 * @returns {Promise<StrengthProgress>}
 */
export const getStrengthProgress = (exerciseId, start, end) =>
  request(
    "GET",
    `/progress/strength${buildQueryString({ exercise_id: exerciseId, start, end })}`
  );

// ---------- Programs ----------

/** @returns {Promise<ProgramSummary[]>} Without their days. */
export const getPrograms = () => request("GET", "/programs");

/**
 * @param {Id} programId
 * @returns {Promise<Program>} The program with all its days, sets and subsets.
 */
export const getProgram = (programId) => request("GET", `/programs/${programId}`);

/**
 * @param {{ name: string, start_date: string | null, end_date: string | null }} fields
 * @returns {Promise<ProgramSummary>}
 */
export const createProgram = (fields) => request("POST", "/programs", fields);

/**
 * @param {Id} programId
 * @param {{ name?: string, start_date?: string | null, end_date?: string | null }} fields
 *   Send only what changed.
 * @returns {Promise<ProgramSummary>}
 */
export const updateProgram = (programId, fields) =>
  request("PUT", `/programs/${programId}`, fields);

/** @param {Id} programId */
export const deleteProgram = (programId) => request("DELETE", `/programs/${programId}`);

/**
 * @param {Id} programId
 * @param {string} name
 * @returns {Promise<ProgramDay>}
 */
export const createProgramDay = (programId, name) =>
  request("POST", `/programs/${programId}/days`, { name });

/**
 * @param {Id} dayId
 * @param {string} name
 * @returns {Promise<ProgramDay>}
 */
export const updateProgramDay = (dayId, name) =>
  request("PUT", `/program-days/${dayId}`, { name });

/** @param {Id} dayId */
export const deleteProgramDay = (dayId) => request("DELETE", `/program-days/${dayId}`);

/**
 * Creates a set together with its subsets in one request.
 * @param {Id} dayId
 * @param {{ position: number, subsets: NewProgramSubset[] }} fields
 * @returns {Promise<ProgramSet>}
 */
export const createProgramSet = (dayId, fields) =>
  request("POST", `/program-days/${dayId}/sets`, fields);

/**
 * @param {Id} setId
 * @param {{ position: number }} fields
 * @returns {Promise<ProgramSet>}
 */
export const updateProgramSet = (setId, fields) =>
  request("PUT", `/program-sets/${setId}`, fields);

/** @param {Id} setId */
export const deleteProgramSet = (setId) => request("DELETE", `/program-sets/${setId}`);

/**
 * @param {Id} setId
 * @param {NewProgramSubset} fields
 * @returns {Promise<ProgramSubset>}
 */
export const createProgramSubset = (setId, fields) =>
  request("POST", `/program-sets/${setId}/subsets`, fields);

/**
 * @param {Id} subsetId
 * @param {Partial<NewProgramSubset>} fields  Send only what changed.
 * @returns {Promise<ProgramSubset>}
 */
export const updateProgramSubset = (subsetId, fields) =>
  request("PUT", `/program-subsets/${subsetId}`, fields);

/** @param {Id} subsetId */
export const deleteProgramSubset = (subsetId) =>
  request("DELETE", `/program-subsets/${subsetId}`);

// ---------- Friends ----------
// A friend's data is read-only. Anyone who isn't an accepted friend comes back as 404.

/** @returns {Promise<Friend[]>} My accepted friends, by name. */
export const getFriends = () => request("GET", "/friends");

/** @param {Id} athleteId  The friend's athlete id. */
export const removeFriend = (athleteId) => request("DELETE", `/friends/${athleteId}`);

/** @returns {Promise<FriendRequests>} Pending requests to me and from me, newest first. */
export const getFriendRequests = () => request("GET", "/friend-requests");

/**
 * Sends a request by exact username. If they already asked me, we become friends at once.
 * @param {string} username
 * @returns {Promise<{ status: "pending" | "accepted", athlete: PublicProfile }>}
 */
export const sendFriendRequest = (username) => request("POST", "/friend-requests", { username });

/**
 * @param {Id} requesterId  The athlete id of whoever sent the request.
 * @param {"accepted" | "declined"} status
 * @returns {Promise<{ status: string, athlete: PublicProfile }>}
 */
export const answerFriendRequest = (requesterId, status) =>
  request("PUT", `/friend-requests/${requesterId}`, { status });

/**
 * Cancels a request I sent.
 * @param {Id} athleteId  The athlete id I sent it to.
 */
export const cancelFriendRequest = (athleteId) =>
  request("DELETE", `/friend-requests/${athleteId}`);

/**
 * @param {Id} athleteId
 * @returns {Promise<PublicProfile>}
 */
export const getFriend = (athleteId) => request("GET", `/athletes/${athleteId}`);

/**
 * @param {Id} athleteId
 * @returns {Promise<FriendLiftSummary[]>} Newest first, without their sets.
 */
export const getFriendLifts = (athleteId) => request("GET", `/athletes/${athleteId}/lifts`);

/**
 * @param {Id} athleteId
 * @param {Id} liftId
 * @returns {Promise<FriendLift>} The lift with its sets and subsets, without body weight.
 */
export const getFriendLift = (athleteId, liftId) =>
  request("GET", `/athletes/${athleteId}/lifts/${liftId}`);

/**
 * @param {Id} athleteId
 * @returns {Promise<ProgramSummary[]>} Without their days.
 */
export const getFriendPrograms = (athleteId) => request("GET", `/athletes/${athleteId}/programs`);

/**
 * @param {Id} athleteId
 * @param {Id} programId
 * @returns {Promise<Program>} The program with all its days, sets and subsets.
 */
export const getFriendProgram = (athleteId, programId) =>
  request("GET", `/athletes/${athleteId}/programs/${programId}`);

/**
 * Hides my lifts from one friend, or shows them again. Programs stay visible.
 * @param {Id} athleteId  The friend's athlete id.
 * @param {boolean} hide
 * @returns {Promise<{ athlete: PublicProfile, hide_my_lifts: boolean }>}
 */
export const setHideMyLifts = (athleteId, hide) =>
  request("PUT", `/friends/${athleteId}`, { hide_my_lifts: hide });

/**
 * Copies a friend's program into my own programs.
 * @param {Id} athleteId
 * @param {Id} programId
 * @returns {Promise<Program>} The new program, owned by me.
 */
export const copyFriendProgram = (athleteId, programId) =>
  request("POST", `/athletes/${athleteId}/programs/${programId}/copy`);

// ---------- Blocks ----------

/** @returns {Promise<BlockedAthlete[]>} The athletes I've blocked, newest first. */
export const getBlocks = () => request("GET", "/blocks");

/**
 * Blocks an athlete: removes any friendship or request, and they can't send another.
 * @param {Id} athleteId
 * @returns {Promise<{ athlete: PublicProfile }>}
 */
export const blockAthlete = (athleteId) => request("PUT", `/blocks/${athleteId}`);

/**
 * Blocks an athlete by exact username.
 * @param {string} username
 * @returns {Promise<{ athlete: PublicProfile }>}
 */
export const blockByUsername = (username) => request("POST", "/blocks", { username });

/** @param {Id} athleteId */
export const unblockAthlete = (athleteId) => request("DELETE", `/blocks/${athleteId}`);
