// Card on the lift detail page for choosing a friend's lift to compare against.
// Step 1: pick a friend. Step 2: pick one of their lift dates (any date, not only
// earlier ones). A friend's lifts carry no body weight, so a date with several lifts
// just offers "Lift 1", "Lift 2". A friend who hides their lifts looks like one with none.

import { useEffect, useRef, useState } from "react";
import { getFriendLifts, getFriends } from "../api.js";
import { displayName } from "../friendHelpers.js";
import LiftDatePicker from "./LiftDatePicker.jsx";

/** @typedef {import("../types.js").Friend} Friend */
/** @typedef {import("../types.js").PublicProfile} PublicProfile */
/** @typedef {import("../types.js").FriendLiftSummary} FriendLiftSummary */

/**
 * @param {object} props
 * @param {(friend: PublicProfile, liftId: number) => void} props.onPick  Loads the chosen lift
 *   into the comparison column.
 * @param {() => void} props.onCancel
 */
function CompareFriendLiftPicker({ onPick, onCancel }) {
  const [friends, setFriends] = useState(/** @type {Friend[] | null} */ (null));
  const [friend, setFriend] = useState(/** @type {PublicProfile | null} */ (null));
  // The chosen friend's lifts; null while they load.
  const [lifts, setLifts] = useState(/** @type {FriendLiftSummary[] | null} */ (null));
  const [error, setError] = useState("");
  // Set when the picked date has more than one lift, so the user chooses which.
  const [dateWithSeveralLifts, setDateWithSeveralLifts] = useState("");
  // Counts friend choices, so a slow answer for an earlier friend is ignored.
  const latestRequest = useRef(0);

  useEffect(() => {
    async function loadFriends() {
      try {
        setFriends(await getFriends());
      } catch (err) {
        setError(err.message);
        setFriends([]);
      }
    }
    loadFriends();
  }, []);

  /** @param {PublicProfile} chosen */
  async function handleChooseFriend(chosen) {
    const requestNumber = ++latestRequest.current;
    setFriend(chosen);
    setLifts(null);
    setError("");
    setDateWithSeveralLifts("");
    try {
      const loaded = await getFriendLifts(chosen.id);
      if (requestNumber === latestRequest.current) {
        setLifts(loaded);
      }
    } catch (err) {
      if (requestNumber === latestRequest.current) {
        setError(err.message);
        setLifts([]);
      }
    }
  }

  /** @param {string} date */
  function handleSelectDate(date) {
    const liftsOnDate = (lifts ?? []).filter((lift) => lift.date === date);
    if (friend && liftsOnDate.length === 1) {
      onPick(friend, liftsOnDate[0].id);
    } else {
      setDateWithSeveralLifts(date);
    }
  }

  // Several lifts on one date are listed in the order they were recorded.
  const liftsOnChosenDate = (lifts ?? [])
    .filter((lift) => lift.date === dateWithSeveralLifts)
    .sort((a, b) => a.id - b.id);

  return (
    <div className="card compare-picker">
      <h4>Compare with a friend's lift</h4>
      {error && <p className="error">{error}</p>}

      {friends === null && <p>Loading friends…</p>}
      {friends !== null && friends.length === 0 && <p>You have no friends to compare with yet.</p>}
      {friends !== null && friends.length > 0 && (
        <div className="compare-picker-choices">
          <p>Which friend?</p>
          {friends.map(({ athlete }) => (
            <button
              key={athlete.id}
              type="button"
              className={athlete.id === friend?.id ? "primary" : undefined}
              onClick={() => handleChooseFriend(athlete)}
            >
              {displayName(athlete)}
            </button>
          ))}
        </div>
      )}

      {friend && lifts === null && <p>Loading lifts…</p>}
      {friend && lifts !== null && lifts.length === 0 && <p>No lifts to compare with</p>}
      {friend && lifts !== null && lifts.length > 0 && (
        <>
          <p className="compare-picker-hint">
            Highlighted dates have a lift recorded. Greyed-out dates have none.
          </p>
          {/* Keyed by friend, so the calendar opens on that friend's latest month. */}
          <LiftDatePicker
            key={friend.id}
            availableDates={lifts.map((lift) => lift.date)}
            selectedDate={dateWithSeveralLifts}
            onSelect={handleSelectDate}
          />
        </>
      )}

      {friend && liftsOnChosenDate.length > 1 && (
        <div className="compare-picker-choices">
          <p>{liftsOnChosenDate.length} lifts were recorded on {dateWithSeveralLifts}. Which one?</p>
          {liftsOnChosenDate.map((lift, index) => (
            <button key={lift.id} type="button" onClick={() => onPick(friend, lift.id)}>
              Lift {index + 1}
            </button>
          ))}
        </div>
      )}

      <button type="button" onClick={onCancel}>Cancel</button>
    </div>
  );
}

export default CompareFriendLiftPicker;
