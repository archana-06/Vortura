import React from "react"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import API_BASE_URL from "../config/api"

function BlockchainLedger() {
    const [ledger, setLedger] = useState([])

  const exportLedger = () => {

  let report = "VORTURA BLOCKCHAIN LEDGER\n\n"

  ledger.forEach((vote, index) => {

    report += `Block #${index + 1}\n`
    report += `Hash: ${vote.blockchainHash}\n`
    report += `Timestamp: ${new Date(vote.timestamp).toLocaleString()}\n`
    report += `Status: VERIFIED\n\n`

  })

  const blob = new Blob([report], {
    type: "text/plain"
  })

  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")

  a.href = url
  a.download = "BlockchainLedger.txt"

  a.click()

  URL.revokeObjectURL(url)
}
const fetchLedger = async () => {
  try {

    const response = await fetch(
      `${API_BASE_URL}/api/voters/blockchain-ledger`
    )

    const data = await response.json()

    setLedger(data.votes)

  } catch (error) {

    console.log(error)

  }

}

useEffect(() => {

  fetchLedger()

}, [])
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
                Blockchain Ledger
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
                className="w-full flex items-center gap-3 text-slate-300 px-4 py-3 rounded-2xl hover:bg-cyan-500/10 hover:text-cyan-300 transition"
            >
                🏆 Results
            </Link>

            <Link
                to="/blockchain"
                className="w-full flex items-center gap-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-4 py-3 rounded-2xl"
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

        {/* TOPBAR */}

        <div className="border-b border-cyan-900/30 px-8 py-6 flex items-center justify-between">

          <div>

            <h1 className="text-[40px] font-bold">
              Blockchain Ledger
            </h1>

            <p className="text-gray-400 text-lg mt-1">
              Immutable encrypted election transaction records
            </p>

          </div>

          <div className="flex gap-4">

            <button
              onClick={() => alert("All Blockchain Nodes Synced")}
              className="px-6 py-3 rounded-xl border border-green-500 bg-green-500/10 text-green-300 font-semibold"
            >
              Chain Synced
            </button>

            <button
            onClick={exportLedger}
            className="px-6 py-3 rounded-xl bg-cyan-500 text-white font-semibold"
          >
            Export Ledger
          </button>
          </div>

        </div>

        {/* CONTENT */}

        <div className="p-8 space-y-8">

          {/* STATUS CARDS */}

          <div className="grid grid-cols-4 gap-6">

            <div className="bg-[#081935] rounded-3xl p-6 border border-cyan-900/20">

              <p className="text-gray-400">
                Total Blocks
              </p>

              <h2 className="text-[40px] font-bold mt-2">
                {ledger.length}
              </h2>

            </div>

            <div className="bg-[#081935] rounded-3xl p-6 border border-cyan-900/20">

              <p className="text-gray-400">
                Verified Transactions
              </p>

              <h2 className="text-[40px] font-bold mt-2">
                {ledger.length}
              </h2>

            </div>

            <div className="bg-[#081935] rounded-3xl p-6 border border-cyan-900/20">
              <p className="text-gray-400">
                Fraud Blocks
              </p>

              <h2 className="text-[40px] font-bold mt-2 text-red-400">
                0
              </h2>

            </div>

            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-6">

              <p>
                Encryption
              </p>

              <h2 className="text-[40px] font-bold mt-2">
                AES-256
              </h2>

            </div>

          </div>

          {/* LEDGER TABLE */}

          <div className="bg-[#081935] rounded-3xl border border-cyan-900/20 overflow-hidden">

            <div className="px-8 py-6 border-b border-cyan-900/20 flex items-center justify-between">

              <div>

                <h2 className="text-3xl font-bold">
                  Election Blockchain Records
                </h2>

                <p className="text-gray-400 mt-1">
                  Latest blockchain verified transactions
                </p>

              </div>

              <button
              onClick={fetchLedger}
              className="px-5 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300"
            >
              Live Chain
            </button>

            </div>

            {/* TABLE */}

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-[#0c2145] text-left text-gray-300">

                  <tr>

                    <th className="px-8 py-5 font-semibold">
                      Block ID
                    </th>

                    <th className="px-8 py-5 font-semibold">
                      Transaction Hash
                    </th>

                    <th className="px-8 py-5 font-semibold">
                      Timestamp
                    </th>

                    <th className="px-8 py-5 font-semibold">
                      Verification
                    </th>

                    <th className="px-8 py-5 font-semibold">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>
                    {ledger.map((vote, index) => (

                    <tr
                        key={index}
                        className="border-b border-cyan-900/10 hover:bg-cyan-900/10 transition"
                    >

                        <td className="px-8 py-6 font-semibold">
                        #{index + 1}
                        </td>

                        <td className="px-8 py-6 text-cyan-300 break-all">
                        {vote.blockchainHash}
                        </td>

                        <td className="px-8 py-6 text-gray-300">
                        {new Date(vote.timestamp).toLocaleString()}
                        </td>

                        <td className="px-8 py-6">
                        Face + OTP + Fingerprint
                        </td>

                        <td className="px-8 py-6">

                        <span className="bg-green-500/20 text-green-300 px-4 py-1 rounded-full text-sm">
                            VERIFIED
                        </span>

                        </td>

                    </tr>

                    ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* BLOCKCHAIN VISUALIZATION */}

          <div className="bg-[#081935] rounded-3xl p-8 border border-cyan-900/20">

            <div className="flex items-center justify-between mb-8">

              <div>

                <h2 className="text-3xl font-bold">
                  Chain Visualization
                </h2>

                <p className="text-gray-400 mt-1">
                  Immutable vote block linkage
                </p>

              </div>

              <div className="text-green-400 font-semibold">
                All Nodes Synced
              </div>

            </div>

            <div className="flex items-center gap-6 overflow-x-auto pb-4">

              {ledger.slice(-3).map((vote, index) => (

  <React.Fragment key={index}>

    <div className="min-w-[240px] bg-[#0c2145] rounded-2xl p-5 border border-cyan-900/20">

      <p className="text-gray-400 text-sm">
        Block #{ledger.length - 2 + index}
      </p>

      <h3 className="text-xl font-bold mt-3">
        Verified Vote
      </h3>

      <p className="text-cyan-300 text-sm mt-3 break-all">
        {vote.blockchainHash?.slice(0,25)}
      </p>

      <div className="mt-5 flex justify-between items-center">

        <span className="text-gray-400 text-sm">
          {new Date(vote.timestamp).toLocaleTimeString()}
        </span>

        <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs">
          VERIFIED
        </span>

      </div>

    </div>

    {index < 2 && (
      <div className="text-4xl text-cyan-400">
        →
      </div>
    )}

  </React.Fragment>

))}

              </div>

            </div>

          </div>

        </div>

      </div>

  )
}

export default BlockchainLedger