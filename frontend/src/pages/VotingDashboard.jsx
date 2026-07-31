import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import API_BASE_URL from "../config/api"

function VotingDashboard() {
  const navigate = useNavigate()
  const [candidates, setCandidates] = useState([])
  const [electionStatus, setElectionStatus] = useState(null)

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/voters/election-status`)
      if (res.ok) {
        const data = await res.json()
        setElectionStatus(data)
      }
    } catch (err) {
      console.warn("Election status fetch error:", err)
    }
  }

  useEffect(() => {
    fetchStatus()

    const savedCandidates =
      JSON.parse(
        localStorage.getItem("candidates")
      ) || []

    const approvedCandidates =
      savedCandidates.filter(
        candidate =>
          candidate.status === "ACTIVE"
      )

    setCandidates(approvedCandidates)
  }, [])

  const castVote = async (candidate) => {
    if (electionStatus && electionStatus.isActive === false) {
      alert("Voting is currently closed. The election session is inactive or ended.")
      return
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/voters/cast-vote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            voterId: sessionStorage.getItem("voterId") || "TN2026001",
            candidateName: candidate.name,
            party: candidate.party,
          }),
        }
      )

      const data = await response.json()

      alert(data.message)

      if (response.ok) {
        navigate("/vote-success")
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-10 py-6 bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">

        {/* Logo */}
        <div className="flex items-center gap-4">

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center shadow-lg">

            <span className="text-white text-2xl font-bold">
              V
            </span>

          </div>

          <div>

            <h1 className="text-3xl font-bold text-slate-900">
              Vortura
            </h1>

            <p className="text-slate-500">
              Blockchain Election Dashboard
            </p>

          </div>

        </div>

        {/* Status */}
        <div className="flex items-center gap-5">

          <div className="flex items-center gap-3 bg-emerald-100 text-emerald-700 px-5 py-3 rounded-2xl font-semibold">

            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>

            Blockchain Active

          </div>

          <button
            onClick={() => {
              localStorage.clear()
              sessionStorage.clear()
              navigate("/login")
            }}
            className="bg-gradient-to-r from-blue-600 to-emerald-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:scale-105 transition"
          >

            Logout

          </button>

        </div>

      </nav>

      {/* Main Content */}
      <div className="px-10 py-10">

        {/* Heading */}
        <div className="mb-8">
          <h2 className="text-5xl font-bold text-slate-900 mb-4">
            Cast Your Vote
          </h2>

          <p className="text-slate-600 text-lg leading-8 max-w-4xl">
            Select your preferred candidate securely.
            Every vote is encrypted using blockchain technology,
            verified through AI-powered authentication,
            and permanently recorded for transparent elections.
          </p>

          {electionStatus && electionStatus.isActive === false && (
            <div className="mt-6 bg-red-500/10 border-2 border-red-500/40 text-red-700 px-6 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-md">
              <span className="text-2xl">🚨</span>
              <div>
                <p className="text-base leading-none font-extrabold">ELECTION VOTING CLOSED</p>
                <p className="text-xs text-red-600 font-medium mt-1">Voting session is currently inactive or ended by the administrator. Vote casting is disabled.</p>
              </div>
            </div>
          )}
        </div>

        {/* Dashboard Layout */}
        <div className="grid lg:grid-cols-4 gap-8">

          {/* Candidate Grid */}
          <div className="lg:col-span-3">

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">

              {candidates.map((candidate, index) => (

                <div
                  key={index}
                  className="bg-white rounded-[32px] p-7 shadow-xl border border-slate-200 hover:scale-[1.02] transition duration-300"
                >

                  {/* Top */}
                  <div className="flex items-center justify-between mb-6">

                    {/* Candidate */}
                    <img
                      src={candidate.photo}
                      alt={candidate.name}
                      className="w-24 h-24 rounded-3xl object-cover border-4 border-slate-100 shadow-md"
                    />

                    {/* Symbol */}
                    <div className="bg-slate-100 p-3 rounded-2xl">

                      <img
                        src={candidate.symbol}
                        alt={candidate.party}
                        className="w-16 h-16 object-contain"
                      />

                    </div>

                  </div>

                  {/* Name */}
                  <h3 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">

                    {candidate.name}

                  </h3>

                  {/* Party */}
                  <p className="text-blue-600 font-semibold mb-4">

                    {candidate.party}

                  </p>

                  {/* Description */}
                  <p className="text-slate-500 leading-7 mb-8 text-sm">
                    Constituency:
                    {candidate.constituency}
                  </p>

                  {/* Vote Button */}
                  <button
                      onClick={() => castVote(candidate)}
                      disabled={electionStatus && electionStatus.isActive === false}
                      className={`w-full py-4 rounded-2xl font-semibold shadow-lg transition ${
                        electionStatus && electionStatus.isActive === false
                          ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-600 to-emerald-500 text-white hover:scale-[1.02]"
                      }`}
                    >
                    {electionStatus && electionStatus.isActive === false ? "Voting Closed" : "Vote Candidate"}

                  </button>

                </div>

              ))}

            </div>

          </div>

          {/* Right Panel */}
          <div className="space-y-6">

            {/* Election Status */}
            <div className="bg-white rounded-[32px] p-8 shadow-xl border border-slate-200">

              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Election Status
              </h2>

              <div className="space-y-5">

                <div className="flex items-center justify-between">

                  <span className="text-slate-600">
                    Blockchain
                  </span>

                  <span className="text-emerald-600 font-semibold">
                    Active
                  </span>

                </div>

                <div className="flex items-center justify-between">

                  <span className="text-slate-600">
                    AI Monitoring
                  </span>

                  <span className="text-blue-600 font-semibold">
                    Running
                  </span>

                </div>

                <div className="flex items-center justify-between">

                  <span className="text-slate-600">
                    Biometric Status
                  </span>

                  <span className="text-purple-600 font-semibold">
                    Verified
                  </span>

                </div>

                <div className="flex items-center justify-between">

                  <span className="text-slate-600">
                    Vote Encryption
                  </span>

                  <span className="text-emerald-600 font-semibold">
                    Enabled
                  </span>

                </div>

              </div>

            </div>

            {/* Blockchain Panel */}
            <div className="bg-gradient-to-br from-blue-600 to-emerald-500 rounded-[32px] p-8 shadow-xl text-white">

              <h2 className="text-3xl font-bold mb-6">
                Blockchain Ledger
              </h2>

              <p className="leading-8 text-blue-100 mb-8">

                Every vote is securely encrypted,
                verified using AI authentication,
                and permanently stored on blockchain
                infrastructure for transparent elections.

              </p>

              <div className="bg-white/10 rounded-2xl p-5">

                <p className="text-sm text-blue-100 mb-2">
                  Latest Block Hash
                </p>

                <p className="font-mono text-sm break-all">

                  0xA84F92BC7D19E32FF1

                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}

export default VotingDashboard