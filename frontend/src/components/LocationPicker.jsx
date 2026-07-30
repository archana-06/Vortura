import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix standard Leaflet default marker icons in React Vite builds
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

const quickPresets = [
  { name: "Chennai South", lat: 13.0827, lng: 80.2707 },
  { name: "T. Nagar, Chennai", lat: 13.0418, lng: 80.2341 },
  { name: "Anna Nagar, Chennai", lat: 13.0850, lng: 80.2101 },
  { name: "Adyar, Chennai", lat: 13.0012, lng: 80.2565 },
  { name: "Velachery, Chennai", lat: 12.9759, lng: 80.2207 },
  { name: "Madurai Urban", lat: 9.9252, lng: 78.1198 },
  { name: "Coimbatore North", lat: 11.0168, lng: 76.9558 },
]

function LocationPicker({ latitude, longitude, onLocationChange }) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const circleRef = useRef(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [gettingGps, setGettingGps] = useState(false)
  const [selectedPlaceName, setSelectedPlaceName] = useState("")

  const numLat = Number(latitude) || 13.0827
  const numLng = Number(longitude) || 80.2707

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([numLat, numLng], 14)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      const marker = L.marker([numLat, numLng], { draggable: true }).addTo(map)
      const circle = L.circle([numLat, numLng], {
        color: "#06b6d4",
        fillColor: "#06b6d4",
        fillOpacity: 0.15,
        radius: 1000, // 1 km radius
      }).addTo(map)

      markerRef.current = marker
      circleRef.current = circle
      mapInstanceRef.current = map

      // Map click handler to place pin
      map.on("click", (e) => {
        const { lat, lng } = e.latlng
        updateCoordinates(lat, lng)
      })

      // Marker drag handler
      marker.on("dragend", () => {
        const position = marker.getLatLng()
        updateCoordinates(position.lat, position.lng)
      })
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Sync Map View when lat/lng props change externally
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && circleRef.current) {
      const newLatLng = [numLat, numLng]
      markerRef.current.setLatLng(newLatLng)
      circleRef.current.setLatLng(newLatLng)
      mapInstanceRef.current.panTo(newLatLng)
    }
  }, [numLat, numLng])

  // Helper to update state and trigger reverse geocoding
  const updateCoordinates = (lat, lng, name = null) => {
    const formattedLat = Number(lat).toFixed(6)
    const formattedLng = Number(lng).toFixed(6)

    onLocationChange({
      latitude: formattedLat,
      longitude: formattedLng,
      pollingStation: name || selectedPlaceName || `Lat ${formattedLat}, Lng ${formattedLng}`,
    })

    if (name) {
      setSelectedPlaceName(name)
    } else {
      reverseGeocode(lat, lng)
    }
  }

  // Reverse Geocoding via OpenStreetMap Nominatim
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      )
      const data = await response.json()
      if (data && data.display_name) {
        const displayName = data.display_name.split(",").slice(0, 3).join(",")
        setSelectedPlaceName(displayName)
        onLocationChange({
          latitude: Number(lat).toFixed(6),
          longitude: Number(lng).toFixed(6),
          pollingStation: displayName,
        })
      }
    } catch (e) {
      console.warn("Reverse geocoding failed:", e.message)
    }
  }

  // Handle Location Name Search (OpenStreetMap Nominatim API)
  const handleSearch = async (e) => {
    e?.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setSearchResults([])

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      )
      const data = await response.json()
      setIsSearching(false)

      if (data && data.length > 0) {
        setSearchResults(data.slice(0, 5))
      } else {
        alert(`No location matches found for "${searchQuery}". Please try another search term.`)
      }
    } catch (err) {
      setIsSearching(false)
      alert("Failed to reach OpenStreetMap geocoding service. Please check network connection.")
    }
  }

  // Select Search Result
  const handleSelectResult = (result) => {
    const lat = Number(result.lat)
    const lng = Number(result.lon)
    const shortName = result.display_name.split(",").slice(0, 3).join(",")

    setSelectedPlaceName(shortName)
    setSearchResults([])
    setSearchQuery("")

    updateCoordinates(lat, lng, shortName)
  }

  // Capture Live Browser GPS
  const captureCurrentGps = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.")
      return
    }

    setGettingGps(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGettingGps(false)
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        updateCoordinates(lat, lng, "Live Device GPS Location")
      },
      (err) => {
        setGettingGps(false)
        alert("Could not access GPS location. Please check browser location permissions.")
      },
      { enableHighAccuracy: true }
    )
  }

  return (
    <div className="space-y-4">
      {/* SEARCH LOCATION BAR */}
      <div className="relative">
        <label className="block text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-2">
          🔍 Search Location Name (Address / Area / Landmark):
        </label>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search e.g. T. Nagar Chennai, Anna Nagar, Madurai..."
            className="flex-1 bg-slate-900 border border-cyan-500/30 rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-cyan-400 placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-5 py-2.5 rounded-xl font-bold text-xs transition disabled:opacity-50 flex items-center gap-1 shadow-md shadow-cyan-500/20"
          >
            {isSearching ? "Searching..." : "🔍 Search Location"}
          </button>
        </form>

        {/* SEARCH RESULTS DROPDOWN */}
        {searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-[#08172d] border border-cyan-500/40 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800">
            {searchResults.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectResult(item)}
                className="w-full text-left px-4 py-3 hover:bg-cyan-500/10 transition flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <p className="font-semibold text-cyan-300 leading-snug">
                    {item.display_name.split(",").slice(0, 2).join(",")}
                  </p>
                  <p className="text-slate-400 text-[11px] truncate max-w-md mt-0.5">
                    {item.display_name}
                  </p>
                </div>
                <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 whitespace-nowrap">
                  {Number(item.lat).toFixed(4)}°, {Number(item.lon).toFixed(4)}°
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* QUICK PRESET BADGES */}
      <div>
        <p className="text-[11px] text-slate-400 mb-1.5 font-medium">Quick Location Presets:</p>
        <div className="flex flex-wrap gap-1.5">
          {quickPresets.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => updateCoordinates(preset.lat, preset.lng, preset.name)}
              className="bg-slate-900 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/40 px-2.5 py-1 rounded-lg text-xs transition"
            >
              📍 {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* INTERACTIVE LEAFLET MAP CONTAINER */}
      <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 shadow-lg">
        <div ref={mapContainerRef} className="w-full h-64 z-10" />

        {/* MAP OVERLAY LEGEND */}
        <div className="absolute bottom-2 left-2 z-20 bg-slate-950/80 backdrop-blur border border-cyan-500/30 px-3 py-1.5 rounded-xl text-[11px] font-mono text-cyan-300 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          Interactive Map • Click anywhere to set pin (1 km voting boundary circle)
        </div>
      </div>

      {/* SELECTED LOCATION INFO & LAT/LNG INPUTS */}
      <div className="bg-slate-900/90 border border-cyan-500/20 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
              Marked Registered Location:
            </span>
            <p className="text-sm font-bold text-white mt-0.5">
              {selectedPlaceName || `Lat ${numLat.toFixed(4)}, Lng ${numLng.toFixed(4)}`}
            </p>
          </div>

          <button
            type="button"
            onClick={captureCurrentGps}
            disabled={gettingGps}
            className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-xs px-3 py-2 rounded-xl transition flex items-center gap-1 font-semibold"
          >
            {gettingGps ? "Capturing..." : "📍 Use Live GPS"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
          <div>
            <span className="text-xs text-slate-400 block mb-1">Latitude (°N)</span>
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => updateCoordinates(e.target.value, longitude)}
              className="w-full bg-slate-950 border border-cyan-500/30 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <span className="text-xs text-slate-400 block mb-1">Longitude (°E)</span>
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => updateCoordinates(latitude, e.target.value)}
              className="w-full bg-slate-950 border border-cyan-500/30 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default LocationPicker
