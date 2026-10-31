// A month calendar where only some dates can be picked.
// The browser's <input type="date"> can't grey out individual days, so the
// comparison picker uses this instead. Dates are YYYY-MM-DD strings throughout,
// built by hand (never toISOString) so the user's time zone can't shift a day.

import { useState } from "react";
import { todayAsDateString } from "../formHelpers.js";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDateString(year, monthIndex, day) {
  const month = String(monthIndex + 1).padStart(2, "0");
  return `${year}-${month}-${String(day).padStart(2, "0")}`;
}

// "2026-10-31" -> a single number per month, so months can be compared and stepped.
function monthNumber(dateString) {
  const [year, month] = dateString.split("-").map(Number);
  return year * 12 + (month - 1);
}

// availableDates: the only dates that can be picked; every other day is greyed out.
// onSelect(date) is called with the picked YYYY-MM-DD string.
function LiftDatePicker({ availableDates, selectedDate, onSelect }) {
  const available = new Set(availableDates);
  // Every month that has at least one pickable date, oldest first. The arrows jump
  // between these, so a long gap between workouts doesn't mean clicking through
  // empty months.
  const monthsWithDates = [...new Set(availableDates.map(monthNumber))].sort((a, b) => a - b);

  // Start on the selected date's month, or else the most recent one with a record.
  const [visibleMonth, setVisibleMonth] = useState(() =>
    monthNumber(selectedDate || availableDates.toSorted().at(-1) || todayAsDateString())
  );

  const year = Math.floor(visibleMonth / 12);
  const monthIndex = visibleMonth % 12;
  const previousMonth = monthsWithDates.findLast((month) => month < visibleMonth);
  const nextMonth = monthsWithDates.find((month) => month > visibleMonth);

  // Blank cells before the 1st, so day 1 sits under the right weekday.
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(day);
  }

  const monthLabel = new Date(year, monthIndex, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button
          type="button"
          className="calendar-nav"
          onClick={() => setVisibleMonth(previousMonth)}
          disabled={previousMonth === undefined}
          aria-label="Previous month with lifts"
        >
          ‹
        </button>
        <span className="calendar-month" aria-live="polite">{monthLabel}</span>
        <button
          type="button"
          className="calendar-nav"
          onClick={() => setVisibleMonth(nextMonth)}
          disabled={nextMonth === undefined}
          aria-label="Next month with lifts"
        >
          ›
        </button>
      </div>

      <div className="calendar-grid">
        {WEEKDAYS.map((weekday) => (
          <span key={weekday} className="calendar-weekday">{weekday}</span>
        ))}
        {cells.map((day, index) => {
          if (day === null) {
            return <span key={`blank-${index}`} />;
          }
          const date = toDateString(year, monthIndex, day);
          const isAvailable = available.has(date);
          const isSelected = date === selectedDate;
          let className = "calendar-day";
          if (isAvailable) className += " calendar-day--available";
          if (isSelected) className += " calendar-day--selected";
          return (
            <button
              key={date}
              type="button"
              className={className}
              disabled={!isAvailable}
              aria-pressed={isSelected}
              aria-label={isAvailable ? `${date}, has a lift` : `${date}, no lift`}
              onClick={() => onSelect(date)}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default LiftDatePicker;
