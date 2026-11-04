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
jsconfig.json         Editor settings: lets VS Code understand imports, JSX and the JSDoc types.
src/
  main.jsx            Starts the app: configures Amplify, loads the styles, adds the router.
  App.jsx             Login wall, navigation bar, and the list of routes. Every page except
                      Lifts is loaded the first time it is opened (see "Bundle size").
  api.js              Every backend call, built on one shared request() helper.
  types.js            JSDoc types for the backend's data (Lift, LiftSet, LiftSubset, Program...).
                      Hover a value in VS Code to see its fields.
  usernameDefault.js  Swaps the auto-generated username for the email handle (before the @) after sign-in.
  friendRequests.js   The shared count of incoming friend requests (context + useFriendRequests hook).
  friendHelpers.js    Friends pages: displayName, shortDate, and the "no longer friends" message.
  formHelpers.js      Small form helpers: numberOrNull, todayAsDateString, nextPosition.
  setSelection.js     useSetSelection: which sets are ticked in a sets table.
  setActions.js       useSetActions: what Copy and Delete do to the ticked sets.
  blocks.js           Groups a day's sets into Blocks A, B, C… by their exercises (display only).
  chartSetup.js       Registers the Chart.js pieces our line charts use, and gives them the dark theme colours.
  glossary.js         The plain-language explanations of lifting terms, chart metrics and
                      exercise ratings.
  exerciseInfo.js     Difficulty and Complexity helpers: dropdown labels, and summarizeSets
                      (average difficulty, fatigue score, complexity counts).
  components/
    LegalPage.jsx, SiteFooter.jsx   Layout of the public legal pages, and the footer linking to them.
  styles/
    index.css         Imports the files below, in the order they apply. Keep that order.
    amplify.css       The part of Amplify UI's stylesheet the sign-in page needs.
    tokens.css        The brand guide's dark palette, spacing and fonts, plus the colours the app uses
                      (the only place the brand is set). The site is dark only, with no rounded corners.
    signin.css        Sign-in page overrides.
    base.css          Reset, layout, headings, error/success messages.
    navigation.css    Top navigation bar.
    cards.css         The white panels (.card, .chart).
    forms.css         Forms, inline forms, buttons.
    tables.css        Data tables and the toolbar above a sets table.
    blocks.css        Blocks: one table per group of sets.
    responsive.css    Tablet and phone adjustments.
    comparison.css    Lift detail page and the side-by-side comparison.
    calendar.css      The comparison date picker.
    guide.css         The Get Started page.
    exercises.css     The exercise-ratings summary line.
    friends.css       The Friends page and the "Viewing … read-only" banner.
    legal.css         Legal pages and the site footer.
  pages/
    Lifts.jsx         List of lifts + form to log one.
    LiftDetail.jsx    One lift: edit/delete it, its sets, add sets, apply a program day,
                      compare it side by side with a past lift.
    Progress.jsx      Page holding the two charts.
    Programs.jsx      List of programs + form to create one.
    ProgramDetail.jsx One program: edit it and manage its days.
    Exercises.jsx     Every exercise with its Difficulty and Complexity, by muscle group (read-only).
    Profile.jsx       View and edit my profile; download my data; delete my account.
    Privacy.jsx       Privacy Policy (public, draft). Terms.jsx is the Terms of Service.
    Friends.jsx       My username, add a friend, requests in and out, and my friends.
    FriendDetail.jsx  One friend: their programs and lifts (read-only).
    FriendLift.jsx    A friend's lift, read-only, without body weight.
    FriendProgram.jsx A friend's program, read-only.
    GetStarted.jsx    How to use the app, then lifting terms and chart metrics explained.
  components/
    NavBar.jsx            Top navigation and Sign out button.
    ExerciseSelect.jsx    Exercise dropdown grouped by muscle group (used by lifts and programs).
    AddLiftSetFooter.jsx  Bottom row of the lift table: inputs that add a new set.
    LiftSetGroup.jsx      One set in the lift table: checkbox + number, exercise rows, add-exercise row.
    LiftSubsetRow.jsx     One exercise row in a lift set; Edit turns its cells into inputs.
    LiftSetsTable.jsx     A lift's sets table; readOnly mode drops every button and input.
    SetActionsToolbar.jsx Bar above a sets table: add exercise / copy / delete the ticked sets.
    SetBlock.jsx          One Block: header bar (letter, exercises, set count) above its table.
    SetsSummary.jsx       One-line summary of a day's exercise ratings (lift page and program days).
    SetLeadingCells.jsx   A set's checkbox and number cells (shared by lift and program set rows).
    NewSetBlock.jsx       The "New set" box under a sets table (shared by lifts and programs).
    CompareLiftPicker.jsx Card for choosing a past lift to compare against.
    LiftDatePicker.jsx    Month calendar where only dates with a lift can be picked.
    HistoricalLiftPanel.jsx Green, read-only column showing the past lift being compared (mine or a
                          friend's; a friend's has no body weight line).
    ApplyProgramForm.jsx  Pick a program and day to apply to a lift.
    BodyWeightChart.jsx   Body weight line chart.
    StrengthChart.jsx     Strength line chart with exercise/metric/date pickers.
    DefaultUsername.jsx   Renders nothing; runs usernameDefault.js once after sign-in.
    FriendRequestsProvider.jsx Loads the incoming-request count for the nav badge (on load and on every
                          route change); pages call refresh() after answering a request.
    CompareFriendLiftPicker.jsx Card for choosing a friend, then one of their lift dates, to compare with.
    FriendBanner.jsx      "Viewing Alex's lift · read-only" bar on every friend view.
    ProgramDayCard.jsx    One program day: name bar plus a table of its sets; readOnly mode
                          (a friend's program) drops every button, checkbox and input.
    AddProgramSetFooter.jsx Bottom row of a program day's table: inputs that add a new set.
    ProgramSetGroup.jsx   One set in a program day's table: checkbox + number, exercise rows, add row.
    ProgramSubsetRow.jsx  One exercise row in a program set; Edit turns its cells into inputs.
```

Lift and program components come in pairs (`LiftSetGroup`/`ProgramSetGroup`,
`LiftSubsetRow`/`ProgramSubsetRow`, `AddLiftSetFooter`/`AddProgramSetFooter`). They look
alike but differ in their columns (a plan has reps only, no RIR or weight) and API calls,
so they are deliberately two simple components rather than one with many options. The
parts that really are identical live in the shared files above (`SetLeadingCells`,
`NewSetBlock`, `setActions.js`, `setSelection.js`).

## Look and feel

The brand guide is implemented in `src/styles/tokens.css` (palette, spacing, fonts) and the type
scale in `base.css`. Fonts (Poppins, Parkinsans, Noto Serif Kannada) load from Google Fonts in
`index.html`. The guide has one background colour, so panels and borders are derived from it in
`tokens.css`. Page titles are `h1`; card and section titles use `h4`, because the guide's `h2` and
`h3` sizes are too large beside form controls. To keep the boxed look, don't add `border-radius`.

## Exercise ratings

Exercises can have a **Difficulty** (1–5, how taxing to train hard) and a **Complexity**
(Low, Moderate or High, how much technique). Both come from the backend's `GET /exercises`
and are entered directly in the database; the app only displays them. Many exercises have
neither yet, so everything treats them as optional. Dropdowns show them (`Name · 4/5 · High`),
`/exercises` lists them, and each lift and program day summarises them. The summary says how
many exercises it could not rate. The wording lives in `glossary.js`, the maths in
`exerciseInfo.js`.

## Types and editor hints

The project is plain JavaScript, but `jsconfig.json` and the JSDoc comments give VS Code
autocomplete, hover docs and error underlines. The backend's data shapes are defined once in
`src/types.js`; `api.js` uses them for its return types and components use them for their
props. When the backend adds a field, add it to `types.js`.

To check the whole project for type errors from the terminal (this downloads TypeScript temporarily and adds nothing to the project):

```
npx -p typescript tsc -p jsconfig.json
```

## Bundle size

- **Pages load on demand.** `App.jsx` uses `React.lazy`, so only the Lifts page ships in the
  first download. Chart.js is only fetched when Progress is opened.
- **The sign-in page is most of what's left.** Amplify's Authenticator (with its state
  machine, QR-code and form libraries) is about 400 kB of the first download. It wraps the
  whole app, so everyone needs it before anything else shows.
- **Amplify styles are trimmed.** `src/styles/amplify.css` imports only the parts of
  Amplify's stylesheet the Authenticator uses, instead of all of `styles.css`.
- To see what is in the bundle, build with `npx vite build --sourcemap --outDir /tmp/bundle`
  and open the result in a bundle analyzer run through `npx`. Don't add one as a dependency.

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

In `src/api.js`, add one exported function next to the related ones, with a JSDoc comment
naming the argument and result types (add the type to `src/types.js` if it is new):

```js
/**
 * @param {Id} somethingId
 * @returns {Promise<Something>}
 */
export const getSomething = (somethingId) => request("GET", `/something/${somethingId}`);
```

Send empty optional fields as `null`, not `""` (see `numberOrNull` in `formHelpers.js`).

## Add a new page

1. Create `src/pages/MyPage.jsx`. Copy a simple page such as `Lifts.jsx` and keep
   the same pattern: `loading` and `error` state, a `load...()` function called
   from `useEffect`, and a reload after every change.
2. In `src/App.jsx`, load it with `lazy` (next to the other pages) and add a route
   inside `<Routes>`:
   ```jsx
   const MyPage = lazy(() => import("./pages/MyPage.jsx"));
   ...
   <Route path="/my-page" element={<MyPage />} />
   ```
3. To put it in the navigation, add a link in `src/components/NavBar.jsx`:
   ```jsx
   <NavLink to="/my-page">My page</NavLink>
   ```
4. If it needs data the backend doesn't expose yet, add the API call first (above).

## Backend behavior worth knowing

- Anything that isn't the signed-in user's comes back as 404.
- Friends can read your programs and logged lifts, never change them, and see only your name
  and username. Their lifts never include `body_weight`, and nothing from the friend endpoints
  includes DOB, gender, height or `cognito_sub`. Someone who isn't an accepted friend (no
  request, pending, declined or blocked) gets 404 from every `/athletes/{id}/…` call.
- Usernames are 3 to 30 of a-z 0-9 . _ -, stored lowercase and unique (409 "That username is
  taken"). The default is the email handle; a taken one gets a number (alex, alex2…). Friend
  and block lookups by username ignore case.
- "Hide my lifts" is one-way and per friend. A friend who hid their lifts from you looks like
  a friend with none: `/athletes/{id}/lifts` is `[]` and a single lift is 404. Programs stay visible.
- Blocking removes any friendship or request. The blocked athlete is never told: sending them
  a request gets "No athlete with that username". Unblocking restores nothing.
- A program too big to copy in one transaction (over 1,000 days, sets and exercises together) is
  refused with a 422 and a message saying so.
- Copying a friend's program makes an independent program of your own, named
  `"<name> (from <friend>)"`, with no dates.
- A request you sent that was declined still shows as pending in Sent requests, so declining
  is never revealed. Cancelling it removes the row.
- `PUT` changes only the fields you send.
- Deletes remove everything underneath (deleting a lift removes its sets and subsets).
- `reps` and `rir` are whole numbers; `weight` can be a decimal; dates are `YYYY-MM-DD`.
- Browsers send an `OPTIONS` "preflight" before each API call. The Lambda answers
  those with `204` before checking sign-in, and API Gateway needs an unauthorized
  `OPTIONS /{proxy+}` route. Without both, every call fails with "Failed to fetch".

## Legal pages

`/privacy` and `/terms` are routed outside the sign-in wall in `App.jsx`, so they open without an
account. They are linked under the sign-in form and from a footer on every page. Both are marked
"Draft: have a lawyer review before launch." and contain placeholders for the support email,
backup retention and governing law. Sign-up stays hidden (`hideSignUp`) until the owner decides
otherwise.

## Staging

Give the Amplify staging branch its own branch environment variables: `VITE_API_URL`,
`VITE_USER_POOL_ID` and `VITE_USER_POOL_CLIENT_ID`, pointing at the staging API and Cognito pool.
Locally, put the same three in `.env.local`. Don't put real user data in staging.

## Coaching

The Coaching page (`/coaching`) lets me ask to coach someone by username, accept or decline coaches,
choose whether each coach sees my body weight, and open the athletes I coach
(`/coaching/:athleteId`, with lift and program pages). Those pages are read-only and reuse the
friend banner. See `src/pages/Coaching.jsx` and the backend README. The Privacy Policy and Terms
(`src/pages/Privacy.jsx`, `Terms.jsx`) describe coaching and carry a "Last updated" date: change
`updated` on the `LegalPage` whenever the text changes.

Programs are private until the owner ticks "Public" on the program page (friends and coaches
then see it; friends can copy it). A coach opens a program's page and uses "Send to my athletes"
(`SendProgram.jsx`) to put a copy in each ticked athlete's programs; the athlete sees it marked
"from <coach>" on Programs.
