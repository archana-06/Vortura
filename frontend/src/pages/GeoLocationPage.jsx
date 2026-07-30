import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"

const surveyedLocations = [
  {
    id: "chennai_south",
    name: "Chennai South - Polling Station #12",
    latitude: 13.0827,
    longitude: 80.2707,
    allowedRadius: 500,
    constituency: "Chennai South"
  },
  {
    id: "chennai_central",
    name: "Chennai Central - Polling Station #04",
    latitude: 13.0839,
    longitude: 80.2700,
    allowedRadius: 500,
    constituency: "Chennai Central"
  },
  {
    id: "coimbatore_north",
    name: "Coimbatore North - Polling Station #15",
    latitude: 11.0168,
    longitude: 76.9558,
    allowedRadius: 500,
    constituency: "Coimbatore North"
  },
  {
    id: "madurai_urban",
    name: "Madurai Urban - Polling Station #08",
    latitude: 9.9252,
    longitude: 78.1198,
    allowedRadius: 500,
    constituency: "Madurai Urban"
  },
  {
    id: "salem_west",
    name: "Salem West - Polling Station #21",
    latitude: 11.6643,
    longitude: 78.1460,
    allowedRadius: 500,
    constituency: "Salem West"
  }
]

function GeoLocationPage() {
  const navigate = useNavigate()

  const [markedLocation, setMarkedLocation] = useState({
    latitude: 13.0827,
    longitude: 80.2707,
    pollingStation: "Marked Dataset Location",
    allowedRadius: 1000
  })
  const [isScanning, setIsScanning] = useState(false)
  const [liveLocation, setLiveLocation] = useState(null)
  const [verificationResult, setVerificationResult] = useState(null) // null | "SUCCESS" | "MISMATCH"
  const [resultDetails, setResultDetails] = useState(null)
  const [errorMessage, setErrorMessage] = useState("")

  // Location edit modal state
  const [showLocationPickerModal, setShowLocationPickerModal] = useState(false)
  const [tempLat, setTempLat] = useState("13.0827")
  const [tempLng, setTempLng] = useState("80.2707")
  const [tempStation, setTempStation] = useState("Marked Dataset Location")
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false)

  const activeVoterId = sessionStorage.getItem("voterId")

  useEffect(() => {
    if (!activeVoterId) {
      alert("Voter session not found. Please log in again.")
      navigate("/login")
      return
    }

    const fetchLocationInfo = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/voters/location-info/${activeVoterId}`
        )

        const data = await response.json()

        console.log(
          "Location information from MongoDB:",
          data
        )

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load registered location"
          )
        }

        const latitude =
          Number(data.assignedLatitude)

        const longitude =
          Number(data.assignedLongitude)

        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude)
        ) {
          throw new Error(
            "Registered coordinates are missing"
          )
        }

        const pollingStation =
          data.assignedPollingStation ||
          "Registered Dataset Location"

        const allowedRadius =
          Number(data.allowedRadiusMeters) || 1000

        setMarkedLocation({
          latitude,
          longitude,
          pollingStation,
          allowedRadius,
        })

        setTempLat(String(latitude))
        setTempLng(String(longitude))
        setTempStation(pollingStation)

        // Keep browser cache synchronised with MongoDB
        sessionStorage.setItem(
          "markedLat",
          String(latitude)
        )

        sessionStorage.setItem(
          "markedLng",
          String(longitude)
        )

        sessionStorage.setItem(
          "markedStation",
          pollingStation
        )

      } catch (error) {
        console.error(
          "Location loading error:",
          error
        )

        setErrorMessage(error.message)
      }
    }

    fetchLocationInfo()
  }, [activeVoterId, navigate])

  // Save updated registered location from GeoLocationPage
  const handleSaveLocationUpdate = async () => {
    setIsUpdatingLocation(true)
    try {
      const response = await fetch("http://localhost:8000/api/voters/update-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voterId: activeVoterId,
          latitude: Number(tempLat),
          longitude: Number(tempLng),
          pollingStation: tempStation,
          allowedRadiusMeters: 1000,
        })
      })

      const data = await response.json()
      setIsUpdatingLocation(false)

      if (response.ok) {
        setMarkedLocation({
          latitude: Number(tempLat),
          longitude: Number(tempLng),
          pollingStation: tempStation,
          allowedRadius: 1000
        })

        sessionStorage.setItem("markedLat", String(tempLat))
        sessionStorage.setItem("markedLng", String(tempLng))
        sessionStorage.setItem("markedStation", String(tempStation))

        setShowLocationPickerModal(false)
        setVerificationResult(null)
      } else {
        alert(data.message || "Failed to update marked location.")
      }
    } catch (err) {
      setIsUpdatingLocation(false)
      alert("Error updating location: " + err.message)
    }
  }

  // Send coordinates to backend verification endpoint
  const verifyCoordinates = async (latitude, longitude) => {
    setIsScanning(true)
    setErrorMessage("")
    setVerificationResult(null)

    try {
      const response = await fetch("http://localhost:8000/api/voters/verify-geolocation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voterId: activeVoterId,
          liveLatitude: latitude,
          liveLongitude: longitude
        })
      })

      const data = await response.json()
      setIsScanning(false)
      setResultDetails(data)

      if (response.ok && data.verified) {
        setVerificationResult("SUCCESS")
      } else {
        setVerificationResult("MISMATCH")
        setErrorMessage(data.message || "Location Mismatch: You are outside your registered 1 km dataset location boundary.")
      }
    } catch (err) {
      setIsScanning(false)
      setVerificationResult("MISMATCH")
      setErrorMessage("Failed to connect to backend verification server.")
    }
  }

  // Handle Live Browser GPS Scan
  const handleLiveScan = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.")
      return
    }

    setIsScanning(true)
    setErrorMessage("")
    setVerificationResult(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setLiveLocation({ latitude, longitude })
        verifyCoordinates(latitude, longitude)
      },
      (error) => {
        setIsScanning(false)
        setVerificationResult("MISMATCH")
        setErrorMessage("Browser GPS location access was denied or unavailable. Please grant location permissions or use simulated location.")
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // Handle Simulation (Inside Polling Station)
  const handleSimulateValid = () => {
    const lat = markedLocation.latitude
    const lng = markedLocation.longitude
    setLiveLocation({ latitude: lat, longitude: lng })
    verifyCoordinates(lat, lng)
  }

  // Handle Simulation (Location Mismatch - 4.2 km Away)
  const handleSimulateMismatch = () => {
    const lat = Number(markedLocation.latitude) + 0.035
    const lng = Number(markedLocation.longitude) - 0.025
    setLiveLocation({ latitude: lat, longitude: lng })
    verifyCoordinates(lat, lng)
  }

  return (
    <div className="min-h-screen bg-[#061122] text-white flex flex-col justify-between p-8 font-sans">

      {/* HEADER NAVBAR */}
      <div className="flex items-center justify-between border-b border-cyan-500/10 pb-6">

        <div className="flex items-center gap-4">

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center font-bold text-xl shadow-lg shadow-cyan-500/20">
            V
          </div>

          <div>

            <h1 className="text-2xl font-bold tracking-tight">
              Geo-Location Verification
            </h1>

            <p className="text-sm text-slate-400">
              Face Dataset Marked Location Validation for Voter ID: <span className="text-cyan-400 font-mono font-semibold">{activeVoterId}</span>
            </p>

          </div>

        </div>

        <div className="flex items-center gap-4">

          <div className="flex items-center gap-2 bg-[#0b1d35] border border-cyan-500/20 px-4 py-2 rounded-xl text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {markedLocation.allowedRadius / 1000} km GPS Radius Active
          </div>

          <button
            onClick={() => {
              sessionStorage.clear()
              navigate("/login")
            }}
            className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition px-4 py-2 rounded-xl text-sm font-medium"
          >
            Logout
          </button>

        </div>

      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-6xl w-full mx-auto my-8 grid lg:grid-cols-12 gap-8 items-start">

        {/* LEFT COLUMN: SURVEYED LOCATION & INSTRUCTIONS */}
        <div className="lg:col-span-5 space-y-6">

          {/* CARD: MARKED DATASET LOCATION */}
          <div className="bg-[#0b1d35] border border-cyan-500/15 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                Marked Dataset Location
              </span>
              <span className="text-2xl">📍</span>
            </div>

            <h3 className="text-xl font-bold text-white mb-1">
              Dataset Registered Location
            </h3>
            <p className="text-xs font-semibold text-cyan-300 mb-4">
              📍 {markedLocation.pollingStation || "Marked Dataset Location"}
            </p>

            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Voters must be within <span className="text-emerald-400 font-semibold">{markedLocation.allowedRadius} meters</span> radius of the location marked during face dataset loading to authenticate vote casting.
            </p>

            <div className="space-y-3 bg-[#08172d] border border-cyan-500/10 rounded-2xl p-4 text-xs font-mono mb-4">
              <div className="flex justify-between border-b border-slate-700/50 pb-2">
                <span className="text-slate-400">Marked Latitude:</span>
                <span className="text-cyan-300 font-bold">{markedLocation.latitude}° N</span>
              </div>
              <div className="flex justify-between border-b border-slate-700/50 pb-2">
                <span className="text-slate-400">Marked Longitude:</span>
                <span className="text-cyan-300 font-bold">{markedLocation.longitude}° E</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Allowed Radius:</span>
                <span className="text-emerald-400 font-bold">{markedLocation.allowedRadius} meters max</span>
              </div>
            </div>

            {/* BUTTON TO OPEN LOCATION PICKER MODAL */}
            <button
              onClick={() => setShowLocationPickerModal(true)}
              className="w-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2"
            >
              <span>🔍</span> Search / Change Registered Location Map
            </button>
          </div>

          {/* ACTIONS CARD */}
          <div className="bg-[#0b1d35] border border-cyan-500/15 rounded-3xl p-6 shadow-xl space-y-4">
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Authentication Actions
            </h4>

            {/* LIVE GPS SCAN */}
            <button
              onClick={handleLiveScan}
              disabled={isScanning}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-cyan-500/20 hover:scale-[1.01] transition flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <span className="text-xl">📍</span>
              {isScanning ? "Scanning Device Location..." : "Verify Live Device Location"}
            </button>

            {/* SIMULATION CONTROLS FOR DEMO & TESTING */}
            <div className="pt-4 border-t border-slate-700/50 space-y-2">
              <p className="text-xs text-slate-400 mb-3 font-medium">
                Simulation & Demo Controls:
              </p>

              <button
                onClick={handleSimulateValid}
                disabled={isScanning}
                className="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 py-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2"
              >
                <span>✅</span> Simulate Marked Location GPS (0m Away - PASS)
              </button>

              <button
                onClick={handleSimulateMismatch}
                disabled={isScanning}
                className="w-full bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 py-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2"
              >
                <span>🚨</span> Simulate Location Mismatch (4.2 km Away - BLOCK)
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: RADAR VISUAL & VERIFICATION RESULTS */}
        <div className="lg:col-span-7 space-y-6">

          {/* RADAR / GPS SCANNER FRAME */}
          <div className="bg-[#0b1d35] border border-cyan-500/15 rounded-3xl p-8 shadow-xl flex flex-col items-center justify-center min-h-[380px] relative overflow-hidden">

            {/* RADAR ANIMATION CONTAINER */}
            <div className="relative w-64 h-64 flex items-center justify-center mb-6">

              {/* Pulsing Concentric Rings */}
              <div className={`absolute inset-0 rounded-full border-2 border-cyan-500/20 ${isScanning ? "animate-ping opacity-30" : ""}`}></div>
              <div className="absolute w-48 h-48 rounded-full border border-cyan-500/30"></div>
              <div className="absolute w-32 h-32 rounded-full border border-cyan-500/40"></div>

              {/* Radar Sweeper */}
              {isScanning && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/40 via-blue-500/20 to-transparent opacity-40 animate-spin"></div>
              )}

              {/* Center Location Pin Badge */}
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-3xl shadow-2xl transition-all duration-500 z-10 ${
                verificationResult === "SUCCESS"
                  ? "bg-emerald-500 text-white shadow-emerald-500/50 scale-110"
                  : verificationResult === "MISMATCH"
                  ? "bg-red-500 text-white shadow-red-500/50 scale-110 animate-bounce"
                  : "bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-cyan-500/30"
              }`}>
                {verificationResult === "SUCCESS" ? "✓" : verificationResult === "MISMATCH" ? "✕" : "📍"}
              </div>

            </div>

            {/* STATUS DISPLAY TEXT */}
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold tracking-tight">
                {isScanning
                  ? "Calculating Distance to Polling Boundary..."
                  : verificationResult === "SUCCESS"
                  ? "Geo-Location Verified"
                  : verificationResult === "MISMATCH"
                  ? "Location Mismatch Detected"
                  : "Ready for Geo-Location Scan"}
              </h3>

              <p className="text-sm text-slate-400 max-w-md mx-auto">
                {verificationResult === "SUCCESS"
                  ? resultDetails?.message
                  : verificationResult === "MISMATCH"
                  ? errorMessage
                  : "Click the scan button to calculate your live GPS distance against your registered polling station."}
              </p>
            </div>

          </div>

          {/* VERIFICATION DETAILS CARD */}
          {verificationResult && resultDetails && (
            <div className={`border rounded-3xl p-6 shadow-xl transition-all duration-500 ${
              verificationResult === "SUCCESS"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-red-500/10 border-red-500/30 text-red-300"
            }`}>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{verificationResult === "SUCCESS" ? "🟢" : "🔴"}</span>
                  <div>
                    <h4 className="font-bold text-lg leading-tight">
                      {verificationResult === "SUCCESS" ? "Boundary Verification Passed" : "Location Mismatch Blocked"}
                    </h4>
                    <p className="text-xs opacity-80 mt-0.5">
                      {verificationResult === "SUCCESS" ? "You are within the allowable polling station boundary." : "Vote casting has been locked due to location anomaly."}
                    </p>
                  </div>
                </div>

                <span className="text-2xl font-extrabold font-mono">
                  {resultDetails.distanceMeters}m
                </span>
              </div>

              {/* DISTANCE METER PROGRESS BAR */}
              <div className="w-full bg-slate-800 rounded-full h-3 mb-6 overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all duration-1000 ${
                    verificationResult === "SUCCESS" ? "bg-emerald-400" : "bg-red-500"
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(5, (resultDetails.distanceMeters / (resultDetails.allowedRadiusMeters || 500)) * 100))}%`
                  }}
                ></div>
              </div>

              {/* ACTION BUTTON */}
              {verificationResult === "SUCCESS" ? (
                <button
                  onClick={() => navigate("/voting-dashboard")}
                  className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/30 hover:scale-[1.01] transition flex items-center justify-center gap-2"
                >
                  Proceed to Cast Vote 🗳️
                </button>
              ) : (
                <div className="bg-red-500/20 border border-red-500/40 rounded-2xl p-4 text-center">
                  <p className="text-xs font-semibold text-red-200 uppercase tracking-wider">
                    🚫 Vote Casting Strictly Prohibited
                  </p>
                  <p className="text-xs text-red-300 mt-1">
                    An audit log entry has been generated for location mismatch.
                  </p>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* LOCATION PICKER SEARCH & MAP MODAL OVERLAY */}
      {showLocationPickerModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#08172d] border border-cyan-500/30 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">
                  🔍 Search & Change Registered Location
                </h3>
                <p className="text-xs text-slate-400">
                  Search location name (e.g. Saveetha Medical College) or click on the interactive map.
                </p>
              </div>
              <button
                onClick={() => setShowLocationPickerModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <LocationPicker
              latitude={tempLat}
              longitude={tempLng}
              onLocationChange={(loc) => {
                setTempLat(loc.latitude)
                setTempLng(loc.longitude)
                if (loc.pollingStation) setTempStation(loc.pollingStation)
              }}
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowLocationPickerModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-4 py-2.5 rounded-xl font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveLocationUpdate}
                disabled={isUpdatingLocation}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs px-6 py-2.5 rounded-xl font-bold shadow-lg transition disabled:opacity-50"
              >
                {isUpdatingLocation ? "Updating..." : "Save & Set Registered Location"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="text-center text-xs text-slate-500 border-t border-cyan-500/10 pt-6">
        Vortura Geo-Location Verification Module • Haversine Boundary Validation • Encrypted Audit Trail
      </div>

    </div>
  )
}

export default GeoLocationPage
