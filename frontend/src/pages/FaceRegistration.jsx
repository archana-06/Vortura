import { useState } from "react"
import { useNavigate } from "react-router-dom"
import LocationPicker from "../components/LocationPicker"

function FaceRegistration() {
    const navigate = useNavigate()
    const [voterId, setVoterId] = useState(sessionStorage.getItem("voterId") || "TN2026001")
    const [images, setImages] = useState([])
    const [latitude, setLatitude] = useState("13.0827")
    const [longitude, setLongitude] = useState("80.2707")
    const [pollingStation, setPollingStation] = useState("Chennai South")
    const [uploading, setUploading] = useState(false)
    const [message, setMessage] = useState("")

    const handleFiles = (event) => {
        const selected = Array.from(event.target.files)

        if (selected.length === 0) {
            setImages([])
            return
        }

        if (selected.length > 5) {
            alert("Please select up to 5 images maximum")
            setImages(selected.slice(0, 5))
            return
        }

        setImages(selected)
        setMessage("")
    }

    const uploadImages = async () => {
        if (!voterId.trim()) {
            alert("Please enter a valid Voter ID (e.g. TN2026001)")
            return
        }

        if (images.length === 0) {
            alert("Please select at least 1 image file to upload")
            return
        }

        const formData = new FormData()
        formData.append("latitude", latitude)
        formData.append("longitude", longitude)
        formData.append("pollingStation", pollingStation || "Marked Dataset Location")

        images.forEach((image) => {
            formData.append("faceImages", image)
        })

        setUploading(true)
        setMessage("Saving face dataset & marking voter location into database...")

        try {
            const parseJsonResponse = async (res) => {
                const text = await res.text()
                try {
                    return JSON.parse(text)
                } catch (e) {
                    throw new Error(`Server returned HTML error (${res.status}): ${text.substring(0, 100)}...`)
                }
            }

            // STEP 1: Upload face images
            const faceResponse = await fetch(
                `http://localhost:8000/api/face-images/upload/${voterId.trim()}`,
                {
                    method: "POST",
                    body: formData,
                }
            )

            const faceData = await parseJsonResponse(faceResponse)

            if (!faceResponse.ok) {
                throw new Error(faceData.message || "Unable to upload face dataset")
            }

            // STEP 2: Save marked location to MongoDB
            const locationResponse = await fetch(
                "http://localhost:8000/api/voters/update-location",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        voterId: voterId.trim(),
                        latitude: Number(latitude),
                        longitude: Number(longitude),
                        pollingStation: pollingStation || "Registered Dataset Location",
                        allowedRadiusMeters: 1000,
                    }),
                }
            )

            const locationData = await parseJsonResponse(locationResponse)

            if (!locationResponse.ok) {
                throw new Error(
                    locationData.message || "Face images uploaded, but registered location was not saved."
                )
            }

            console.log("Saved registered location:", locationData)

            sessionStorage.setItem("voterId", voterId.trim())
            sessionStorage.setItem("markedLat", String(locationData.assignedLatitude))
            sessionStorage.setItem("markedLng", String(locationData.assignedLongitude))
            sessionStorage.setItem("markedStation", locationData.assignedPollingStation)

            setMessage(`✅ Successfully saved face dataset & registered location "${locationData.assignedPollingStation}" (${locationData.assignedLatitude}, ${locationData.assignedLongitude}) into MongoDB for Voter ID '${voterId.trim()}'!`)
            setImages([])

        } catch (error) {
            console.error(error)
            setMessage(`🚨 Registration Error: ${error.message}`)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">

            <div className="w-full max-w-3xl bg-[#08172d] border border-cyan-500/30 rounded-3xl p-8 shadow-2xl space-y-6">

                <div className="flex items-center justify-between mb-2">
                    <div>
                        <div className="inline-block bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 px-3 py-1 rounded-lg text-xs font-mono font-bold mb-2">
                            ELECTION ADMIN CONTROL CONSOLE
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-1">
                            Voter Biometric Dataset Setup
                        </h1>
                        <p className="text-slate-400 text-sm">
                            Pre-register official face reference dataset photos & mark voter location into MongoDB prior to voting.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/admin-dashboard")}
                        className="bg-white/5 border border-white/10 hover:bg-white/10 text-cyan-300 text-xs px-4 py-2 rounded-xl transition"
                    >
                        ← Admin Dashboard
                    </button>
                </div>

                <div>
                    <label className="block font-semibold mb-2 text-sm text-cyan-300">
                        Voter ID (Official Registry Record)
                    </label>

                    <input
                        value={voterId}
                        onChange={(event) => setVoterId(event.target.value.toUpperCase())}
                        placeholder="TN2026001"
                        className="w-full bg-slate-900 border border-cyan-500/30 rounded-xl px-4 py-3 font-mono font-bold text-white focus:outline-none focus:border-cyan-400"
                    />
                </div>

                {/* INTERACTIVE LOCATION PICKER WITH GEOCODING SEARCH & LEAFLET MAP */}
                <div className="bg-slate-900/60 border border-cyan-500/20 rounded-2xl p-5">
                    <LocationPicker
                        latitude={latitude}
                        longitude={longitude}
                        onLocationChange={(loc) => {
                            setLatitude(loc.latitude)
                            setLongitude(loc.longitude)
                            if (loc.pollingStation) setPollingStation(loc.pollingStation)
                        }}
                    />
                </div>

                <label className="block font-semibold mb-2 text-sm text-cyan-300">
                    Select Official Face Reference Photos (1 to 5 Images)
                </label>

                <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    multiple
                    onChange={handleFiles}
                    className="w-full bg-slate-900 border border-cyan-500/30 rounded-xl px-4 py-3 mb-6 text-sm text-slate-300"
                />

                {images.length > 0 && (
                    <div className="grid grid-cols-5 gap-3 mb-6">
                        {images.map((image, index) => (
                            <div key={`${image.name}-${index}`}>
                                <img
                                    src={URL.createObjectURL(image)}
                                    alt={`Face ${index + 1}`}
                                    className="w-full h-24 object-cover rounded-xl border border-cyan-400/40"
                                />
                                <p className="text-xs text-center text-slate-400 mt-1 font-mono">
                                    Ref {index + 1}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                <button
                    onClick={uploadImages}
                    disabled={uploading}
                    className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 py-4 rounded-xl font-bold shadow-lg hover:scale-[1.01] transition disabled:opacity-50"
                >
                    {uploading ? "Registering Dataset & Location..." : "Save Face Dataset & Marked Location into MongoDB"}
                </button>

                {message && (
                    <div className="mt-5 text-center text-sm font-semibold p-3 bg-white/5 border border-white/10 rounded-xl">
                        {message}
                    </div>
                )}

                <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                    <span>Target Registry Record: <strong className="text-cyan-300">{voterId}</strong></span>
                    <button
                        onClick={() => navigate("/admin-dashboard")}
                        className="text-emerald-400 font-bold hover:underline"
                    >
                        Return to Admin Console →
                    </button>
                </div>

            </div>

        </div>
    )
}

export default FaceRegistration