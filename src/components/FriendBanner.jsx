// The bar at the top of every friend view, so it can't be mistaken for your own data:
// "Viewing Alex's lift · read-only".

import { displayName } from "../friendHelpers.js";

/**
 * @param {object} props
 * @param {import("../types.js").PublicProfile} props.athlete  The friend.
 * @param {string} props.what  What is being viewed, such as "lift" or "program".
 */
function FriendBanner({ athlete, what }) {
  return (
    <p className="friend-banner">
      Viewing {displayName(athlete)}&apos;s {what} · read-only
    </p>
  );
}

export default FriendBanner;
