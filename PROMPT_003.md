# Feature: Historical Lift Comparison View

Implement a side-by-side comparison feature on individual Lift-specific pages, allowing users to compare their currently displayed lift against a previously recorded performance of that same lift.

## 1. Feature Overview

Add the ability to toggle an individual Lift page between:

- **Single-column view:** The existing Lift page, unchanged.
- **Comparison view:** A two-column layout displaying a historical instance of the same lift alongside the currently displayed lift.

The purpose is to let users visually compare previous performances, including sets, reps, and weights, without losing the context of their current workout record.

## 2. Comparison Date Selection

Add a date-selection menu that allows the user to select a previous date on which they recorded the currently selected lift.

Requirements:

- Only dates with previously recorded instances of the selected lift should be selectable.
- Dates without a recorded instance of that lift should appear greyed out and be non-selectable.
- Dates with recorded instances should be visually highlighted using the application's existing date-selection styling conventions.
- The date selector should derive its available dates from the historical records for the currently selected lift, not from all recorded workouts.
- The currently displayed lift should not be selectable as its own historical comparison.
- Selecting a valid date should load the corresponding historical lift record into the comparison view.

If multiple records of the same lift exist on a selected date, follow the application's existing data model and record-selection conventions rather than arbitrarily selecting one.

## 3. Comparison Layout

When a historical date is selected, transition the Lift page from its existing single-column layout to a two-column comparison layout.

**Left column: Historical comparison**

- Display the previously recorded lift.
- Display the selected historical date prominently.
- Use the application's signature green background/styling for the historical comparison side.
- Display the historical sets, reps, weights, and other existing lift-specific information.
- All historical set information must be strictly read-only.
- Users must not be able to add, remove, edit, or otherwise modify sets from the historical comparison side.

**Right column: Current lift**

- Display the currently selected Lift page.
- Preserve its existing appearance and functionality.
- Maintain all existing editing capabilities, including adding, modifying, and removing sets where currently supported.
- Do not allow the historical comparison state to interfere with current lift editing.

The two columns should be visually distinct while maintaining consistent spacing, typography, and component styling with the existing application.

On narrower screens, use an appropriate responsive layout rather than forcing two cramped columns. A stacked layout is acceptable if necessary.

## 4. Removing the Comparison

Provide a clearly identifiable control to remove the historical comparison.

When activated:
- Remove the historical comparison column.
- Return the page to its original single-column layout.
- Display the current Lift page exactly as it appeared before comparison mode was activated.
- Preserve any unsaved or in-progress changes to the current lift.
- Do not delete or modify historical records.

Removing the comparison should not require a page reload.

## 5. Technical and Implementation Requirements

Before implementing:

1. Inspect the existing Lift-specific page architecture and identify how individual lifts and their associated sets are retrieved and rendered.
2. Identify the existing date-picker/calendar component and reuse it if possible.
3. Identify the application's signature green background styling and reuse the existing design tokens or CSS classes.
4. Understand the existing state-management and data-fetching patterns before introducing new state or queries.

Implementation guidelines:

- Keep the feature specific to individual Lift pages.
- Reuse existing components wherever practical.
- Avoid duplicating lift-rendering logic unnecessarily. Consider supporting a read-only rendering mode for the historical comparison.
- Ensure historical data is fetched using the appropriate lift identifier and selected date.
- Ensure comparison mode is purely presentational with respect to historical records.
- Do not introduce unnecessary dependencies.
- Do not modify the underlying workout data model unless absolutely necessary.
- Preserve existing functionality and avoid regressions in the standard Lift page.

## 6. Acceptance Criteria

The feature is complete when all of the following are true:

1. A user can open an individual Lift page and activate historical comparison.
2. The date selector highlights dates containing previous records of that specific lift.
3. Dates without records are greyed out and cannot be selected.
4. Selecting a historical date displays the historical lift on the left and the current lift on the right.
5. The historical comparison uses the signature green background.
6. Historical sets are completely read-only.
7. The current lift remains fully editable.
8. The user can remove the comparison and return to the original single-column view.
9. Removing the comparison does not discard current edits or modify historical records.
10. Existing Lift page functionality remains intact.

**Important:** First inspect the existing codebase and follow its established architecture and conventions. Do not assume how the data model, components, or styling work. Implement this feature in the smallest coherent set of changes possible. After implementation, summarize the files modified, the architectural decisions made, and any remaining limitations.