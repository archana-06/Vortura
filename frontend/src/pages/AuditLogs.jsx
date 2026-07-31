import React from "react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import API_BASE_URL from "../config/api"

function AuditLogs() {
    const [logs, setLogs] = useState([])

    const fetchLogs = async () => {

    try {

        const response = await fetch(
        `${API_BASE_URL}/api/voters/audit-logs`
        )

        const data = await response.json()

        setLogs(data.logs)

    } catch (error) {

        console.log(error)

    }

    }

    useEffect(() => {

    fetchLogs()

    }, [])
    const securityAlerts = logs.length

const fraudAttempts = logs.filter(
  log =>
    log.status === "FAILED" ||
    log.status === "BLOCKED"
).length

const voteRejections = logs.filter(
  log => log.action?.includes("Rejected")
).length
const exportLogs = () => {

const content = logs.map(log =>

`
Action: ${log.action}
Status: ${log.status}
Time: ${new Date(log.timestamp).toLocaleString()}
--------------------------------
`

).join("")

const blob = new Blob(
[content],
{ type: "text/plain" }
)

const url =
window.URL.createObjectURL(blob)

const a =
document.createElement("a")

a.href = url

a.download = "AuditLogs.txt"

a.click()

}

  return (
    <div className="min-h-screen bg-[#020b24] text-white flex">

      {/* SIDEBAR */}

      <div className="w-[250px] bg-[#06132d] border-r border-cyan-900/30">

        <div className="p-6 border-b border-cyan-900/30">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-2xl font-bold">
              V
            </div>

            <div>

              <h1 className="text-2xl font-bold">
                Vortura
              </h1>

              <p className="text-gray-400 text-sm">
                Audit & Security Logs
              </p>

            </div>

          </div>

        </div>

        {/* MENU */}

        <div className="p-4 space-y-2">

            <Link
                to="/admin-dashboard"
                className="w-full flex items-center gap-3 text-slate-300 px-4 py-3 rounded-2xl hover:bg-cyan-500/10 hover:text-cyan-300 transition"
            >
                📊 Dashboard
            </Link>

            <Link
                to="/election-control"
                className="w-full flex items-center gap-3 text-slate-300 px-4 py-3 rounded-2xl hover:bg-cyan-500/10 hover:text-cyan-300 transition"
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
                className="w-full flex items-center gap-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-4 py-3 rounded-2xl"
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

      {/* MAIN */}

      <div className="flex-1">

        {/* TOPBAR */}

        <div className="border-b border-cyan-900/30 px-8 py-6 flex items-center justify-between">

          <div>

            <h1 className="text-[40px] font-bold">
              Audit & Security Logs
            </h1>

            <p className="text-gray-400 text-lg mt-1">
              Real-time election monitoring and security event tracking
            </p>

          </div>

          <div className="flex gap-4">

            <button
onClick={exportLogs}
className="px-6 py-3 rounded-xl bg-cyan-500 text-white font-semibold hover:bg-cyan-600"
>
Export Logs
</button>

          </div>

        </div>

        {/* CONTENT */}

        <div className="p-8 space-y-8">

          {/* STATUS CARDS */}

          <div className="grid grid-cols-4 gap-6">

            <div className="bg-[#081935] rounded-3xl p-6 border border-cyan-900/20">

              <p className="text-gray-400">
                Security Alerts
              </p>

              <h2 className="text-[40px] font-bold mt-2 text-red-400">
                {securityAlerts}
              </h2>

            </div>

            <div className="bg-[#081935] rounded-3xl p-6 border border-cyan-900/20">

              <p className="text-gray-400">
                Fraud Attempts
              </p>

              <h2 className="text-[40px] font-bold mt-2 text-yellow-400">
                {fraudAttempts}
              </h2>

            </div>

            <div className="bg-[#081935] rounded-3xl p-6 border border-cyan-900/20">

              <p className="text-gray-400">
                Vote Rejections
              </p>

              <h2 className="text-[40px] font-bold mt-2">
                {voteRejections}
              </h2>

            </div>

            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-6">

              <p>
                System Integrity
              </p>

              <h2 className="text-[40px] font-bold mt-2">
                SECURE
              </h2>

            </div>

          </div>

          {/* SECURITY EVENTS */}

          <div className="bg-[#081935] rounded-3xl border border-cyan-900/20 overflow-hidden">

            <div className="px-8 py-6 border-b border-cyan-900/20 flex items-center justify-between">

              <div>

                <h2 className="text-3xl font-bold">
                  Security Event Logs
                </h2>

                <p className="text-gray-400 mt-1">
                  Real-time suspicious activity and election security monitoring
                </p>

              </div>

              <button
              className="px-5 py-2 rounded-xl border border-red-500 text-red-300 hover:bg-red-500/10"
              onClick={() => {

              const failedLogs =
              logs.filter(
              log =>
              log.status === "FAILED" ||
              log.status === "BLOCKED"
              )

              alert(
              `High Risk Events: ${failedLogs.length}`
              )

              }}
              >
              High Alert Monitoring
              </button>

            </div>

            {/* TABLE */}

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-[#0c2145] text-left text-gray-300">

                  <tr>

                    <th className="px-8 py-5 font-semibold">
                      Event ID
                    </th>

                    <th className="px-8 py-5 font-semibold">
                      Security Event
                    </th>

                    <th className="px-8 py-5 font-semibold">
                      Location
                    </th>

                    <th className="px-8 py-5 font-semibold">
                      Timestamp
                    </th>

                    <th className="px-8 py-5 font-semibold">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {logs.map((log, index) => (

                    <tr
                        key={index}
                        className="border-b border-cyan-900/10 hover:bg-cyan-900/10 transition"
                    >

                        <td className="px-8 py-6 font-semibold">
                        EVT-{index + 1000}
                        </td>

                        <td className="px-8 py-6">
                        {log.action}
                        </td>

                        <td className="px-8 py-6 text-gray-300">
                        {log.voterId || "Unknown"}
                        </td>

                        <td className="px-8 py-6 text-gray-300">
                        {new Date(log.timestamp).toLocaleString()}
                        </td>

                        <td className="px-8 py-6">

                        <span
                            className={`px-4 py-1 rounded-full text-sm ${
                            log.status === "FAILED"
                                ? "bg-red-500/20 text-red-300"
                                : log.status === "BLOCKED"
                                ? "bg-yellow-500/20 text-yellow-300"
                                : "bg-green-500/20 text-green-300"
                            }`}
                        >

                            {log.status}

                        </span>

                        </td>

                    </tr>

                    ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* SECURITY ANALYTICS */}

          <div className="grid grid-cols-2 gap-6">

            {/* FRAUD ANALYTICS */}

            <div className="bg-[#081935] rounded-3xl p-8 border border-cyan-900/20">

              <div className="flex items-center justify-between mb-6">

                <div>

                  <h2 className="text-3xl font-bold">
                    Fraud Analytics
                  </h2>

                  <p className="text-gray-400 mt-1">
                    Rejected vote validation attempts
                  </p>

                </div>

                <div
                className={`font-semibold ${
                fraudAttempts > 0
                ? "text-red-400"
                : "text-green-400"
                }`}
                >
                {fraudAttempts > 0
                ? "Threat Detected"
                : "System Safe"}
                </div>

              </div>

              <div className="space-y-5">

                <div>

                  <div className="flex justify-between mb-2">

                    <span>
                      Face Mismatches
                    </span>

                    <span>
                      {fraudAttempts}
                    </span>

                  </div>

                  <div className="w-full h-3 bg-[#10264a] rounded-full overflow-hidden">

                    <div
  className="h-full bg-red-500 rounded-full"
  style={{
    width: fraudAttempts > 0 ? "70%" : "0%"
  }}
></div>

                  </div>

                </div>

                <div>

                  <div className="flex justify-between mb-2">

                    <span>
                      OTP Failures
                    </span>

                    <span>
                      {fraudAttempts}
                    </span>

                  </div>

                  <div className="w-full h-3 bg-[#10264a] rounded-full overflow-hidden">

                    <div
  className="h-full bg-yellow-500 rounded-full"
  style={{
    width: fraudAttempts > 0 ? "85%" : "0%"
  }}
></div>

                  </div>

                </div>

                <div>

                  <div className="flex justify-between mb-2">

                    <span>
                      Duplicate Voting Attempts
                    </span>

                    <span>
                      {voteRejections}
                    </span>

                  </div>

                  <div className="w-full h-3 bg-[#10264a] rounded-full overflow-hidden">

                    <div
  className="h-full bg-purple-500 rounded-full"
  style={{
    width: voteRejections > 0 ? "40%" : "0%"
  }}
></div>

                  </div>

                </div>

                <div>

                  <div className="flex justify-between mb-2">

                    <span>
                      Geo-location Mismatches
                    </span>

                    <span>
                      {securityAlerts}
                    </span>

                  </div>

                  <div className="w-full h-3 bg-[#10264a] rounded-full overflow-hidden">

                    <div
  className="h-full bg-cyan-500 rounded-full"
  style={{
    width: securityAlerts > 0 ? "60%" : "0%"
  }}
></div>

                  </div>

                </div>

              </div>

            </div>

            {/* SYSTEM INTEGRITY */}

            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-8">

              <div className="flex items-center justify-between mb-8">

                <div>

                  <h2 className="text-3xl font-bold">
                    System Integrity
                  </h2>

                  <p className="mt-1 text-cyan-100">
                    Election infrastructure monitoring
                  </p>

                </div>

                <div
                className={`px-4 py-2 rounded-full text-sm ${
                fraudAttempts > 0
                ? "bg-red-500/20 text-red-300"
                : "bg-green-500/20 text-green-300"
                }`}
                >
                {fraudAttempts > 0
                ? "WARNING"
                : "SECURE"}
              </div>

              </div>

              <div className="space-y-5">

                <div className="bg-white/10 rounded-2xl p-5">

                  <div className="flex justify-between items-center">

                    <span>
                      Blockchain Nodes
                    </span>

                    <span className="font-bold">
  {logs.length} Audit Records
</span>

                  </div>

                </div>

                <div className="bg-white/10 rounded-2xl p-5">

                  <div className="flex justify-between items-center">

                    <span>
                      Encryption Protocol
                    </span>

                    <span className="font-bold">
                      AES-256
                    </span>

                  </div>

                </div>

                <div className="bg-white/10 rounded-2xl p-5">

                  <div className="flex justify-between items-center">

                    <span>
                      Verification Engine
                    </span>

                    <span className="font-bold">
                      RUNNING
                    </span>

                  </div>

                </div>

                <div className="bg-white/10 rounded-2xl p-5">

                  <div className="flex justify-between items-center">

                    <span>
                      Vote Integrity
                    </span>

                    <span className="font-bold">
                      {fraudAttempts > 0
                      ? "UNDER REVIEW"
                      : "VERIFIED"}
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}

export default AuditLogs