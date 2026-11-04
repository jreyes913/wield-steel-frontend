// Top-level layout: login wall, navigation bar, and the route table.
// Add new pages by importing them here and adding a <Route> line.
//
// Every page except the first one (Lifts) is loaded the first time it is visited,
// not up front. That keeps big libraries, such as Chart.js on the Progress page,
// out of the first download.

import { lazy, Suspense } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { Authenticator } from "@aws-amplify/ui-react";
import DefaultUsername from "./components/DefaultUsername.jsx";
import FriendRequestsProvider from "./components/FriendRequestsProvider.jsx";
import NavBar from "./components/NavBar.jsx";
import SiteFooter from "./components/SiteFooter.jsx";
import Lifts from "./pages/Lifts.jsx";
import Privacy from "./pages/Privacy.jsx";
import Terms from "./pages/Terms.jsx";

const LiftDetail = lazy(() => import("./pages/LiftDetail.jsx"));
const Progress = lazy(() => import("./pages/Progress.jsx"));
const Exercises = lazy(() => import("./pages/Exercises.jsx"));
const Programs = lazy(() => import("./pages/Programs.jsx"));
const ProgramDetail = lazy(() => import("./pages/ProgramDetail.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const Friends = lazy(() => import("./pages/Friends.jsx"));
const FriendDetail = lazy(() => import("./pages/FriendDetail.jsx"));
const FriendLift = lazy(() => import("./pages/FriendLift.jsx"));
const FriendProgram = lazy(() => import("./pages/FriendProgram.jsx"));
const Coaching = lazy(() => import("./pages/Coaching.jsx"));
const CoachedAthlete = lazy(() => import("./pages/CoachedAthlete.jsx"));
const CoachedLift = lazy(() => import("./pages/CoachedLift.jsx"));
const CoachedProgram = lazy(() => import("./pages/CoachedProgram.jsx"));
const GetStarted = lazy(() => import("./pages/GetStarted.jsx"));

/** Links under the sign-in form, so the legal pages can be read before signing in. */
const signInComponents = {
  Footer() {
    return (
      <p className="site-footer">
        <Link to="/privacy">Privacy Policy</Link>
        <Link to="/terms">Terms of Service</Link>
      </p>
    );
  },
};

/** Everything that needs a signed-in user: the sign-in form, then the navigation bar and pages. */
function SignedInApp() {
  return (
    // The app is invite-only (users are created in Cognito), so sign-up is hidden.
    // Nothing inside renders until the user has signed in.
    <Authenticator hideSignUp components={signInComponents}>
      {({ signOut }) => (
        <FriendRequestsProvider>
          <div className="app">
            <DefaultUsername />
            <NavBar signOut={signOut} />
            <main className="page">
              <Suspense fallback={<p>Loading…</p>}>
                <Routes>
                  {/* Other pages get added here as they are built. */}
                  <Route path="/" element={<Lifts />} />
                  <Route path="/lifts/:id" element={<LiftDetail />} />
                  <Route path="/progress" element={<Progress />} />
                  <Route path="/exercises" element={<Exercises />} />
                  <Route path="/programs" element={<Programs />} />
                  <Route path="/programs/:id" element={<ProgramDetail />} />
                  <Route path="/friends" element={<Friends />} />
                  <Route path="/friends/:athleteId" element={<FriendDetail />} />
                  <Route path="/friends/:athleteId/lifts/:liftId" element={<FriendLift />} />
                  <Route path="/friends/:athleteId/programs/:programId" element={<FriendProgram />} />
                  <Route path="/coaching" element={<Coaching />} />
                  <Route path="/coaching/:athleteId" element={<CoachedAthlete />} />
                  <Route path="/coaching/:athleteId/lifts/:liftId" element={<CoachedLift />} />
                  <Route path="/coaching/:athleteId/programs/:programId" element={<CoachedProgram />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/get-started" element={<GetStarted />} />
                </Routes>
              </Suspense>
            </main>
            <SiteFooter />
          </div>
        </FriendRequestsProvider>
      )}
    </Authenticator>
  );
}

/** The routes: the legal pages are public, everything else sits behind sign-in. */
function App() {
  return (
    <Routes>
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="*" element={<SignedInApp />} />
    </Routes>
  );
}

export default App;
