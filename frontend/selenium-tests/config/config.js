export const config = {
  baseUrl: process.env.BASE_URL || "https://archana-06.github.io/Vortura",
  browser: process.env.BROWSER || "chrome",
  headless: process.env.HEADLESS !== "false",
  defaultTimeout: 15000,
  pollInterval: 500,
  routes: {
    landing: "/",
    voterLogin: "/#/login",
    biometric: "/#/biometric",
    fingerprint: "/#/fingerprint",
    geolocation: "/#/geolocation",
    votingDashboard: "/#/voting-dashboard",
    voteSuccess: "/#/vote-success",
    adminLogin: "/#/admin-login",
    adminDashboard: "/#/admin-dashboard",
    electionControl: "/#/election-control",
    candidateManagement: "/#/candidate-management",
    results: "/#/results",
    blockchain: "/#/blockchain",
    auditLogs: "/#/audit-logs",
    faceRegistration: "/#/face-registration"
  }
};
