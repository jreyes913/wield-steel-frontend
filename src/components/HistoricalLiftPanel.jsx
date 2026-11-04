// The left column of the comparison view: a past lift, shown read-only on the
// brand green background. Nothing here can change the past lift; the only
// buttons pick a different date or close the comparison.
// It can also show a friend's lift: the label names the friend, and there is no
// body weight line, because a friend's lift has none.

import { useState } from "react";
import { displayName } from "../friendHelpers.js";
import LiftSetsTable from "./LiftSetsTable.jsx";

/**
 * @param {object} props
 * @param {import("../types.js").Lift | import("../types.js").FriendLift | null} props.lift
 *   Null while it is still loading.
 * @param {import("../types.js").PublicProfile | null} [props.friend]  Whose lift it is, when
 *   it is a friend's. Leave out for one of my own past lifts.
 * @param {() => void} props.onChangeDate  Opens the date picker again.
 * @param {() => void} props.onRemove  Closes the comparison.
 */
function HistoricalLiftPanel({ lift, friend = null, onChangeDate, onRemove }) {
  // On a narrow screen the panel sits below the lift being edited and starts closed,
  // so the lift in use comes first. Side by side (wide screens) it is always open.
  const [isOpen, setIsOpen] = useState(() => !window.matchMedia("(max-width: 1100px)").matches);

  return (
    <section className="lift-history" aria-label="Past lift for comparison">
      <div className="lift-history-header">
        <div>
          <p className="lift-history-label">
            {friend ? `Comparing with ${displayName(friend)}'s lift · read-only` : "Past lift · read-only"}
          </p>
          <h4 className="lift-history-date">{lift ? `Lift on ${lift.date}` : "Loading…"}</h4>
        </div>
        <div className="lift-history-actions">
          <button type="button" onClick={onChangeDate}>Change date</button>
          <button type="button" onClick={onRemove}>✕ Remove comparison</button>
        </div>
      </div>

      <button
        type="button"
        className="lift-history-toggle"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "▾ Hide sets" : "▸ Show sets"}
      </button>

      {lift && (
        <div className="lift-history-body" hidden={!isOpen}>
          {"body_weight" in lift && (
            <p className="lift-history-detail">Body weight: {lift.body_weight ?? "–"}</p>
          )}
          <h4>Sets</h4>
          <LiftSetsTable lift={lift} readOnly />
        </div>
      )}
    </section>
  );
}

export default HistoricalLiftPanel;
