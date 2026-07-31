import { By } from "selenium-webdriver";
import { BasePage } from "./BasePage.js";
import { config } from "../config/config.js";

export class LandingPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.mainHeading = By.xpath("//h1[contains(text(), 'Vortura') or contains(text(), 'Secure')]");
    this.voterLoginButton = By.css("a[href*='login']");
    this.adminPanelButton = By.css("a[href*='admin-login']");
  }

  async open() {
    await this.navigateTo(config.routes.landing);
  }

  async getHeadingText() {
    return await this.getText(this.mainHeading);
  }

  async isHeadingDisplayed() {
    return await this.isDisplayed(this.mainHeading);
  }
}
