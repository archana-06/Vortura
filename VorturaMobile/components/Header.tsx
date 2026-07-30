import React from "react"
import { View, Text, StyleSheet } from "react-native"

interface HeaderProps {
  title: string
  subtitle?: string
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.logoRow}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>V</Text>
        </View>
        <View>
          <Text style={styles.brandTitle}>Vortura Mobile</Text>
          <Text style={styles.brandTag}>Secure Biometric Voting</Text>
        </View>
      </View>
      <Text style={styles.pageTitle}>{title}</Text>
      {subtitle && <Text style={styles.pageSubtitle}>{subtitle}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#08172d",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(6, 182, 212, 0.15)",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#0ea5e9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  logoText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 20,
  },
  brandTitle: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  brandTag: {
    color: "#94a3b8",
    fontSize: 10,
  },
  pageTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "bold",
  },
  pageSubtitle: {
    color: "#06b6d4",
    fontSize: 12,
    marginTop: 2,
  },
})
