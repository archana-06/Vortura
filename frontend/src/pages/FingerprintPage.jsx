import { useNavigate } from "react-router-dom"
import API_BASE_URL from "../config/api"

function FingerprintPage() {
  const navigate = useNavigate()
  const activeVoterId = sessionStorage.getItem("voterId") || "TN2026001"

  const verifyFingerprint = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/voters/verify-fingerprint`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            voterId: activeVoterId,
            fingerprintMatch: true,
          }),
        }
      )

      const data = await response.json()
      alert(data.message)

      if (response.ok) {
        navigate("/geolocation")
      }
      console.log("Fingerprint Response:", data)
      console.log("Response OK:", response.ok)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center px-6 py-10">

      {/* MAIN CONTAINER */}
      <div className="grid md:grid-cols-2 bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[36px] overflow-hidden shadow-2xl max-w-6xl w-full">

        {/* Left Section */}
        <div className="p-12 text-white">

          {/* Logo & Voter Badge */}
          <div className="flex items-center justify-between gap-4 mb-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">V</span>
              </div>

              <div>
                <h1 className="text-3xl font-bold">Vortura</h1>
                <p className="text-slate-400">Fingerprint Authentication</p>
              </div>
            </div>

            {/* Voter Badge */}
            <div className="bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 px-4 py-2 rounded-xl text-sm font-mono font-bold">
              ID: {activeVoterId}
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Fingerprint Identity Verification
          </h2>

          <p className="text-slate-300 leading-7 text-base mb-8">
            Secure fingerprint authentication integrated with Aadhaar-linked biometric validation and AI-powered spoof detection.
          </p>

          {/* Verification Status Cards */}
          <div className="space-y-4 mb-6">

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">Fingerprint Scanner</h3>
                <p className="text-slate-400 text-xs">Sensor successfully connected</p>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                Active
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">Biometric Encryption</h3>
                <p className="text-slate-400 text-xs">Fingerprint data encrypted securely</p>
              </div>
              <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"></div>
                Protected
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">AI Spoof Detection</h3>
                <p className="text-slate-400 text-xs">Live fingerprint authenticity analysis</p>
              </div>
              <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse"></div>
                Monitoring
              </div>
            </div>

            {/* Launch Modal Button */}
            <button
              onClick={verifyFingerprint}
              className="w-full mt-4 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:scale-[1.02] text-white py-4 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
            >
              Verify Fingerprint
            </button>

          </div>

        </div>

        {/* Right Section - Clean Biometric Scanner Frame */}
        <div className="relative bg-gradient-to-br from-blue-900/30 to-emerald-900/30 flex flex-col items-center justify-center p-12 text-center">

          {/* Center Scanner Frame */}
          <div className="relative w-64 h-64 rounded-full bg-gradient-to-br from-blue-500/20 to-emerald-400/20 border-4 border-cyan-400/50 flex items-center justify-center mb-6 shadow-2xl overflow-hidden">

            {/* Animated Laser Scanning Line */}
            <div className="absolute w-full h-1 bg-emerald-400 shadow-[0_0_15px_#34d399] animate-pulse top-20 z-20"></div>

            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-600 via-teal-600 to-emerald-500 flex flex-col items-center justify-center shadow-xl border-2 border-cyan-400/30">
              <span className="text-6xl text-white mb-1">👆</span>
              <span className="text-[10px] text-cyan-200 font-mono tracking-widest uppercase">ENCRYPTED DATASET</span>
            </div>

            <div className="absolute bottom-2 bg-emerald-500 text-slate-950 font-bold px-4 py-1 rounded-full text-xs shadow-lg z-30">
              Voter ID: {activeVoterId}
            </div>
          </div>

          <h3 className="text-2xl font-bold text-white mb-2">
            AI Fingerprint Matching
          </h3>

          <p className="text-slate-300 text-sm max-w-sm leading-6 mb-4">
            Click <strong className="text-cyan-300">Verify Fingerprint</strong> to authenticate your biometric fingerprint pattern.
          </p>

          <button
            onClick={verifyFingerprint}
            className="bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/20 px-6 py-2.5 rounded-xl text-sm font-bold transition"
          >
            Verify Fingerprint
          </button>

        </div>

      </div>

    </div>
  )
}

export default FingerprintPage