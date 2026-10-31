# Workout Tracker (web)

A small React frontend for the workout tracker API. Sign in with an invited
Cognito account, then log lifts, view progress charts, and manage programs.

## Run it locally

1. Install dependencies (once): `npm install`
2. Make sure `.env.local` exists in the project root with:
   ```
   VITE_API_URL=https://dwclwdsouqbt4.cloudfront.net
   VITE_USER_POOL_ID=us-east-2_LAaNM8OAn
   VITE_USER_POOL_CLIENT_ID=6u276gi81pj6p7jbvmmspp2je6
   ```
   (`.env.local` is gitignored. Restart `npm run dev` after changing it.)
3. Start it: `npm run dev`
4. Open **http://localhost:5173**. It must be exactly this address: the backend's
   CORS settings only allow it, and `vite.config.js` refuses to switch ports.

Other commands: `npm run build` (production build), `npm run lint`.

## Where the API lives

The frontend calls the API through CloudFront, never API Gateway directly:

```
browser → CloudFront (dwclwdsouqbt4.cloudfront.net) + WAF → API Gateway (r6z25oo3o9) → Lambda
```

- **CloudFront** distribution `EDARORIJXGK3R`: HTTPS only, no caching, passes every
  header except `Host` through (so `Authorization` and CORS still work).
- **WAF** web ACL `wield-steel-waf` (in us-east-1, as CloudFront requires) runs the
  AWS managed Common and SQL-injection rule sets. Blocked requests get a plain
  `403` from CloudFront, which `request()` shows as an error. If a normal-looking
  request gets a 403, check the WAF's sampled requests in the AWS console.
- **API Gateway** stage `$default` is throttled to 200 requests/second (burst 500).
  Over that, calls get `429 Too Many Requests`.
- **Production** builds on Amplify (app `d2gypyesmndbtg`) read `VITE_API_URL` from
  the Amplify app's environment variables, not from `.env.local`. Change it there
  and redeploy if the API address ever changes.

The old `execute-api` address still answers and bypasses the WAF; don't use it.

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
    AddLiftSetFooter.jsx  Bottom row of the lift table: inputs that add a new set.
    LiftSetGroup.jsx      One set in the lift table: header row, exercise rows, add-exercise row.
    LiftSubsetRow.jsx     One exercise row in a lift set; Edit turns its cells into inputs.
    ApplyProgramForm.jsx  Pick a program and day to apply to a lift.
    BodyWeightChart.jsx   Body weight line chart.
    StrengthChart.jsx     Strength line chart with exercise/metric/date pickers.
    ProgramDayCard.jsx    One program day: name bar plus a table of its sets.
    ProgramSetGroup.jsx   One set in a program day's table: header row, exercise rows, add row.
    ProgramSubsetRow.jsx  One exercise row in a program set; Edit turns its cells into inputs.
```

## How a request flows

Take "log a lift" as an example:

1. On `Lifts.jsx`, the form's submit handler calls `createLift({ date, body_weight })`
   (imported from `api.js`). Pages never call `fetch` themselves.
2. `createLift` calls the shared `request("POST", "/lifts", fields)` in `api.js`.
3. `request()` asks Amplify for the current session (`fetchAuthSession()`, which
   refreshes an expired token automatically) and sends the call with
   `Authorization: Bearer <access token>`.
4. The call goes to CloudFront, where the WAF screens it (see "Where the API
   lives" below), and is passed on to API Gateway. API Gateway checks the token,
   then the Lambda reads the user's identity **from the token**. That is why the
   frontend never sends an `athlete_id`.
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
