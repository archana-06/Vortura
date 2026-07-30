import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import {
  CameraCapturedPicture,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import api from "../../services/api";

type VerificationStatus =
  | "IDLE"
  | "CAMERA"
  | "SCANNING"
  | "SUCCESS"
  | "FAILED";

type RecognitionResponse = {
  success: boolean;
  isMatch: boolean;
  livenessPassed?: boolean;
  voterId?: string;
  fullName?: string;
  confidence?: number;
  cosineScore?: number;
  averageScore?: number;
  matchedImages?: number;
  totalImagesChecked?: number;
  message?: string;
};

const getPythonUrl = () => {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:5001";
    }
    return `http://${hostname}:5001`;
  }
  return "http://192.168.31.59:5001";
};

const PYTHON_SERVER_URL = getPythonUrl();

export default function FaceScreen() {
  const router = useRouter();

  const cameraRef = useRef<CameraView | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [permission, requestPermission] = useCameraPermissions();

  const [voterId, setVoterId] = useState("");
  const [status, setStatus] = useState<VerificationStatus>("IDLE");
  const [statusMessage, setStatusMessage] = useState(
    "Ready for live facial biometric verification."
  );
  const [progress, setProgress] = useState(0);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedVoterId = await AsyncStorage.getItem("voterId");

        if (!storedVoterId) {
          setStatus("FAILED");
          setStatusMessage(
            "Voter session not found. Please log in again."
          );
          return;
        }

        setVoterId(storedVoterId);
      } catch (error) {
        console.error("Unable to load voter session:", error);

        setStatus("FAILED");
        setStatusMessage(
          "Unable to load voter session. Please log in again."
        );
      }
    };

    loadSession();
  }, []);

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;

    if (status === "SCANNING") {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );

      animation.start();
    } else {
      pulseAnim.setValue(1);
    }

    return () => {
      animation?.stop();
    };
  }, [status, pulseAnim]);

  const openCamera = async () => {
    try {
      console.log("Open camera button pressed");

      if (!voterId) {
        Alert.alert(
          "Voter ID unavailable",
          "Please log in again before facial verification."
        );
        return;
      }

      let cameraPermission = permission;

      if (!cameraPermission?.granted) {
        cameraPermission = await requestPermission();
      }

      console.log("Camera permission:", cameraPermission);

      if (!cameraPermission.granted) {
        Alert.alert(
          "Camera permission required",
          "Open your phone settings and allow camera access for Expo Go."
        );

        setStatus("FAILED");
        setStatusMessage("Camera permission was denied.");
        return;
      }

      setConfidence(null);
      setProgress(0);
      setCameraReady(false);
      setStatus("CAMERA");
      setStatusMessage(
        "Position your face inside the frame and look directly at the camera."
      );

      setIsCameraVisible(true);
    } catch (error) {
      console.error("Unable to open camera:", error);

      setStatus("FAILED");
      setStatusMessage("Unable to open the camera.");

      Alert.alert(
        "Camera error",
        error instanceof Error
          ? error.message
          : "The camera could not be opened."
      );
    }
  };

  const closeCamera = () => {
    if (status === "SCANNING") {
      return;
    }

    setIsCameraVisible(false);
    setCameraReady(false);
    setStatus("IDLE");
    setProgress(0);
    setStatusMessage(
      "Ready for live facial biometric verification."
    );
  };

  const sendRecognitionResultToNode = async (
    result: RecognitionResponse
  ) => {
    try {
      await api.post("/verify-face", {
        voterId,
        predictedVoterId: result.isMatch
          ? result.voterId || voterId
          : "UNMATCHED_FACE",
        confidence: result.confidence ?? 0,
        faceMatch: result.isMatch,
      });
    } catch (error) {
      console.warn(
        "Recognition completed, but Node logging failed:",
        error
      );
    }
  };

  const verifyCapturedFace = async (
    capturedPhoto: CameraCapturedPicture
  ) => {
    if (!capturedPhoto.base64) {
      throw new Error(
        "The camera did not return Base64 image data."
      );
    }

    setProgress(35);
    setStatusMessage(
      `Loading the registered dataset for ${voterId}...`
    );

    const imageDataUrl = `data:image/jpeg;base64,${capturedPhoto.base64}`;

    setProgress(60);
    setStatusMessage(
      "Comparing the live face with the registered admin images..."
    );

    let response: Response;
    try {
      response = await fetch(
        `${PYTHON_SERVER_URL}/recognize-voter`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            voterId,
            image: imageDataUrl,
          }),
        }
      );
    } catch (netErr: any) {
      throw new Error(
        `AI Face Service network error. Python server (port 5001) connection failed.`
      );
    }

    let result: RecognitionResponse;

    try {
      result = await response.json();
    } catch {
      throw new Error(
        "The face-recognition server returned an invalid response."
      );
    }

    if (!response.ok) {
      throw new Error(
        result.message ||
        "Face recognition could not be completed."
      );
    }

    await sendRecognitionResultToNode(result);

    setProgress(100);
    setConfidence(result.confidence ?? 0);

    if (result.success && result.isMatch) {
      setStatus("SUCCESS");
      setStatusMessage(
        `Face verified successfully${result.fullName ? ` for ${result.fullName}` : ""
        } with ${result.confidence ?? 0}% confidence.`
      );

      await AsyncStorage.setItem("faceVerified", "true");
      await AsyncStorage.setItem(
        "faceConfidence",
        String(result.confidence ?? 0)
      );

      setTimeout(() => {
        router.push("/location");
      }, 1300);
    } else {
      setStatus("FAILED");
      setStatusMessage(
        result.message ||
        "The captured face does not match the registered voter."
      );

      await AsyncStorage.removeItem("faceVerified");
    }
  };

  const captureAndVerify = async () => {
    if (status === "SCANNING") {
      return;
    }

    if (!cameraRef.current || !cameraReady) {
      Alert.alert(
        "Camera not ready",
        "Please wait for the camera to load."
      );
      return;
    }

    try {
      setStatus("SCANNING");
      setProgress(15);
      setConfidence(null);
      setStatusMessage(
        "Capturing and analysing your live face..."
      );

      const capturedPhoto =
        await cameraRef.current.takePictureAsync({
          base64: true,
          quality: 0.75,
          skipProcessing: false,
        });

      if (!capturedPhoto) {
        throw new Error("No photograph was captured.");
      }

      setIsCameraVisible(false);
      setCameraReady(false);

      await verifyCapturedFace(capturedPhoto);
    } catch (error: unknown) {
      console.error("Face verification error:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Face verification failed. Please try again.";

      setStatus("FAILED");
      setProgress(0);
      setConfidence(null);
      setIsCameraVisible(false);
      setCameraReady(false);
      setStatusMessage(message);

      await AsyncStorage.removeItem("faceVerified");

      Alert.alert("Face verification failed", message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#061122"
      />

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
            <Ionicons
              name="chevron-back"
              size={22}
              color="#38BDF8"
            />

            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.brandTitle}>Vortura Mobile</Text>

          <Text style={styles.mainTitle}>
            Facial Biometric Match
          </Text>

          <Text style={styles.subTitle}>
            Step 3 of 5 • AI Face Verification
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="scan-outline"
              size={24}
              color="#38BDF8"
            />

            <Text style={styles.cardTitle}>
              Live Face Comparison
            </Text>
          </View>

          <Text style={styles.cardDesc}>
            Your live face will be compared with the reference
            images uploaded by the web administrator for Voter ID{" "}
            <Text style={styles.voterIdHighlight}>
              {voterId || "Loading..."}
            </Text>
            .
          </Text>

          <View style={styles.cameraBox}>
            {isCameraVisible ? (
              <View style={styles.cameraWrapper}>
                <CameraView
                  ref={cameraRef}
                  style={styles.camera}
                  facing="front"
                  mode="picture"
                  mirror
                  onCameraReady={() => {
                    setCameraReady(true);
                    setStatusMessage(
                      "Camera ready. Keep your face centred and tap Capture and Verify."
                    );
                  }}
                  onMountError={(event) => {
                    console.error(
                      "Camera mount error:",
                      event.message
                    );

                    setStatus("FAILED");
                    setIsCameraVisible(false);
                    setCameraReady(false);
                    setStatusMessage(
                      `Camera error: ${event.message}`
                    );
                  }}
                />

                <View style={styles.cameraOverlay}>
                  <View style={styles.faceGuide} />
                </View>

                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveBadgeText}>
                    LIVE CAMERA
                  </Text>
                </View>
              </View>
            ) : (
              <Animated.View
                style={[
                  styles.avatarContainer,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <Ionicons
                  name={
                    status === "SUCCESS"
                      ? "checkmark-circle"
                      : status === "FAILED"
                        ? "close-circle"
                        : status === "SCANNING"
                          ? "scan-circle-outline"
                          : "person-circle-outline"
                  }
                  size={88}
                  color={
                    status === "SUCCESS"
                      ? "#10B981"
                      : status === "FAILED"
                        ? "#EF4444"
                        : "#38BDF8"
                  }
                />
              </Animated.View>
            )}

            {status === "SCANNING" && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${progress}%`,
                      },
                    ]}
                  />
                </View>

                <ActivityIndicator
                  size="small"
                  color="#38BDF8"
                  style={styles.loader}
                />
              </View>
            )}

            {confidence !== null &&
              status !== "SCANNING" && (
                <Text style={styles.confidenceText}>
                  Confidence: {confidence.toFixed(1)}%
                </Text>
              )}

            <Text
              style={[
                styles.statusText,
                status === "SUCCESS" && styles.successText,
                status === "FAILED" && styles.failedText,
              ]}
            >
              {statusMessage}
            </Text>
          </View>

          {!isCameraVisible ? (
            <TouchableOpacity
              style={[
                styles.actionButton,
                (status === "SCANNING" || !voterId) &&
                styles.buttonDisabled,
              ]}
              onPress={openCamera}
              activeOpacity={0.85}
              disabled={status === "SCANNING" || !voterId}
            >
              {status === "SCANNING" ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons
                    name="camera"
                    size={21}
                    color="#FFFFFF"
                  />

                  <Text style={styles.actionButtonText}>
                    Open Live Camera
                  </Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  (!cameraReady || status === "SCANNING") &&
                  styles.buttonDisabled,
                ]}
                onPress={captureAndVerify}
                activeOpacity={0.85}
                disabled={
                  !cameraReady || status === "SCANNING"
                }
              >
                {status === "SCANNING" ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons
                      name="scan"
                      size={21}
                      color="#FFFFFF"
                    />

                    <Text style={styles.actionButtonText}>
                      Capture and Verify
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeCamera}
                activeOpacity={0.85}
                disabled={status === "SCANNING"}
              >
                <Ionicons
                  name="close-outline"
                  size={21}
                  color="#CBD5E1"
                />

                <Text style={styles.cancelButtonText}>
                  Cancel Camera
                </Text>
              </TouchableOpacity>
            </>
          )}

          {status === "FAILED" && !isCameraVisible && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={openCamera}
              activeOpacity={0.85}
            >
              <Ionicons
                name="refresh"
                size={19}
                color="#EF4444"
              />

              <Text style={styles.retryButtonText}>
                Try Face Verification Again
              </Text>
            </TouchableOpacity>
          )}

          <Text style={styles.footerNote}>
            Ensure that your face is clearly visible, lighting is
            sufficient, and no other person appears in the frame.
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
    marginBottom: 10,
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  cardDesc: {
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 20,
  },

  voterIdHighlight: {
    color: "#38BDF8",
    fontWeight: "700",
  },

  cameraBox: {
    minHeight: 330,
    backgroundColor: "#040B17",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    marginBottom: 22,
    overflow: "hidden",
  },

  cameraWrapper: {
    width: "100%",
    height: 245,
    borderRadius: 15,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#000000",
  },

  camera: {
    flex: 1,
  },

  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },

  faceGuide: {
    width: 170,
    height: 210,
    borderRadius: 90,
    borderWidth: 3,
    borderColor: "rgba(56, 189, 248, 0.85)",
    backgroundColor: "transparent",
  },

  liveBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(4, 11, 23, 0.76)",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    marginRight: 6,
  },

  liveBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.7,
  },

  avatarContainer: {
    marginBottom: 12,
  },

  progressContainer: {
    width: "100%",
    alignItems: "center",
    marginVertical: 12,
  },

  progressBarBackground: {
    width: "85%",
    height: 6,
    backgroundColor: "#0E2443",
    borderRadius: 3,
    overflow: "hidden",
  },

  progressBarFill: {
    height: "100%",
    backgroundColor: "#38BDF8",
    borderRadius: 3,
  },

  loader: {
    marginTop: 10,
  },

  confidenceText: {
    color: "#E2E8F0",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 10,
  },

  statusText: {
    color: "#38BDF8",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 19,
    marginTop: 10,
  },

  successText: {
    color: "#10B981",
    fontWeight: "700",
  },

  failedText: {
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

  cancelButton: {
    height: 50,
    borderRadius: 15,
    backgroundColor: "rgba(148, 163, 184, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.25)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },

  cancelButtonText: {
    color: "#CBD5E1",
    fontSize: 15,
    fontWeight: "700",
  },

  retryButton: {
    minHeight: 50,
    borderRadius: 15,
    backgroundColor: "rgba(239, 68, 68, 0.11)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
  },

  retryButtonText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "700",
  },

  buttonDisabled: {
    opacity: 0.55,
  },

  footerNote: {
    color: "#64748B",
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
  },
});