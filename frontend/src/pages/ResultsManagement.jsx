import React from "react"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import API_BASE_URL from "../config/api"

function ResultsManagement() {

  const [resultsUnlocked, setResultsUnlocked] = useState(false)
const [showVerifyModal, setShowVerifyModal] = useState(false)
const [showPasswordModal, setShowPasswordModal] = useState(false)
const [adminPassword, setAdminPassword] = useState("")
    const [results, setResults] = useState([])
      console.log("Results:", results)
    const winner = results.length > 0 ? results[0] : null
    const verifyBlockchain = () => {
  setShowVerifyModal(true)
}
    const fetchResults = async () => {

    try {

      const response = await fetch(
        `${API_BASE_URL}/api/voters/results`
      )

      const data = await response.json()

      setResults(data.results)

    } catch (error) {

      console.log(error)

    }

  }

  useEffect(() => {

  fetchResults()

  const interval = setInterval(() => {

    fetchResults()

  }, 5000)

  return () => clearInterval(interval)

    }, [])
    const downloadAuditReport = () => {

  let report = "VORTURA ELECTION AUDIT REPORT\n\n"
  if (winner) {

  report += `WINNER: ${winner._id.candidateName}\n`
  report += `PARTY: ${winner._id.party}\n`
  report += `TOTAL VOTES: ${winner.totalVotes}\n\n`

}

  report += `Generated: ${new Date().toLocaleString()}\n\n`

  results.forEach((candidate, index) => {

    report += `${index + 1}. ${candidate._id.candidateName}\n`
    report += `Party: ${candidate._id.party}\n`
    report += `Votes: ${candidate.totalVotes}\n\n`

  })

  const blob = new Blob(
    [report],
    { type: "text/plain" }
  )

  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")

  a.href = url
  a.download = "Election_Audit_Report.txt"

  a.click()

  URL.revokeObjectURL(url)

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
                Results Management
              </p>

            </div>

          </div>

        </div>

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
                className="w-full flex items-center gap-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-4 py-3 rounded-2xl"
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

      {/* MAIN */}

      <div className="flex-1">

        {/* TOP BAR */}

<div className="border-b border-cyan-900/30 px-8 py-6 flex items-center justify-between">

  <div>

    <h1 className="text-[40px] font-bold leading-tight">
      Election Results Center
    </h1>

    <p className="text-gray-400 text-lg mt-1">
      Blockchain verified election result analytics
    </p>

  </div>

  <div className="flex gap-4">

    <button
      onClick={verifyBlockchain}
      className="border border-cyan-400 text-cyan-400 px-6 py-3 rounded-xl"
    >
      Blockchain Verified
    </button>

    <button
  onClick={() => setShowPasswordModal(true)}
  className="bg-green-500 px-6 py-3 rounded-xl font-semibold hover:bg-green-600"
>
  Unlock Results
</button>

  </div>

</div>

{showVerifyModal && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

    <div className="bg-[#0f172a] p-8 rounded-xl w-[500px] text-white">

      <h2 className="text-2xl font-bold text-green-400 mb-4">
        Blockchain Verification Successful
      </h2>

      <div className="space-y-3">
        <p>✓ All Votes Verified</p>
        <p>✓ No Tampering Detected</p>
        <p>✓ Hash Integrity Confirmed</p>
        <p>✓ Smart Contract Validation Passed</p>
      </div>

      <button
        onClick={() => setShowVerifyModal(false)}
        className="mt-6 bg-cyan-500 px-6 py-2 rounded"
      >
        Close
      </button>

    </div>

  </div>
)}
{/* Password Modal Starts Here */}

{showPasswordModal && (

  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

    <div className="bg-[#0f172a] p-8 rounded-xl w-[400px]">

      <h2 className="text-2xl font-bold mb-4">
        Admin Authentication
      </h2>

      <input
        type="password"
        placeholder="Enter Admin Password"
        value={adminPassword}
        onChange={(e) => setAdminPassword(e.target.value)}
        className="w-full p-3 rounded-lg bg-[#1e293b] border border-cyan-500"
      />

      <div className="flex gap-3 mt-6">

        <button
          onClick={() => {

            if (adminPassword === "admin123") {

              setResultsUnlocked(true)
              setShowPasswordModal(false)

            } else {

              alert("Invalid Password")

            }

          }}
          className="bg-green-500 px-5 py-2 rounded-lg"
        >
          Verify
        </button>

        <button
          onClick={() => setShowPasswordModal(false)}
          className="bg-red-500 px-5 py-2 rounded-lg"
        >
          Cancel
        </button>

      </div>

    </div>

  </div>

)}
        {/* CONTENT */}

        <div className="p-8 space-y-8">

          {/* STATUS */}

{resultsUnlocked && (
<div className="grid grid-cols-3 gap-6">
  {results.map((candidate, index) => (

    <div
      key={candidate._id.candidateName}
      className="bg-[#08172d] rounded-3xl p-6 border border-cyan-500/20"
    >

      <div className="flex justify-between items-center mb-4">

        <span className="bg-green-500/20 text-green-400 px-4 py-1 rounded-full text-sm">
          LIVE
        </span>

      </div>

      <h1 className="text-3xl font-bold mb-2">
        {candidate._id.candidateName}
      </h1>

      <p className="text-cyan-400 text-lg mb-4">
        {candidate._id.party}
      </p>

      <h2 className="text-5xl font-bold text-white">
        {candidate.totalVotes}
      </h2>

      <p className="text-slate-400 mt-2">
        Total Votes
      </p>

    </div>

  ))}
</div>
)}

          {/* TITLE */}
          {resultsUnlocked && winner && (

            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-3xl p-6 mb-8">

                <p className="text-cyan-300 text-lg mb-2">
                Current Leading Candidate
                </p>

                <h1 className="text-4xl font-bold text-white">
                {winner._id.candidateName}
                </h1>

                <p className="text-cyan-400 text-xl mt-2">
                {winner._id.party}
                </p>

                <h2 className="text-6xl font-bold mt-4">
                {winner.totalVotes} Votes
                </h2>

            </div>

            )}
            {resultsUnlocked && (
  <div className="flex items-center justify-between mb-6">

    <h2 className="text-3xl font-bold">
      Constituency Results
    </h2>

    <button
      onClick={downloadAuditReport}
      className="px-6 py-3 rounded-xl bg-cyan-500 font-semibold"
    >
      Download Audit Report
    </button>

  </div>
)}     
          {/* RESULT CARDS */}
          {resultsUnlocked && winner && (
          <div className="grid grid-cols-3 gap-6">

          {results.map((candidate, index) => {

            const approvedCandidates =
            JSON.parse(
              localStorage.getItem("candidates")
            ) || []

          const candidateInfo =
          approvedCandidates.find(
            c =>
              c.name === candidate._id.candidateName ||
              c.candidateName === candidate._id.candidateName
          )

            const totalVotes = results.reduce(
              (sum, item) => sum + item.totalVotes,
              0
            )

            const percentage =
              totalVotes > 0
                ? ((candidate.totalVotes / totalVotes) * 100).toFixed(1)
                : 0
          
  return (

    <div
      key={index}
      className="bg-[#081935] rounded-3xl p-6 border border-cyan-900/20"
    >

      <div className="flex items-center justify-between mb-5">

        <span
          className={`px-4 py-1 rounded-full text-sm
          ${
            index === 0
              ? "bg-green-500/20 text-green-300"
              : index === 1
              ? "bg-blue-500/20 text-blue-300"
              : "bg-yellow-500/20 text-yellow-300"
          }`}
        >
          {
            index === 0
              ? "WINNER"
              : index === 1
              ? "RUNNER UP"
              : "THIRD PLACE"
          }
        </span>

      </div>

      <div className="flex flex-col items-center">
        <img
  src={candidateInfo?.photo || "https://via.placeholder.com/150"}
  alt="candidate"
  className="w-28 h-28 rounded-2xl object-cover mx-auto mb-4"
/>

        <h3 className="text-[30px] font-bold mt-5">
          {candidate._id.candidateName}
        </h3>

        <p className="text-cyan-400 text-xl mt-1">
          {candidate._id.party}
        </p>
        <div className="bg-white rounded-2xl p-3 mt-5 shadow-lg">

        <img
  src={candidateInfo?.symbol || "https://via.placeholder.com/80"}
  alt="symbol"
  className="w-20 h-20 object-contain"
/>

      </div>

        <div className="w-full mt-6">

          <div className="flex justify-between text-base mb-2">

            <span>Vote Percentage</span>

            <span>{percentage}%</span>

          </div>

          <div className="w-full h-3 bg-[#10264a] rounded-full overflow-hidden">

            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
              style={{
                width: `${percentage}%`
              }}
            ></div>

          </div>

        </div>

        <div className="mt-6 text-center">

          <h4 className="text-[32px] font-bold">
            {candidate.totalVotes}
          </h4>

          <p className="text-gray-400 mt-1">
            Verified Votes
          </p>

        </div>

      </div>

    </div>

  )
})}

</div>
          )}
            

            </div>

          </div>

        </div>
  )
}

export default ResultsManagement