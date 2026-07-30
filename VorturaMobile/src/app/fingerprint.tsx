import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Header from "../../components/Header"
import CustomButton from "../../components/CustomButton"
import { voterApi } from "../../services/api"

export default function FingerprintScreen() {
  const router = useRouter()
  const [voterId, setVoterId] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"IDLE" | "SUCCESS" | "FAILED">("IDLE")

  useEffect(() => {
    AsyncStorage.getItem("voterId").then((val) => {
      if (val) setVoterId(val)
    })
  }, [])

  const handleVerifyFingerprint = async (simulateMatch: boolean) => {
    setLoading(true)
    try {
      if (simulateMatch) {
        await voterApi.verifyFingerprint(voterId, true)
        setStatus("SUCCESS")
        setLoading(false)
        setTimeout(() => router.push("/voting"), 1200)
      } else {
        await voterApi.verifyFingerprint(voterId, false)
        setStatus("FAILED")
        setLoading(false)
        Alert.alert("Fingerprint Mismatch", "Secondary biometric fingerprint scan failed.")
      }
    } catch (err: any) {
      setLoading(false)
      if (simulateMatch) {
        setStatus("SUCCESS")
        setTimeout(() => router.push("/voting"), 1200)
      } else {
        setStatus("FAILED")
        Alert.alert("Notice", err.message || "Fingerprint scan failed")
      }
    }
  }

  return (
    <View style={styles.container}>
      <Header title="Secondary Biometric" subtitle="Step 5 of 5 • Fingerprint Template Verification" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fingerprint Scan Verification</Text>
          <Text style={styles.cardDesc}>
            Place your thumb on the scanner to confirm secondary biometric identity for Voter ID{" "}
            <Text style={styles.highlight}>{voterId || "TN2026001"}</Text>.
          </Text>

          <View style={styles.sensorBox}>
            <Text style={styles.sensorIcon}>👆</Text>
            <Text style={styles.sensorText}>
              {status === "SUCCESS"
                ? "✅ Fingerprint Matched & Verified"
                : status === "FAILED"
                  ? "❌ Fingerprint Biometric Mismatch"
                  : "Biometric Touch Sensor Ready"}
            </Text>
          </View>

          <CustomButton
            title={loading ? "Scanning Minutiae..." : "Scan Fingerprint (MATCH PASS) →"}
            onPress={() => handleVerifyFingerprint(true)}
            loading={loading}
          />

          <CustomButton
            title="Simulate Fingerprint Mismatch (FAIL TEST)"
            onPress={() => handleVerifyFingerprint(false)}
            variant="danger"
            disabled={loading}
          />
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#061122",
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: "#08172d",
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.2)",
    borderRadius: 20,
    padding: 20,
  },
  cardTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  cardDesc: {
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  highlight: {
    color: "#06b6d4",
    fontWeight: "bold",
  },
  sensorBox: {
    height: 180,
    backgroundColor: "#061122",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  sensorIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  sensorText: {
    color: "#06b6d4",
    fontSize: 12,
    fontWeight: "600",
  },
})
