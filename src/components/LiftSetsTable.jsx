// The table of a lift's sets. The lift detail page uses it twice:
// - normally (editable): every set has its buttons, and the last row adds a new set;
// - readOnly: the historical comparison column, where nothing can be changed. No
//   buttons or inputs are rendered, and no change callbacks are needed.

import AddLiftSetFooter from "./AddLiftSetFooter.jsx";
import LiftSetGroup from "./LiftSetGroup.jsx";
import { nextPosition } from "../formHelpers.js";

function LiftSetsTable({ lift, readOnly = false, exercises, muscleGroups, onChanged, onError }) {
  const newSetPosition = nextPosition(lift.sets);

  return (
    <>
      {lift.sets.length === 0 && (
        <p>{readOnly ? "No sets were recorded for this lift." : "No sets yet. Add the first one in the last row."}</p>
      )}
      <div className="table-wrap">
        <table className={readOnly ? "data-table data-table--read-only" : "data-table"}>
          <thead>
            <tr>
              <th className="set-cell">Set</th>
              <th>Exercise</th>
              <th>Reps</th>
              <th>RIR</th>
              <th>Weight</th>
              {!readOnly && <th></th>}
            </tr>
          </thead>
          {/* Each set is its own <tbody>, so its rows stay visually grouped. */}
          {lift.sets.map((set) => (
            <LiftSetGroup
              key={set.id}
              set={set}
              readOnly={readOnly}
              liftId={lift.id}
              nextSetPosition={newSetPosition}
              exercises={exercises}
              muscleGroups={muscleGroups}
              onChanged={onChanged}
              onError={onError}
            />
          ))}
          {!readOnly && (
            <AddLiftSetFooter
              liftId={lift.id}
              position={newSetPosition}
              exercises={exercises}
              muscleGroups={muscleGroups}
              onChanged={onChanged}
              onError={onError}
            />
          )}
        </table>
      </div>
    </>
  );
}

export default LiftSetsTable;
