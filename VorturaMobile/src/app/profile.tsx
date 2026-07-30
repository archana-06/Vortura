import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView } from "react-native"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Header from "../../components/Header"
import CustomButton from "../../components/CustomButton"

export default function ProfileScreen() {
  const router = useRouter()
  const [voterId, setVoterId] = useState("")

  useEffect(() => {
    AsyncStorage.getItem("voterId").then((v) => setVoterId(v || "TN2026001"))
  }, [])

  return (
    <View style={styles.container}>
      <Header title="Voter Verification Audit" subtitle="Biometric & Geo-Location Security Profile" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Voter Profile Status</Text>
          <Text style={styles.voterIdBadge}>Voter ID: {voterId}</Text>

          <View style={styles.auditList}>
            <View style={styles.auditItem}>
              <Text style={styles.auditLabel}>1. Credentials Identification</Text>
              <Text style={styles.auditPass}>✅ PASSED</Text>
            </View>

            <View style={styles.auditItem}>
              <Text style={styles.auditLabel}>2. MFA Mobile OTP</Text>
              <Text style={styles.auditPass}>✅ VERIFIED</Text>
            </View>

            <View style={styles.auditItem}>
              <Text style={styles.auditLabel}>3. DeepFace AI Match (92.5%)</Text>
              <Text style={styles.auditPass}>✅ VERIFIED</Text>
            </View>

            <View style={styles.auditItem}>
              <Text style={styles.auditLabel}>4. Geo-Location (0m Boundary)</Text>
              <Text style={styles.auditPass}>✅ VERIFIED</Text>
            </View>

            <View style={styles.auditItem}>
              <Text style={styles.auditLabel}>5. Fingerprint Biometric</Text>
              <Text style={styles.auditPass}>✅ VERIFIED</Text>
            </View>
          </View>

          <CustomButton
            title="Log Out Voter Session"
            onPress={async () => {
              await AsyncStorage.clear()
              router.push("/login")
            }}
            variant="danger"
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
    marginBottom: 4,
  },
  voterIdBadge: {
    color: "#06b6d4",
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 20,
  },
  auditList: {
    backgroundColor: "#061122",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.15)",
    marginBottom: 20,
    gap: 12,
  },
  auditItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
    paddingBottom: 8,
  },
  auditLabel: {
    color: "#cbd5e1",
    fontSize: 12,
  },
  auditPass: {
    color: "#34d399",
    fontSize: 12,
    fontWeight: "bold",
  },
})
