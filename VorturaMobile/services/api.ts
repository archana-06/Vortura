import axios from "axios";
import { Platform } from "react-native";

const getBaseUrl = () => {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:8000/api/voters";
    }
    return `http://${hostname}:8000/api/voters`;
  }
  return "http://192.168.31.59:8000/api/voters";
};

const API_BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 25000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const voterApi = {
  login: async (voterId: string) => {
    const res = await api.post("/login", { voterId });
    return res.data;
  },
  generateOtp: async (voterId: string, email?: string) => {
    const res = await api.post("/generate-otp", { voterId, email });
    return res.data;
  },
  verifyOtp: async (voterId: string, otp: string) => {
    const res = await api.post("/verify-otp", { voterId, otp });
    return res.data;
  },
  verifyFace: async (voterId: string, predictedVoterId: string, confidence: number, faceMatch: boolean) => {
    const res = await api.post("/verify-face", { voterId, predictedVoterId, confidence, faceMatch });
    return res.data;
  },
  getLocationInfo: async (voterId: string) => {
    const res = await api.get(`/location-info/${voterId}`);
    return res.data;
  },
  verifyGeoLocation: async (voterId: string, liveLatitude: number, liveLongitude: number) => {
    const res = await api.post("/verify-geolocation", { voterId, liveLatitude, liveLongitude });
    return res.data;
  },
  verifyFingerprint: async (voterId: string, fingerprintMatch: boolean) => {
    const res = await api.post("/verify-fingerprint", { voterId, fingerprintMatch });
    return res.data;
  },
  getCandidates: async () => {
    const res = await api.get("/candidates");
    return res.data;
  },
  castVote: async (voterId: string, candidateName: string, party: string) => {
    const res = await api.post("/cast-vote", { voterId, candidateName, party });
    return res.data;
  },
};

export default api;