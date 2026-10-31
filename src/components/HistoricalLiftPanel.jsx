// The left column of the comparison view: a past lift, shown read-only on the
// brand green background. Nothing here can change the past lift; the only
// buttons pick a different date or close the comparison.

import LiftSetsTable from "./LiftSetsTable.jsx";

// lift is null while it is still loading.
function HistoricalLiftPanel({ lift, onChangeDate, onRemove }) {
  return (
    <section className="lift-history" aria-label="Past lift for comparison">
      <div className="lift-history-header">
        <div>
          <p className="lift-history-label">Comparing with · read-only</p>
          <h2 className="lift-history-date">{lift ? `Lift on ${lift.date}` : "Loading…"}</h2>
        </div>
        <div className="lift-history-actions">
          <button type="button" onClick={onChangeDate}>Change date</button>
          <button type="button" onClick={onRemove}>✕ Remove comparison</button>
        </div>
      </div>

      {lift && (
        <>
          <p className="lift-history-detail">Body weight: {lift.body_weight ?? "–"}</p>
          <h2>Sets</h2>
          <LiftSetsTable lift={lift} readOnly />
        </>
      )}
    </section>
  );
}

export default HistoricalLiftPanel;
