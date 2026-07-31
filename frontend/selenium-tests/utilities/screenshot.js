import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { logger } from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function captureScreenshot(driver, testName) {
  try {
    const sanitizeName = testName.replace(/[^a-zA-Z0-9_-]/g, "_");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${sanitizeName}_${timestamp}.png`;

    const screenshotsDir = path.resolve(__dirname, "..", "screenshots");
    const failuresDir = path.resolve(__dirname, "..", "reports", "failures");

    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    if (!fs.existsSync(failuresDir)) {
      fs.mkdirSync(failuresDir, { recursive: true });
    }

    const imageBase64 = await driver.takeScreenshot();

    const mainPath = path.join(screenshotsDir, filename);
    const failurePath = path.join(failuresDir, filename);

    fs.writeFileSync(mainPath, imageBase64, "base64");
    fs.writeFileSync(failurePath, imageBase64, "base64");

    logger.info(`Screenshot captured: ${mainPath}`);
    return mainPath;
  } catch (err) {
    logger.error(`Failed to capture screenshot: ${err.message}`);
    return null;
  }
}
