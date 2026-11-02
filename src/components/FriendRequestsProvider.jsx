// Keeps the count of incoming friend requests for the nav bar's badge. It loads when the
// app starts and on every route change, and any page can call refresh() after answering
// a request. A failed fetch just hides the badge: it never shows an error.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { getFriendRequests } from "../api.js";
import { FriendRequestsContext } from "../friendRequests.js";

/** @param {{ children: import("react").ReactNode }} props */
function FriendRequestsProvider({ children }) {
  const [count, setCount] = useState(0);
  const { pathname } = useLocation();

  const refresh = useCallback(async () => {
    try {
      const requests = await getFriendRequests();
      setCount(requests.incoming.length);
    } catch {
      setCount(0);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, pathname]);

  const value = useMemo(() => ({ count, refresh }), [count, refresh]);
  return <FriendRequestsContext.Provider value={value}>{children}</FriendRequestsContext.Provider>;
}

export default FriendRequestsProvider;
