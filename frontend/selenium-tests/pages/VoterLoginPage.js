import { By } from "selenium-webdriver";
import { BasePage } from "./BasePage.js";
import { config } from "../config/config.js";

export class VoterLoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.voterIdInput = By.css("input[placeholder='Enter Voter ID']");
    this.emailInput = By.css("input[placeholder='Enter Registered Email Address']");
    this.sendOtpButton = By.xpath("//button[contains(text(), 'Send OTP') or contains(text(), 'Voting Session Inactive')]");
    this.pageHeading = By.xpath("//h1[contains(text(), 'Voter Portal') or contains(text(), 'Authentication')]");
  }

  async open() {
    await this.navigateTo(config.routes.voterLogin);
  }

  async clickSendOtp() {
    await this.click(this.sendOtpButton);
  }

  async isPageLoaded() {
    return (
      (await this.isDisplayed(this.voterIdInput)) &&
      (await this.isDisplayed(this.emailInput))
    );
  }
}
