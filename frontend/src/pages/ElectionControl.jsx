import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import API_BASE_URL from "../config/api"

function ElectionControl() {
  const [electionStatus, setElectionStatus] = useState(null)
  const [resultsLocked, setResultsLocked] =
  useState(true)
  const [startTime, setStartTime] = useState("00:00")
  const [endTime, setEndTime] = useState("00:00")
  const [securitySettings, setSecuritySettings] = useState({
  faceVerification: true,
  fingerprintVerification: true,
  otpVerification: true,
  geoValidation: true,
  spoofDetection: true,
})
  useEffect(() => {
    fetchElectionStatus()

    const interval = setInterval(() => {
      fetchElectionStatus()
    }, 2500)

    const savedStart = localStorage.getItem("electionStartTime")
    const savedEnd = localStorage.getItem("electionEndTime")

    if (savedStart) {
      setStartTime(savedStart)
    }

    if (savedEnd) {
      setEndTime(savedEnd)
    }
    const savedSecurity = localStorage.getItem("securitySettings")

    if (savedSecurity) {
      setSecuritySettings(JSON.parse(savedSecurity))
    }

    return () => clearInterval(interval)
  }, [])

  const toggleSecurity = (key) => {
    const updatedSettings = {
      ...securitySettings,
      [key]: !securitySettings[key]
    }

    setSecuritySettings(updatedSettings)

    localStorage.setItem(
      "securitySettings",
      JSON.stringify(updatedSettings)
    )
  }

  const fetchElectionStatus = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/voters/election-status`
      )

      const data = await response.json()

      setElectionStatus(data)
    } catch (error) {
      console.log(error)
    }
  }

  const startElection = async () => {
    const today = new Date().toISOString().split("T")[0]
    let start = startTime
    let end = endTime

    if (!start || start === "00:00") {
      const now = new Date()
      start = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
    }
    if (!end || end === "00:00" || end === start) {
      end = "23:59"
    }

    const formattedStart = `${today}T${start}`
    const formattedEnd = `${today}T${end}`

    const activeState = {
      isActive: true,
      statusText: "ACTIVE",
      startTime: formattedStart,
      endTime: formattedEnd
    }

    setElectionStatus(activeState)

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/voters/start-election`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startTime: formattedStart,
            endTime: formattedEnd
          }),
        }
      )

      const data = await response.json()

      localStorage.setItem("electionStartTime", start)
      localStorage.setItem("electionEndTime", end)

      if (data.election) {
        setElectionStatus(data.election)
      } else {
        setElectionStatus(activeState)
      }

      setResultsLocked(true)
      alert(data.message || "Election session started cleanly! Historical audit logs, votes, and fraud counts reset to 0.")
    } catch (error) {
      console.log(error)
      alert("Error starting election: " + error.message)
    }
  }

  const pauseElection = async () => {
    const isCurrentlyPaused = electionStatus?.statusText === "PAUSED"
    const endpoint = isCurrentlyPaused ? "start-election" : "pause-election"

    setElectionStatus(prev => ({
      ...prev,
      isActive: isCurrentlyPaused,
      statusText: isCurrentlyPaused ? "ACTIVE" : "PAUSED"
    }))

    try {
      const today = new Date().toISOString().split("T")[0]
      const response = await fetch(
        `${API_BASE_URL}/api/voters/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startTime: `${today}T${startTime}`,
            endTime: `${today}T${endTime}`
          }),
        }
      )

      const data = await response.json()

      alert(data.message)
      fetchElectionStatus()
    } catch (error) {
      console.log(error)
    }
  }

  const endElection = async () => {
    setElectionStatus(prev => ({
      ...prev,
      isActive: false,
      statusText: "ENDED"
    }))

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/voters/end-election`,
        {
          method: "POST",
        }
      )

      const data = await response.json()

      alert(data.message || "Election Ended")
      fetchElectionStatus()
    } catch (error) {
      console.log(error)
    }
  }

  const publishResults = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/voters/publish-results`,
        {
          method: "POST",
        }
      )

      const data = await response.json()
      setElectionStatus(prev => ({
        ...prev,
        isActive: false
      }))
      setResultsLocked(false)
      setStartTime("00:00")
      setEndTime("00:00")
      localStorage.removeItem("electionStartTime")
      localStorage.removeItem("electionEndTime")

      alert(data.message)
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div className="min-h-screen bg-[#061122] text-white flex">

      {/* SIDEBAR */}
      <div className="w-64 bg-[#08172d] border-r border-cyan-500/10 flex flex-col justify-between">

        <div>

          {/* Logo */}
          <div className="px-6 py-6 border-b border-cyan-500/10">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">

                <span className="font-bold text-lg">
                  V
                </span>

              </div>

              <div>

                <h1 className="text-xl font-semibold">
                  Vortura
                </h1>

                <p className="text-xs text-slate-400">
                  Election Control Center
                </p>

              </div>

            </div>

          </div>

          {/* Menu */}
          <div className="p-4 space-y-2">

          <Link
            to="/admin-dashboard"
            className="w-full flex items-center gap-3 text-slate-300 px-4 py-3 rounded-2xl hover:bg-cyan-500/10 hover:text-cyan-300 transition"
          >
            📊 Dashboard
          </Link>

          <Link
            to="/election-control"
            className="w-full flex items-center gap-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-4 py-3 rounded-2xl"
          >
            🗳 Election Control
          </Link>

          <Link
            to="/candidate-management"
            className="w-full flex items-center gap-3 text-slate-300 px-4 py-3 rounded-2xl hover:bg-cyan-500/10 hover:text-cyan-300 transition"
          >
            👥 Candidate Management
          </Link>

          <Link
            to="/results"
            className="w-full flex items-center gap-3 text-slate-300 px-4 py-3 rounded-2xl hover:bg-cyan-500/10 hover:text-cyan-300 transition"
          >
            🏆 Results
          </Link>

          <Link
            to="/blockchain"
            className="w-full flex items-center gap-3 text-slate-300 px-4 py-3 rounded-2xl hover:bg-cyan-500/10 hover:text-cyan-300 transition"
          >
            ⛓ Blockchain Ledger
          </Link>

          <Link
            to="/audit-logs"
            className="w-full flex items-center gap-3 text-slate-300 px-4 py-3 rounded-2xl hover:bg-cyan-500/10 hover:text-cyan-300 transition"
          >
            📁 Audit Logs
          </Link>

          <Link
            to="/face-registration"
            className="w-full flex items-center gap-3 text-slate-300 px-4 py-3 rounded-2xl hover:bg-cyan-500/10 hover:text-cyan-300 transition"
          >
            📸 Voter Face Dataset
          </Link>

        </div>

        </div>

        {/* Footer */}
        <div className="p-4">

          <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-2xl p-4">

            <p className="text-xs text-slate-400 mb-2">
              Election Status
            </p>

            <div className={`flex items-center gap-2 text-sm font-semibold ${electionStatus?.isActive ? "text-emerald-400" : "text-red-400"}`}>
              <div className={`w-2 h-2 rounded-full ${electionStatus?.isActive ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`}></div>
              {electionStatus?.isActive ? "ACTIVE" : (electionStatus?.statusText || "INACTIVE")}
            </div>

          </div>

        </div>

      </div>

      {/* MAIN */}
      <div className="flex-1 overflow-y-auto">

        {/* TOP BAR */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-cyan-500/10 bg-[#08172d]">

          <div>

            <h1 className="text-3xl font-semibold mb-1">
              Election Control Center
            </h1>

            <p className="text-sm text-slate-400">
              Manage election lifecycle and security configuration
            </p>

          </div>

          <div className="flex gap-4">

            <button onClick={startElection} className="bg-emerald-500 hover:bg-emerald-600 transition px-5 py-2 rounded-xl text-sm font-medium">

              Start Election

            </button>

            <button onClick={pauseElection} className="bg-yellow-500 hover:bg-yellow-600 transition px-5 py-2 rounded-xl text-sm font-medium">

              {electionStatus?.statusText === "PAUSED" ? "Resume Election" : "Pause Election"}

            </button>

            <button onClick={endElection} className="bg-red-500 hover:bg-red-600 transition px-5 py-2 rounded-xl text-sm font-medium">

              End Election

            </button>

          </div>

        </div>

        {/* CONTENT */}
        <div className="p-8 space-y-6">

          {/* TIMING */}
          <div className="grid grid-cols-3 gap-5">

            <div className="bg-[#0b1d35] border border-cyan-500/10 rounded-2xl p-5">

              <p className="text-sm text-slate-400 mb-2">
                Election Start Time
              </p>

              <input
                type="time"
                value={startTime}
                onChange={(e) =>
                  setStartTime(e.target.value)
                }
                className="w-full bg-[#08172d] border border-cyan-500/10 rounded-xl p-3 outline-none"
              />

            </div>

            <div className="bg-[#0b1d35] border border-cyan-500/10 rounded-2xl p-5">

              <p className="text-sm text-slate-400 mb-2">
                Election End Time
              </p>

              <input
                type="time"
                value={endTime}
                onChange={(e) =>
                  setEndTime(e.target.value)
                }
                className="w-full bg-[#08172d] border border-cyan-500/10 rounded-xl p-3 outline-none"
              />

            </div>

            <div className={`rounded-2xl p-5 ${
              electionStatus?.isActive
                ? "bg-gradient-to-r from-blue-600 to-cyan-500"
                : "bg-[#0b1d35] border border-cyan-500/10"
            }`}>
              <p className="text-sm text-cyan-100 mb-2 font-medium">
                Current Status
              </p>

              <h2 className="text-3xl font-bold tracking-wide text-white">
                {electionStatus?.isActive ? "ACTIVE" : "INACTIVE"}
              </h2>

              <p className="text-sm mt-3 font-medium text-slate-300">
                {electionStatus?.isActive
                  ? "Voting Currently Enabled"
                  : "Voting Currently Disabled"}
              </p>

            </div>

          </div>

          {/* SECURITY CONFIG */}
          <div className="bg-[#0b1d35] border border-cyan-500/10 rounded-2xl p-6">

            <div className="flex items-center justify-between mb-6">

              <div>

                <h2 className="text-2xl font-semibold mb-1">
                  Security Configuration
                </h2>

                <p className="text-sm text-slate-400">
                  Enable or disable verification modules
                </p>

              </div>

            </div>

            <div className="grid grid-cols-2 gap-5">

              {/* ITEM */}
              <div className="bg-[#08172d] rounded-xl p-5 flex items-center justify-between">

                <div>

                  <h3 className="font-medium">
                    Face Verification
                  </h3>

                  <p className="text-sm text-slate-400 mt-1">
                    Aadhaar biometric validation
                  </p>

                </div>

                <button
                  onClick={() =>
                    toggleSecurity("faceVerification")
                  }
                  className={`w-12 h-6 rounded-full relative transition ${
                    securitySettings.faceVerification
                      ? "bg-emerald-500"
                      : "bg-slate-600"
                  }`}
                >

                  <div
                    className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${
                      securitySettings.faceVerification
                        ? "right-1"
                        : "left-1"
                    }`}
                  ></div>

                </button>

              </div>

              {/* ITEM */}
              <div className="bg-[#08172d] rounded-xl p-5 flex items-center justify-between">

                <div>

                  <h3 className="font-medium">
                    Fingerprint Verification
                  </h3>

                  <p className="text-sm text-slate-400 mt-1">
                    Fingerprint authentication
                  </p>

                </div>

               <button
                  onClick={() =>
                    toggleSecurity("fingerprintVerification")
                  }
                  className={`w-12 h-6 rounded-full relative transition ${
                    securitySettings.fingerprintVerification
                      ? "bg-emerald-500"
                      : "bg-slate-600"
                  }`}
                >

                  <div
                    className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${
                      securitySettings.fingerprintVerification
                        ? "right-1"
                        : "left-1"
                    }`}
                  ></div>

                </button>

              </div>

              {/* ITEM */}
              <div className="bg-[#08172d] rounded-xl p-5 flex items-center justify-between">

                <div>

                  <h3 className="font-medium">
                    OTP Verification
                  </h3>

                  <p className="text-sm text-slate-400 mt-1">
                    Mobile OTP authentication
                  </p>

                </div>

                <button
                  onClick={() =>
                    toggleSecurity("otpVerification")
                  }
                  className={`w-12 h-6 rounded-full relative transition ${
                    securitySettings.otpVerification
                      ? "bg-emerald-500"
                      : "bg-slate-600"
                  }`}
                >

                  <div
                    className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${
                      securitySettings.otpVerification
                        ? "right-1"
                        : "left-1"
                    }`}
                  ></div>

                </button>

              </div>

              {/* ITEM */}
              <div className="bg-[#08172d] rounded-xl p-5 flex items-center justify-between">

                <div>

                  <h3 className="font-medium">
                    Geo-location Validation
                  </h3>

                  <p className="text-sm text-slate-400 mt-1">
                    Location mismatch prevention
                  </p>

                </div>

               <button
                  onClick={() =>
                    toggleSecurity("geoLocationValidation")
                  }
                  className={`w-12 h-6 rounded-full relative transition ${
                    securitySettings.geoLocationValidation
                      ? "bg-emerald-500"
                      : "bg-slate-600"
                  }`}
                >

                  <div
                    className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${
                      securitySettings.geoLocationValidation
                        ? "right-1"
                        : "left-1"
                    }`}
                  ></div>

                </button>

              </div>

              {/* ITEM */}
              <div className="bg-[#08172d] rounded-xl p-5 flex items-center justify-between">

                <div>

                  <h3 className="font-medium">
                    AI Spoof Detection
                  </h3>

                  <p className="text-sm text-slate-400 mt-1">
                    Fake biometric detection
                  </p>

                </div>

                <button
                  onClick={() =>
                    toggleSecurity("spoofDetection")
                  }
                  className={`w-12 h-6 rounded-full relative transition ${
                    securitySettings.spoofDetection
                      ? "bg-emerald-500"
                      : "bg-slate-600"
                  }`}
                >

                  <div
                    className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${
                      securitySettings.spoofDetection
                        ? "right-1"
                        : "left-1"
                    }`}
                  ></div>

                </button>

              </div>

            </div>

          </div>

          {/* RESULTS CONTROL */}
          <div className="grid grid-cols-2 gap-5">

            {/* RESULTS */}
            <div className="bg-[#0b1d35] border border-cyan-500/10 rounded-2xl p-6">

              <h2 className="text-2xl font-semibold mb-5">
                Results Control
              </h2>

              <div className="space-y-4">

                <div className="bg-[#08172d] rounded-xl p-5 flex items-center justify-between">

                  <div>

                    <h3 className="font-medium">
                      Results Visibility
                    </h3>

                    <p className="text-sm text-slate-400 mt-1">
                      Locked until election ends
                    </p>

                  </div>

                  <div
                    className={`text-sm font-medium ${
                      resultsLocked
                        ? "text-yellow-400"
                        : "text-emerald-400"
                    }`}
                  >

                    {resultsLocked
                      ? "LOCKED"
                      : "UNLOCKED"}

                  </div>

                </div>

                {resultsLocked ? (

                <button
                  disabled
                  className="w-full rounded-xl py-3 font-medium bg-slate-700 text-slate-400 cursor-not-allowed"
                >

                  Results Locked

                </button>

              ) : (

                <Link to="/results">

                  <button
                    className="w-full rounded-xl py-3 font-medium bg-cyan-500 hover:bg-cyan-600 text-white transition"
                  >

                    View Results

                  </button>

                </Link>

              )}

              </div>

            </div>

            {/* BLOCKCHAIN */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-6">

              <h2 className="text-2xl font-semibold mb-5">
                Blockchain Status
              </h2>

              <div className="space-y-5">

                <div>

                  <p className="text-cyan-100 text-sm mb-1">
                    Encryption Protocol
                  </p>

                  <h3 className="text-2xl font-bold">
                    AES-256
                  </h3>

                </div>

                <div>

                  <p className="text-cyan-100 text-sm mb-1">
                    Node Synchronization
                  </p>

                  <h3 className="text-2xl font-bold">
                    ACTIVE
                  </h3>

                </div>

                <div className="bg-white/10 rounded-xl p-4">

                  <p className="text-sm leading-7">

                    Blockchain nodes synchronized and vote
                    encryption functioning securely.

                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}

export default ElectionControl