import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import API_BASE_URL from "../config/api"

function AdminDashboard() {

  const [results, setResults] = useState([])
  const [electionStatus, setElectionStatus] = useState(null)
  console.log("Election Status:", electionStatus)
  const [auditLogs, setAuditLogs] = useState([])
  const [ledger, setLedger] = useState([])
  const [remainingTime, setRemainingTime] = useState("00:00:00")
  const [faceMismatchCount, setFaceMismatchCount] = useState(0)
  const [duplicateVoteCount, setDuplicateVoteCount] = useState(0)
  const [aadhaarMismatchCount, setAadhaarMismatchCount] = useState(0)
  const [otpFailures, setOtpFailures] = useState(0)
  const [aiSpoofCount, setAiSpoofCount] = useState(0)
 const totalVotes = results.reduce(
  (sum, candidate) =>
    sum + Number(candidate.voteCount || 0),
  0
)
  const [fingerprintFailures, setFingerprintFailures] = useState(0)
  const [stats, setStats] = useState({
    totalVotes: 0,
    verifiedVoters: 0,
    fraudBlocks: 0,
    blockchainBlocks: 1,
    faceMismatches: 0,
    fingerprintFailures: 0,
    otpFailures: 0,
    duplicateAttempts: 0,
    aiSpoofCount: 0
  })

  // FETCH DASHBOARD STATS
  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/voters/dashboard-stats`)
      if (!response.ok) return
      const data = await response.json()
      setStats(data)
      setFaceMismatchCount(data.faceMismatches || 0)
      setFingerprintFailures(data.fingerprintFailures || 0)
      setOtpFailures(data.otpFailures || 0)
      setDuplicateVoteCount(data.duplicateAttempts || 0)
    } catch (err) {
      console.warn("fetchDashboardStats error:", err.message)
    }
  }

  // FETCH RESULTS
  const fetchResults = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/voters/results`)
      if (!response.ok) return
      const data = await response.json()
      setResults(data.results || [])
    } catch (err) {
      console.warn("fetchResults error:", err.message)
    }
  }

  // FETCH ELECTION STATUS
  const fetchElectionStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/voters/election-status`)
      if (!response.ok) return
      const data = await response.json()
      setElectionStatus(data)
    } catch (err) {
      console.warn("fetchElectionStatus error:", err.message)
    }
  }

  // FETCH AUDIT LOGS
  const fetchAuditLogs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/voters/audit-logs`)
      if (!response.ok) return
      const data = await response.json()
      const logs = data.logs || []
      setAuditLogs(logs)
    } catch (error) {
      console.log(error)
    }
  }

  // FETCH BLOCKCHAIN
  const fetchBlockchain = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/voters/blockchain-ledger`)
      if (!response.ok) return
      const data = await response.json()
      setLedger(data.votes || [])
    } catch (err) {
      console.warn("fetchBlockchain error:", err.message)
    }
  }

  const endElection = async () => {
    try {
      const endResponse = await fetch(`${API_BASE_URL}/api/voters/end-election`, { method: "POST" })
      const endData = await endResponse.json()
      alert("Election Status: " + (endData.message || "Election Ended"))
      fetchElectionStatus()
      fetchDashboardStats()
    } catch (error) {
      console.log(error)
    }
  }

  // USE EFFECT
  useEffect(() => {
    fetchResults()
    fetchElectionStatus()
    fetchAuditLogs()
    fetchBlockchain()
    fetchDashboardStats()

    const interval = setInterval(() => {
      fetchResults()
      fetchElectionStatus()
      fetchAuditLogs()
      fetchBlockchain()
      fetchDashboardStats()
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return "00:00:00"
    let str = String(timeStr)
    if (str.includes("T")) {
      str = str.split("T")[1]
    }
    if (str.includes(".")) {
      str = str.split(".")[0]
    }
    return str || "00:00:00"
  }

  useEffect(() => {
    if (!electionStatus?.isActive || !electionStatus?.endTime) {
      setRemainingTime("00:00:00")
      return
    }

    const interval = setInterval(() => {
      try {
        const now = new Date()
        let endTimeStr = String(electionStatus.endTime)
        if (endTimeStr.includes("T")) {
          endTimeStr = endTimeStr.split("T")[1]
        }
        const parts = endTimeStr.split(":")
        const hours = Number(parts[0] || 18)
        const minutes = Number(parts[1] || 0)

        const endDate = new Date()
        endDate.setHours(hours, minutes, 0, 0)

        let startTimeStr = String(electionStatus.startTime || "00:00")
        if (startTimeStr.includes("T")) {
          startTimeStr = startTimeStr.split("T")[1]
        }
        const startParts = startTimeStr.split(":")
        const startHours = Number(startParts[0] || 0)
        const startMinutes = Number(startParts[1] || 0)

        const nowMins = now.getHours() * 60 + now.getMinutes()
        const endMins = hours * 60 + minutes
        const startMins = startHours * 60 + startMinutes

        let diff = endDate.getTime() - now.getTime()

        if (startMins > endMins) {
          // Cross-midnight window e.g. 23:29 to 03:00
          const isWithinWindow = nowMins >= startMins || nowMins < endMins
          if (!isWithinWindow) {
            diff = 0
          }
        }

        if (diff <= 0) {
          setRemainingTime("00:00:00")
          fetch(`${API_BASE_URL}/api/voters/end-election`, { method: "POST" })
            .then(() => fetchElectionStatus())
            .catch(() => null)
          clearInterval(interval)
          return
        }

        const hrs = Math.floor(diff / (1000 * 60 * 60))
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const secs = Math.floor((diff % (1000 * 60)) / 1000)

        setRemainingTime(
          `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
        )
      } catch (err) {
        setRemainingTime("00:00:00")
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [electionStatus])

  return (
    <div className="min-h-screen bg-[#061122] text-white flex overflow-hidden">

      {/* SIDEBAR */}
      <div className="w-64 bg-[#08172d] border-r border-cyan-500/10 flex flex-col justify-between">

        <div>

          {/* Logo */}
          <div className="px-6 py-6 border-b border-cyan-500/10">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg">

                <span className="font-bold text-lg">
                  V
                </span>

              </div>

              <div>

                <h1 className="text-xl font-semibold">
                  Vortura
                </h1>

                <p className="text-xs text-slate-400">
                  Blockchain Election Console
                </p>

              </div>

            </div>

          </div>

          {/* Menu */}
          <div className="p-4 space-y-2">

            {/* Dashboard */}

            <Link
              to="/admin-dashboard"
              className="w-full flex items-center gap-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-4 py-3 rounded-2xl hover:bg-cyan-500/20 transition"
            >
              📊 Dashboard
            </Link>

            {/* Election Control */}

            <Link
              to="/election-control"
              className="w-full flex items-center gap-3 text-slate-300 px-4 py-3 rounded-2xl hover:bg-cyan-500/10 hover:text-cyan-300 transition"
            >
              🗳 Election Control
            </Link>

            {/* Candidate Management */}

            <Link
              to="/candidate-management"
              className="w-full flex items-center gap-3 text-slate-300 px-4 py-3 rounded-2xl hover:bg-cyan-500/10 hover:text-cyan-300 transition"
            >
              👥 Candidate Management
            </Link>

            {/* Results */}

            <Link
              to="/results"
              className="w-full flex items-center gap-3 text-slate-300 px-4 py-3 rounded-2xl hover:bg-cyan-500/10 hover:text-cyan-300 transition"
            >
              🏆 Results
            </Link>

            {/* Blockchain */}

            <Link
              to="/blockchain"
              className="w-full flex items-center gap-3 text-slate-300 px-4 py-3 rounded-2xl hover:bg-cyan-500/10 hover:text-cyan-300 transition"
            >
              ⛓ Blockchain Ledger
            </Link>

            {/* Audit Logs */}

            <Link
              to="/audit-logs"
              className="w-full flex items-center gap-3 text-slate-300 px-4 py-3 rounded-2xl hover:bg-cyan-500/10 hover:text-cyan-300 transition"
            >
              📁 Audit Logs
            </Link>

            {/* Voter Face Dataset Registration (Pre-Election Setup) */}

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

            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">

              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>

              Voting Active

            </div>

          </div>

        </div>

      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto">

        {/* TOP BAR */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-cyan-500/10 bg-[#08172d]">

          <div>

            <h1 className="text-3xl font-semibold mb-1">
              Election Dashboard
            </h1>

            <p className="text-sm text-slate-400">
              Real-time blockchain election monitoring system
            </p>

          </div>

          <div className="flex items-center gap-4">

            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl text-sm">

              Blockchain Active

            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-4 py-2 rounded-xl text-sm">

              Real-Time Verification

            </div>

            <button
            onClick={endElection}
            className="bg-red-500 hover:bg-red-600 transition px-5 py-2 rounded-xl text-sm font-medium"
          >
            End Election
          </button>

          </div>

        </div>

        {/* CONTENT */}
        <div className="p-8">
            {/* ELECTION TIMING */}
        <div className="grid grid-cols-3 gap-5 mb-6">

        {/* Start Time */}
        <div className="bg-[#0b1d35] border border-cyan-500/10 rounded-2xl px-5 py-3 h-[135px]">

            <p className="text-sm text-slate-400 mb-2">
            Election Start Time
            </p>

         <h2 className="text-3xl font-bold">
            {formatTimeDisplay(electionStatus?.startTime)}
          </h2>
            <p className="text-xs text-emerald-400 mt-3">
            Voting session initiated
            </p>

        </div>

        {/* End Time */}
        <div className="bg-[#0b1d35] border border-cyan-500/10 rounded-2xl px-5 py-3 h-[135px]">

            <p className="text-sm text-slate-400 mb-2">
            Election End Time
            </p>

            <h2 className="text-3xl font-bold">
            {formatTimeDisplay(electionStatus?.endTime)}
          </h2>

        </div>

        {/* Current Status */}
        <div className={`rounded-2xl px-5 py-4 flex flex-col justify-center transition-colors duration-300 ${
          electionStatus?.isActive
            ? "bg-gradient-to-r from-blue-600 to-cyan-500"
            : "bg-[#0b1d35] border border-cyan-500/10"
        }`}>

            <p className="text-sm text-cyan-100 mb-2">
            Current Election Status
            </p>

            <h2 className="text-3xl font-bold text-white">
            {electionStatus?.isActive ? "ACTIVE" : "INACTIVE"}
          </h2>

            <div className="flex items-center gap-2 mt-3 text-sm font-medium">
            <div className={`w-2.5 h-2.5 rounded-full ${
              electionStatus?.isActive
                ? "bg-emerald-400 animate-pulse"
                : "bg-amber-400"
            }`}></div>

            <span className={electionStatus?.isActive ? "text-emerald-300" : "text-amber-300"}>
              {electionStatus?.isActive ? "Live Voting in Progress" : "Voting Currently Disabled"}
            </span>
          </div>
            <div className="mt-2">

            <p className="text-sm text-cyan-100">
              Election Ends In
            </p>

            <h2 className="text-2xl font-bold text-white mt-2">
              {remainingTime}
            </h2>

          </div>

        </div>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-5 mb-6">

        {/* CARD */}
        <div className="bg-[#0b1d35] border border-cyan-500/10 rounded-2xl p-5">

            <div className="text-3xl mb-4">
            🗳️
            </div>

            <p className="text-sm text-slate-400 mb-2">
            Total Votes
            </p>

            <h2 className="text-3xl font-bold">
            {stats.totalVotes}
            </h2>

        </div>

        {/* CARD */}
        <div className="bg-[#0b1d35] border border-cyan-500/10 rounded-2xl p-5">

            <div className="text-3xl mb-4">
            👤
            </div>

            <p className="text-sm text-slate-400 mb-2">
            Verified Voters
            </p>

            <h2 className="text-3xl font-bold">
            {stats.verifiedVoters}
            </h2>

        </div>

        {/* CARD */}
        <div className="bg-[#0b1d35] border border-cyan-500/10 rounded-2xl p-5">

            <div className="text-3xl mb-4">
            🤖
            </div>

            <p className="text-sm text-slate-400 mb-2">
            Fraud Blocks
            </p>

            <h2 className="text-3xl font-bold">
            {stats.fraudBlocks}
            </h2>

        </div>

        {/* CARD */}
        <div className="bg-[#0b1d35] border border-cyan-500/10 rounded-2xl p-5">

            <div className="text-3xl mb-4">
            ⛓️
            </div>

            <p className="text-sm text-slate-400 mb-2">
            Blockchain Blocks
            </p>

            <h2 className="text-3xl font-bold">
            {stats.blockchainBlocks}
            </h2>

        </div>

        </div>


          
          {/* MAIN GRID */}
          <div className="grid grid-cols-3 gap-6">

            {/* LEFT */}
            <div className="col-span-2 space-y-6">

              {/* SECURITY */}
              <div className="bg-[#0b1d35] border border-cyan-500/10 rounded-2xl p-6">

                <div className="flex items-center justify-between mb-6">

                  <div>

                    <h2 className="text-xl font-semibold mb-1">
                      Security Monitoring
                    </h2>

                    <p className="text-sm text-slate-400">
                      Fraud prevention and authentication analytics
                    </p>

                  </div>

                  <div className="text-emerald-400 text-sm">
                    Monitoring Active
                  </div>

                </div>

                {/* SECURITY GRID */}
                <div className="grid grid-cols-2 gap-4">

                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5">

                    <p className="text-red-400 text-sm mb-2">
                      Face Mismatches
                    </p>

                    <h2 className="text-3xl font-bold">
                      {faceMismatchCount}
                    </h2>

                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-5">

                    <p className="text-yellow-400 text-sm mb-2">
                      Fingerprint Failures
                    </p>

                    <h2 className="text-3xl font-bold">
                      {fingerprintFailures}
                    </h2>

                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">

                    <p className="text-blue-400 text-sm mb-2">
                      OTP Failures
                    </p>

                    <h2 className="text-3xl font-bold">
                      {otpFailures}
                    </h2>

                  </div>

                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-5">

                    <p className="text-purple-400 text-sm mb-2">
                      Duplicate Attempts
                    </p>

                    <h2 className="text-3xl font-bold">
                      {duplicateVoteCount}
                    </h2>

                  </div>

                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-5">

                    <p className="text-orange-400 text-sm mb-2">
                      Location Mismatches
                    </p>

                    <h2 className="text-3xl font-bold">
                      {stats.locationMismatches || 0}
                    </h2>

                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5">

                    <p className="text-emerald-400 text-sm mb-2">
                      AI Spoof Detection
                    </p>

                    <h2 className="text-3xl font-bold">
                      {aiSpoofCount}
                    </h2>

                  </div>

                </div>

              </div>

              {/* RESULTS LOCK */}
              <div className="bg-[#0b1d35] border border-cyan-500/10 rounded-2xl p-10 text-center">

                <div className="text-6xl mb-4">
                  🔒
                </div>

                <h2 className="text-2xl font-semibold mb-3">
                  Results Locked
                </h2>

                <p className="text-slate-400 text-sm leading-7 max-w-2xl mx-auto">

                  Election results remain inaccessible until the
                  voting period officially ends or the administrator
                  manually closes the election session.

                </p>

              </div>

            </div>

            {/* RIGHT */}
              <div className="space-y-6">

                {/* BLOCKCHAIN */}
                <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-6">

                  <h2 className="text-2xl font-semibold mb-6">
                    Blockchain Ledger
                  </h2>

                  <div className="space-y-5">

                    {
                      ledger.slice(0, 5).map((block, index) => (

                        <div
                          key={index}
                          className="border-l-2 border-cyan-300 pl-4"
                        >

                          <h3 className="text-sm font-medium">
                            Block #{index + 1}
                          </h3>

                          <p className="text-xs text-cyan-100 break-all mt-1">
                            {block._id}
                          </p>

                        </div>

                      ))
                    }

                  </div>

                </div>

                {/* AUDIT LOGS */}
                <div className="bg-[#0b1d35] border border-cyan-500/10 rounded-2xl p-6">

                  <h2 className="text-2xl font-semibold mb-6">
                    Audit Logs
                  </h2>

                  <div className="space-y-5">

                    {
                      auditLogs.slice(0, 5).map((log, index) => (

                        <div
                          key={index}
                          className="border-l-2 border-emerald-400 pl-4"
                        >

                          <h3 className="text-sm font-medium">
                            {log.action}
                          </h3>

                          <p className="text-xs text-slate-400 mt-1">
                            {
                              new Date(log.timestamp)
                              .toLocaleTimeString()
                            }
                          </p>

                        </div>

                      ))
                    }

                  </div>

                </div>

              </div>
            </div>

        </div>

      </div>

    </div>
  )
}

export default AdminDashboard