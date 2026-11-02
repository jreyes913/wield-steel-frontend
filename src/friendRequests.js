// The number of requests waiting for me, shared by the nav bar and the Friends page.
// FriendRequestsProvider (components/) fills it in; useFriendRequests reads it.

import { createContext, useContext } from "react";

/**
 * @typedef {object} FriendRequestsValue
 * @property {number} count  Incoming requests waiting for an answer. 0 if it couldn't be loaded.
 * @property {() => Promise<void>} refresh  Fetches the count again. Never throws.
 */

export const FriendRequestsContext = createContext(
  /** @type {FriendRequestsValue} */ ({ count: 0, refresh: async () => {} })
);

/** @returns {FriendRequestsValue} */
export function useFriendRequests() {
  return useContext(FriendRequestsContext);
}
