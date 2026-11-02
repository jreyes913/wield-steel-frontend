# Maintenance: Bundle Size, Code Organization, and IDE Hints

Reduce the production bundle size, then refactor the codebase for human readability and better editor (IDE) hints. This is a maintenance pass: **the site must look and behave exactly the same afterwards.**

## 1. Current State (measured 2026-10-31)

`npm run build` produces a single JavaScript chunk and warns that it is over 500 kB:

```
dist/assets/index-*.css   321.68 kB │ gzip:  32.03 kB
dist/assets/index-*.js    960.73 kB │ gzip: 275.74 kB
```

Known facts to verify before acting:

- Everything ships in one chunk. No route is lazy-loaded.
- `chart.js` and `react-chartjs-2` are only used on the Progress page (`BodyWeightChart.jsx`, `StrengthChart.jsx`, `chartSetup.js`), but every page downloads them.
- `main.jsx` imports the full `@aws-amplify/ui-react/styles.css`, which is most of the 321 kB stylesheet, though only the `Authenticator` is used.
- `aws-amplify` and `@aws-amplify/ui-react` are likely the largest contributors overall.

The codebase is about 2,600 lines of plain JavaScript/JSX (React 18, Vite 8, React Router 7). There is no `jsconfig.json`, no TypeScript, and no formatter config.

## 2. Bundle Size

Before changing anything, measure what is actually in the bundle (for example with a bundle visualizer run once via `npx`, not added as a permanent dependency unless it earns its place). Report the biggest contributors.

Then reduce the initial download, in roughly this order of value:

1. Lazy-load routes with `React.lazy` and `Suspense`, at minimum the Progress page so Chart.js only loads there. Consider the other pages too. Use a loading fallback consistent with the existing `<p>Loading…</p>`.
2. Check whether the Amplify imports can be narrowed (for example importing only `aws-amplify/auth` APIs and only the Authenticator's styles) without breaking sign-in.
3. Add `manualChunks`/code-splitting in `vite.config.js` only if it gives a measurable benefit after steps 1 and 2.

Requirements:

- Sign-in must still work, including the sign-in page styling and the custom brand colours in `index.css`.
- Report before/after sizes (raw and gzip) for the initial load and for each chunk.
- Do not raise `chunkSizeWarningLimit` just to hide the warning.

## 3. Code Organization and Readability

Refactor for a human reader who is new to the project. The existing style is deliberate and should be kept: plain language comments at the top of every file and above non-obvious code, one small function per API endpoint in `api.js`, and the `loading`/`error`/`load…()` page pattern described in the README.

Known duplication to evaluate (verify each; only merge where it makes the code clearer, not just shorter):

- `LiftSetsTable.jsx` and `ProgramDayCard.jsx` repeat the copy-sets and delete-sets handlers, the block table markup, and the "New set" table.
- `LiftSetGroup.jsx` / `ProgramSetGroup.jsx` and `LiftSubsetRow.jsx` / `ProgramSubsetRow.jsx` are near-copies that differ only in the RIR and weight columns and the API calls.
- `AddLiftSetFooter.jsx` and the new-set row inside `ProgramDayCard.jsx` do the same job in two different places.
- `index.css` is a single file of about 1,000 lines. Decide whether splitting it (for example per area, or co-located with components) helps readability. Keep the colour tokens on `:root` in one place either way.

General guidelines:

- Prefer clear names and small components over clever abstractions. A shared component that needs many flags to cover both cases is worse than two simple ones.
- Remove dead code, unused CSS rules, and stale comments (for example, comments describing layouts that changed this week).
- Keep files and folders easy to find; update the README's folder structure for anything that moves.
- Add a formatter config (Prettier is fine) only if it matches the current formatting closely enough not to produce a huge, noisy diff. If it would, propose it instead of applying it.

## 4. IDE Hints

Make editors (VS Code in particular) give useful autocomplete, hover docs, and error hints, **without converting the project to TypeScript**.

- Add a `jsconfig.json` suited to Vite + React (module resolution, JSX, the `src` folder).
- Add JSDoc type definitions for the backend's data shapes, in one shared file, and use them in `api.js` return types and component props. The shapes, from the backend's responses:
  - Lift: `id`, `date` (YYYY-MM-DD), `body_weight` (int or null), `sets`.
  - Set: `id`, `position`, `subsets`.
  - Lift subset: `id`, `position`, `exercise` (`{ id, name }`), `reps`, `rir`, `weight` (each may be null).
  - Program, program day, program set and program subset (reps only, no RIR or weight). Check `api.js`, the components, and `../wield-steel-backend/src/routes/` for the exact fields rather than guessing.
- Add `@param` JSDoc to each component's props and each exported helper (`formHelpers.js`, `blocks.js`, `setSelection.js`).
- Optionally evaluate `// @ts-check` (or `checkJs` in `jsconfig.json`). If it reports real issues, fix them; if it would need noisy workarounds, leave it off and say why.

## 5. Constraints

- No visual or behavioural changes. Every page (Lifts, Lift detail with comparison and Blocks, Progress, Programs, Program detail, Profile, sign-in) must work as before.
- Do not change the backend or the API contract.
- Do not add runtime dependencies unless they remove more than they add.
- `npm run lint` and `npm run build` must pass, with no new lint suppressions unless they are explained in a comment.
- Work in small, reviewable steps. Commit only when asked. Pushing to `master` deploys to production through Amplify.

## 6. Acceptance Criteria

1. The initial JavaScript download is clearly smaller, with before/after numbers reported.
2. Chart.js is no longer part of the initial load.
3. Sign-in, its styling, and every page still work exactly as before.
4. Duplicated set/table logic is consolidated where doing so makes it easier to read.
5. Hovering a lift, set, or subset value in VS Code shows its type and fields.
6. Component props and shared helpers have JSDoc.
7. The README's folder structure matches the code.
8. Lint and build pass.

**Finish with a summary:** the before/after bundle sizes, the files added/removed/moved, what was consolidated and what was deliberately left separate (and why), and anything worth doing later.
