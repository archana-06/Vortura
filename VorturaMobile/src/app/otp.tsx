import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import api from "../../services/api";

export default function OtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ voterId?: string; email?: string }>();

  const inputRef = useRef<TextInput>(null);

  const [voterId, setVoterId] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [seconds, setSeconds] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  useEffect(() => {
    const loadVoterId = async () => {
      try {
        const storedVoterId = await AsyncStorage.getItem("voterId");
        const storedEmail = await AsyncStorage.getItem("voterEmail");

        const receivedVoterId =
          typeof params.voterId === "string"
            ? params.voterId
            : storedVoterId || "";

        const receivedEmail =
          typeof params.email === "string"
            ? params.email
            : storedEmail || "";

        if (!receivedVoterId) {
          showMessage(
            "Session expired",
            "Voter ID was not found. Please log in again."
          );

          router.replace("/login");
          return;
        }

        setVoterId(receivedVoterId);
        setEmail(receivedEmail);
        await AsyncStorage.setItem("voterId", receivedVoterId);
        if (receivedEmail) {
          await AsyncStorage.setItem("voterEmail", receivedEmail);
        }
      } catch (error) {
        console.error("Failed to load Voter ID:", error);

        showMessage(
          "Storage Error",
          "Unable to load your voter information."
        );
      }
    };

    loadVoterId();
  }, [params.voterId, params.email, router]);

  useEffect(() => {
    if (seconds <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setSeconds((previousSeconds) => previousSeconds - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  const handleOtpChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "").slice(0, 6);
    setOtp(numericValue);
  };

  const handleVerifyOtp = async () => {
    if (!voterId) {
      showMessage(
        "Voter ID Missing",
        "Please return to the login screen and try again."
      );
      return;
    }

    if (otp.length !== 6) {
      showMessage(
        "Invalid OTP",
        "Please enter the complete 6-digit OTP."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/verify-otp", {
        voterId,
        otp: otp.trim(),
      });

      if (response.status === 200) {
        await AsyncStorage.setItem("otpVerified", "true");
        router.replace("/face");
      }

    } catch (error: any) {
      console.error(
        "OTP verification error:",
        error?.response?.data || error
      );

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to connect to the verification server.";

      showMessage("OTP Verification Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!voterId) {
      showMessage(
        "Voter ID Missing",
        "Please return to the login screen."
      );
      return;
    }

    if (seconds > 0 || resending) {
      return;
    }

    setResending(true);

    try {
      const response = await api.post("/generate-otp", {
        voterId,
        email,
      });

      if (response.status === 200) {
        setOtp("");
        setSeconds(60);

        showMessage(
          "OTP Sent",
          response.data?.message ||
          "A new 6-digit OTP has been sent to your email."
        );
      }

      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    } catch (error: any) {
      console.error(
        "OTP resend error:",
        error?.response?.data || error
      );

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to resend the OTP.";

      showMessage("OTP Resend Failed", errorMessage);
    } finally {
      setResending(false);
    }
  };

  const maskedVoterId =
    voterId.length > 5
      ? `${voterId.slice(0, 2)}••••${voterId.slice(-3)}`
      : voterId;

  return (
    <SafeAreaView style={styles.container}>
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
            <Ionicons
              name="chevron-back"
              size={23}
              color="#1D4ED8"
            />

            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.topSection}>
            <View style={styles.iconBox}>
              <Ionicons
                name="mail-unread-outline"
                size={38}
                color="#FFFFFF"
              />
            </View>

            <Text style={styles.title}>Verify OTP</Text>

            <Text style={styles.subtitle}>
              Enter the 6-digit security code sent to{" "}
              <Text style={styles.voterIdText}>{email || "your registered email"}</Text> for Voter ID{" "}
              <Text style={styles.voterIdText}>
                {maskedVoterId || "Loading..."}
              </Text>
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderIcon}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={23}
                  color="#1D4ED8"
                />
              </View>

              <View style={styles.cardHeaderContent}>
                <Text style={styles.cardTitle}>
                  OTP Authentication
                </Text>

                <Text style={styles.cardSubtitle}>
                  Step 2 of secure voter verification
                </Text>
              </View>
            </View>

            <Text style={styles.label}>
              One-Time Password
            </Text>

            <TouchableOpacity
              style={styles.otpContainer}
              activeOpacity={1}
              onPress={() => inputRef.current?.focus()}
            >
              {Array.from({ length: 6 }).map((_, index) => {
                const digit = otp[index];
                const isActive = otp.length === index;

                return (
                  <View
                    key={index}
                    style={[
                      styles.otpBox,
                      digit ? styles.otpBoxFilled : null,
                      isActive ? styles.otpBoxActive : null,
                    ]}
                  >
                    <Text style={styles.otpDigit}>
                      {digit || ""}
                    </Text>
                  </View>
                );
              })}
            </TouchableOpacity>

            <TextInput
              ref={inputRef}
              value={otp}
              onChangeText={handleOtpChange}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
              style={styles.hiddenInput}
              onSubmitEditing={handleVerifyOtp}
            />

            <TouchableOpacity
              style={[
                styles.verifyButton,
                (loading || otp.length !== 6) &&
                styles.verifyButtonDisabled,
              ]}
              onPress={handleVerifyOtp}
              disabled={loading || otp.length !== 6}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.verifyButtonText}>
                    Verify and Continue
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color="#FFFFFF"
                  />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.resendSection}>
              {seconds > 0 ? (
                <Text style={styles.timerText}>
                  Resend OTP in{" "}
                  <Text style={styles.timerValue}>
                    {seconds}s
                  </Text>
                </Text>
              ) : (
                <TouchableOpacity
                  onPress={handleResendOtp}
                  disabled={resending}
                  activeOpacity={0.7}
                >
                  {resending ? (
                    <View style={styles.resendingRow}>
                      <ActivityIndicator
                        size="small"
                        color="#1D4ED8"
                      />

                      <Text style={styles.resendText}>
                        Generating OTP...
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.resendText}>
                      Resend OTP
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.notice}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color="#0F766E"
              />

              <Text style={styles.noticeText}>
                Never share your OTP with another person or election
                official.
              </Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressItem}>
              <View style={styles.completedCircle}>
                <Ionicons
                  name="checkmark"
                  size={16}
                  color="#FFFFFF"
                />
              </View>

              <Text style={styles.completedText}>
                Login
              </Text>
            </View>

            <View style={styles.completedLine} />

            <View style={styles.progressItem}>
              <View style={styles.activeCircle}>
                <Text style={styles.activeNumber}>2</Text>
              </View>

              <Text style={styles.activeText}>OTP</Text>
            </View>

            <View style={styles.inactiveLine} />

            <View style={styles.progressItem}>
              <View style={styles.inactiveCircle}>
                <Text style={styles.inactiveNumber}>3</Text>
              </View>

              <Text style={styles.inactiveText}>
                Biometric
              </Text>
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
    paddingTop: 14,
    paddingBottom: 30,
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
    marginTop: 30,
    marginBottom: 28,
  },

  iconBox: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: "#1D4ED8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#1D4ED8",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.24,
    shadowRadius: 14,
    elevation: 8,
  },

  title: {
    color: "#0F2A5F",
    fontSize: 28,
    fontWeight: "800",
  },

  subtitle: {
    maxWidth: 340,
    color: "#64748B",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 10,
  },

  voterIdText: {
    color: "#1D4ED8",
    fontWeight: "700",
  },

  card: {
    width: "100%",
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

  cardHeaderIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  cardHeaderContent: {
    flex: 1,
    marginLeft: 13,
  },

  cardTitle: {
    color: "#0F2A5F",
    fontSize: 17,
    fontWeight: "700",
  },

  cardSubtitle: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 3,
  },

  label: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 18,
  },

  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 7,
  },

  otpBox: {
    flex: 1,
    height: 52,
    maxWidth: 48,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    borderRadius: 13,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },

  otpBoxActive: {
    borderColor: "#1D4ED8",
    backgroundColor: "#EFF6FF",
  },

  otpBoxFilled: {
    borderColor: "#60A5FA",
  },

  otpDigit: {
    color: "#0F2A5F",
    fontSize: 21,
    fontWeight: "800",
  },

  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },

  verifyButton: {
    height: 56,
    borderRadius: 15,
    backgroundColor: "#1D4ED8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 24,
    shadowColor: "#1D4ED8",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 6,
  },

  verifyButtonDisabled: {
    opacity: 0.5,
  },

  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  resendSection: {
    alignItems: "center",
    marginTop: 18,
  },

  timerText: {
    color: "#64748B",
    fontSize: 13,
  },

  timerValue: {
    color: "#1D4ED8",
    fontWeight: "700",
  },

  resendingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  resendText: {
    color: "#1D4ED8",
    fontSize: 14,
    fontWeight: "700",
  },

  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#ECFDF5",
    borderRadius: 14,
    padding: 13,
    marginTop: 20,
  },

  noticeText: {
    flex: 1,
    color: "#0F766E",
    fontSize: 12,
    lineHeight: 18,
    marginLeft: 9,
  },

  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },

  progressItem: {
    alignItems: "center",
  },

  completedCircle: {
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },

  activeCircle: {
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: "#1D4ED8",
    alignItems: "center",
    justifyContent: "center",
  },

  inactiveCircle: {
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  activeNumber: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  inactiveNumber: {
    color: "#64748B",
    fontWeight: "700",
  },

  completedText: {
    color: "#10B981",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 6,
  },

  activeText: {
    color: "#1D4ED8",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 6,
  },

  inactiveText: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 6,
  },

  completedLine: {
    width: 42,
    height: 2,
    backgroundColor: "#10B981",
    marginHorizontal: 7,
    marginBottom: 18,
  },

  inactiveLine: {
    width: 42,
    height: 2,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 7,
    marginBottom: 18,
  },

  footerText: {
    color: "#94A3B8",
    fontSize: 11,
    textAlign: "center",
    marginTop: 22,
  },
});