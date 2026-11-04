// A select that narrows a list of athletes to one of my groups ("All athletes" shows everyone).
// Nothing renders when I have no groups.

/**
 * @param {object} props
 * @param {import("../types.js").CoachGroup[]} props.groups
 * @param {string} props.value  The chosen group's id, or "" for all athletes.
 * @param {(value: string) => void} props.onChange
 */
function GroupFilter({ groups, value, onChange }) {
  if (groups.length === 0) {
    return null;
  }
  return (
    <label>
      Group{" "}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">All athletes</option>
        {groups.map((group) => (
          <option key={group.id} value={String(group.id)}>
            {group.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export default GroupFilter;
