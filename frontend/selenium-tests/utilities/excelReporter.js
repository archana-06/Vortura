import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { logger } from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resultsList = [];
const executionLogs = [];

export function recordTestResult(result) {
  resultsList.push(result);
}

export function recordLogEntry(log) {
  executionLogs.push(log);
}

export async function generateExcelReport(customFileName = "Selenium_E2E_Report.xlsx") {
  try {
    const excelDir = path.resolve(__dirname, "..", "excel");
    if (!fs.existsSync(excelDir)) {
      fs.mkdirSync(excelDir, { recursive: true });
    }

    const filePath = path.join(excelDir, customFileName);
    const legacyPath = path.join(excelDir, "E2E_Report.xlsx");
    const workbook = new ExcelJS.Workbook();

    // Calculate Summary Stats
    const total = resultsList.length;
    const passed = resultsList.filter((r) => r.status === "PASSED" || r.status === "PASS").length;
    const failed = resultsList.filter((r) => r.status === "FAILED" || r.status === "FAIL").length;
    const skipped = resultsList.filter((r) => r.status === "SKIPPED" || r.status === "SKIP" || r.status === "PENDING").length;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(2) + "%" : "0%";
    const totalDuration = resultsList.reduce((acc, r) => acc + (r.duration || 0), 0);

    // ----------------------------------------------------
    // SHEET 1: Summary
    // ----------------------------------------------------
    const summarySheet = workbook.addWorksheet("Summary");
    summarySheet.columns = [
      { header: "Metric", key: "metric", width: 25 },
      { header: "Value", key: "value", width: 45 }
    ];

    summarySheet.addRows([
      { metric: "Execution Date", value: new Date().toISOString().replace("T", " ").substring(0, 19) },
      { metric: "Environment", value: process.env.BASE_URL || "https://archana-06.github.io/Vortura" },
      { metric: "Browser", value: process.env.BROWSER || "chrome" },
      { metric: "Total Tests", value: total },
      { metric: "Passed", value: passed },
      { metric: "Failed", value: failed },
      { metric: "Skipped", value: skipped },
      { metric: "Pass Percentage", value: passRate },
      { metric: "Total Duration (ms)", value: totalDuration }
    ]);

    summarySheet.getRow(1).font = { bold: true, color: { argb: "FFFFFF" } };
    summarySheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "0F766E" } };

    // ----------------------------------------------------
    // SHEET 2: Test Cases
    // ----------------------------------------------------
    const testCasesSheet = workbook.addWorksheet("Test Cases");
    testCasesSheet.columns = [
      { header: "Test ID", key: "testId", width: 18 },
      { header: "Module", key: "module", width: 22 },
      { header: "Scenario", key: "scenario", width: 45 },
      { header: "Preconditions", key: "preconditions", width: 30 },
      { header: "Test Steps", key: "testSteps", width: 45 },
      { header: "Expected Result", key: "expectedResult", width: 35 },
      { header: "Actual Result", key: "actualResult", width: 35 },
      { header: "Browser", key: "browser", width: 12 },
      { header: "Status", key: "status", width: 12 },
      { header: "Start Time", key: "startTime", width: 20 },
      { header: "End Time", key: "endTime", width: 20 },
      { header: "Duration (ms)", key: "duration", width: 15 },
      { header: "Screenshot Path", key: "screenshotPath", width: 40 }
    ];

    testCasesSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFF" } };
    testCasesSheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "1E3A8A" } };

    resultsList.forEach((r, idx) => {
      const row = testCasesSheet.addRow({
        testId: r.testId || `WEB-TEST-${String(idx + 1).padStart(3, "0")}`,
        module: r.module || r.suite || "General",
        scenario: r.scenario || r.title || "Web UI Automation Test Case",
        preconditions: r.preconditions || "Browser open on Vortura app route",
        testSteps: r.testSteps || "1. Navigate to route\n2. Interact with element\n3. Verify state",
        expectedResult: r.expectedResult || "Element state/navigation matches specification",
        actualResult: r.actualResult || (r.status === "FAILED" ? r.error : "Verification successful"),
        browser: r.browser || process.env.BROWSER || "chrome",
        status: r.status || "PASSED",
        startTime: r.startTime || new Date().toISOString().substring(11, 19),
        endTime: r.endTime || new Date().toISOString().substring(11, 19),
        duration: r.duration || 0,
        screenshotPath: r.screenshotPath || "-"
      });

      const statusCell = row.getCell("status");
      if (r.status === "PASSED" || r.status === "PASS") {
        statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "D1FAE5" } };
        statusCell.font = { color: { argb: "065F46" }, bold: true };
      } else if (r.status === "FAILED" || r.status === "FAIL") {
        statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FEE2E2" } };
        statusCell.font = { color: { argb: "991B1B" }, bold: true };
      } else {
        statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FEF3C7" } };
        statusCell.font = { color: { argb: "92400E" }, bold: true };
      }
    });

    // ----------------------------------------------------
    // SHEET 3: Failed Tests
    // ----------------------------------------------------
    const failedSheet = workbook.addWorksheet("Failed Tests");
    failedSheet.columns = [
      { header: "Test ID", key: "testId", width: 18 },
      { header: "Test Name", key: "testName", width: 40 },
      { header: "Failure Reason", key: "failureReason", width: 45 },
      { header: "Stack Trace", key: "stackTrace", width: 50 },
      { header: "Current URL", key: "currentUrl", width: 40 },
      { header: "Screenshot Path", key: "screenshotPath", width: 40 },
      { header: "Browser", key: "browser", width: 12 }
    ];

    failedSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFF" } };
    failedSheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "991B1B" } };

    const failedRecords = resultsList.filter((r) => r.status === "FAILED" || r.status === "FAIL");
    failedRecords.forEach((f, idx) => {
      failedSheet.addRow({
        testId: f.testId || `WEB-FAIL-${String(idx + 1).padStart(3, "0")}`,
        testName: f.title || f.scenario,
        failureReason: f.error || "Assertion failed",
        stackTrace: f.stack || f.error || "-",
        currentUrl: f.url || f.currentUrl || "-",
        screenshotPath: f.screenshotPath || "-",
        browser: f.browser || process.env.BROWSER || "chrome"
      });
    });

    // ----------------------------------------------------
    // SHEET 4: Execution Logs
    // ----------------------------------------------------
    const logsSheet = workbook.addWorksheet("Execution Logs");
    logsSheet.columns = [
      { header: "Timestamp", key: "timestamp", width: 22 },
      { header: "Test ID", key: "testId", width: 18 },
      { header: "Step", key: "step", width: 45 },
      { header: "Result", key: "result", width: 15 },
      { header: "Remarks", key: "remarks", width: 40 }
    ];

    logsSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFF" } };
    logsSheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "374151" } };

    if (executionLogs.length > 0) {
      executionLogs.forEach((l) => logsSheet.addRow(l));
    } else {
      resultsList.forEach((r, idx) => {
        logsSheet.addRow({
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
          testId: r.testId || `WEB-TEST-${String(idx + 1).padStart(3, "0")}`,
          step: `Executed assertion: ${r.title}`,
          result: r.status,
          remarks: r.error ? `Failed: ${r.error}` : "Clean execution"
        });
      });
    }

    await workbook.xlsx.writeFile(filePath);
    await workbook.xlsx.writeFile(legacyPath).catch(() => null);
    logger.info(`Excel E2E Report successfully written to: ${filePath}`);
  } catch (err) {
    logger.error(`Failed to generate Excel report: ${err.message}`);
  }
}
