import { BrowserRouter, Routes, Route } from "react-router-dom"

import LandingPage from "./pages/LandingPage"
import AdminLogin from "./pages/AdminLogin"
import AdminDashboard from "./pages/AdminDashboard"
import ElectionControl from "./pages/ElectionControl"
import CandidateManagement from "./pages/CandidateManagement"
import ResultsManagement from "./pages/ResultsManagement"
import BlockchainLedger from "./pages/BlockchainLedger"
import AuditLogs from "./pages/AuditLogs"
import LoginPage from "./pages/LoginPage"
import BiometricPage from "./pages/BiometricPage"
import FingerprintPage from "./pages/FingerprintPage"
import GeoLocationPage from "./pages/GeoLocationPage"
import VotingDashboard from "./pages/VotingDashboard"
import VoteSuccessPage from "./pages/VoteSuccessPage"
import FaceRegistration from
  "./pages/FaceRegistration"

function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* Landing Page */}
        <Route
          path="/"
          element={<LandingPage />}
        />

        {/* Voter Flow */}
        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/biometric"
          element={<BiometricPage />}
        />

        <Route
          path="/fingerprint"
          element={<FingerprintPage />}
        />

        <Route
          path="/geolocation"
          element={<GeoLocationPage />}
        />

        <Route
          path="/voting-dashboard"
          element={<VotingDashboard />}
        />

        <Route
          path="/vote-success"
          element={<VoteSuccessPage />}
        />

        {/* Admin Login */}
        <Route
          path="/admin-login"
          element={<AdminLogin />}
        />

        {/* Protected Admin Dashboard */}
        <Route
          path="/admin-dashboard"
          element={<AdminDashboard />}
        />

        {/* Admin Pages */}
        <Route
          path="/election-control"
          element={<ElectionControl />}
        />

        <Route
          path="/candidate-management"
          element={<CandidateManagement />}
        />

        <Route
          path="/results"
          element={<ResultsManagement />}
        />

        <Route
          path="/blockchain"
          element={<BlockchainLedger />}
        />

        <Route
          path="/audit-logs"
          element={<AuditLogs />}
        />
        <Route
          path="/face-registration"
          element={<FaceRegistration />}
        />
      </Routes>

    </BrowserRouter>

  )

}

export default App