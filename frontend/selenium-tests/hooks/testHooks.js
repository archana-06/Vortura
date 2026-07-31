import { createDriver, getDriver, quitDriver } from "../utilities/driverFactory.js";
import { captureScreenshot } from "../utilities/screenshot.js";
import { recordTestResult, generateExcelReport } from "../utilities/excelReporter.js";
import { logger } from "../utilities/logger.js";

export const mochaHooks = {
  async beforeAll() {
    logger.info("================ STARTING E2E TEST SUITE EXECUTION ================");
    await createDriver();
  },

  async beforeEach() {
    const currentTest = this.currentTest;
    logger.info(`START TEST: [${currentTest?.parent?.title || "Suite"}] -> ${currentTest?.title}`);
  },

  async afterEach() {
    const currentTest = this.currentTest;
    const duration = currentTest ? (currentTest.duration || 0) : 0;
    const driver = await getDriver();
    let currentUrl = "N/A";
    let failureMsg = null;

    if (driver) {
      try {
        currentUrl = await driver.getCurrentUrl();
      } catch {
        // Driver closed
      }
    }

    if (currentTest && currentTest.state === "failed") {
      failureMsg = currentTest.err ? currentTest.err.message : "Unknown Error";
      logger.error(`FAILED TEST: ${currentTest.title} - ${failureMsg}`);

      if (driver) {
        await captureScreenshot(driver, currentTest.title);
        try {
          const logs = await driver.manage().logs().get("browser");
          if (logs && logs.length > 0) {
            logger.warn(`Browser Console Logs for [${currentTest.title}]:`);
            logs.forEach((log) => logger.warn(`  [${log.level.name}] ${log.message}`));
          }
        } catch {
          // Ignored
        }
      }

      recordTestResult({
        suite: currentTest.parent?.title || "Default Suite",
        title: currentTest.title,
        status: "FAILED",
        duration,
        url: currentUrl,
        error: failureMsg
      });
    } else if (currentTest) {
      logger.info(`PASSED TEST: ${currentTest.title} (${duration}ms)`);
      recordTestResult({
        suite: currentTest.parent?.title || "Default Suite",
        title: currentTest.title,
        status: "PASSED",
        duration,
        url: currentUrl,
        error: null
      });
    }

    await generateExcelReport().catch((err) => logger.error(`Excel error: ${err.message}`));
  },

  async afterAll() {
    logger.info("================ FINISHING E2E TEST SUITE EXECUTION ================");
    await generateExcelReport().catch((err) => logger.error(`Excel error: ${err.message}`));
    await quitDriver();
  }
};
