import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import api, { voterApi } from "../../services/api";

type VerificationStatus = "IDLE" | "SCANNING" | "SUCCESS" | "MISMATCH";

interface LocationInfo {
  assignedLatitude: number;
  assignedLongitude: number;
  assignedPollingStation: string;
  allowedRadiusMeters: number;
}

export default function LocationScreen() {
  const router = useRouter();

  const [voterId, setVoterId] = useState("");
  const [status, setStatus] = useState<VerificationStatus>("IDLE");
  const [statusMessage, setStatusMessage] = useState(
    "Ready for geo-fenced location verification."
  );
  const [loading, setLoading] = useState(false);
  const [locationInfo, setLocationInfo] = useState<LocationInfo>({
    assignedLatitude: 13.0067,
    assignedLongitude: 80.2570,
    assignedPollingStation: "Adyar Polling Station #04, Chennai",
    allowedRadiusMeters: 1000,
  });

  const [liveLocation, setLiveLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);

  useEffect(() => {
    const loadSessionAndLocation = async () => {
      try {
        const storedVoterId = await AsyncStorage.getItem("voterId");
        const activeId = storedVoterId || "TN2026001";
        setVoterId(activeId);

        try {
          const info = await voterApi.getLocationInfo(activeId);
          if (info && info.assignedLatitude && info.assignedLongitude) {
            setLocationInfo({
              assignedLatitude: Number(info.assignedLatitude),
              assignedLongitude: Number(info.assignedLongitude),
              assignedPollingStation:
                info.assignedPollingStation || "Adyar Polling Station #04, Chennai",
              allowedRadiusMeters: Number(info.allowedRadiusMeters) || 1000,
            });
          }
        } catch (e) {
          console.warn("Using default polling station coordinates:", e);
        }
      } catch (err) {
        console.error("Session load error:", err);
      }
    };

    loadSessionAndLocation();
  }, []);

  const calculateHaversineDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  };

  const handleVerifyLocation = async (
    overrideLat?: number,
    overrideLng?: number
  ) => {
    if (loading) return;

    setLoading(true);
    setStatus("SCANNING");
    setStatusMessage("Obtaining live device GPS coordinates...");

    try {
      let lat = overrideLat;
      let lng = overrideLng;

      if (lat === undefined || lng === undefined) {
        if (Platform.OS === "web") {
          if (!navigator.geolocation) {
            throw new Error("Geolocation is not supported by your browser.");
          }
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
              });
            }
          );
          lat = position.coords.latitude;
          lng = position.coords.longitude;
        } else {
          const { status: permStatus } =
            await Location.requestForegroundPermissionsAsync();
          if (permStatus !== "granted") {
            throw new Error("Permission to access location was denied.");
          }
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        }
      }

      setLiveLocation({ latitude: lat, longitude: lng });

      const dist = calculateHaversineDistance(
        lat,
        lng,
        locationInfo.assignedLatitude,
        locationInfo.assignedLongitude
      );
      setDistanceMeters(dist);

      let serverVerified = false;
      let serverMessage = "";

      try {
        const res = await api.post("/verify-geolocation", {
          voterId,
          liveLatitude: lat,
          liveLongitude: lng,
        });
        serverVerified = res.data?.verified === true;
        serverMessage = res.data?.message || "";
      } catch (err: any) {
        console.warn("Backend geolocation check failed:", err?.response?.data || err);
        serverVerified = false;
        serverMessage = err?.response?.data?.message || "Location Mismatch: Outside allowed boundary.";
      }

      setLoading(false);

      if (dist <= locationInfo.allowedRadiusMeters && serverVerified) {
        setStatus("SUCCESS");
        setStatusMessage(
          `✅ Location Verified (${dist}m away - Inside 1 km Boundary)`
        );

        await AsyncStorage.setItem("locationVerified", "true");

        setTimeout(() => {
          router.push("/fingerprint");
        }, 1200);
      } else {
        setStatus("MISMATCH");
        setStatusMessage(
          `❌ Location Mismatch (${dist}m away - Outside 1 km Boundary)`
        );

        await AsyncStorage.removeItem("locationVerified");

        Alert.alert(
          "Location Mismatch",
          serverMessage ||
            `Your live position is ${dist} meters away from your registered polling station (${locationInfo.assignedPollingStation}). Maximum allowed radius is 1000m.`
        );
      }
    } catch (error: any) {
      setLoading(false);
      setStatus("MISMATCH");
      const errText = error?.message || "Unable to acquire live GPS location.";
      setStatusMessage(`❌ ${errText}`);
      Alert.alert("GPS Error", errText);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#061122" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color="#38BDF8" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.brandTitle}>Vortura Mobile</Text>
          <Text style={styles.mainTitle}>Geo-Location Validation</Text>
          <Text style={styles.subTitle}>
            Step 4 of 5 • 1 km Polling Station Boundary
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="location-outline" size={24} color="#38BDF8" />
            <Text style={styles.cardTitle}>Registered Polling Station</Text>
          </View>

          <Text style={styles.stationName}>
            📍 {locationInfo.assignedPollingStation}
          </Text>

          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Marked Latitude:</Text>
              <Text style={styles.infoVal}>
                {locationInfo.assignedLatitude.toFixed(6)}° N
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Marked Longitude:</Text>
              <Text style={styles.infoVal}>
                {locationInfo.assignedLongitude.toFixed(6)}° E
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Allowed Boundary:</Text>
              <Text style={styles.infoValHighlight}>
                {locationInfo.allowedRadiusMeters} meters (1 km) max
              </Text>
            </View>

            {liveLocation && (
              <View style={styles.liveGeoDivider}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Live Device GPS:</Text>
                  <Text style={styles.liveGeoVal}>
                    {liveLocation.latitude.toFixed(6)}°,{" "}
                    {liveLocation.longitude.toFixed(6)}°
                  </Text>
                </View>
                {distanceMeters !== null && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Calculated Distance:</Text>
                    <Text
                      style={[
                        styles.infoVal,
                        distanceMeters <= locationInfo.allowedRadiusMeters
                          ? styles.successColor
                          : styles.dangerColor,
                      ]}
                    >
                      {distanceMeters} meters away
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          <View
            style={[
              styles.statusBanner,
              status === "SUCCESS" && styles.successBanner,
              status === "MISMATCH" && styles.mismatchBanner,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                status === "SUCCESS" && styles.successText,
                status === "MISMATCH" && styles.mismatchText,
              ]}
            >
              {statusMessage}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.actionButton, loading && styles.buttonDisabled]}
            onPress={() => handleVerifyLocation()}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="navigate" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>
                  Verify Live GPS Location
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.simMatchButton}
            onPress={() =>
              handleVerifyLocation(
                locationInfo.assignedLatitude,
                locationInfo.assignedLongitude
              )
            }
            activeOpacity={0.85}
            disabled={loading}
          >
            <Ionicons name="checkmark-circle-outline" size={19} color="#10B981" />
            <Text style={styles.simMatchText}>
              Simulate Inside Station (PASS TEST)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.simFailButton}
            onPress={() =>
              handleVerifyLocation(
                locationInfo.assignedLatitude + 0.045,
                locationInfo.assignedLongitude - 0.035
              )
            }
            activeOpacity={0.85}
            disabled={loading}
          >
            <Ionicons name="warning-outline" size={19} color="#EF4444" />
            <Text style={styles.simFailText}>
              Simulate Outside Station (FAIL TEST)
            </Text>
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            Location validation ensures that every voter is physically within
            their designated 1 km polling station radius.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#061122",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
  },

  header: {
    marginBottom: 20,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    alignSelf: "flex-start",
  },

  backText: {
    color: "#38BDF8",
    fontSize: 15,
    fontWeight: "600",
  },

  brandTitle: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  mainTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
    marginTop: 4,
  },

  subTitle: {
    color: "#38BDF8",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },

  card: {
    backgroundColor: "#08172D",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.25)",
    borderRadius: 22,
    padding: 22,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  stationName: {
    color: "#38BDF8",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 18,
  },

  infoBox: {
    backgroundColor: "#040B17",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.2)",
    marginBottom: 18,
    gap: 10,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  infoLabel: {
    color: "#94A3B8",
    fontSize: 13,
  },

  infoVal: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  infoValHighlight: {
    color: "#10B981",
    fontSize: 13,
    fontWeight: "700",
  },

  liveGeoDivider: {
    borderTopWidth: 1,
    borderTopColor: "rgba(56, 189, 248, 0.15)",
    paddingTop: 10,
    marginTop: 4,
    gap: 8,
  },

  liveGeoVal: {
    color: "#38BDF8",
    fontSize: 13,
    fontWeight: "700",
  },

  successColor: {
    color: "#10B981",
  },

  dangerColor: {
    color: "#EF4444",
  },

  statusBanner: {
    backgroundColor: "rgba(56, 189, 248, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.25)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
  },

  successBanner: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderColor: "rgba(16, 185, 129, 0.3)",
  },

  mismatchBanner: {
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderColor: "rgba(239, 68, 68, 0.3)",
  },

  statusText: {
    color: "#38BDF8",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },

  successText: {
    color: "#10B981",
    fontWeight: "700",
  },

  mismatchText: {
    color: "#EF4444",
    fontWeight: "700",
  },

  actionButton: {
    height: 54,
    borderRadius: 15,
    backgroundColor: "#0EA5E9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 12,
  },

  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  simMatchButton: {
    height: 50,
    borderRadius: 15,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 10,
  },

  simMatchText: {
    color: "#10B981",
    fontSize: 14,
    fontWeight: "700",
  },

  simFailButton: {
    height: 50,
    borderRadius: 15,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 16,
  },

  simFailText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "700",
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  footerNote: {
    color: "#64748B",
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
  },
});
