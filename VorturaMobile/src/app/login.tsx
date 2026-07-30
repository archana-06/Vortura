import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import api from "../../services/api";

export default function LoginScreen() {
  const router = useRouter();

  const [voterId, setVoterId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleLogin = async () => {
    const formattedVoterId = voterId.trim().toUpperCase();
    const formattedEmail = email.trim();

    if (!formattedVoterId) {
      showMessage("Voter ID required", "Please enter your Voter ID.");
      return;
    }

    if (!formattedEmail) {
      showMessage("Email required", "Please enter your registered email address.");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Verify the voter exists and can log in.
      const loginResponse = await api.post("/login", {
        voterId: formattedVoterId,
      });

      if (!loginResponse.data?.voter) {
        showMessage(
          "Login unsuccessful",
          loginResponse.data?.message || "Unable to verify this Voter ID."
        );
        return;
      }

      const otpResponse = await api.post("/generate-otp", {
        voterId: formattedVoterId,
        email: formattedEmail,
      });

      if (!otpResponse.data?.otp && !otpResponse.data?.message) {
        showMessage(
          "OTP error",
          "Unable to generate OTP."
        );
        return;
      }

      await AsyncStorage.setItem("voterId", formattedVoterId);
      await AsyncStorage.setItem("voterEmail", formattedEmail);
      await AsyncStorage.setItem(
        "voter",
        JSON.stringify(loginResponse.data.voter)
      );

      router.push({
        pathname: "/otp",
        params: {
          voterId: formattedVoterId,
          email: formattedEmail,
        },
      });
    } catch (error: any) {
      console.error("Mobile login error:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to connect to the voting server.";

      showMessage("Login failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color="#1D4ED8" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.topSection}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>V</Text>
            </View>

            <Text style={styles.title}>Voter Login</Text>

            <Text style={styles.subtitle}>
              Enter your registered Voter ID and Email to begin secure identity
              verification.
            </Text>
          </View>

          <View style={styles.loginCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIcon}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={24}
                  color="#1D4ED8"
                />
              </View>

              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Identity Verification</Text>
                <Text style={styles.cardCaption}>
                  Authorised voters only
                </Text>
              </View>
            </View>

            <Text style={styles.label}>Voter ID</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={21}
                color="#64748B"
                style={styles.inputIcon}
              />

              <TextInput
                style={styles.input}
                value={voterId}
                onChangeText={(value) => setVoterId(value.toUpperCase())}
                placeholder="Example: TN2026001"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!loading}
                returnKeyType="next"
              />
            </View>

            <Text style={[styles.label, { marginTop: 14 }]}>Registered Email Address</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={21}
                color="#64748B"
                style={styles.inputIcon}
              />

              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(value) => setEmail(value)}
                placeholder="Example: voter@gmail.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.loginButton,
                loading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Continue Securely</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color="#FFFFFF"
                  />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.securityNotice}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color="#0F766E"
              />

              <Text style={styles.securityNoticeText}>
                Your information is encrypted and used only for voter
                authentication.
              </Text>
            </View>
          </View>

          <View style={styles.stepsCard}>
            <Text style={styles.stepsTitle}>Secure voting process</Text>

            <View style={styles.stepsRow}>
              <View style={styles.step}>
                <View style={styles.stepCircle}>
                  <Text style={styles.stepNumber}>1</Text>
                </View>
                <Text style={styles.stepText}>Login</Text>
              </View>

              <View style={styles.stepLine} />

              <View style={styles.step}>
                <View style={styles.stepCircleInactive}>
                  <Text style={styles.stepNumberInactive}>2</Text>
                </View>
                <Text style={styles.stepTextInactive}>Verify</Text>
              </View>

              <View style={styles.stepLine} />

              <View style={styles.step}>
                <View style={styles.stepCircleInactive}>
                  <Text style={styles.stepNumberInactive}>3</Text>
                </View>
                <Text style={styles.stepTextInactive}>Vote</Text>
              </View>
            </View>
          </View>

          <Text style={styles.footerText}>
            Vortura Secure Election Platform
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 28,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingRight: 12,
  },

  backText: {
    color: "#1D4ED8",
    fontSize: 15,
    fontWeight: "600",
  },

  topSection: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 30,
  },

  logoBox: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: "#1D4ED8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#1D4ED8",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },

  logoText: {
    color: "#FFFFFF",
    fontSize: 39,
    fontWeight: "900",
  },

  title: {
    color: "#0F2A5F",
    fontSize: 28,
    fontWeight: "800",
  },

  subtitle: {
    maxWidth: 330,
    color: "#64748B",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 10,
  },

  loginCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 5,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  cardIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  cardHeaderText: {
    flex: 1,
    marginLeft: 13,
  },

  cardTitle: {
    color: "#0F2A5F",
    fontSize: 17,
    fontWeight: "700",
  },

  cardCaption: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 3,
  },

  label: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 9,
  },

  inputContainer: {
    height: 56,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    borderRadius: 15,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  inputIcon: {
    marginRight: 11,
  },

  input: {
    flex: 1,
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  loginButton: {
    height: 56,
    borderRadius: 15,
    backgroundColor: "#1D4ED8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    gap: 10,
    shadowColor: "#1D4ED8",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.23,
    shadowRadius: 12,
    elevation: 6,
  },

  loginButtonDisabled: {
    opacity: 0.65,
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  securityNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#ECFDF5",
    borderRadius: 14,
    padding: 13,
    marginTop: 18,
  },

  securityNoticeText: {
    flex: 1,
    color: "#0F766E",
    fontSize: 12,
    lineHeight: 18,
    marginLeft: 9,
  },

  stepsCard: {
    marginTop: 22,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },

  stepsTitle: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },

  stepsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  step: {
    alignItems: "center",
  },

  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1D4ED8",
    alignItems: "center",
    justifyContent: "center",
  },

  stepCircleInactive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  stepNumber: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  stepNumberInactive: {
    color: "#64748B",
    fontWeight: "700",
  },

  stepText: {
    color: "#1D4ED8",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 6,
  },

  stepTextInactive: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 6,
  },

  stepLine: {
    width: 55,
    height: 2,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 8,
    marginBottom: 18,
  },

  footerText: {
    color: "#94A3B8",
    fontSize: 11,
    textAlign: "center",
    marginTop: 18,
  },
});