// Card on the lift detail page for choosing a past lift to compare against.
// Only dates with another lift recorded on or before this lift's date can be
// picked. The lift being viewed is never offered as its own comparison.

import { useEffect, useState } from "react";
import { getLifts } from "../api.js";
import LiftDatePicker from "./LiftDatePicker.jsx";

// currentLift: the lift being viewed. selectedLiftId: the lift already being
// compared, if any. onPick(liftId) loads the chosen lift into the comparison column.
function CompareLiftPicker({ currentLift, selectedLiftId, onPick, onCancel, onError }) {
  const [lifts, setLifts] = useState(null);
  // Set when the picked date has more than one lift, so the user chooses which.
  const [dateWithSeveralLifts, setDateWithSeveralLifts] = useState("");

  useEffect(() => {
    async function loadLifts() {
      try {
        setLifts(await getLifts());
      } catch (err) {
        onError(err.message);
        setLifts([]);
      }
    }
    loadLifts();
    // onError is a new function every render; we only want to load once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (lifts === null) {
    return (
      <div className="card">
        <p>Loading past lifts…</p>
      </div>
    );
  }

  // Dates are YYYY-MM-DD, so comparing the strings compares the dates.
  const pastLifts = lifts.filter(
    (lift) => lift.id !== currentLift.id && lift.date <= currentLift.date
  );
  const selectedDate = lifts.find((lift) => lift.id === selectedLiftId)?.date ?? "";
  // Several lifts on one date are listed in the order they were recorded.
  const liftsOnChosenDate = pastLifts
    .filter((lift) => lift.date === dateWithSeveralLifts)
    .sort((a, b) => a.id - b.id);

  function handleSelectDate(date) {
    const liftsOnDate = pastLifts.filter((lift) => lift.date === date);
    if (liftsOnDate.length === 1) {
      onPick(liftsOnDate[0].id);
    } else {
      setDateWithSeveralLifts(date);
    }
  }

  return (
    <div className="card compare-picker">
      <h2>Compare with a past lift</h2>
      {pastLifts.length === 0 ? (
        <p>There are no earlier lifts to compare with yet.</p>
      ) : (
        <>
          <p className="compare-picker-hint">
            Highlighted dates have a lift recorded. Greyed-out dates have none.
          </p>
          <LiftDatePicker
            availableDates={pastLifts.map((lift) => lift.date)}
            selectedDate={dateWithSeveralLifts || selectedDate}
            onSelect={handleSelectDate}
          />
        </>
      )}

      {liftsOnChosenDate.length > 1 && (
        <div className="compare-picker-choices">
          <p>{liftsOnChosenDate.length} lifts were recorded on {dateWithSeveralLifts}. Which one?</p>
          {liftsOnChosenDate.map((lift, index) => (
            <button key={lift.id} type="button" onClick={() => onPick(lift.id)}>
              Lift {index + 1}
              {lift.body_weight !== null && lift.body_weight !== undefined
                ? ` · body weight ${lift.body_weight}`
                : ""}
            </button>
          ))}
        </div>
      )}

      <button type="button" onClick={onCancel}>Cancel</button>
    </div>
  );
}

export default CompareLiftPicker;
