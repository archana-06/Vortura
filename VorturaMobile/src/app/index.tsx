import { useRouter } from "expo-router";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.circleOne} />
      <View style={styles.circleTwo} />

      <View style={styles.content}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>V</Text>
        </View>

        <Text style={styles.appName}>VORTURA</Text>

        <Text style={styles.tagline}>
          Secure. Transparent. Every Vote Matters.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Secure Digital Voting</Text>

          <Text style={styles.cardDescription}>
            Authenticate securely through OTP, face recognition, location and
            biometric verification before casting your vote.
          </Text>

          <View style={styles.badgesContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>AI Verified</Text>
            </View>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>Blockchain Secured</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.85}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Accessible only to authorised voters
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F2A5F",
    overflow: "hidden",
  },

  circleOne: {
    position: "absolute",
    width: 290,
    height: 290,
    borderRadius: 145,
    backgroundColor: "#2563EB",
    opacity: 0.25,
    top: -110,
    right: -100,
  },

  circleTwo: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#38BDF8",
    opacity: 0.12,
    bottom: 40,
    left: -130,
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  logoBox: {
    width: 92,
    height: 92,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 10,
  },

  logoText: {
    color: "#1D4ED8",
    fontSize: 50,
    fontWeight: "900",
  },

  appName: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 4,
  },

  tagline: {
    color: "#DCEAFF",
    fontSize: 15,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 36,
  },

  card: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
    borderRadius: 24,
    padding: 22,
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },

  cardDescription: {
    color: "#DCEAFF",
    fontSize: 14,
    lineHeight: 22,
  },

  badgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18,
  },

  badge: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  footer: {
    paddingHorizontal: 24,
    paddingBottom: 28,
  },

  button: {
    height: 56,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#1746A2",
    fontSize: 17,
    fontWeight: "700",
  },

  footerText: {
    color: "#AFC8EF",
    fontSize: 12,
    textAlign: "center",
    marginTop: 14,
  },
});
