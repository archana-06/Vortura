import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "10s", target: 20 },
    { duration: "1m", target: 100 },
    { duration: "10s", target: 0 }
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<2000"],
    checks: ["rate>0.99"]
  }
};

const BASE_URL = __ENV.K6_TARGET_URL || "https://vortura-backend.onrender.com";

export default function () {
  const res = http.get(`${BASE_URL}/api/health`);
  check(res, {
    "status is 200": (r) => r.status === 200,
    "response time < 2000ms": (r) => r.timings.duration < 2000
  });
  sleep(0.5);
}
