import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Header from "../../components/Header"
import CustomButton from "../../components/CustomButton"

export default function SuccessScreen() {
  const router = useRouter()
  const [voterId, setVoterId] = useState("")
  const [candidate, setCandidate] = useState("")
  const [party, setParty] = useState("")
  const [hash, setHash] = useState("")

  useEffect(() => {
    AsyncStorage.getItem("voterId").then((v) => setVoterId(v || "TN2026001"))
    AsyncStorage.getItem("votedCandidate").then((c) => setCandidate(c || "Dr. MK Stalin"))
    AsyncStorage.getItem("votedParty").then((p) => setParty(p || "DMK"))
    AsyncStorage.getItem("blockchainHash").then((h) => setHash(h || "6a6994e870da8174b4197795"))
  }, [])

  return (
    <View style={styles.container}>
      <Header title="Vote Cast Successfully" subtitle="Cryptographic Receipt • SHA-256 Ledger Block" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.successIconBadge}>
            <Text style={styles.successIcon}>🎉</Text>
          </View>

          <Text style={styles.title}>Ballot Sealed in Blockchain</Text>
          <Text style={styles.desc}>
            Your vote has been verified by 5-factor authentication and permanently committed to the immutable ledger.
          </Text>

          <View style={styles.receiptBox}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Voter ID:</Text>
              <Text style={styles.receiptVal}>{voterId}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Candidate Voted:</Text>
              <Text style={styles.receiptVal}>{candidate}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Political Party:</Text>
              <Text style={styles.receiptValHighlight}>{party}</Text>
            </View>
            <View style={styles.hashSection}>
              <Text style={styles.receiptLabel}>Immutable SHA-256 Hash:</Text>
              <Text style={styles.hashVal}>{hash}</Text>
            </View>
          </View>

          <CustomButton
            title="View Voter Profile Audit →"
            onPress={() => router.push("/profile")}
          />

          <CustomButton
            title="Return to Home Screen"
            onPress={() => router.push("/login")}
            variant="secondary"
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
    borderColor: "rgba(16, 185, 129, 0.3)",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  successIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  successIcon: {
    fontSize: 32,
  },
  title: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
    textAlign: "center",
  },
  desc: {
    color: "#94a3b8",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  receiptBox: {
    backgroundColor: "#061122",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
    width: "100%",
    marginBottom: 20,
    gap: 10,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  receiptLabel: {
    color: "#64748b",
    fontSize: 12,
  },
  receiptVal: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  receiptValHighlight: {
    color: "#10b981",
    fontSize: 12,
    fontWeight: "bold",
  },
  hashSection: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: 10,
  },
  hashVal: {
    color: "#06b6d4",
    fontSize: 11,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    marginTop: 4,
  },
})
