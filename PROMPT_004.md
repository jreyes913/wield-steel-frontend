# Block Grouping Logic: Clarification

Implement the following precise Block grouping behavior across Program pages and Lift pages.

## 1. Grouping Rules

A Block is a grouping of sets that contain the same exercises within their respective subsets.

- Compare exercise identities across the subsets belonging to each set.
- Sets with identical exercise compositions belong to the same Block.
- Reps, weight, RIR, and all other performance or prescription values are irrelevant to Block assignment.
- Do not reorganize, reorder, sort, or restructure sets or subsets.
- Do not introduce any additional organizational hierarchy.
- Preserve the existing set and subset structure exactly as it is.

Blocking is strictly a grouping and presentation behavior.

## 2. Block Identification

Assign alphabetical identifiers based on the order in which each unique exercise composition first appears.

- A, B, C ... Z
- AA, AB ... ZZ
- AAA, AAB ... ZZZ
- Continue as needed.

Sets with an exercise composition already encountered should reuse its existing Block identifier.

Do not assign new Block identifiers to individual sets that belong to an existing Block.

## 3. Block Reset Behavior

**Every individual lifting day must start its Block numbering at A.**

This applies independently to:

- Each day within a Program.
- Each individual Lift/workout session.

For example:

Program:
- Day 1: Blocks A, B, C.
- Day 2: Blocks A, B.
- Day 3: Blocks A, B, C, D.

Lift sessions:
- Monday: Blocks A, B.
- Wednesday: Blocks A, B, C.
- Friday: Blocks A, B.

Block identifiers must never carry over between different lifting days or sessions.

## 4. Display and Collapse Behavior

Retain the previously specified Block presentation:

- Each Block has its own table.
- Each Block displays its alphabetical identifier.
- Each Block can independently collapse or expand.
- Program day Blocks are collapsible.
- Standard Lift page Blocks are collapsible.
- Historical comparison Blocks are non-collapsible and read-only.

Historical comparison Blocks must use the same grouping rules and reset numbering independently for the historical lifting day.

## 5. Implementation Constraints

- Reuse existing exercise IDs to determine exercise identity.
- Preserve original set and subset ordering.
- Do not modify the underlying workout data model unnecessarily.
- Block membership should be derived dynamically.
- Changes to exercise composition should trigger regrouping.
- Changes to reps, weight, or RIR must not trigger a change in Block membership.
- Ensure Block state is scoped to its individual lifting day.

## 6. Acceptance Criteria

1. Sets with identical exercise compositions share a Block.
2. Different exercise compositions receive different Blocks.
3. Reps, weight, and RIR never affect grouping.
4. Original set and subset ordering remains unchanged.
5. Every Program day starts numbering at Block A.
6. Every individual Lift session starts numbering at Block A.
7. Blocks remain independently collapsible where permitted.
8. Historical comparison Blocks remain non-collapsible and read-only.
9. Existing workout functionality and data integrity remain intact.

**Core principle: Blocks are simply labels grouping sets with identical exercise compositions. They do not introduce a new organizational hierarchy or alter the existing structure of sets and subsets.**