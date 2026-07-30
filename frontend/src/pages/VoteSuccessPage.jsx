import { useNavigate } from "react-router-dom"
function VoteSuccessPage() {

  const navigate = useNavigate()
  const receiptId =
  "VR-" +
  Math.floor(Math.random() * 100000)

const hash =
  "0x" +
  Math.random()
    .toString(16)
    .substring(2, 34)
    .toUpperCase()

  const downloadReceipt = () => {

const receipt = `
VORTURA BLOCKCHAIN RECEIPT

Receipt ID: ${receiptId}

Blockchain Hash:
${hash}

Status: Vote Successfully Recorded

Timestamp:
${new Date().toLocaleString()}
`

    const blob = new Blob(
      [receipt],
      { type: "text/plain" }
    )

    const link =
      document.createElement("a")

    link.href =
      URL.createObjectURL(blob)

    link.download =
      "VoteReceipt.txt"

    link.click()

  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center px-6 py-10">

      <div className="grid lg:grid-cols-2 gap-8 max-w-7xl w-full">

        {/* Left Section */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[36px] p-12 text-white relative overflow-hidden">

          {/* Glow */}
          <div className="absolute w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl top-[-100px] left-[-100px]"></div>

          {/* Content */}
          <div className="relative z-10">

            {/* Success Icon */}
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-6xl shadow-2xl mb-10 animate-pulse">

              ✓

            </div>

            {/* Heading */}
            <h1 className="text-5xl font-bold leading-tight mb-6">

              Vote Successfully Recorded

            </h1>

            <p className="text-slate-300 text-lg leading-8 mb-10 max-w-xl">

              Your vote has been securely encrypted,
              verified through AI authentication,
              and permanently stored in the blockchain ledger.

            </p>

            {/* Verification Timeline */}
            <div className="space-y-6">

              {/* Step */}
              <div className="flex items-start gap-5">

                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold">

                  ✓

                </div>

                <div>

                  <h3 className="text-xl font-bold mb-1">
                    Voter Identity Verified
                  </h3>

                  <p className="text-slate-400">
                    Multi-modal biometric verification completed.
                  </p>

                </div>

              </div>

              {/* Step */}
              <div className="flex items-start gap-5">

                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">

                  ✓

                </div>

                <div>

                  <h3 className="text-xl font-bold mb-1">
                    AI Fraud Detection Passed
                  </h3>

                  <p className="text-slate-400">
                    No spoofing or suspicious activity detected.
                  </p>

                </div>

              </div>

              {/* Step */}
              <div className="flex items-start gap-5">

                <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center font-bold">

                  ✓

                </div>

                <div>

                  <h3 className="text-xl font-bold mb-1">
                    Blockchain Transaction Confirmed
                  </h3>

                  <p className="text-slate-400">
                    Vote permanently stored in blockchain ledger.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Right Section */}
        <div className="bg-white rounded-[36px] p-12 shadow-2xl relative overflow-hidden">

          {/* Background */}
          <div className="absolute w-80 h-80 bg-blue-100 rounded-full blur-3xl top-[-100px] right-[-100px] opacity-50"></div>

          {/* Content */}
          <div className="relative z-10">

            {/* Header */}
            <div className="flex items-center justify-between mb-10">

              <div>

                <h2 className="text-4xl font-bold text-slate-900">
                  Blockchain Receipt
                </h2>

                <p className="text-slate-500 mt-2">
                  Encrypted voting confirmation
                </p>

              </div>

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center shadow-lg">

                <span className="text-white text-2xl font-bold">
                  V
                </span>

              </div>

            </div>

            {/* Receipt Card */}
            <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-200">

              {/* Receipt Fields */}
              <div className="space-y-6">

                {/* Receipt ID */}
                <div>

                  <p className="text-slate-500 mb-2">
                    Receipt ID
                  </p>

                  <h3 className="text-xl font-bold text-slate-900 font-mono">

                    VR-4589-ABX21

                  </h3>

                </div>

                {/* Transaction Hash */}
                <div>

                  <p className="text-slate-500 mb-2">
                    Blockchain Transaction Hash
                  </p>

                  <h3 className="text-sm font-bold text-slate-900 font-mono break-all leading-7">

                    0xA84F92BC7D19E32FF1A2C7D92AB71EF32C

                  </h3>

                </div>

                {/* Block Number */}
                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-slate-500 mb-2">
                      Block Number
                    </p>

                    <h3 className="text-xl font-bold text-slate-900">

                      #102458

                    </h3>

                  </div>

                  <div>

                    <p className="text-slate-500 mb-2">
                      Timestamp
                    </p>

                    <h3 className="text-xl font-bold text-slate-900">

                      10:42 AM

                    </h3>

                  </div>

                </div>

                {/* Encryption */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex items-center justify-between">

                  <div>

                    <h3 className="font-bold text-emerald-700 mb-1">
                      Encryption Status
                    </h3>

                    <p className="text-emerald-600 text-sm">
                      End-to-end vote encryption active
                    </p>

                  </div>

                  <div className="flex items-center gap-2 text-emerald-600 font-semibold">

                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>

                    Secure

                  </div>

                </div>

              </div>

            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-5 mt-8">

              <button
                onClick={downloadReceipt}
                className="bg-gradient-to-r from-blue-600 to-emerald-500 text-white py-4 rounded-2xl font-semibold shadow-lg hover:scale-[1.02] transition"
              >

                Download Receipt

              </button>

              <button
                onClick={() => navigate("/")}
                className="flex-1 border border-slate-300 rounded-2xl py-4 font-semibold text-lg hover:bg-slate-100 transition"
              >

                Return Home

              </button>

            </div>

            {/* Footer */}
            <p className="text-center text-slate-500 mt-8 leading-7">

              Your vote remains anonymous while
              ensuring complete transparency and
              tamper-proof election integrity.

            </p>

          </div>

        </div>

      </div>

    </div>
  )
}

export default VoteSuccessPage