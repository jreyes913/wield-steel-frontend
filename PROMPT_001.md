# Task: Build a barebones frontend for my workout tracker

You're working in `workout-tracker-web`, a Vite + React project I already created. Build a simple, working frontend for my existing backend API. **Readability is the top priority.** I'll maintain this code by hand later without AI help, so write it the way a careful developer would for a beginner teammate: plain, explicit, and well-commented. When choosing between clever and obvious, choose obvious.

## Current project state
- Vite + React, **JavaScript (not TypeScript)**, React **18** (pinned on purpose; don't upgrade).
- Already installed: `aws-amplify`, `@aws-amplify/ui-react`.
- I'm on Windows using PowerShell.
- The starter Vite demo is still in `src/`. Replace it.

## Allowed dependencies
Use only these. Ask me before adding anything else.
- `aws-amplify`, `@aws-amplify/ui-react` (installed)
- `react-router-dom` (pages and URLs)
- `chart.js` and `react-chartjs-2` (progress charts only)

No TypeScript, no CSS frameworks, no state-management libraries, no form libraries, no axios (use `fetch`).

## Environment
Read these from `.env.local`, and create the file if it's missing:
```
VITE_API_URL=https://r6z25oo3o9.execute-api.us-east-2.amazonaws.com
VITE_USER_POOL_ID=us-east-2_LAaNM8OAn
VITE_USER_POOL_CLIENT_ID=6u276gi81pj6p7jbvmmspp2je6
```
`.env.local` is already gitignored by Vite's default `.gitignore`. Keep it that way.

## Authentication
- Cognito user pool, **invite-only**: use `<Authenticator hideSignUp>` from `@aws-amplify/ui-react` to wrap the whole app. Nothing renders until the user signs in.
- Configure Amplify once at startup with the user pool ID and client ID.
- Every API request must send `Authorization: Bearer <access token>`, using the access token from `fetchAuthSession()`. Amplify refreshes tokens automatically.
- Show a Sign out button in the navigation.

## Readability rules (most important)
1. **One API file.** `src/api.js` holds every backend call: one small, named, exported function per endpoint, all built on a single shared `request()` helper. Components never call `fetch` directly.
2. **One page per file** in `src/pages/`. Small reusable pieces go in `src/components/`, but only when they're used in two or more places.
3. **Plain function components with `useState` and `useEffect`.** No custom hooks, context providers, reducers, or higher-order components unless there's no simpler way, and if you add one, explain why in a comment.
4. **Same pattern on every page:** load data in `useEffect`, track `loading` and `error` in state, show "Loading…" and the error message, and reload the data after a successful create, edit, or delete. Use the same variable names on every page.
5. **Descriptive names** (`selectedExerciseId`, not `selId`). No abbreviations except common ones like `id`.
6. **Comments explain *why*, not *what*.** Every file starts with a short comment saying what the page or module is for. Add comments wherever the backend has a rule the reader wouldn't guess (for example, the user's identity comes from the token, so the frontend never sends `athlete_id`).
7. **Keep files short.** If a page goes past about 200 lines, split out a component.
8. **One plain CSS file** (`src/index.css`), with simple class names. Barebones styling: readable spacing, works on a phone screen. No design work beyond that.
9. **Simple forms:** controlled inputs, a submit handler, then clear the form. Dates use `<input type="date">` (YYYY-MM-DD). Confirm deletes with `window.confirm`.
10. **No premature abstraction.** Some repetition between pages is fine if it keeps each page easy to read top to bottom.

## Pages and routes
| Route | Page | What it does |
|---|---|---|
| `/` | Lifts | List my lifts (newest first). Form to log a lift (date, body weight). Each row links to its detail page. |
| `/lifts/:id` | Lift detail | Show the lift's sets and subsets. Edit date and body weight. Delete the lift. Add a set (pick exercise, reps, RIR, weight). Add an exercise to an existing set (for supersets). Edit or delete any subset. Delete a set. Apply a program day (two dropdowns: program, then day). |
| `/progress` | Progress | Line chart of body weight over time. Strength chart: pick an exercise and a metric (`weight`, `e1rm`, `intensity`, `load`, `volume`, `daily_1rm`), with optional start and end dates. Plot from the response's `days` array for daily metrics and the `sets` array for per-set metrics. |
| `/programs` | Programs | List my programs. Create one (name, optional start and end dates). Delete one. Each links to its detail page. |
| `/programs/:id` | Program detail | Edit name and dates. Add, rename, or delete days. In each day: add a set (exercise and reps), add an exercise to a set, edit or delete subsets, delete sets. |
| `/profile` | Profile | Show and edit first name, last name, date of birth, gender, height. |

