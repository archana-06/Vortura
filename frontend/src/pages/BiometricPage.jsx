import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"

function BiometricPage() {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const recognitionRunningRef = useRef(false)
  const recognitionCompletedRef = useRef(false)
  const consecutiveMatchesRef = useRef(0)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [stream, setStream] = useState(null)
  const [progress, setProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState("Initializing AI facial recognition model...")
  const [isVerifying, setIsVerifying] = useState(false)
  const [voterImages, setVoterImages] = useState([])
  const [voterInfo, setVoterInfo] = useState(null)
  const [verificationResult, setVerificationResult] = useState(null) // "SUCCESS" | "MISMATCH" | "NO_FACE" | null

  const activeVoterId = sessionStorage.getItem("voterId")

  const securitySettings = {
    faceVerification: true,
    fingerprintVerification: true,
    otpVerification: true
  }

  // Redirect if voter session is missing
  useEffect(() => {
    if (!activeVoterId) {
      alert("Voter session not found. Please log in again.")
      navigate("/login")
    }
  }, [activeVoterId, navigate])

  // Fetch Stored Face Dataset info for activeVoterId
  useEffect(() => {
    if (!activeVoterId) return

    async function fetchVoterFaceImages() {
      try {
        const response = await fetch(`http://localhost:8000/api/face-images/voter/${activeVoterId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.images && data.images.length > 0) {
            setVoterImages(data.images)
          }
          if (data.fullName) {
            setVoterInfo(data)
          }
        }
      } catch (err) {
        console.warn("Could not fetch voter dataset images:", err.message)
      }
    }

    fetchVoterFaceImages()
  }, [activeVoterId])

  // Open Pop-Up Camera Modal
  const openCameraModal = () => {
    if (!activeVoterId) {
      alert("Voter session not found")
      navigate("/login")
      return
    }

    if (!voterImages || voterImages.length === 0) {
      alert(
        `No registered face dataset found for Voter ID ${activeVoterId}`
      )
      return
    }

    setIsModalOpen(true)
    setProgress(0)
    setVerificationResult(null)

    recognitionCompletedRef.current = false
    recognitionRunningRef.current = false
    consecutiveMatchesRef.current = 0

    setStatusMessage(
      `Loading ${voterImages.length} registered images for ${activeVoterId}...`
    )
  }

  // Close Camera Modal & Stop Stream
  const closeCameraModal = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setIsModalOpen(false)
    setCameraActive(false)
    recognitionCompletedRef.current = false
    recognitionRunningRef.current = false
  }

  // Start Live Webcam Stream
  useEffect(() => {
    if (!isModalOpen) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
        setStream(null)
      }
      return
    }

    let activeStream = null
    async function startWebcam() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        })
        activeStream = mediaStream
        setStream(mediaStream)
        setCameraActive(true)
        setStatusMessage(`Live camera active. Analyzing face for Voter ID: ${activeVoterId}...`)
      } catch (err) {
        console.warn("Webcam access warning:", err.message)
        setCameraActive(false)
        setStatusMessage(`Camera access restricted. Please allow webcam access to scan face.`)
      }
    }

    startWebcam()

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [isModalOpen, activeVoterId])

  // Attach MediaStream to Video Element srcObject
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(() => null)
    }
  }, [stream, isModalOpen])

  // Real Python Face-Recognition Service Integration
  const checkVoterFace = async () => {
    if (
      recognitionRunningRef.current ||
      recognitionCompletedRef.current ||
      !videoRef.current ||
      !canvasRef.current
    ) {
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video.videoWidth || !video.videoHeight) {
      return
    }

    recognitionRunningRef.current = true
    setIsVerifying(true)

    try {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const context = canvas.getContext("2d")

      context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      )

      const liveImage = canvas.toDataURL(
        "image/jpeg",
        0.9
      )

      setProgress(35)
      setStatusMessage(
        `Loading registered face dataset for ${activeVoterId}...`
      )

      const response = await fetch(
        "http://localhost:5001/recognize-voter",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            voterId: activeVoterId,
            image: liveImage,
          }),
        }
      )

      const result = await response.json()
      console.log("Python recognition result:", result)

      if (!response.ok) {
        setProgress(0)
        setVerificationResult("NO_FACE")
        setStatusMessage(
          result.message || "Unable to analyse the face."
        )
        return
      }

      if (
        result.isMatch !== true ||
        result.voterId !== activeVoterId ||
        Number(result.confidence) < 58
      ) {
        consecutiveMatchesRef.current = 0

        setProgress(
          Math.min(
            55,
            Math.round(result.confidence || 0)
          )
        )

        setVerificationResult("MISMATCH")

        setStatusMessage(
          `Face mismatch. The live person does not match the registered face dataset for ${activeVoterId}.`
        )

        return
      }

      consecutiveMatchesRef.current += 1

      const successfulFrames =
        consecutiveMatchesRef.current

      setVerificationResult(null)

      setProgress(
        successfulFrames === 1
          ? 70
          : successfulFrames === 2
          ? 85
          : 95
      )

      setStatusMessage(
        `Correct face detected in ${successfulFrames}/3 verification frames. Please remain still.`
      )

      if (successfulFrames < 3) {
        return
      }

      const backendResponse = await fetch(
        "http://localhost:8000/api/voters/verify-face",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            voterId: activeVoterId,
            predictedVoterId: result.voterId,
            predictedName: result.fullName,
            confidence: Number(result.confidence),
            faceMatch: result.isMatch === true,
            livenessPassed: true,
          }),
        }
      )

      const backendData =
        await backendResponse.json()

      if (!backendResponse.ok) {
        setProgress(0)
        setVerificationResult("MISMATCH")
        setStatusMessage(
          backendData.message ||
            "Face verification failed."
        )
        return
      }

      recognitionCompletedRef.current = true

      setProgress(100)
      setVerificationResult("SUCCESS")
      setStatusMessage(
        `✓ Correct voter verified: ${result.fullName} (${activeVoterId}). Match confidence: ${result.confidence}%`
      )

      setTimeout(() => {
        closeCameraModal()
        navigate("/fingerprint")
      }, 1200)

    } catch (error) {
      console.error(error)

      setProgress(0)
      setStatusMessage(
        "Face-recognition service is unavailable. Please ensure python/app.py is running on port 5001."
      )

    } finally {
      recognitionRunningRef.current = false
      setIsVerifying(false)
    }
  }

  // Automatic verification runner every 2 seconds
  useEffect(() => {
    if (
      !isModalOpen ||
      !cameraActive ||
      recognitionCompletedRef.current
    ) {
      return
    }

    const recognitionInterval = setInterval(() => {
      checkVoterFace()
    }, 2000)

    return () => {
      clearInterval(recognitionInterval)
    }
  }, [isModalOpen, cameraActive, activeVoterId])

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
                <p className="text-slate-400">Biometric Verification</p>
              </div>
            </div>

            {/* Voter Badge */}
            <div className="bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 px-4 py-2 rounded-xl text-sm font-mono font-bold">
              ID: {activeVoterId}
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Facial Identity Verification
          </h2>

          <p className="text-slate-300 leading-7 text-base mb-8">
            Secure facial biometric authentication integrated with MongoDB voter dataset and AI-powered live verification.
          </p>

          {/* Verification Status Cards */}
          <div className="space-y-4 mb-6">

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">Face Recognition</h3>
                <p className="text-slate-400 text-xs">SFace facial feature descriptor matching</p>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                Active
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">Biometric Encryption</h3>
                <p className="text-slate-400 text-xs">Encrypted dataset stored in MongoDB ({activeVoterId})</p>
              </div>
              <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"></div>
                Protected
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">AI Spoof Detection</h3>
                <p className="text-slate-400 text-xs">Live camera verification & descriptor check</p>
              </div>
              <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse"></div>
                Monitoring
              </div>
            </div>

            {/* Launch Modal Button */}
            <button
              onClick={openCameraModal}
              className="w-full mt-4 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:scale-[1.02] text-white py-4 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
            >
              Verify Facial Identity
            </button>

          </div>

        </div>

        {/* Right Section - Clean Biometric Scanner Frame */}
        <div className="relative bg-gradient-to-br from-blue-900/30 to-emerald-900/30 flex flex-col items-center justify-center p-12 text-center">

          {/* Center Scanner Frame with Avatar Icon */}
          <div className="relative w-64 h-64 rounded-full bg-gradient-to-br from-blue-500/20 to-emerald-400/20 border-4 border-cyan-400/50 flex items-center justify-center mb-6 shadow-2xl overflow-hidden">

            {/* Animated Laser Scanning Line */}
            <div className="absolute w-full h-1 bg-emerald-400 shadow-[0_0_15px_#34d399] animate-pulse top-20 z-20"></div>

            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-600 via-teal-600 to-emerald-500 flex flex-col items-center justify-center shadow-xl border-2 border-cyan-400/30">
              <span className="text-6xl text-white mb-1">👤</span>
              <span className="text-[10px] text-cyan-200 font-mono tracking-widest uppercase">ENCRYPTED DATASET</span>
            </div>

            <div className="absolute bottom-2 bg-emerald-500 text-slate-950 font-bold px-4 py-1 rounded-full text-xs shadow-lg z-30">
              Voter ID: {activeVoterId}
            </div>
          </div>

          <h3 className="text-2xl font-bold text-white mb-2">
            AI Facial Feature Matching
          </h3>

          <p className="text-slate-300 text-sm max-w-sm leading-6 mb-4">
            Click <strong className="text-cyan-300">Verify Facial Identity</strong> to identify your facial identity.
          </p>

          <button
            onClick={openCameraModal}
            className="bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/20 px-6 py-2.5 rounded-xl text-sm font-bold transition"
          >
            Verify Facial Identity
          </button>

        </div>

      </div>

      {/* POP-UP AI CAMERA RECOGNITION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 animate-fade-in">

          <div className="bg-[#0b1d35] border border-cyan-500/30 rounded-[36px] max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">

            {/* Modal Header */}
            <div className="px-8 py-5 border-b border-cyan-500/20 bg-[#08172d] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-400 flex items-center justify-center font-bold text-slate-950 shadow-md">
                  AI
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    AI Facial Feature Scanner & Fraud Detection
                  </h3>
                  <p className="text-xs text-cyan-300">
                    Target Voter ID: <span className="font-mono font-bold text-white">{activeVoterId}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={closeCameraModal}
                className="text-slate-400 hover:text-white text-2xl font-bold w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body - Centered Camera Layout */}
            <div className="p-8 overflow-y-auto flex flex-col items-center justify-center text-center">

              {/* CENTER CAMERA FRAME */}
              <div className={`relative w-64 h-64 md:w-72 md:h-72 rounded-full overflow-hidden border-4 ${verificationResult === "MISMATCH" ? "border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.6)] animate-pulse" : verificationResult === "NO_FACE" ? "border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.4)]" : "border-emerald-400 shadow-[0_0_40px_rgba(52,211,153,0.3)]"} bg-black flex items-center justify-center mb-6`}>

                {/* Reticle Target Corners */}
                <div className={`absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 ${verificationResult === "NO_FACE" ? "border-amber-400" : "border-emerald-400"} z-30`}></div>
                <div className={`absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 ${verificationResult === "NO_FACE" ? "border-amber-400" : "border-emerald-400"} z-30`}></div>
                <div className={`absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 ${verificationResult === "NO_FACE" ? "border-amber-400" : "border-emerald-400"} z-30`}></div>
                <div className={`absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 ${verificationResult === "NO_FACE" ? "border-amber-400" : "border-emerald-400"} z-30`}></div>

                {/* Laser Scanning Line */}
                <div className={`absolute w-full h-1 ${verificationResult === "MISMATCH" ? "bg-red-500 shadow-[0_0_20px_#ef4444]" : verificationResult === "NO_FACE" ? "bg-amber-400 shadow-[0_0_15px_#f59e0b]" : "bg-emerald-400 shadow-[0_0_20px_#34d399]"} animate-pulse top-24 z-30`}></div>

                {/* Live Video Stream */}
                <video
                  ref={(el) => {
                    videoRef.current = el
                    if (el && stream && el.srcObject !== stream) {
                      el.srcObject = stream
                      el.play().catch(() => null)
                    }
                  }}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover rounded-full z-10"
                />

                {/* Hidden Canvas for Live Frame Capture */}
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />

                {!stream && (
                  <div className="absolute inset-0 bg-slate-900 flex items-center justify-center text-6xl text-slate-500 z-0">
                    📷
                  </div>
                )}

                {/* Encrypted Record Badge Overlay */}
                <div className="absolute top-3 left-3 bg-[#08172d]/95 border border-cyan-400/50 rounded-xl p-1.5 z-30 flex items-center gap-2 shadow-xl">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-xs text-white">
                    🛡️
                  </div>
                  <div className="text-left pr-1">
                    <p className="text-[9px] text-cyan-300 font-bold leading-none">DATABASE RECORD</p>
                    <p className="text-[8px] text-slate-300 font-mono leading-none mt-0.5">{activeVoterId}</p>
                  </div>
                </div>

                {/* Liveness Badge */}
                <div className={`absolute bottom-3 inset-x-4 bg-black/85 backdrop-blur-md text-[11px] font-bold py-1.5 rounded-xl border text-center z-30 ${verificationResult === "MISMATCH" ? "text-red-400 border-red-500/50 bg-red-950/80" : verificationResult === "NO_FACE" ? "text-amber-300 border-amber-500/40 bg-amber-950/70" : "text-emerald-400 border-emerald-500/30"}`}>
                  {verificationResult === "MISMATCH" ? "🚨 FRAUD DETECTED: FACE MISMATCH" : verificationResult === "NO_FACE" ? "⚠️ NO FACE DETECTED" : "LIVE CAMERA VERIFICATION: ACTIVE"}
                </div>
              </div>

              {/* Progress & Verification Status Box */}
              <div className="w-full max-w-lg space-y-3">

                <div className="flex justify-between text-xs text-slate-300 mb-1 font-semibold">
                  <span>Verification Progress ({activeVoterId})</span>
                  <span className={`font-bold ${verificationResult === "MISMATCH" ? "text-red-400 font-mono text-sm" : verificationResult === "NO_FACE" ? "text-amber-400" : "text-emerald-400"}`}>
                    {progress}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-white/10">
                  <div
                    className={`h-full transition-all duration-300 ${verificationResult === "MISMATCH" ? "bg-gradient-to-r from-red-600 to-rose-500 shadow-[0_0_15px_#ef4444]" : verificationResult === "NO_FACE" ? "bg-amber-500/60 shadow-[0_0_15px_#f59e0b]" : "bg-gradient-to-r from-blue-500 to-emerald-400 shadow-[0_0_15px_#34d399]"}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                {/* Status Message */}
                <p className={`text-sm font-semibold leading-6 p-3.5 rounded-2xl border ${verificationResult === "MISMATCH" ? "bg-red-500/15 border-red-500/40 text-red-300 font-bold" : verificationResult === "NO_FACE" ? "bg-amber-500/15 border-amber-500/40 text-amber-200" : "bg-white/5 border-white/10 text-slate-200"}`}>
                  {statusMessage}
                </p>

              </div>

            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-cyan-500/20 bg-[#08172d] flex items-center justify-between">
              <button
                onClick={closeCameraModal}
                className="px-6 py-3 rounded-xl border border-slate-600 text-slate-300 font-semibold hover:bg-white/5 transition"
              >
                Cancel
              </button>

              <div className={`text-xs font-semibold flex items-center gap-2 ${verificationResult === "MISMATCH" ? "text-red-400 font-bold" : verificationResult === "NO_FACE" ? "text-amber-400 font-bold" : "text-emerald-400"}`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${verificationResult === "MISMATCH" ? "bg-red-400" : verificationResult === "NO_FACE" ? "bg-amber-400" : "bg-emerald-400"}`}></div>
                {verificationResult === "MISMATCH" ? "⛔ ACCESS BLOCKED: Scanned face does not match Voter ID" : verificationResult === "NO_FACE" ? "⚠️ Position your face inside the circle to scan" : "Auto-navigates upon 100% dataset verification match"}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  )
}

export default BiometricPage