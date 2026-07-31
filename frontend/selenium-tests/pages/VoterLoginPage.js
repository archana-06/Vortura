import { By, until } from "selenium-webdriver";
import { BasePage } from "./BasePage.js";
import { config } from "../config/config.js";

export class VoterLoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.pageHeading = By.xpath("//h2[contains(text(), 'Voter Authentication')]");
    this.brandLogo = By.xpath("//h1[contains(text(), 'Vortura')]");
    this.instructionText = By.xpath("//p[contains(text(), 'Login securely using your Voter ID')]");
    this.inactiveBanner = By.xpath("//*[contains(text(), 'VOTING SESSION CLOSED') or contains(text(), 'Election is currently inactive')]");

    this.voterIdInput = By.css("input[placeholder='Enter Voter ID']");
    this.emailInput = By.css("input[placeholder='Enter Registered Email Address']");
    this.sendOtpButton = By.xpath("//button[contains(text(), 'Send OTP') or contains(text(), 'Voting Session Inactive')]");

    this.otpInput = By.css("input[placeholder='Enter OTP']");
    this.verifyOtpButton = By.xpath("//button[contains(text(), 'Verify OTP')]");

    this.rightSectionHeading = By.xpath("//h2[contains(text(), 'Trusted Digital Elections')]");
    this.securityStat = By.xpath("//p[contains(text(), 'Security')]");
  }

  async open() {
    await this.navigateTo(config.routes.voterLogin);
  }

  async isPageLoaded() {
    return (
      (await this.isDisplayed(this.voterIdInput)) &&
      (await this.isDisplayed(this.emailInput))
    );
  }

  async getHeadingText() {
    return await this.getText(this.pageHeading);
  }

  async isHeadingDisplayed() {
    return await this.isDisplayed(this.pageHeading);
  }

  async isBrandLogoDisplayed() {
    return await this.isDisplayed(this.brandLogo);
  }

  async getInstructionText() {
    return await this.getText(this.instructionText);
  }

  async isInstructionTextDisplayed() {
    return await this.isDisplayed(this.instructionText);
  }

  async isVoterIdInputDisplayed() {
    return await this.isDisplayed(this.voterIdInput);
  }

  async isEmailInputDisplayed() {
    return await this.isDisplayed(this.emailInput);
  }

  async isSendOtpButtonDisplayed() {
    return await this.isDisplayed(this.sendOtpButton);
  }

  async getSendOtpButtonText() {
    return await this.getText(this.sendOtpButton);
  }

  async isSendOtpButtonEnabled() {
    const element = await this.findElement(this.sendOtpButton);
    return await element.isEnabled();
  }

  async getVoterIdAttribute(attributeName) {
    const element = await this.findElement(this.voterIdInput);
    return await element.getAttribute(attributeName);
  }

  async getEmailAttribute(attributeName) {
    const element = await this.findElement(this.emailInput);
    return await element.getAttribute(attributeName);
  }

  async clearReactInput(locator) {
    const driver = await this.getDriver();
    const element = await this.findElement(locator);
    await driver.executeScript(`
      const el = arguments[0];
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(el, '');
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    `, element);
  }

  async clearInputs() {
    await this.clearReactInput(this.voterIdInput);
    await this.clearReactInput(this.emailInput);
  }

  async setVoterId(value) {
    if (!value) {
      await this.clearReactInput(this.voterIdInput);
      return;
    }
    await this.sendKeys(this.voterIdInput, value);
  }

  async setEmail(value) {
    if (!value) {
      await this.clearReactInput(this.emailInput);
      return;
    }
    await this.sendKeys(this.emailInput, value);
  }

  async getVoterIdValue() {
    return await this.getVoterIdAttribute("value");
  }

  async getEmailValue() {
    return await this.getEmailAttribute("value");
  }

  async clickSendOtp() {
    const driver = await this.getDriver();
    const button = await driver.findElement(
      By.xpath("//button[contains(text(), 'Send OTP') or contains(text(), 'Voting Session Inactive')]")
    );
    await driver.executeScript(
      "arguments[0].scrollIntoView({block: 'center'});",
      button
    );
    await driver.wait(until.elementIsVisible(button), 10000);
    await driver.executeScript("arguments[0].click();", button);
  }

  async isInactiveBannerDisplayed() {
    return await this.isDisplayed(this.inactiveBanner);
  }

  async isOtpInputDisplayed() {
    return await this.isDisplayed(this.otpInput);
  }

  async isVerifyOtpButtonDisplayed() {
    return await this.isDisplayed(this.verifyOtpButton);
  }

  async setOtp(value) {
    await this.sendKeys(this.otpInput, value);
  }

  async getOtpValue() {
    const element = await this.findElement(this.otpInput);
    return await element.getAttribute("value");
  }

  async clickVerifyOtp() {
    const driver = await this.getDriver();
    const button = await driver.findElement(
      By.xpath("//button[contains(text(), 'Verify OTP')]")
    );
    await driver.executeScript(
      "arguments[0].scrollIntoView({block: 'center'});",
      button
    );
    await driver.wait(until.elementIsVisible(button), 10000);
    await driver.executeScript("arguments[0].click();", button);
  }

  async isRightSectionDisplayed() {
    return await this.isDisplayed(this.rightSectionHeading);
  }

  async refreshPage() {
    const driver = await this.getDriver();
    await driver.navigate().refresh();
  }
}