Navigation bar on every page: Lifts, Progress, Programs, Profile, Sign out.

Exercise dropdowns: load `GET /exercises` and `GET /muscle-groups`, and group the options by muscle group (`<optgroup>`).

New sets and subsets need a `position`. Compute it as one more than the current highest position on that lift, day, or set, so the user never types positions.

## Backend API (already built; do not change it)
All requests require the Authorization header. Errors come back as `{"error": "message"}` with a 4xx or 5xx status. API Gateway's own 401 is `{"message": "Unauthorized"}`. The `request()` helper should throw an Error carrying whichever message is present, and pages should display it. Anything that isn't the user's returns 404. Edits (PUT) change only the fields sent. Deletes remove everything underneath and return `{"deleted": id}`.

**Profile**
- `GET /me` → `{id, username, first_name, last_name, dob, gender, height}`
- `PUT /me` body `{first_name?, last_name?, dob?, gender?, height?}` → same shape

**Reference data**
- `GET /muscle-groups` → `[{id, name}]`
- `GET /exercises` (optional `?muscle_group_id=`) → `[{id, name, muscle_group_id, difficulty, complexity}]`

**Lifts**
- `GET /lifts` → `[{id, date, athlete_id, body_weight}]`, newest first
- `POST /lifts` body `{date, body_weight?}` → the lift
- `GET /lifts/{id}` → `{id, date, athlete_id, body_weight, sets: [{id, position, subsets: [{id, position, exercise: {id, name}, reps, rir, weight}]}]}`
- `PUT /lifts/{id}` body `{date?, body_weight?}` → the lift
- `DELETE /lifts/{id}`
- `POST /lifts/{id}/sets` body `{position, subsets: [{exercise_id, position, reps?, rir?, weight?}]}` → the new set (subsets here have `exercise_id`, not a nested exercise. Just reload the lift afterward)
- `POST /lifts/{id}/apply` body `{program_day_id}` → same shape as `GET /lifts/{id}`
- `PUT /sets/{id}` body `{position}`
- `DELETE /sets/{id}`
- `POST /sets/{id}/subsets` body `{exercise_id, position, reps?, rir?, weight?}`
- `PUT /subsets/{id}` body `{exercise_id?, position?, reps?, rir?, weight?}`
- `DELETE /subsets/{id}`

Field rules: `reps` and `rir` are whole numbers, `weight` can be a decimal, `body_weight` and `height` are whole numbers, dates are `YYYY-MM-DD`. Send empty optional fields as `null`, not empty strings.

**Progress**
- `GET /progress/body-weight` (optional `?start=&end=`) → `[{date, body_weight}]`
- `GET /progress/strength?exercise_id=` (optional `&start=&end=`) → `{exercise: {id, name}, days: [{date, daily_1rm, top_weight, set_count, volume}], sets: [{date, lift_id, set_position, subset_position, weight, reps, rir, e1rm, daily_1rm, intensity, load, volume}]}`. Metrics can be `null` (no qualifying set that day). Skip null points in charts.

**Programs** (a program has days, days have sets, sets have subsets)
- `GET /programs` → `[{id, athlete_id, name, start_date, end_date}]`
- `POST /programs` body `{name, start_date?, end_date?}`
- `GET /programs/{id}` → `{..., days: [{id, name, sets: [{id, position, subsets: [{id, position, exercise: {id, name}, reps}]}]}]}`
- `PUT /programs/{id}` body `{name?, start_date?, end_date?}`
- `DELETE /programs/{id}`
- `POST /programs/{id}/days` body `{name}`
- `PUT /program-days/{id}` body `{name}`
- `DELETE /program-days/{id}`
- `POST /program-days/{id}/sets` body `{position, subsets: [{exercise_id, position, reps?}]}`
- `PUT /program-sets/{id}` body `{position}`
- `DELETE /program-sets/{id}`
- `POST /program-sets/{id}/subsets` body `{exercise_id, position, reps?}`
- `PUT /program-subsets/{id}` body `{exercise_id?, position?, reps?}`
- `DELETE /program-subsets/{id}`

## Deliverables
1. All the files above, working.
2. A `README.md` explaining: how to run it locally, the folder structure (one line per file), how a request flows from a page through `api.js` to the backend, and step-by-step how to add a new page and a new API call.
3. Run `npm run build` and fix any errors before finishing.
4. When you're done, list every file you created or changed, with one sentence each.

## Working style
- Build in this order, and stop for me to test after step 2: (1) `api.js`, Amplify setup, login, and navigation; (2) Profile page (proves the full login → API chain works); (3) Lifts and Lift detail; (4) Progress; (5) Programs.
- If anything in this spec is ambiguous, ask instead of guessing.