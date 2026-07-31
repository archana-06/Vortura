import { By } from "selenium-webdriver";
import { BasePage } from "./BasePage.js";
import { config } from "../config/config.js";

export class AdminLoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.usernameInput = By.css("input[placeholder='Enter admin username']");
    this.passwordInput = By.css("input[placeholder='Enter secure password']");
    this.accessDashboardButton = By.xpath("//button[contains(text(), 'Access Dashboard')]");
    this.pageHeading = By.xpath("//h1[contains(text(), 'Admin Portal')]");
  }

  async open() {
    await this.navigateTo(config.routes.adminLogin);
  }

  async clickAccessDashboard() {
    await this.click(this.accessDashboardButton);
  }

  async isPageLoaded() {
    return (
      (await this.isDisplayed(this.usernameInput)) &&
      (await this.isDisplayed(this.passwordInput))
    );
  }
}
