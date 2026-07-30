import React, {
  useState,
  useEffect
} from "react"
import { Link } from "react-router-dom"
function CandidateManagement() {

  const [candidates, setCandidates] =
    useState([])
    const [showForm, setShowForm] =
  useState(false)

const [name, setName] =
  useState("")

const [party, setParty] =
  useState("")

const [constituency, setConstituency] =
  useState("")

  const [photo, setPhoto] =
  useState("")

const [symbol, setSymbol] =
  useState("")

  const syncCandidatesWithBackend = async (list) => {
    try {
      await fetch("http://localhost:8000/api/voters/candidates/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidates: list }),
      })
    } catch (e) {
      console.warn("Backend candidate sync error:", e)
    }
  }

  useEffect(() => {
    const savedCandidates =
      JSON.parse(
        localStorage.getItem("candidates")
      ) || []

    setCandidates(savedCandidates)
    syncCandidatesWithBackend(savedCandidates)
  }, [])

  const handleAddCandidate = () => {
    const newCandidate = {
      id: Date.now(),
      name,
      party,
      constituency,
      photo,
      symbol,
      status: "PENDING"
    }

    const updatedCandidates = [
      ...candidates,
      newCandidate
    ]

    setCandidates(updatedCandidates)
    localStorage.setItem(
      "candidates",
      JSON.stringify(updatedCandidates)
    )
    syncCandidatesWithBackend(updatedCandidates)

    setShowForm(false)
    setName("")
    setParty("")
    setConstituency("")
    setPhoto("")
    setSymbol("")
  }

  const approveCandidate = (id) => {
    const updatedCandidates =
      candidates.map((candidate) =>
        candidate.id === id
          ? {
              ...candidate,
              status: "ACTIVE"
            }
          : candidate
      )

    setCandidates(updatedCandidates)
    localStorage.setItem(
      "candidates",
      JSON.stringify(updatedCandidates)
    )
    syncCandidatesWithBackend(updatedCandidates)
  }

  const rejectCandidate = (id) => {
    const updatedCandidates =
      candidates.filter(
        (candidate) =>
          candidate.id !== id
      )

    setCandidates(updatedCandidates)
    localStorage.setItem(
      "candidates",
      JSON.stringify(updatedCandidates)
    )
    syncCandidatesWithBackend(updatedCandidates)
  }
  const removeCandidate = (id) => {

  const updatedCandidates =
    candidates.filter(
      (candidate) =>
        candidate.id !== id
    )

  setCandidates(updatedCandidates)

  localStorage.setItem(
    "candidates",
    JSON.stringify(updatedCandidates)
  )

}
  return (
    <div className="min-h-screen bg-[#061122] text-white flex">

      {/* SIDEBAR */}
      <div className="w-64 bg-[#08172d] border-r border-cyan-500/10 flex flex-col">

        {/* LOGO */}
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
                Candidate Management
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
                className="w-full flex items-center gap-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-4 py-3 rounded-2xl"
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

      {/* MAIN */}
      <div className="flex-1 overflow-y-auto">

        {/* TOPBAR */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-cyan-500/10 bg-[#08172d]">

          <div>

            <h1 className="text-3xl font-semibold mb-1">
              Candidate Management
            </h1>

            <p className="text-sm text-slate-400">
              Manage candidates, parties, symbols and constituencies
            </p>

          </div>

          <div className="flex gap-4">

            <button
            onClick={() => setShowForm(true)}
            className="bg-cyan-500 hover:bg-cyan-600 transition px-5 py-2 rounded-xl text-sm font-medium"
          >
            Add Candidate
          </button>

          </div>

        </div>

        {/* CONTENT */}
        <div className="p-8">

          {/* FILTERS */}
          <div className="flex gap-4 mb-8">

            <select className="bg-[#0b1d35] border border-cyan-500/10 rounded-xl px-4 py-3 text-sm outline-none">

            <option>All Constituencies</option>

            {[...new Set(
              candidates
                .filter(c => c.status === "ACTIVE")
                .map(c => c.constituency)
            )].map((constituency) => (

              <option key={constituency}>
                {constituency}
              </option>

            ))}

          </select>

            <select className="bg-[#0b1d35] border border-cyan-500/10 rounded-xl px-4 py-3 text-sm outline-none">

              <option>All Parties</option>

              {[...new Set(
                candidates
                  .filter(c => c.status === "ACTIVE")
                  .map(c => c.party)
              )].map((party) => (

                <option key={party}>
                  {party}
                </option>

              ))}

            </select>

          </div>

          {/* CANDIDATE GRID */}
          <div className="grid grid-cols-3 gap-6">
            {candidates.map((candidate) => (

 <div
  key={candidate.id}
  className="bg-[#0b1d35] border border-cyan-500/10 rounded-3xl overflow-hidden"
>

    <div className="p-5">

      <div className="flex items-center justify-between mb-5">

        <div
          className={`text-xs px-3 py-1 rounded-full ${
            candidate.status === "ACTIVE"
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-yellow-500/10 text-yellow-400"
          }`}
        >
          {candidate.status}
        </div>

        <div className="text-sm text-slate-400">
          {candidate.constituency}
        </div>

      </div>

      <div className="flex flex-col items-center text-center">

        <img
          src={candidate.photo}
          className="w-28 h-28 rounded-2xl object-cover mb-4"
        />

        <h2 className="text-2xl font-semibold mb-1">
          {candidate.name}
        </h2>

        <p className="text-cyan-400 mb-5">
          {candidate.party}
        </p>
        <img
        src={candidate.symbol}
        alt="Symbol"
        className="w-20 h-20 object-contain bg-white rounded-xl p-2"
      />
      {candidate.status === "PENDING" ? (

  <div className="flex justify-center gap-3 mt-6">

  <button
    onClick={() => approveCandidate(candidate.id)}
    className="bg-green-500 text-white w-24 py-2 rounded-lg"
  >
    Approve
  </button>

  <button
    onClick={() => rejectCandidate(candidate.id)}
    className="bg-red-500 text-white w-20 py-1 rounded-lg"
  >
    Reject
  </button>

</div>

) : (

  <button
  onClick={() => removeCandidate(candidate.id)}
  className="bg-red-500 text-white w-52 py-3 rounded-xl font-semibold mt-6"
>
  Remove
</button>

)}
      </div>

    </div>

  </div>

))}


        </div>

      </div>

      {showForm && (

        <div
  className="fixed inset-0 bg-black/50 flex items-center justify-center"
  onClick={() => setShowForm(false)}
>

          <div
  className="bg-white text-black p-6 rounded-xl w-[450px]"
  onClick={(e) => e.stopPropagation()}
>

            <h2 className="text-2xl font-bold mb-4">
              Add Candidate
            </h2>

            <input
              type="text"
              placeholder="Candidate Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2 mb-3"
            />

            <input
              type="text"
              placeholder="Party Name"
              value={party}
              onChange={(e) => setParty(e.target.value)}
              className="w-full border p-2 mb-3"
            />

            <input
              type="text"
              placeholder="Constituency"
              value={constituency}
              onChange={(e) => setConstituency(e.target.value)}
              className="w-full border p-2 mb-3"
            />

            <input
              type="text"
              placeholder="Photo URL"
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
              className="w-full border p-2 mb-3"
            />

            <input
              type="text"
              placeholder="Symbol URL"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full border p-2 mb-4"
            />

            <div className="flex justify-between mt-4">

  <button
    onClick={() => setShowForm(false)}
    className="bg-gray-500 text-white px-4 py-2 rounded"
  >
    Cancel
  </button>

  <button
    onClick={handleAddCandidate}
    className="bg-green-500 text-white px-4 py-2 rounded"
  >
    Approve Candidate
  </button>

</div>

          </div>

        </div>

      )}

    </div>

          </div>
  )
}

export default CandidateManagement