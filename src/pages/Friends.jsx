// Friends page: my username to share, a form to add a friend by username, requests
// waiting for me, requests I sent, my friends, and the athletes I've blocked. Friends can
// see my programs and lifts (read-only), never my body weight or profile details. I can
// hide my lifts from one friend, or block someone.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getMe,
  getFriends,
  getFriendRequests,
  sendFriendRequest,
  answerFriendRequest,
  cancelFriendRequest,
  removeFriend,
  setHideMyLifts,
  getBlocks,
  blockAthlete,
  blockByUsername,
  unblockAthlete,
} from "../api.js";
import { displayName, shortDate } from "../friendHelpers.js";
import { useFriendRequests } from "../friendRequests.js";

/** @typedef {import("../types.js").Friend} Friend */
/** @typedef {import("../types.js").FriendRequests} FriendRequests */
/** @typedef {import("../types.js").BlockedAthlete} BlockedAthlete */

function Friends() {
  const [username, setUsername] = useState("");
  const [friends, setFriends] = useState(/** @type {Friend[]} */ ([]));
  const [requests, setRequests] = useState(
    /** @type {FriendRequests} */ ({ incoming: [], outgoing: [] })
  );
  const [blocked, setBlocked] = useState(/** @type {BlockedAthlete[]} */ ([]));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // What the last action did ("Request sent", "Copied"); cleared by the next action.
  const [notice, setNotice] = useState("");

  // The username typed into the "Add a friend" form.
  const [friendUsername, setFriendUsername] = useState("");

  // Updates the badge in the nav bar straight away after an action here.
  const { refresh: refreshBadge } = useFriendRequests();

  async function loadFriends() {
    try {
      const [me, loadedFriends, loadedRequests, loadedBlocked] = await Promise.all([
        getMe(),
        getFriends(),
        getFriendRequests(),
        getBlocks(),
      ]);
      setUsername(me.username);
      setFriends(loadedFriends);
      setRequests(loadedRequests);
      setBlocked(loadedBlocked);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadFriends();
  }, []);

  // Runs one action, then reloads so the page shows what the backend now holds.
  /** @param {() => Promise<string | void>} action  May return the notice to show. */
  async function run(action) {
    setError("");
    setNotice("");
    try {
      const message = await action();
      if (message) {
        setNotice(message);
      }
      await loadFriends();
      refreshBadge();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCopy() {
    setError("");
    setNotice("");
    try {
      await navigator.clipboard.writeText(username);
      setNotice("Copied");
    } catch {
      setError("Couldn't copy. Select the username and copy it yourself.");
    }
  }

  function handleSend(event) {
    event.preventDefault();
    run(async () => {
      const result = await sendFriendRequest(friendUsername);
      setFriendUsername("");
      return result.status === "accepted" ? "You're now friends" : "Request sent";
    });
  }

  /**
   * @param {import("../types.js").PublicProfile} athlete
   * @param {"accepted" | "declined"} status
   */
  function handleAnswer(athlete, status) {
    run(async () => {
      await answerFriendRequest(athlete.id, status);
    });
  }

  /** @param {import("../types.js").PublicProfile} athlete */
  function handleCancel(athlete) {
    run(async () => {
      await cancelFriendRequest(athlete.id);
    });
  }

  /** @param {import("../types.js").PublicProfile} athlete */
  function handleBlock(athlete) {
    const message =
      `Block ${displayName(athlete)}? They are removed from your friends and requests, ` +
      "and can't send you another request.";
    if (!window.confirm(message)) {
      return;
    }
    run(async () => {
      await blockAthlete(athlete.id);
    });
  }

  // Blocks whoever the typed username belongs to, without sending them anything.
  function handleBlockUsername() {
    if (friendUsername.trim() === "") {
      setError("Type a username first.");
      return;
    }
    if (!window.confirm(`Block ${friendUsername.trim()}? They can't send you requests or see anything of yours.`)) {
      return;
    }
    run(async () => {
      const result = await blockByUsername(friendUsername);
      setFriendUsername("");
      return `Blocked ${displayName(result.athlete)}`;
    });
  }

  /** @param {import("../types.js").PublicProfile} athlete */
  function handleUnblock(athlete) {
    run(async () => {
      await unblockAthlete(athlete.id);
    });
  }

  /**
   * @param {import("../types.js").PublicProfile} athlete
   * @param {boolean} hide
   */
  function handleHideLifts(athlete, hide) {
    run(async () => {
      await setHideMyLifts(athlete.id, hide);
    });
  }

  /** @param {import("../types.js").PublicProfile} athlete */
  function handleRemove(athlete) {
    if (!window.confirm(`Remove ${displayName(athlete)} from your friends?`)) {
      return;
    }
    run(async () => {
      await removeFriend(athlete.id);
    });
  }

  if (loading) {
    return <p>Loading…</p>;
  }

  return (
    <div>
      <h1>Friends</h1>
      {error && <p className="error">{error}</p>}
      {notice && <p className="success">{notice}</p>}

      <section className="card">
        <h4>Your username</h4>
        <div className="friend-username">
          <strong>{username}</strong>
          <button type="button" onClick={handleCopy}>Copy</button>
        </div>
        <p>Share this so friends can add you.</p>
      </section>

      <form onSubmit={handleSend} className="card">
        <h4>Add a friend</h4>
        <div className="inline-form">
          <input
            aria-label="Friend's username"
            placeholder="Their username"
            value={friendUsername}
            onChange={(e) => setFriendUsername(e.target.value)}
            required
          />
          <button type="submit">Send</button>
          <button type="button" className="danger" onClick={handleBlockUsername}>Block</button>
        </div>
      </form>

      {requests.incoming.length > 0 && (
        <section className="card">
          <h4>Requests for you</h4>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Sent</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {requests.incoming.map(({ athlete, sent_at }) => (
                  <tr key={athlete.id}>
                    <td>{displayName(athlete)}</td>
                    <td>{athlete.username}</td>
                    <td>{shortDate(sent_at)}</td>
                    <td className="actions">
                      <button type="button" className="primary" onClick={() => handleAnswer(athlete, "accepted")}>
                        Accept
                      </button>
                      <button type="button" onClick={() => handleAnswer(athlete, "declined")}>
                        Decline
                      </button>
                      <button type="button" className="danger" onClick={() => handleBlock(athlete)}>
                        Block
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {requests.outgoing.length > 0 && (
        <section className="card">
          <h4>Sent requests</h4>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Sent</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {requests.outgoing.map(({ athlete, sent_at }) => (
                  <tr key={athlete.id}>
                    <td>{displayName(athlete)}</td>
                    <td>{athlete.username}</td>
                    <td>{shortDate(sent_at)}</td>
                    <td className="actions">
                      <button type="button" onClick={() => handleCancel(athlete)}>Cancel</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="card">
        <h4>Friends</h4>
        {friends.length === 0 && <p>No friends yet.</p>}
        {friends.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Friends since</th>
                  <th>Hide my lifts</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {friends.map(({ athlete, since, hide_my_lifts }) => (
                  <tr key={athlete.id}>
                    <td><Link to={`/friends/${athlete.id}`}>{displayName(athlete)}</Link></td>
                    <td>{athlete.username}</td>
                    <td>{shortDate(since)}</td>
                    <td className="select-cell">
                      <input
                        type="checkbox"
                        aria-label={`Hide my lifts from ${displayName(athlete)}`}
                        checked={hide_my_lifts}
                        onChange={(e) => handleHideLifts(athlete, e.target.checked)}
                      />
                    </td>
                    <td className="actions">
                      <button type="button" className="danger" onClick={() => handleBlock(athlete)}>
                        Block
                      </button>
                      <button type="button" className="danger" onClick={() => handleRemove(athlete)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {blocked.length > 0 && (
        <section className="card">
          <h4>Blocked</h4>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Blocked</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {blocked.map(({ athlete, since }) => (
                  <tr key={athlete.id}>
                    <td>{displayName(athlete)}</td>
                    <td>{athlete.username}</td>
                    <td>{shortDate(since)}</td>
                    <td className="actions">
                      <button type="button" onClick={() => handleUnblock(athlete)}>Unblock</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

export default Friends;
