import { By, until } from "selenium-webdriver";
import { config } from "../config/config.js";
import { getDriver } from "../utilities/driverFactory.js";
import { logger } from "../utilities/logger.js";

export class BasePage {
  constructor(driver = null) {
    this._driver = driver;
    this.baseUrl = config.baseUrl;
  }

  async getDriver() {
    if (this._driver) return this._driver;
    return await getDriver();
  }

  async navigateTo(path = "") {
    const driver = await this.getDriver();
    const fullUrl = `${this.baseUrl}${path}`;
    logger.info(`Navigating to: ${fullUrl}`);
    await driver.get(fullUrl);
  }

  async getCurrentUrl() {
    const driver = await this.getDriver();
    return await driver.getCurrentUrl();
  }

  async findElement(locator, timeout = config.defaultTimeout) {
    const driver = await this.getDriver();
    const element = await driver.wait(
      until.elementLocated(locator),
      timeout,
      `Element not located: ${locator}`
    );
    await driver.wait(
      until.elementIsVisible(element),
      timeout,
      `Element not visible: ${locator}`
    );
    return element;
  }

  async click(locator, timeout = config.defaultTimeout) {
    logger.info(`Clicking element: ${locator}`);
    const driver = await this.getDriver();
    const element = await this.findElement(locator, timeout);
    try {
      await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", element);
      await element.click();
    } catch (err) {
      logger.warn(`Standard click failed, attempting JS click fallback: ${err.message}`);
      await driver.executeScript("arguments[0].click();", element);
    }
  }

  async sendKeys(locator, text, timeout = config.defaultTimeout) {
    logger.info(`Typing into element ${locator}: "${text}"`);
    const driver = await this.getDriver();
    const element = await this.findElement(locator, timeout);
    try {
      await driver.executeScript(
        "arguments[0].value = ''; arguments[0].dispatchEvent(new Event('input', { bubbles: true }));",
        element
      );
    } catch {
      await element.clear();
    }
    if (text) {
      await element.sendKeys(text);
    }
  }

  async getText(locator, timeout = config.defaultTimeout) {
    const element = await this.findElement(locator, timeout);
    return await element.getText();
  }

  async isDisplayed(locator, timeout = config.defaultTimeout) {
    try {
      const element = await this.findElement(locator, timeout);
      return await element.isDisplayed();
    } catch {
      return false;
    }
  }

  async getAlertTextAndAccept(timeout = 10000) {
    const driver = await this.getDriver();
    try {
      await driver.wait(until.alertIsPresent(), timeout);
      const alert = await driver.switchTo().alert();
      const text = await alert.getText();
      logger.info(`Browser Alert Text captured: "${text}"`);
      await alert.accept();
      return text;
    } catch (err) {
      logger.warn(`No alert present or failed to capture: ${err.message}`);
      return null;
    }
  }
}
