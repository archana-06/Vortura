import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { logger } from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resultsList = [];

export function recordTestResult(result) {
  resultsList.push(result);
}

export async function generateExcelReport() {
  try {
    const excelDir = path.resolve(__dirname, "..", "excel");
    if (!fs.existsSync(excelDir)) {
      fs.mkdirSync(excelDir, { recursive: true });
    }

    const filePath = path.join(excelDir, "E2E_Report.xlsx");
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("E2E Test Execution Summary");

    sheet.columns = [
      { header: "#", key: "id", width: 6 },
      { header: "Test Suite", key: "suite", width: 25 },
      { header: "Test Title", key: "title", width: 45 },
      { header: "Status", key: "status", width: 12 },
      { header: "Duration (ms)", key: "duration", width: 15 },
      { header: "URL", key: "url", width: 40 },
      { header: "Failure Message", key: "error", width: 50 },
      { header: "Timestamp", key: "timestamp", width: 22 }
    ];

    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFF" } };
    sheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "0F766E" }
    };

    resultsList.forEach((res, index) => {
      const row = sheet.addRow({
        id: index + 1,
        suite: res.suite || "General",
        title: res.title,
        status: res.status,
        duration: res.duration,
        url: res.url || "N/A",
        error: res.error || "-",
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19)
      });

      const statusCell = row.getCell("status");
      if (res.status === "PASSED") {
        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "D1FAE5" }
        };
        statusCell.font = { color: { argb: "065F46" }, bold: true };
      } else if (res.status === "FAILED") {
        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FEE2E2" }
        };
        statusCell.font = { color: { argb: "991B1B" }, bold: true };
      }
    });

    await workbook.xlsx.writeFile(filePath);
    logger.info(`Excel E2E Report generated at: ${filePath}`);
  } catch (err) {
    logger.error(`Failed to generate Excel report: ${err.message}`);
  }
}
