// Every call to the backend lives in this file, one small function per endpoint.
// Pages import these functions; they never call fetch themselves.
//
// The backend works out who the user is from the access token, so the frontend
// never sends an athlete_id. Anything that isn't the user's comes back as 404.

import { fetchAuthSession } from "aws-amplify/auth";

// Remove a trailing slash so we can always write paths like "/lifts".
const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

// The one place that talks to the network. Returns the parsed JSON on success
// and throws an Error (with the backend's message) on failure.
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
    throw new Error(message);
  }
  return data;
}

// Builds "?a=1&b=2" from an object, skipping empty values (null, undefined, "").
function buildQueryString(params) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== "") {
      query.append(key, value);
    }
  }
  const text = query.toString();
  return text ? `?${text}` : "";
}

// ---------- Profile ----------
export const getMe = () => request("GET", "/me");
// fields: any of first_name, last_name, dob, gender, height
export const updateMe = (fields) => request("PUT", "/me", fields);

// ---------- Reference data ----------
export const getMuscleGroups = () => request("GET", "/muscle-groups");
export const getExercises = () => request("GET", "/exercises");

// ---------- Lifts ----------
export const getLifts = () => request("GET", "/lifts");
export const getLift = (liftId) => request("GET", `/lifts/${liftId}`);
// fields: { date, body_weight }
export const createLift = (fields) => request("POST", "/lifts", fields);
// fields: any of date, body_weight
export const updateLift = (liftId, fields) => request("PUT", `/lifts/${liftId}`, fields);
export const deleteLift = (liftId) => request("DELETE", `/lifts/${liftId}`);
// fields: { position, subsets: [{ exercise_id, position, reps, rir, weight }] }
export const createLiftSet = (liftId, fields) => request("POST", `/lifts/${liftId}/sets`, fields);
// Copies a program day's sets into the lift. Returns the updated lift.
export const applyProgramDay = (liftId, programDayId) =>
  request("POST", `/lifts/${liftId}/apply`, { program_day_id: programDayId });

export const updateLiftSet = (setId, fields) => request("PUT", `/sets/${setId}`, fields);
export const deleteLiftSet = (setId) => request("DELETE", `/sets/${setId}`);
// fields: { exercise_id, position, reps, rir, weight }
export const createLiftSubset = (setId, fields) =>
  request("POST", `/sets/${setId}/subsets`, fields);
export const updateLiftSubset = (subsetId, fields) =>
  request("PUT", `/subsets/${subsetId}`, fields);
export const deleteLiftSubset = (subsetId) => request("DELETE", `/subsets/${subsetId}`);

// ---------- Progress ----------
// start and end are optional YYYY-MM-DD strings.
export const getBodyWeightProgress = (start, end) =>
  request("GET", `/progress/body-weight${buildQueryString({ start, end })}`);
export const getStrengthProgress = (exerciseId, start, end) =>
  request(
    "GET",
    `/progress/strength${buildQueryString({ exercise_id: exerciseId, start, end })}`
  );

// ---------- Programs ----------
export const getPrograms = () => request("GET", "/programs");
export const getProgram = (programId) => request("GET", `/programs/${programId}`);
// fields: { name, start_date, end_date }
export const createProgram = (fields) => request("POST", "/programs", fields);
export const updateProgram = (programId, fields) =>
  request("PUT", `/programs/${programId}`, fields);
export const deleteProgram = (programId) => request("DELETE", `/programs/${programId}`);

export const createProgramDay = (programId, name) =>
  request("POST", `/programs/${programId}/days`, { name });
export const updateProgramDay = (dayId, name) =>
  request("PUT", `/program-days/${dayId}`, { name });
export const deleteProgramDay = (dayId) => request("DELETE", `/program-days/${dayId}`);

// fields: { position, subsets: [{ exercise_id, position, reps }] }
export const createProgramSet = (dayId, fields) =>
  request("POST", `/program-days/${dayId}/sets`, fields);
export const updateProgramSet = (setId, fields) =>
  request("PUT", `/program-sets/${setId}`, fields);
export const deleteProgramSet = (setId) => request("DELETE", `/program-sets/${setId}`);

// fields: { exercise_id, position, reps }
export const createProgramSubset = (setId, fields) =>
  request("POST", `/program-sets/${setId}/subsets`, fields);
export const updateProgramSubset = (subsetId, fields) =>
  request("PUT", `/program-subsets/${subsetId}`, fields);
export const deleteProgramSubset = (subsetId) =>
  request("DELETE", `/program-subsets/${subsetId}`);
