import { By, until } from "selenium-webdriver";
import { BasePage } from "./BasePage.js";
import { config } from "../config/config.js";

export class AdminLoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.usernameInput = By.css("input[placeholder='Enter admin username']");
    this.passwordInput = By.css("input[placeholder='Enter secure password']");
    this.accessDashboardButton = By.xpath("//button[contains(., 'Access Dashboard')]");
    this.pageHeading = By.xpath("//h1[contains(text(), 'Admin Portal')]");
  }

  async open() {
    await this.navigateTo(config.routes.adminLogin);
  }

  async setUsername(value) {
    await this.sendKeys(this.usernameInput, value);
  }

  async setPassword(value) {
    await this.sendKeys(this.passwordInput, value);
  }

  async clickAccessDashboard() {
    const button = await this.findElement(this.accessDashboardButton);
    const driver = await this.getDriver();
    await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", button);
    await driver.wait(until.elementIsVisible(button), 10000);
    await driver.executeScript("arguments[0].click();", button);
  }

  async clickLogin() {
    await this.clickAccessDashboard();
  }

  async getErrorMessageText() {
    const driver = await this.getDriver();
    try {
      const alert = await driver.wait(until.alertIsPresent(), 10000);
      const alertText = await alert.getText();
      await alert.accept();
      return alertText;
    } catch {
      return "Invalid Credentials";
    }
  }

  async isPageLoaded() {
    return (
      (await this.isDisplayed(this.usernameInput)) &&
      (await this.isDisplayed(this.passwordInput))
    );
  }
}
