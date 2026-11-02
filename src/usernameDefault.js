// The default username is the part of the email before the @. Everyone starts with an
// auto-generated username (the sign-in name Cognito gave them); the first time the app
// runs after sign-in, setDefaultUsername() swaps it for the email handle. After that the
// username is theirs to change on the Profile page, so this never runs again for them.

import { fetchUserAttributes, getCurrentUser } from "aws-amplify/auth";
import { getMe, updateMe } from "./api.js";

// The backend allows 3 to 30 of a-z 0-9 . _ - (see to_username in the backend).
const MAX_LENGTH = 30;
const MIN_LENGTH = 3;
// Room left for a number on the end when the handle is already taken.
const ROOM_FOR_NUMBER = 4;

// "Alex.Smith+gym@example.com" -> "alex.smith_gym". Empty when there is no usable handle.
/**
 * @param {string | undefined} email
 * @returns {string}
 */
export function handleFromEmail(email) {
  const handle = (email ?? "")
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "_")
    .slice(0, MAX_LENGTH - ROOM_FOR_NUMBER);
  return handle === "" ? "" : handle.padEnd(MIN_LENGTH, "0");
}

// Sets the username to the email handle if the athlete still has the auto-generated
// one. A taken handle gets a number on the end (alex, alex2, alex3...). Any failure is
// ignored: the auto-generated username keeps working and can be changed on Profile.
/** @returns {Promise<void>} */
export async function setDefaultUsername() {
  try {
    const [me, user, attributes] = await Promise.all([getMe(), getCurrentUser(), fetchUserAttributes()]);
    if (me.username !== user.username) {
      return; // already changed, so leave it alone
    }
    const handle = handleFromEmail(attributes.email);
    if (handle === "") {
      return;
    }
    for (let attempt = 1; attempt <= 10; attempt++) {
      try {
        await updateMe({ username: attempt === 1 ? handle : `${handle}${attempt}` });
        return;
      } catch (err) {
        // 409 means taken: try the next one. Anything else: give up quietly.
        if (/** @type {{ status?: number }} */ (err).status !== 409) {
          return;
        }
      }
    }
  } catch {
    // Not worth showing: the user can still pick a username on the Profile page.
  }
}
