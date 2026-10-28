# Frontend Setup Guide — Workout Tracker

A complete, step-by-step record of how to set up the Workout Tracker website: a React app that signs users in with Cognito, talks to the backend API, and is hosted on AWS Amplify. Written so someone who has never built a website can follow it, and so the same steps can be reused for another project. It assumes the backend from **Backend Setup Guide - Workout Tracker.md** already exists.

---

## Table of Contents

1. [What We're Building](#1-what-were-building)
2. [Key Terms](#2-key-terms)
3. [What It Costs](#3-what-it-costs)
4. [Before You Start](#4-before-you-start)
5. [Step 1 — Prepare the Backend for a Browser](#5-step-1--prepare-the-backend-for-a-browser)
6. [Step 2 — Get the Code](#6-step-2--get-the-code)
7. [Step 3 — Install the Dependencies](#7-step-3--install-the-dependencies)
8. [Step 4 — Add Your Settings (.env.local)](#8-step-4--add-your-settings-envlocal)
9. [Step 5 — Create Your Login (Invite a User)](#9-step-5--create-your-login-invite-a-user)
10. [Step 6 — Run It Locally](#10-step-6--run-it-locally)
11. [Step 7 — Test Every Page](#11-step-7--test-every-page)
12. [Step 8 — Put the Code on GitHub](#12-step-8--put-the-code-on-github)
13. [Step 9 — Deploy to Amplify](#13-step-9--deploy-to-amplify)
14. [Step 10 — Allow the Live Site in the Backend (CORS)](#14-step-10--allow-the-live-site-in-the-backend-cors)
15. [Step 11 — Test the Live Site](#15-step-11--test-the-live-site)
16. [Everyday Workflow](#16-everyday-workflow)
17. [Troubleshooting — Every Error We Hit](#17-troubleshooting--every-error-we-hit)
18. [Appendix A — Recreating the Project From Nothing](#appendix-a--recreating-the-project-from-nothing)
19. [Appendix B — File Map](#appendix-b--file-map)
20. [Appendix C — Pages and the API Calls Behind Them](#appendix-c--pages-and-the-api-calls-behind-them)
21. [Appendix D — This Project's Values](#appendix-d--this-projects-values)

---

## 1. What We're Building

```
 You, in a browser
        │  1. Open the website (hosted on Amplify)
        │  2. Sign in → Cognito gives the browser a token
        ▼
 React app (this project)
        │  3. A page calls a function in src/api.js
        │  4. api.js attaches the token: "Authorization: Bearer <token>"
        ▼
 API Gateway ──► Lambda ──► Aurora DSQL        (the backend, already built)
```

**Why each piece exists:**

| Piece | Job | Why not skip it? |
|---|---|---|
| **React + Vite** | Builds the pages you click on | — |
| **`src/api.js`** | The one file that talks to the backend | Keeps every network call in one place, so there is only one place to debug. |
| **Amplify libraries** (`aws-amplify`, `@aws-amplify/ui-react`) | Provide the login screen and keep the token fresh | Writing your own login screen and token refresh is hard and easy to get wrong. |
| **react-router-dom** | Gives each page its own URL (`/lifts`, `/programs`) | Without it, the whole app is one page. |
| **chart.js** | Draws the progress charts | — |
| **Amplify Hosting** | Puts the built website on the internet | Your computer is not a public server. |

The website has six pages: **Lifts**, **Lift detail**, **Progress**, **Programs**, **Program detail**, and **Profile**.

---

## 2. Key Terms

| Term | Plain-English meaning |
|---|---|
| **Node.js** | Lets you run JavaScript tools on your computer. Needed to build the site. |
| **npm** | Node's package installer. It downloads the libraries the project uses. It comes with Node. |
| **React** | A JavaScript library for building web pages out of small pieces called components. |
| **Vite** | The tool that runs a local test copy of the site and builds the final files. |
| **Component** | One reusable piece of a page, written as a function (for example the navigation bar). |
| **Route** | A URL mapped to a page, like `/lifts/5` → the Lift detail page. |
| **Dependency** | A library the project needs. They are listed in `package.json`. |
| **`node_modules/`** | The folder where npm puts the downloaded libraries. It is huge, and you never edit or commit it. |
| **Environment variable** | A setting kept outside the code, like the API address. In Vite, ours start with `VITE_`. |
| **`.env.local`** | The file holding those settings on your computer. It is not committed to Git. |
| **Build** | Turning the project into plain files (`dist/`) that any web server can host. |
| **Amplify Hosting** | The AWS service that builds your project from GitHub and hosts it. |
| **Token (JWT)** | A temporary digital pass proving who you are. It expires after about an hour, and Amplify refreshes it for you. |
| **CORS** | A browser security rule controlling which websites may call your API. |
| **Preflight** | A quick `OPTIONS` request the browser sends before the real request, to ask "is this website allowed?" It carries **no** token. |
| **Origin** | A website's address: `https://` + domain + port, with no path and no trailing slash. |
| **PowerShell** | The Windows terminal this guide uses. Commands go in a PowerShell window. |

---

## 3. What It Costs

For a small app (about 1–10 users), the frontend costs **close to $0/month**.

| Service | Free allowance | Notes |
|---|---|---|
| Amplify Hosting | Build minutes and hosting data transfer each have a monthly free allowance | A small site stays inside it. Check the Amplify pricing page, because allowances change. |
| GitHub | Free for private and public repos | — |
| Backend services | See the backend guide | Cognito, API Gateway, Lambda, and DSQL costs are unchanged. |

**Set a budget alert** if you have not already: **Billing → Budgets → Create budget**, $1.

---

## 4. Before You Start

You need:

- The **backend finished and tested** (database, Cognito, Lambda, API Gateway). You need three values from it, listed in [Appendix D](#appendix-d--this-projects-values): the API URL, the user pool ID, and the app client ID.
- An **AWS account** you can sign in to.
- A **GitHub account**.
- **Node.js 20.19 or newer** (or 22.12+). Check in PowerShell:
  ```powershell
  node -v
  ```
  If it says `command not found` or shows something older, install the **LTS** version from nodejs.org, then **close and reopen PowerShell** and check again.
- **Git**. Check with `git --version`. If it is missing, install it from git-scm.com.
- A code editor. **VS Code** is a good choice.

---

## 5. Step 1 — Prepare the Backend for a Browser

**Do this first.** The backend works with command-line tests (`curl`) without any of this, but a **browser** adds a security check (CORS) that needs three things set up. If any one is missing, every page shows **"Failed to fetch"**, and the browser's error message does not say why.

### 5.1 The idea

Before the browser sends a real request with an `Authorization` header, it first sends a **preflight** (`OPTIONS`) request asking permission. A preflight **never carries a token**. If the API answers it with an error, such as 401, the browser blocks the real request.

Your API's login check would reject the token-less preflight, so three things are needed:

| # | Where | What |
|---|---|---|
| 1 | API Gateway → **CORS** | List every website address allowed to call the API |
| 2 | API Gateway → **Routes** | An extra `OPTIONS /{proxy+}` route with **no** authorizer |
| 3 | Lambda code | Answer `OPTIONS` requests with `204` before the sign-in check |

### 5.2 Set the allowed origins (CORS)

1. Open **API Gateway** (region **us-east-2**) → your API `workout-api`.
2. Left menu: **Develop → CORS → Configure**.
3. Fill in:

   | Setting | Value |
   |---|---|
   | Access-Control-Allow-Origin | `http://localhost:5173` — click **Add**. You will add the Amplify URL later in [Step 10](#14-step-10--allow-the-live-site-in-the-backend-cors). |
   | Access-Control-Allow-Methods | `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS` |
   | Access-Control-Allow-Headers | `authorization`, `content-type` |

4. **Save**.

> **Origins must match exactly:** `https://` or `http://`, the domain, the port, and **no trailing slash**. `http://localhost:5173` and `http://127.0.0.1:5173` are different origins.

### 5.3 Add the unprotected OPTIONS route

1. API Gateway → **Develop → Routes → Create**.
2. Route: method **OPTIONS**, path `/{proxy+}` → **Create**.
3. Click the new route → **Attach integration** → choose `workout-api` (the Lambda).
4. Make sure **no authorizer** is attached to this route. (The existing `ANY /{proxy+}` route keeps the `cognito` authorizer.)
5. Auto-deploy is on, so no extra deploy is needed. If you turned it off, deploy.

### 5.4 Make the Lambda answer OPTIONS

In `lambda_function.py`, the `handler` function must return early for `OPTIONS`, **before** it checks who the user is:

```python
def handler(event, context):
    method = event.get("requestContext", {}).get("http", {}).get("method", "GET")
    path = event.get("rawPath", "/")

    # Browser CORS preflight. Browsers never attach the token to it, so it must
    # be answered before the sign-in check below. API Gateway adds the CORS
    # headers itself from the API's CORS settings.
    if method == "OPTIONS":
        return {"statusCode": 204}

    try:
        claims = _claims(event)  # 401 if not signed in
        ...
```

If your copy does not have this yet, add it, rebuild the zip ([Backend guide, Appendix A](Backend%20Setup%20Guide%20-%20Workout%20Tracker.md)), and upload it to the Lambda.

### 5.5 Check it worked

Run this in **PowerShell** (use `curl.exe`, not `curl`):

```powershell
curl.exe -i -X OPTIONS https://r6z25oo3o9.execute-api.us-east-2.amazonaws.com/lifts -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: authorization"
```

| Response | Meaning |
|---|---|
| `204 No Content` **and** a line `access-control-allow-origin: http://localhost:5173` | ✅ Ready |
| `401 Unauthorized` with `www-authenticate: Bearer` | The `OPTIONS` route is missing, or has the authorizer attached (5.3) |
| `401` with `{"error": "Not signed in"}` | The route exists, but the Lambda has no early return (5.4), or you have not uploaded the new code |
| `204` but **no** `access-control-allow-origin` line | The origin is not in the CORS list (5.2). Check spelling and the trailing slash |

Do not continue until you get the ✅ row.

---

## 6. Step 2 — Get the Code

Open PowerShell and go to the folder where you keep projects. Then download the code:

```powershell
cd $HOME\Desktop
git clone https://github.com/jreyes913/workout-tracker-web.git
cd workout-tracker-web
```

If you do not have the repo (for example, you are starting a new project), see [Appendix A](#appendix-a--recreating-the-project-from-nothing).

Open the folder in VS Code if you like: `code .`

---

## 7. Step 3 — Install the Dependencies

In the project folder:

```powershell
npm install
```

- It reads `package.json` and downloads everything into `node_modules/`.
- It takes a minute or two. Warnings (yellow text) are fine. Red `ERR!` lines are not.
- You should see something like `added 300 packages` and `found 0 vulnerabilities`.

The libraries it installs, and why:

| Library | Why |
|---|---|
| `react`, `react-dom` | The page-building library. **Pinned to version 18 on purpose. Do not upgrade.** |
| `aws-amplify` | Talks to Cognito and keeps your login token fresh |
| `@aws-amplify/ui-react` | The ready-made sign-in screen |
| `react-router-dom` | Gives each page its own URL |
| `chart.js`, `react-chartjs-2` | Draws the progress charts |
| `vite`, `@vitejs/plugin-react` | The development server and build tool |
| `eslint` (plus plugins) | Warns about likely mistakes in the code |

> Do not add other libraries without a reason. The project deliberately avoids TypeScript, CSS frameworks, state-management libraries, form libraries, and axios, so a beginner can read all of the code.

---

## 8. Step 4 — Add Your Settings (.env.local)

The app needs three values from the backend. In the project root (the same folder as `package.json`), create a file named exactly **`.env.local`**:

```
VITE_API_URL=https://r6z25oo3o9.execute-api.us-east-2.amazonaws.com
VITE_USER_POOL_ID=us-east-2_LAaNM8OAn
VITE_USER_POOL_CLIENT_ID=6u276gi81pj6p7jbvmmspp2je6
```

**Rules that avoid the usual mistakes:**

- **Copy and paste the values; do not retype them.** The letter `O` and the number `0` look almost identical.
- **No quotes**, **no spaces** around `=`, and **no trailing slash** on the API URL.
- The file name starts with a dot and has no `.txt` on the end. In Windows File Explorer, turn on **View → Show → File name extensions** to check. In VS Code, use **New File** and type `.env.local`.
- The names must start with `VITE_`, or Vite will not give them to the app.
- **Restart `npm run dev` after any change to this file.** It is only read at startup.
- This file is **not committed to Git**. Vite's default `.gitignore` already ignores `*.local`.

These three values are **not secret** (they end up in the website's code). Passwords and tokens are what you keep private.

Where each value comes from if you ever need to find them again:

| Variable | Where to find it |
|---|---|
| `VITE_API_URL` | API Gateway → your API → **Invoke URL** |
| `VITE_USER_POOL_ID` | Cognito → User pools → your pool → **Overview** |
| `VITE_USER_POOL_CLIENT_ID` | Cognito → your pool → **Applications → App clients** → **Client ID** |

---

## 9. Step 5 — Create Your Login (Invite a User)

The app has **no sign-up button**. The user pool is invite-only, so you must create yourself a login:

1. Open **Cognito** (us-east-2) → your user pool → **Users → Create user**.
2. Choose **Send an email invitation**, enter your email, and set a temporary password (or let Cognito generate one).
3. **Create user**.
4. You will use the email and the temporary password on first login. The app will make you pick a new password.

> If you made a test user earlier with a permanent password (backend guide, Step 8, Method 2), you can use that one instead.

---

## 10. Step 6 — Run It Locally

```powershell
npm run dev
```

You should see:

```
  VITE  ready in ... ms
  ➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser. You must use **exactly** this address.

- The project is set to **refuse to start** if port 5173 is busy, instead of quietly choosing 5174. This is on purpose. The backend's CORS list only allows `http://localhost:5173`, so any other port makes every request fail with "Failed to fetch".
- If you see `Error: Port 5173 is already in use`, another `npm run dev` is still running. Find that PowerShell window and press **Ctrl+C**, then start again.
- Stop the server any time with **Ctrl+C**.

You should see the **sign-in screen** and no "Create Account" tab. Sign in with the account from Step 5.

---

## 11. Step 7 — Test Every Page

Work through this list. Each line is something you can see, so a failure points straight to a fix in [Troubleshooting](#17-troubleshooting--every-error-we-hit).

**Profile** (`/profile`)
- [ ] The page loads and shows your username
- [ ] Change the first name → **Save** → "Saved." appears
- [ ] Refresh the browser → the new name is still there

**Lifts** (`/`)
- [ ] The page loads with no red error text
- [ ] Add a lift (pick a date) → it appears in the list and the form clears
- [ ] Click the lift → the detail page opens

**Lift detail** (`/lifts/<id>`)
- [ ] Change the date or body weight → **Save**
- [ ] **Add a set**: choose an exercise (grouped by muscle group), enter reps, RIR, weight
- [ ] **Add an exercise** to that set (a superset)
- [ ] **Edit** and **Delete** an exercise inside a set (the delete asks you to confirm)
- [ ] **Delete set**, then **Delete lift** (takes you back to the list)

**Programs** (`/programs`)
- [ ] Create a program (name only is fine)
- [ ] Open it → **Add a day**, **Rename** it
- [ ] In the day: **Add a set**, **Add an exercise** to it, **Edit**, **Delete**
- [ ] Delete the day, then the program

**Apply a program day** (on a lift's detail page)
- [ ] Choose a program, then a day, then **Apply** → the sets appear on the lift

**Progress** (`/progress`)
- [ ] The body weight chart shows points for lifts that have a body weight
- [ ] Choose an exercise and a metric → the strength chart appears
- [ ] Try a start and end date

**Navigation**
- [ ] Every link in the top bar works, and **Sign out** returns you to the sign-in screen

> If the exercise dropdown is empty, the database has no exercises. See "Adding sets requires exercises" in the backend guide (Step 8), or run the `seed_001_exercises.sql` file against the database.

---

## 12. Step 8 — Put the Code on GitHub

Amplify builds your site straight from GitHub, so the code must be there.

### 12.1 Check what will be committed

```powershell
git status
```

`.env.local` and `node_modules/` must **not** appear in the list. (They are ignored.) If you see either one, stop and check `.gitignore`.

### 12.2 Commit and push

```powershell
git add .
git commit -m "Workout tracker frontend"
git push -u origin master
```

- If Git says `remote origin already exists`, you cloned the repo and it is already connected. Skip any `git remote add` step.
- The first push may open a browser window to sign in to GitHub.
- This project's branch is **`master`**. Remember that when picking the branch in Amplify.

---

## 13. Step 9 — Deploy to Amplify

### 13.1 Create the app

1. Open **AWS Amplify** (region **us-east-2**).
2. **Create new app** → **GitHub** → **Next**, then authorize AWS to read your repos.
3. Pick the repo `workout-tracker-web` and the branch **`master`** → **Next**.
4. Amplify detects Vite. The defaults are correct:
   - Build command: `npm run build`
   - Output directory: `dist`

### 13.2 Add the environment variables — before the first build

On the **App settings** screen of the wizard, open **Advanced settings** (or later: **Hosting → Environment variables**) and add all three:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://r6z25oo3o9.execute-api.us-east-2.amazonaws.com` |
| `VITE_USER_POOL_ID` | `us-east-2_LAaNM8OAn` |
| `VITE_USER_POOL_CLIENT_ID` | `6u276gi81pj6p7jbvmmspp2je6` |

> **Vite bakes these into the files at build time.** If you add or change a variable after a build, you must **redeploy** (Amplify → your branch → **Redeploy this version**) for it to take effect. Your `.env.local` file is *not* uploaded, so Amplify never sees it.

### 13.3 Deploy

Click **Next** → **Save and deploy**. Wait for all stages (Provision, Build, Deploy, Verify) to turn green, about 2–5 minutes.

Copy the site address, which looks like:

```
https://master.xxxxxxxxxxxxxx.amplifyapp.com
```

### 13.4 Add the page-refresh rule (required)

React Router handles URLs like `/lifts/3` inside the browser. Without this rule, refreshing the page or opening a bookmark on such a URL gives a **404**, because no file exists at that path.

1. Amplify → your app → **Hosting → Rewrites and redirects**.
2. Click **Manage redirects** and choose the **Single-page app (SPA)** preset (or add it manually):

   | Source | Target | Type |
   |---|---|---|
   | `/<*>` | `/index.html` | `404 (Rewrite)` |

3. **Save**.

> Using the preset is safest. A rule that only looks saved but is not will still give 404s. [Step 11](#15-step-11--test-the-live-site) checks it.

---

## 14. Step 10 — Allow the Live Site in the Backend (CORS)

Right now the live site will sign in fine and then show "Failed to fetch" on every page. The API only knows about `localhost`.

1. API Gateway → your API → **Develop → CORS → Configure**.
2. Under **Access-Control-Allow-Origin**, **Add** your Amplify address, with **no trailing slash**:
   ```
   https://master.xxxxxxxxxxxxxx.amplifyapp.com
   ```
   Keep the `http://localhost:5173` entry too.
3. **Save** (deploy if auto-deploy is off).
4. Check it from PowerShell, with your own address in the `Origin` header:
   ```powershell
   curl.exe -i -X OPTIONS https://r6z25oo3o9.execute-api.us-east-2.amazonaws.com/lifts -H "Origin: https://master.xxxxxxxxxxxxxx.amplifyapp.com" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: authorization"
   ```
   You want `204` and `access-control-allow-origin: https://master.xxxxxxxxxxxxxx.amplifyapp.com`.

> **If you add a custom domain later,** add that origin here too.

---

## 15. Step 11 — Test the Live Site

1. Open your Amplify address and sign in.
2. Repeat the key checks from [Step 7](#11-step-7--test-every-page): Lifts, adding a lift, Progress, Programs, Profile.
3. **Hard-refresh a detail page.** Open a lift's page, then press **Ctrl+Shift+R**. It must reload the page, not show a 404. This confirms the rule from 13.4.
4. Open the site in a private/incognito window and confirm it asks you to sign in. Nothing should show until you do.

---

## 16. Everyday Workflow

| I want to… | Do this |
|---|---|
| Change the website | Edit files in `src/`, check at http://localhost:5173 (it updates as you save), then `git add .`, `git commit -m "..."`, `git push`. **Amplify rebuilds automatically on every push.** |
| Check the build before pushing | `npm run build`. It must finish with `built in ...` and no errors. |
| Check for likely mistakes | `npm run lint` |
| Add an API call | Add one exported function to `src/api.js` (see the README) |
| Add a page | Create `src/pages/MyPage.jsx`, add a `<Route>` in `src/App.jsx`, add a link in `src/components/NavBar.jsx` (see the README) |
| Change the backend | Redeploy the Lambda the way the backend guide describes. Amplify only deploys the website. |
| Change an environment variable | Update it in Amplify, then **Redeploy this version**. Locally, edit `.env.local` and restart `npm run dev`. |
| Invite another user | Cognito → your pool → **Users → Create user** |

---

## 17. Troubleshooting — Every Error We Hit

### ❌ Every page says **"Failed to fetch"** (browser)

This message means the browser blocked the request or got no usable response. It is not a message from your backend. In the browser, press **F12 → Network**, reload, and look at the red `lifts` or `me` requests. Then use the matching case below.

| What you see in the Network tab | Cause | Fix |
|---|---|---|
| Address bar is not exactly `http://localhost:5173` (for example `:5174` or `127.0.0.1`) | That origin is not in the CORS list | Stop every old `npm run dev` (Ctrl+C), start one, and use exactly `http://localhost:5173` |
| A `preflight` request with status **401**, then a CORS error on the real request | The `OPTIONS` route is missing or has the authorizer attached | [5.3](#53-add-the-unprotected-options-route) |
| Preflight status **401** and its response body is `{"error": "Not signed in"}` | The route exists, but the Lambda checks the login before answering `OPTIONS` | [5.4](#54-make-the-lambda-answer-options), then upload the new code |
| Preflight is **204** but the console says there is no `Access-Control-Allow-Origin` | The site's origin is not in the CORS list | [5.2](#52-set-the-allowed-origins-cors) or [Step 10](#14-step-10--allow-the-live-site-in-the-backend-cors) |
| Works on `localhost` but "Failed to fetch" on the Amplify site | You have not added the Amplify address to CORS | [Step 10](#14-step-10--allow-the-live-site-in-the-backend-cors) |

> Browsers cache preflight answers for up to 5 minutes (the API's `max-age: 300`). After fixing CORS, hard-reload with **Ctrl+Shift+R**, or wait a few minutes, or use a private window.

### ❌ `{"message":"Unauthorized"}` shown on a page

**Cause:** API Gateway rejected the token. Usually the browser's saved session is stale, or the preflight problem above is happening (the preflight gets the 401, not the real request).
**Fix:** First rule out CORS with [5.5](#55-check-it-worked). If that passes, click **Sign out**, sign in again, and retry. If it still fails, check that the authorizer's Issuer URL ends in the exact user pool ID and the Audience is the exact app client ID (backend guide, 11.2).

### ❌ `{"error": "Not signed in"}` shown on a page

**Cause:** The request reached the Lambda without login info. The JWT authorizer is not attached to the route, or the app is not sending a token.
**Fix:** Attach the authorizer (backend guide, 11.2). Confirm you actually signed in.

### ❌ `Error: Port 5173 is already in use`

**Cause:** An old dev server is still running. This is the setting doing its job.
**Fix:** Find the other PowerShell window running `npm run dev` and press **Ctrl+C** in it. If you cannot find it, see what uses the port, then end that process:
```powershell
Get-NetTCPConnection -LocalPort 5173 | Select-Object OwningProcess
Stop-Process -Id <the number shown>
```

### ❌ The sign-in screen never appears, or the page is blank

**Cause:** Usually a missing or wrong `.env.local`. Without the pool IDs, Amplify cannot start.
**Fix:** Check the file name (`.env.local`, no `.txt`), that all three values are present with no quotes or spaces, and that the names start with `VITE_`. **Restart `npm run dev`.** Press **F12 → Console** for the actual error.

### ❌ Sign-in says "User does not exist" or "Incorrect username or password"

**Cause:** The user was never created, the password is wrong, or the pool ID or client ID is wrong (for example `O` retyped as `0`).
**Fix:** Create the user (Step 5). Re-copy the IDs from the console and paste them into `.env.local`.

### ❌ Sign-in works, but a "Create Account" tab appears

**Cause:** `hideSignUp` is missing from `<Authenticator>` in `src/App.jsx`.
**Fix:** It should read `<Authenticator hideSignUp>`. (Self-sign-up should also be off in Cognito, backend guide 8.2.)

### ❌ Deployed site loads but every page fails; localhost works

**Cause:** Either the Amplify address is not in CORS ([Step 10](#14-step-10--allow-the-live-site-in-the-backend-cors)), or the three `VITE_` variables are missing in Amplify.
**Fix:** Check CORS first. Then open Amplify → **Hosting → Environment variables**. After adding or changing any variable, **redeploy**. A quick check: the live site's sign-in screen would not even appear correctly without the pool ID, so missing variables usually show up as a blank page or an immediate error.

### ❌ Refreshing a page like `/lifts/3` on the live site gives a 404

**Cause:** The single-page-app rewrite rule is missing or not saved.
**Fix:** [13.4](#134-add-the-page-refresh-rule-required). Use the **SPA preset** in **Manage redirects**. Wait a minute, then test by opening a deep link directly.

### ❌ Amplify build fails

**Cause:** Usually a code error, a missing file, or an old Node version in the build image.
**Fix:** Run `npm run build` on your computer first. If that passes, open the failed build in Amplify and read the log for the first red line. Make sure you pushed your latest commit (`git status` should be clean, and `git log` should show it on GitHub).

### ❌ `npm run lint` says "Calling setState synchronously within an effect"

**Cause:** A newer React lint rule flags the "load data from `useEffect`" pattern every page uses, even though it is correct.
**Fix:** Already handled. `eslint.config.js` turns that one rule off (`'react-hooks/set-state-in-effect': 'off'`) with a comment. If you recreated the project without that file, add it back.

### ❌ Dropdown for exercises is empty

**Cause:** The database has no exercises yet.
**Fix:** Seed them with `seed_001_exercises.sql` (see the backend folder), run through psql as in the backend guide.

### ❌ `npm install` fails or `node` is not recognized

**Cause:** Node is not installed, or the terminal was open before you installed it.
**Fix:** Install Node LTS, **close and reopen PowerShell**, and run `node -v` to confirm.

### ❌ A change to `.env.local` has no effect

**Cause:** Vite only reads it at startup.
**Fix:** Stop the dev server (Ctrl+C) and run `npm run dev` again.

---

## Appendix A — Recreating the Project From Nothing

Only needed if you do not have the GitHub repo, or want the same setup for a new project. The finished source files live in `src/`, so copy that folder from an existing copy of the project.

```powershell
# 1. Create a Vite + React project (choose: React, then JavaScript)
npm create vite@latest workout-tracker-web
cd workout-tracker-web

# 2. Pin React to version 18 (the project depends on it; do not upgrade)
npm install react@18 react-dom@18

# 3. Install the other libraries
npm install aws-amplify @aws-amplify/ui-react react-router-dom chart.js react-chartjs-2

# 4. Delete the demo files Vite created
Remove-Item src\App.css
Remove-Item -Recurse src\assets
```

Then:

1. **Copy `src/`** from the finished project over the new one (all of the files in [Appendix B](#appendix-b--file-map)).
2. **Copy `eslint.config.js`** (it contains the one disabled rule described in Troubleshooting).
3. **Edit `vite.config.js`** to pin the port:
   ```js
   import react from '@vitejs/plugin-react'
   import { defineConfig } from 'vite'

   export default defineConfig({
     plugins: [react()],
     server: {
       // The backend's CORS rules only allow http://localhost:5173.
       port: 5173,
       strictPort: true,
     },
   })
   ```
4. Create `.env.local` ([Step 4](#8-step-4--add-your-settings-envlocal)).
5. Run `npm run dev` and continue from [Step 6](#10-step-6--run-it-locally).
6. Create the repo on GitHub (**New repository**, leave it empty), then:
   ```powershell
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin master
   ```

---

## Appendix B — File Map

```
.env.local                  Your three settings (never committed)
index.html                  The single HTML page Vite starts from
package.json                Dependency list and npm commands
vite.config.js              Dev server settings (port 5173, strict)
eslint.config.js            Lint settings (one rule turned off, with a comment)
README.md                   Short developer guide (run, file list, add a page/call)
src/
  main.jsx                  Starts the app: configures Amplify, adds the router
  App.jsx                   Login wall, navigation bar, and the list of routes
  api.js                    Every backend call, built on one shared request() helper
  formHelpers.js            numberOrNull, todayAsDateString, nextPosition
  chartSetup.js             Registers the Chart.js pieces the charts use
  index.css                 The only stylesheet
  pages/
    Lifts.jsx               List of lifts + form to log one
    LiftDetail.jsx          One lift: edit/delete it, its sets, add sets, apply a program day
    Progress.jsx            Page holding the two charts
    Programs.jsx            List of programs + form to create one
    ProgramDetail.jsx       One program: edit it and manage its days
    Profile.jsx             View and edit my profile
  components/
    NavBar.jsx              Top navigation and Sign out button
    ExerciseSelect.jsx      Exercise dropdown grouped by muscle group
    AddLiftSetFooter.jsx    Bottom row of the lift table: inputs that add a new set
    LiftSetGroup.jsx        One set in the lift table: header row, exercise rows, add-exercise row
    LiftSubsetRow.jsx       One exercise row in a lift set; Edit turns its cells into inputs
    ApplyProgramForm.jsx    Pick a program and day to apply to a lift
    BodyWeightChart.jsx     Body weight line chart
    StrengthChart.jsx       Strength line chart with exercise/metric/date pickers
    ProgramDayCard.jsx      One program day: name bar plus a table of its sets
    ProgramSetGroup.jsx     One set in a program day's table
    ProgramSubsetRow.jsx    One exercise row in a program set; Edit turns its cells into inputs
```

**How a request flows** (example: logging a lift):

1. `Lifts.jsx` calls `createLift({ date, body_weight })` from `api.js`. Pages never call `fetch` themselves.
2. `api.js` calls its shared `request("POST", "/lifts", fields)`.
3. `request()` gets the current token from Amplify (`fetchAuthSession()`, which refreshes it if expired) and sends `Authorization: Bearer <token>`.
4. API Gateway checks the token. The Lambda reads the user's identity **from the token**, which is why the frontend never sends an `athlete_id`.
5. The reply is JSON. On failure, `request()` throws an `Error` with the backend's message (`error` or `message` field), and the page shows it in red.
6. After every successful create/edit/delete, the page reloads its data so the screen shows what the backend really stored.

---

## Appendix C — Pages and the API Calls Behind Them

| Page | URL | Calls (all in `src/api.js`) |
|---|---|---|
| Lifts | `/` | `getLifts`, `createLift` |
| Lift detail | `/lifts/:id` | `getLift`, `updateLift`, `deleteLift`, `createLiftSet`, `updateLiftSet`, `deleteLiftSet`, `createLiftSubset`, `updateLiftSubset`, `deleteLiftSubset`, `applyProgramDay`, `getPrograms`, `getProgram`, `getExercises`, `getMuscleGroups` |
| Progress | `/progress` | `getBodyWeightProgress`, `getStrengthProgress`, `getExercises`, `getMuscleGroups` |
| Programs | `/programs` | `getPrograms`, `createProgram`, `deleteProgram` |
| Program detail | `/programs/:id` | `getProgram`, `updateProgram`, `createProgramDay`, `updateProgramDay`, `deleteProgramDay`, `createProgramSet`, `updateProgramSet`, `deleteProgramSet`, `createProgramSubset`, `updateProgramSubset`, `deleteProgramSubset`, `getExercises`, `getMuscleGroups` |
| Profile | `/profile` | `getMe`, `updateMe` |

**Backend rules the frontend relies on:**

- The user is identified from the token. The frontend never sends `athlete_id`.
- Anything that is not yours returns **404**.
- `PUT` changes only the fields you send.
- Deletes remove everything underneath and return `{"deleted": id}`.
- `reps` and `rir` are whole numbers, `weight` can be a decimal, `body_weight` and `height` are whole numbers, dates are `YYYY-MM-DD`.
- Empty optional fields are sent as `null`, never as an empty string.
- New sets and subsets need a `position`. The app sets it to one more than the highest existing position, so you never type one.

> The backend guide's Appendix B lists only the first endpoints that were built. The code in `lambda_function.py` has more (delete, edit, progress, programs), and this app uses them. The route list at the bottom of `lambda_function.py` is the real source of truth.

---

## Appendix D — This Project's Values

These are **not secret** (they appear in the website's code). Never share passwords or tokens.

| Item | Value |
|---|---|
| Region | `us-east-2` (Ohio) |
| API URL (`VITE_API_URL`) | `https://r6z25oo3o9.execute-api.us-east-2.amazonaws.com` |
| User pool ID (`VITE_USER_POOL_ID`) | `us-east-2_LAaNM8OAn` |
| App client ID (`VITE_USER_POOL_CLIENT_ID`) | `6u276gi81pj6p7jbvmmspp2je6` |
| GitHub repo | `https://github.com/jreyes913/workout-tracker-web` |
| Git branch | `master` |
| Local address | `http://localhost:5173` (exactly) |
| Live site | `https://master.d2gypyesmndbtg.amplifyapp.com` |
| Allowed CORS origins | `http://localhost:5173`, `https://master.d2gypyesmndbtg.amplifyapp.com` |
| Node version | 20.19+ or 22.12+ (developed on 22.13.1) |
| React | 18 (pinned on purpose) |
| Amplify rewrite rule | `/<*>` → `/index.html`, `404 (Rewrite)` |

**Status as of Oct 28, 2026:** The frontend is complete and deployed. All six pages work locally and on Amplify, and CORS allows both `localhost:5173` and the live site.
