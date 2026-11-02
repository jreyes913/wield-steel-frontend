// Small helpers for the friends pages: how to show a person's name and a date,
// and what to say when a friend's page can't be loaded.

/** Shown when a friend's data comes back 404: never a friend, or no longer one. */
export const NOT_FRIENDS_MESSAGE = "Not found, or you're no longer friends";

// "Alex Smith", or the username when they haven't set a name.
/**
 * @param {import("./types.js").PublicProfile} athlete
 * @returns {string}
 */
export function displayName(athlete) {
  const name = [athlete.first_name, athlete.last_name].filter(Boolean).join(" ");
  return name || athlete.username;
}

// An ISO timestamp from the backend as YYYY-MM-DD in the user's local time zone.
/**
 * @param {string} timestamp  For example "2026-11-02T14:03:00+00:00".
 * @returns {string}  For example "2026-11-02".
 */
export function shortDate(timestamp) {
  return new Date(timestamp).toLocaleDateString("en-CA");
}

// The message to show when loading a friend's page failed.
/**
 * @param {Error & { status?: number }} err
 * @returns {string}
 */
export function friendLoadError(err) {
  return err.status === 404 ? NOT_FRIENDS_MESSAGE : err.message;
}
