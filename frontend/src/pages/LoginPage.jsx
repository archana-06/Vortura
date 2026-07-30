import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"

function LoginPage() {
  const navigate = useNavigate()

  const [voterId, setVoterId] = useState("")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [electionStatus, setElectionStatus] = useState(null)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/voters/election-status")
        if (res.ok) {
          const data = await res.json()
          setElectionStatus(data)
        }
      } catch (err) {
        console.warn("Election status check error:", err)
      }
    }
    fetchStatus()

    const interval = setInterval(fetchStatus, 2000)
    return () => clearInterval(interval)
  }, [])

  const sendOTP = async () => {
    try {
      const statusRes = await fetch("http://localhost:8000/api/voters/election-status")
      if (statusRes.ok) {
        const latestStatus = await statusRes.json()
        setElectionStatus(latestStatus)
        if (latestStatus.isActive === false) {
          alert("Election is currently inactive or closed. OTP generation and voter login are disabled until an admin starts the election.")
          return
        }
      }
    } catch (e) {
      console.warn("Pre-OTP status check failed:", e)
    }

    const trimmedVoterId = voterId.trim().toUpperCase()
    const trimmedEmail = email.trim()

    if (!trimmedVoterId || !trimmedEmail) {
      alert("Please enter both Voter ID Number and Registered Email Address.")
      return
    }

    // Voter ID Format Validation: Must be 9 characters (2-3 letters followed by 6-7 digits)
    const voterIdRegex = /^[A-Z]{2,3}[0-9]{6,7}$/
    if (trimmedVoterId.length !== 9 || !voterIdRegex.test(trimmedVoterId)) {
      alert("Please enter a valid Voter ID")
      return
    }

    try {
      const response = await fetch(
        "http://localhost:8000/api/voters/generate-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            voterId: trimmedVoterId,
            email: trimmedEmail,
            mobileNumber: trimmedEmail,
          })
        }
      )
      const data = await response.json()

      if (response.ok) {
        setOtpSent(true)
        alert("OTP generated successfully")
      } else {
        setOtpSent(false)
        alert(data.message || "Unable to generate OTP. Please enter correct Voter ID.")
      }
    } catch (error) {
      console.error("sendOTP Error:", error)
      alert("Unable to connect to backend server at http://localhost:8000. Please make sure the backend server is running.")
    }
  }
const verifyOTP = async () => {
  const trimmedVoterId = voterId.trim().toUpperCase()

  try {
    const response = await fetch(
      "http://localhost:8000/api/voters/verify-otp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voterId: trimmedVoterId,
          otp: otp.trim(),
        }),
      }
    )

    const data = await response.json()
    alert(data.message)

    if (response.ok) {
      sessionStorage.setItem("voterId", trimmedVoterId)
      console.log("Navigating to biometric page for voter:", trimmedVoterId)
      navigate("/biometric")
    }
  } catch (error) {
    console.error("verifyOTP Error:", error)
  }
}
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 flex items-center justify-center px-6">

      <div className="grid md:grid-cols-2 bg-white rounded-[36px] overflow-hidden shadow-2xl max-w-6xl w-full">

        {/* Left Section */}
        <div className="p-14">

          {/* Logo */}
          <div className="flex items-center gap-4 mb-10">

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center shadow-lg">

              <span className="text-white text-2xl font-bold">
                V
              </span>

            </div>

            <div>

              <h1 className="text-3xl font-bold text-slate-900">
                Vortura
              </h1>

              <p className="text-slate-500">
                Secure Digital Voting Platform
              </p>

            </div>

          </div>

          {/* Heading */}
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Voter Authentication
          </h2>

          <p className="text-slate-500 mb-6 leading-7">
            Login securely using your Voter ID and registered
            email address to receive your OTP and access the blockchain voting platform.
          </p>

          {electionStatus && electionStatus.isActive === false && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-2xl flex items-center gap-3">
              <span className="text-2xl">🚨</span>
              <div>
                <p className="font-bold text-sm">VOTING SESSION CLOSED</p>
                <p className="text-xs text-red-600 mt-0.5">Election is currently inactive. OTP generation and voter authentication are disabled until an administrator starts the election.</p>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="space-y-6">

            {/* Voter ID */}
            <div>

              <label className="block text-slate-700 font-semibold mb-3">
                Voter ID Number
              </label>

              <input
                type="text"
                placeholder="Enter Voter ID"
                value={voterId}
                onChange={(e) => setVoterId(e.target.value)}
                className="w-full border border-slate-300 rounded-2xl px-5 py-4 outline-none focus:border-blue-500"
              />

            </div>

            {/* Email Address */}
            <div>

              <label className="block text-slate-700 font-semibold mb-3">
                Registered Email Address
              </label>

              <input
                type="email"
                placeholder="Enter Registered Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-2xl px-5 py-4 outline-none focus:border-blue-500"
              />

            </div>

            {/* OTP Button */}
            <button
              onClick={sendOTP}
              disabled={electionStatus && electionStatus.isActive === false}
              className={`w-full py-4 rounded-2xl font-semibold text-lg shadow-lg transition ${
                electionStatus && electionStatus.isActive === false
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-emerald-500 text-white hover:scale-[1.02]"
              }`}
            >
              {electionStatus && electionStatus.isActive === false ? "Voting Session Inactive" : "Send OTP"}
            </button>
            {otpSent && (

              <div className="mt-6">

                <label className="block text-slate-700 font-semibold mb-3">
                  Enter OTP
                </label>

                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full border border-slate-300 rounded-2xl px-5 py-4 outline-none focus:border-blue-500"
                />

                <button
                  onClick={verifyOTP}
                  className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:scale-[1.02] transition"
                >

                  Verify OTP

                </button>

              </div>

            )}

          </div>

        

        </div>

        {/* Right Section */}
        <div className="bg-gradient-to-br from-blue-600 to-emerald-500 p-14 flex flex-col justify-center text-white relative overflow-hidden">

          {/* Background Circles */}
          <div className="absolute w-72 h-72 bg-white/10 rounded-full top-[-80px] right-[-80px]"></div>

          <div className="absolute w-52 h-52 bg-white/10 rounded-full bottom-[-60px] left-[-60px]"></div>

          {/* Content */}
          <div className="relative z-10">

            <div className="w-32 h-32 rounded-full border-4 border-white mx-auto mb-10 flex items-center justify-center text-6xl bg-white/10 backdrop-blur-lg">

              🗳️

            </div>

            <h2 className="text-4xl font-bold text-center mb-6">
              Trusted Digital Elections
            </h2>

            <p className="text-center text-blue-100 leading-8 text-lg">

              Secure blockchain infrastructure with
              multi-layer biometric authentication and
              AI-powered fraud prevention for transparent voting.

            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-5 mt-12">

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 text-center">

                <h3 className="text-2xl font-bold">
                  99%
                </h3>

                <p className="text-sm text-blue-100">
                  Security
                </p>

              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 text-center">

                <h3 className="text-2xl font-bold">
                  AI
                </h3>

                <p className="text-sm text-blue-100">
                  Monitoring
                </p>

              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 text-center">

                <h3 className="text-2xl font-bold">
                  24/7
                </h3>

                <p className="text-sm text-blue-100">
                  Verification
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}

export default LoginPage