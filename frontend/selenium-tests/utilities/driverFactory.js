import { Builder } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import firefox from "selenium-webdriver/firefox.js";
import edge from "selenium-webdriver/edge.js";
import { config } from "../config/config.js";
import { logger } from "./logger.js";

let activeDriver = null;

export async function createDriver() {
  if (activeDriver) return activeDriver;

  const browserName = config.browser.toLowerCase();
  const isHeadless = config.headless;

  logger.info(`Initializing ${browserName} driver (Headless: ${isHeadless})...`);

  let builder = new Builder().forBrowser(browserName);

  if (browserName === "chrome") {
    const options = new chrome.Options();
    if (isHeadless) {
      options.addArguments("--headless=new");
    }
    options.addArguments(
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--window-size=1920,1080"
    );
    builder.setChromeOptions(options);
  } else if (browserName === "firefox") {
    const options = new firefox.Options();
    if (isHeadless) {
      options.addArguments("-headless");
    }
    builder.setFirefoxOptions(options);
  } else if (browserName === "edge") {
    const options = new edge.Options();
    if (isHeadless) {
      options.addArguments("--headless=new");
    }
    builder.setEdgeOptions(options);
  }

  activeDriver = await builder.build();
  await activeDriver.manage().setTimeouts({ implicit: 5000, pageLoad: 30000 });
  await activeDriver.manage().window().maximize();

  return activeDriver;
}

export async function getDriver() {
  if (!activeDriver) {
    await createDriver();
  }
  return activeDriver;
}

export async function quitDriver() {
  if (activeDriver) {
    await activeDriver.quit();
    activeDriver = null;
    logger.info("Driver successfully closed.");
  }
}
