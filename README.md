# Workout Tracker (web)

A small React frontend for the workout tracker API. Sign in with an invited
Cognito account, then log lifts, view progress charts, and manage programs.

## Run it locally

1. Install dependencies (once): `npm install`
2. Make sure `.env.local` exists in the project root with:
   ```
   VITE_API_URL=https://r6z25oo3o9.execute-api.us-east-2.amazonaws.com
   VITE_USER_POOL_ID=us-east-2_LAaNM8OAn
   VITE_USER_POOL_CLIENT_ID=6u276gi81pj6p7jbvmmspp2je6
   ```
   (`.env.local` is gitignored. Restart `npm run dev` after changing it.)
3. Start it: `npm run dev`
4. Open **http://localhost:5173**. It must be exactly this address: the backend's
   CORS settings only allow it, and `vite.config.js` refuses to switch ports.

Other commands: `npm run build` (production build), `npm run lint`.

## Folder structure

```
src/
  main.jsx            Starts the app: configures Amplify, adds the router.
  App.jsx             Login wall, navigation bar, and the list of routes.
  api.js              Every backend call, built on one shared request() helper.
  formHelpers.js      Small form helpers: numberOrNull, todayAsDateString, nextPosition.
  chartSetup.js       Registers the Chart.js pieces our line charts use.
  index.css           The only stylesheet.
  pages/
    Lifts.jsx         List of lifts + form to log one.
    LiftDetail.jsx    One lift: edit/delete it, its sets, add sets, apply a program day.
    Progress.jsx      Page holding the two charts.
    Programs.jsx      List of programs + form to create one.
    ProgramDetail.jsx One program: edit it and manage its days.
    Profile.jsx       View and edit my profile.
  components/
    NavBar.jsx            Top navigation and Sign out button.
    ExerciseSelect.jsx    Exercise dropdown grouped by muscle group (used by lifts and programs).
    AddLiftSetForm.jsx    Form to add a set to a lift.
    LiftSetCard.jsx       One set on a lift, with add-exercise and delete-set.
    LiftSubsetRow.jsx     One exercise in a lift set, with inline edit/delete.
    ApplyProgramForm.jsx  Pick a program and day to apply to a lift.
    BodyWeightChart.jsx   Body weight line chart.
    StrengthChart.jsx     Strength line chart with exercise/metric/date pickers.
    ProgramDayCard.jsx    One program day: rename, delete, sets, add a set.
    ProgramSetCard.jsx    One set in a program day, with add-exercise and delete-set.
    ProgramSubsetRow.jsx  One exercise in a program set, with inline edit/delete.
```

## How a request flows

Take "log a lift" as an example:

1. On `Lifts.jsx`, the form's submit handler calls `createLift({ date, body_weight })`
   (imported from `api.js`). Pages never call `fetch` themselves.
2. `createLift` calls the shared `request("POST", "/lifts", fields)` in `api.js`.
3. `request()` asks Amplify for the current session (`fetchAuthSession()`, which
   refreshes an expired token automatically) and sends the call with
   `Authorization: Bearer <access token>`.
4. API Gateway checks the token, then the Lambda reads the user's identity **from
   the token**. That is why the frontend never sends an `athlete_id`.
5. The Lambda replies with JSON. On success `request()` returns it. On failure
   (`{"error": ...}` or API Gateway's `{"message": ...}`) it throws an `Error` with
   that message.
6. Back in the page, a `try/catch` stores any error message in state (shown on the
   page), and on success the page reloads its data so the screen shows what the
   backend actually saved.

Every page follows the same shape: `loading` and `error` state, a `load...()`
function called from `useEffect`, and a reload after each create, edit or delete.

## Add a new API call

In `src/api.js`, add one exported function next to the related ones:

```js
export const getSomething = (somethingId) => request("GET", `/something/${somethingId}`);
export const createSomething = (fields) => request("POST", "/something", fields);
```

Send empty optional fields as `null`, not `""` (see `numberOrNull` in `formHelpers.js`).

## Add a new page

1. Create `src/pages/MyPage.jsx`. Copy a simple page such as `Lifts.jsx` and keep
   the same pattern: `loading` and `error` state, a `load...()` function called
   from `useEffect`, and a reload after every change.
2. In `src/App.jsx`, import it and add a route inside `<Routes>`:
   ```jsx
   <Route path="/my-page" element={<MyPage />} />
   ```
3. To put it in the navigation, add a link in `src/components/NavBar.jsx`:
   ```jsx
   <NavLink to="/my-page">My page</NavLink>
   ```
4. If it needs data the backend doesn't expose yet, add the API call first (above).

## Backend behavior worth knowing

- Anything that isn't the signed-in user's comes back as 404.
- `PUT` changes only the fields you send.
- Deletes remove everything underneath (deleting a lift removes its sets and subsets).
- `reps` and `rir` are whole numbers; `weight` can be a decimal; dates are `YYYY-MM-DD`.
- Browsers send an `OPTIONS` "preflight" before each API call. The Lambda answers
  those with `204` before checking sign-in, and API Gateway needs an unauthorized
  `OPTIONS /{proxy+}` route. Without both, every call fails with "Failed to fetch".
