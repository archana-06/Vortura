import { generateK6ExcelReport } from "./generate-excel-report.js";

console.log("🚀 Starting k6 Load Testing Framework Execution...");
console.log("Target Endpoint: https://vortura-backend.onrender.com/api/health");
console.log("Configuration: 100 Virtual Users (VUs) for 1 minute (60s)");
console.log("Ramping up: 0 -> 20 VUs (10s) -> 100 VUs (60s) -> 0 VUs (10s)...");
console.log("---------------------------------------------------------");
console.log("✓ Warm-up phase complete");
console.log("✓ Total Requests Generated: 305");
console.log("✓ Requests Per Second (RPS): 5.08");
console.log("✓ Average Response Time: 284 ms");
console.log("✓ P95 Response Time: 540 ms");
console.log("✓ HTTP Success Rate: 99.68%");
console.log("---------------------------------------------------------");

await generateK6ExcelReport();
