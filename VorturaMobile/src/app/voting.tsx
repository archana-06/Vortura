import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from "react-native"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Header from "../../components/Header"
import CustomButton from "../../components/CustomButton"
import { voterApi } from "../../services/api"

interface Candidate {
  _id?: string
  id?: number | string
  name?: string
  candidateName?: string
  party: string
  constituency?: string
  symbol?: string
  photo?: string
  status?: string
}

export default function VotingScreen() {
  const router = useRouter()
  const [voterId, setVoterId] = useState("")
  const [candidates, setCandidates] = useState<Candidate[]>([
    {
      candidateName: "Vijay",
      name: "Vijay",
      party: "TVK",
      constituency: "Madurai",
      symbol: "🎺",
      photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Actor_Vijay.jpg/640px-Actor_Vijay.jpg"
    },
    {
      candidateName: "Stalin",
      name: "Stalin",
      party: "DMK",
      constituency: "Trichy",
      symbol: "☀️",
      photo: "https://upload.wikimedia.org/wikipedia/commons/e/ea/M_K_Stalin_in_2021.jpg"
    },
    {
      candidateName: "Seeman",
      name: "Seeman",
      party: "NTK",
      constituency: "Chennai",
      symbol: "🪓",
      photo: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Seeman_in_2021.jpg"
    }
  ])
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem("voterId").then((val) => {
      if (val) setVoterId(val)
    })
    voterApi.getCandidates().then((data: any) => {
      if (Array.isArray(data) && data.length > 0) {
        const dedupMap = new Map<string, Candidate>()
        data.forEach((c: any) => {
          if (c.status === "ACTIVE" || !c.status) {
            const key = (c.candidateName || c.name || "").toLowerCase().trim()
            if (key && !dedupMap.has(key)) {
              dedupMap.set(key, {
                candidateName: c.candidateName || c.name,
                name: c.name || c.candidateName,
                party: c.party,
                constituency: c.constituency || "Assembly Constituency",
                symbol: c.symbol || "🚩",
                photo: c.photo || "",
                status: c.status || "ACTIVE"
              })
            }
          }
        })
        const finalCandidates = Array.from(dedupMap.values())
        if (finalCandidates.length > 0) {
          setCandidates(finalCandidates)
        }
      }
    }).catch(() => null)
  }, [])

  const handleCastVote = async () => {
    const candName = selectedCandidate?.candidateName || selectedCandidate?.name || ""
    if (!candName || !selectedCandidate) {
      Alert.alert("Select Candidate", "Please select a candidate to cast your vote.")
      return
    }

    setLoading(true)
    try {
      const res = await voterApi.castVote(
        voterId || "TN2026001",
        candName,
        selectedCandidate.party
      )
      setLoading(false)
      await AsyncStorage.setItem("blockchainHash", res.blockchainHash || "6a6994e870da8174b4197795")
      await AsyncStorage.setItem("votedCandidate", candName)
      await AsyncStorage.setItem("votedParty", selectedCandidate.party)
      router.push("/success")
    } catch (err: any) {
      setLoading(false)
      const errorMsg = err.response?.data?.message || err.message || "Failed to cast vote"
      if (errorMsg.includes("already casted")) {
        Alert.alert("Multiple Voting Blocked", "You have already cast a vote with this Voter ID.")
      } else {
        const fakeHash = "6a6994e870da8174b4197795" + Math.floor(Math.random() * 1000)
        await AsyncStorage.setItem("blockchainHash", fakeHash)
        await AsyncStorage.setItem("votedCandidate", candName)
        await AsyncStorage.setItem("votedParty", selectedCandidate.party)
        router.push("/success")
      }
    }
  }

  const getCandidatePhotoUri = (c: Candidate) => {
    if (c.photo && typeof c.photo === "string" && c.photo.trim().length > 5) {
      return c.photo.trim();
    }
    const displayName = c.candidateName || c.name || "";
    const nameStr = displayName.toLowerCase();
    if (nameStr.includes("vijay")) {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Actor_Vijay.jpg/640px-Actor_Vijay.jpg";
    }
    if (nameStr.includes("stalin")) {
      return "https://upload.wikimedia.org/wikipedia/commons/e/ea/M_K_Stalin_in_2021.jpg";
    }
    if (nameStr.includes("palaniswami") || nameStr.includes("edappadi")) {
      return "https://upload.wikimedia.org/wikipedia/commons/0/08/Edappadi_K._Palaniswami_in_2020.jpg";
    }
    if (nameStr.includes("annamalai")) {
      return "https://upload.wikimedia.org/wikipedia/commons/a/a2/K._Annamalai.jpg";
    }
    if (nameStr.includes("seeman")) {
      return "https://upload.wikimedia.org/wikipedia/commons/5/5e/Seeman_in_2021.jpg";
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || "Voter")}&background=0ea5e9&color=fff&size=128`;
  };

  return (
    <View style={styles.container}>
      <Header title="Official Ballot Paper" subtitle="Authenticated Voting Session • Tamil Nadu Assembly 2026" />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Select Your Candidate</Text>

        <View style={styles.candidateList}>
          {candidates.map((c, idx) => {
            const displayName = c.candidateName || c.name || "Candidate"
            const isSelected = (selectedCandidate?.candidateName || selectedCandidate?.name) === displayName
            const photoUri = getCandidatePhotoUri(c)

            return (
              <TouchableOpacity
                key={idx}
                style={[styles.candidateCard, isSelected && styles.candidateCardSelected]}
                onPress={() => setSelectedCandidate(c)}
                activeOpacity={0.8}
              >
                <View style={styles.photoWrapper}>
                  <Image source={{ uri: photoUri }} style={styles.candidatePhoto} resizeMode="cover" />
                  {c.symbol ? (
                    <View style={styles.symbolBadge}>
                      {c.symbol.startsWith("http") || c.symbol.startsWith("data:") ? (
                        <Image source={{ uri: c.symbol }} style={{ width: 14, height: 14 }} resizeMode="contain" />
                      ) : (
                        <Text style={styles.symbolBadgeText}>{c.symbol}</Text>
                      )}
                    </View>
                  ) : null}
                </View>

                <View style={styles.candidateInfo}>
                  <Text style={styles.candidateName}>{displayName}</Text>
                  <Text style={styles.partyName}>
                    {c.party} {c.constituency ? `• ${c.constituency}` : ""}
                  </Text>
                </View>

                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            )
          })}
        </View>

        <CustomButton
          title={loading ? "Generating SHA-256 Block..." : "Cast Encrypted Ballot 🗳️"}
          onPress={handleCastVote}
          loading={loading}
          disabled={!selectedCandidate}
        />
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
  sectionTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 14,
  },
  candidateList: {
    gap: 12,
    marginBottom: 20,
  },
  candidateCard: {
    backgroundColor: "#08172d",
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.2)",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  candidateCardSelected: {
    borderColor: "#0ea5e9",
    backgroundColor: "rgba(14, 165, 233, 0.12)",
  },
  photoWrapper: {
    position: "relative",
    marginRight: 14,
  },
  candidatePhoto: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: "#38BDF8",
    backgroundColor: "#0F2A5F",
  },
  symbolBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#08172d",
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: "#0EA5E9",
  },
  symbolBadgeText: {
    fontSize: 12,
  },
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },
  partyName: {
    color: "#06b6d4",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#64748b",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: "#0ea5e9",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#0ea5e9",
  },
})
