// Top-level layout: login wall, navigation bar, and the route table.
// Add new pages by importing them here and adding a <Route> line.

import { Routes, Route } from "react-router-dom";
import { Authenticator } from "@aws-amplify/ui-react";
import NavBar from "./components/NavBar.jsx";
import Lifts from "./pages/Lifts.jsx";
import LiftDetail from "./pages/LiftDetail.jsx";
import Progress from "./pages/Progress.jsx";
import Programs from "./pages/Programs.jsx";
import ProgramDetail from "./pages/ProgramDetail.jsx";
import Profile from "./pages/Profile.jsx";

function App() {
  return (
    // The app is invite-only (users are created in Cognito), so sign-up is hidden.
    // Nothing inside renders until the user has signed in.
    <Authenticator hideSignUp>
      {({ signOut }) => (
        <div className="app">
          <NavBar signOut={signOut} />
          <main className="page">
            <Routes>
              {/* Other pages get added here as they are built. */}
              <Route path="/" element={<Lifts />} />
              <Route path="/lifts/:id" element={<LiftDetail />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/programs" element={<Programs />} />
              <Route path="/programs/:id" element={<ProgramDetail />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
        </div>
      )}
    </Authenticator>
  );
}

export default App;
