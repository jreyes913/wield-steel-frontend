// Small helpers shared by the forms.
// Text inputs always hold strings, but the backend wants numbers or null
// (never empty strings), so every form converts with these before sending.

// "" -> null, "12" -> 12, "12.5" -> 12.5
export function numberOrNull(text) {
  return text === "" ? null : Number(text);
}

// Today as YYYY-MM-DD in the user's local time zone. (toISOString would use UTC,
// which gives tomorrow's date for evening workouts in the Americas.)
export function todayAsDateString() {
  return new Date().toLocaleDateString("en-CA");
}

// The next free position in a list of items that each have a `position`.
// Users never type positions, so new items go at the end.
export function nextPosition(items) {
  let highest = 0;
  for (const item of items) {
    if (item.position > highest) {
      highest = item.position;
    }
  }
  return highest + 1;
}
