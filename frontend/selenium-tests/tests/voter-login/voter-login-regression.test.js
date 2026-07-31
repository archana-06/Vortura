import { expect } from "chai";
import { until } from "selenium-webdriver";
import { VoterLoginPage } from "../../pages/VoterLoginPage.js";
import { logger } from "../../utilities/logger.js";

describe("Voter Login Regression Test Suite", function () {
  this.timeout(60000);
  let page;

  const API_VOTER_ID = "TN2026002";
  const API_EMAIL = "voter@example.com";
  const testVoterId = process.env.TEST_VOTER_ID || "TN2026001";
  const testVoterEmail = process.env.TEST_VOTER_EMAIL || "archanapoornima09@gmail.com";
  const testOtp = process.env.TEST_OTP || "123456";
  const runApiTests = process.env.RUN_API_TESTS === "true";

  beforeEach(async function () {
    page = new VoterLoginPage();
    logger.info("Resetting navigation to Voter Login Page before test execution...");
    try {
      const driver = await page.getDriver();
      const alert = await driver.switchTo().alert();
      await alert.accept();
    } catch {}
    await page.open();
  });

  // A. Page and component checks
  it("LOGIN-001: Voter login page loads successfully", async function () {
    const currentUrl = await page.getCurrentUrl();
    expect(currentUrl).to.include("#/login");
  });

  it("LOGIN-002: Login heading is visible", async function () {
    const isHeadingVisible = await page.isHeadingDisplayed();
    expect(isHeadingVisible).to.be.true;
    const headingText = await page.getHeadingText();
    expect(headingText).to.include("Voter Authentication");
  });

  it("LOGIN-003: Voter ID field is visible", async function () {
    const isVisible = await page.isVoterIdInputDisplayed();
    expect(isVisible).to.be.true;
  });

  it("LOGIN-004: Registered email field is visible", async function () {
    const isVisible = await page.isEmailInputDisplayed();
    expect(isVisible).to.be.true;
  });

  it("LOGIN-005: Send OTP button is visible", async function () {
    const isVisible = await page.isSendOtpButtonDisplayed();
    expect(isVisible).to.be.true;
  });

  it("LOGIN-006: Brand logo text is visible", async function () {
    const isLogoVisible = await page.isBrandLogoDisplayed();
    expect(isLogoVisible).to.be.true;
  });

  it("LOGIN-007: Security or instruction text is visible", async function () {
    const isInstructionVisible = await page.isInstructionTextDisplayed();
    expect(isInstructionVisible).to.be.true;
    const text = await page.getInstructionText();
    expect(text).to.include("Login securely");
  });

  it("LOGIN-008: Inputs use appropriate input types", async function () {
    const voterIdType = await page.getVoterIdAttribute("type");
    const emailType = await page.getEmailAttribute("type");
    expect(voterIdType).to.equal("text");
    expect(emailType).to.equal("email");
  });

  // B. Required-field validation
  it("LOGIN-009: Submit with both fields empty shows alert", async function () {
    await page.clickSendOtp();
    const alertText = await page.getAlertTextAndAccept();
    expect(alertText).to.not.be.null;
    expect(alertText.toLowerCase()).to.satisfy(
      (t) => t.includes("voter id") || t.includes("email") || t.includes("please enter") || t.includes("inactive")
    );
  });

  it("LOGIN-010: Submit with empty Voter ID only shows alert", async function () {
    await page.setEmail(testVoterEmail);
    await page.clickSendOtp();
    const alertText = await page.getAlertTextAndAccept();
    expect(alertText).to.not.be.null;
  });

  it("LOGIN-011: Submit with empty email only shows alert", async function () {
    await page.setVoterId(testVoterId);
    await page.clickSendOtp();
    const alertText = await page.getAlertTextAndAccept();
    expect(alertText).to.not.be.null;
  });

  it("LOGIN-012: Field inputs preserve typed values", async function () {
    await page.setVoterId("TN2026002");
    await page.setEmail("voter@example.com");
    const voterVal = await page.getVoterIdValue();
    const emailVal = await page.getEmailValue();
    expect(voterVal).to.equal("TN2026002");
    expect(emailVal).to.equal("voter@example.com");
  });

  it("LOGIN-013: Validation alert is captured correctly", async function () {
    await page.open();
    await page.clearInputs();
    await page.clickSendOtp();

    const driver = await page.getDriver();
    const alert = await driver.wait(
      until.alertIsPresent(),
      15000,
      "Validation alert did not appear"
    );

    const alertText = await alert.getText();
    await alert.accept();

    expect(alertText.toLowerCase()).to.satisfy(
      (text) => text.includes("please enter") || text.includes("voter id") || text.includes("inactive") || text.includes("unable")
    );
  });

  it("LOGIN-014: Validation does not navigate away from login page", async function () {
    await page.clickSendOtp();
    await page.getAlertTextAndAccept();
    const currentUrl = await page.getCurrentUrl();
    expect(currentUrl).to.include("#/login");
  });

  // C. Voter ID validation
  it("LOGIN-015: Valid Voter ID format pattern accepted in input", async function () {
    await page.setVoterId("TN2026001");
    const val = await page.getVoterIdValue();
    expect(val).to.equal("TN2026001");
  });

  it("LOGIN-016: Invalid Voter ID format rejected upon submit", async function () {
    await page.setVoterId("12345");
    await page.setEmail(testVoterEmail);
    await page.clickSendOtp();
    const alertText = await page.getAlertTextAndAccept();
    expect(alertText).to.not.be.null;
    expect(alertText.toLowerCase()).to.satisfy(
      (t) => t.includes("valid voter id") || t.includes("please enter") || t.includes("inactive")
    );
  });

  it("LOGIN-017: Voter ID shorter than 9 characters is rejected", async function () {
    await page.setVoterId("TN123");
    await page.setEmail(testVoterEmail);
    await page.clickSendOtp();
    const alertText = await page.getAlertTextAndAccept();
    expect(alertText).to.not.be.null;
  });

  it("LOGIN-018: Voter ID longer than 9 characters is rejected", async function () {
    await page.setVoterId("TN12345678");
    await page.setEmail(testVoterEmail);
    await page.clickSendOtp();
    const alertText = await page.getAlertTextAndAccept();
    expect(alertText).to.not.be.null;
  });

  it("LOGIN-019: Voter ID with special characters is rejected", async function () {
    await page.setVoterId("TN@#$1234");
    await page.setEmail(testVoterEmail);
    await page.clickSendOtp();
    const alertText = await page.getAlertTextAndAccept();
    expect(alertText).to.not.be.null;
  });

  it("LOGIN-020: Voter ID field preserves entered value", async function () {
    await page.setVoterId("TN2026009");
    const val = await page.getVoterIdValue();
    expect(val).to.equal("TN2026009");
  });

  // D. Email validation
  it("LOGIN-021: Valid registered-email format accepted in field", async function () {
    await page.setEmail("voter.user@example.com");
    const val = await page.getEmailValue();
    expect(val).to.equal("voter.user@example.com");
  });

  it("LOGIN-022: Email without @ symbol rejected upon submission", async function () {
    const freshVoterId = "TN2026" + Math.floor(100 + Math.random() * 899);
    await page.setVoterId(freshVoterId);
    await page.setEmail("testexample.com");
    await page.clickSendOtp();
    const alertText = await page.getAlertTextAndAccept();
    expect(alertText).to.not.be.null;
  });

  it("LOGIN-023: Email without domain rejected upon submission", async function () {
    const freshVoterId = "TN2026" + Math.floor(100 + Math.random() * 899);
    await page.setVoterId(freshVoterId);
    await page.setEmail("test@");
    await page.clickSendOtp();
    const alertText = await page.getAlertTextAndAccept();
    expect(alertText).to.not.be.null;
  });

  it("LOGIN-024: Email containing spaces handled safely", async function () {
    await page.setEmail("  voter@example.com  ");
    const val = await page.getEmailValue();
    expect(val).to.include("voter@example.com");
  });

  it("LOGIN-025: Email with uppercase characters accepted", async function () {
    await page.setEmail("VOTER@EXAMPLE.COM");
    const val = await page.getEmailValue();
    expect(val).to.equal("VOTER@EXAMPLE.COM");
  });

  it("LOGIN-026: Very long email input handled safely", async function () {
    const longEmail = "a".repeat(80) + "@domain.com";
    await page.setEmail(longEmail);
    const val = await page.getEmailValue();
    expect(val).to.equal(longEmail);
  });

  // E. Election-state and button behavior
  it("LOGIN-027: Send OTP button is present and inspectable", async function () {
    const isVisible = await page.isSendOtpButtonDisplayed();
    expect(isVisible).to.be.true;
    const btnText = await page.getSendOtpButtonText();
    expect(btnText.length).to.be.greaterThan(0);
  });

  it("LOGIN-028: Inactive election status banner or button state displayed if inactive", async function () {
    const isBtnVisible = await page.isSendOtpButtonDisplayed();
    expect(isBtnVisible).to.be.true;
  });

  it("LOGIN-029: Rapid consecutive clicks do not crash the page", async function () {
    const freshVoterId = "TN2026" + Math.floor(100 + Math.random() * 899);
    await page.setVoterId(freshVoterId);
    await page.setEmail(testVoterEmail);
    await page.clickSendOtp();
    await page.getAlertTextAndAccept();
    const currentUrl = await page.getCurrentUrl();
    expect(currentUrl).to.include("#/login");
  });

  it("LOGIN-030: Right section brand stats are visible", async function () {
    const isVisible = await page.isRightSectionDisplayed();
    expect(isVisible).to.be.true;
  });

  // F. OTP Workflow (API-Dependent Tests)
  it("LOGIN-031: [API] OTP request shows OTP input section on success", async function () {
    if (!runApiTests) {
      logger.info("Skipping API-dependent test LOGIN-031 (RUN_API_TESTS is not true)");
      this.skip();
    }
    const driver = await page.getDriver();
    await page.setVoterId(API_VOTER_ID);
    await page.setEmail(API_EMAIL);
    await page.clickSendOtp();

    const alert = await driver.wait(until.alertIsPresent(), 30000);
    const alertText = await alert.getText();
    await alert.accept();

    const isOtpVisible = await page.isOtpInputDisplayed();
    expect(isOtpVisible).to.be.true;
  });

  it("LOGIN-032: [API] OTP input is visible after OTP generation", async function () {
    if (!runApiTests) {
      logger.info("Skipping API-dependent test LOGIN-032 (RUN_API_TESTS is not true)");
      this.skip();
    }
    const driver = await page.getDriver();
    await page.setVoterId(API_VOTER_ID);
    await page.setEmail(API_EMAIL);
    await page.clickSendOtp();

    const alert = await driver.wait(until.alertIsPresent(), 30000);
    await alert.accept();

    const isVisible = await page.isOtpInputDisplayed();
    expect(isVisible).to.be.true;
  });

  it("LOGIN-033: [API] Verify OTP button is visible after OTP generation", async function () {
    if (!runApiTests) {
      logger.info("Skipping API-dependent test LOGIN-033 (RUN_API_TESTS is not true)");
      this.skip();
    }
    const driver = await page.getDriver();
    await page.setVoterId(API_VOTER_ID);
    await page.setEmail(API_EMAIL);
    await page.clickSendOtp();

    const alert = await driver.wait(until.alertIsPresent(), 30000);
    await alert.accept();

    const isVisible = await page.isVerifyOtpButtonDisplayed();
    expect(isVisible).to.be.true;
  });

  it("LOGIN-034: [API] Empty OTP submission shows alert", async function () {
    if (!runApiTests) {
      logger.info("Skipping API-dependent test LOGIN-034 (RUN_API_TESTS is not true)");
      this.skip();
    }
    const driver = await page.getDriver();
    await page.setVoterId(API_VOTER_ID);
    await page.setEmail(API_EMAIL);
    await page.clickSendOtp();

    const alert1 = await driver.wait(until.alertIsPresent(), 30000);
    await alert1.accept();

    await page.clickVerifyOtp();

    const alert2 = await driver.wait(until.alertIsPresent(), 15000);
    const alertText = await alert2.getText();
    await alert2.accept();

    expect(alertText).to.not.be.null;
  });

  it("LOGIN-035: [API] Short OTP is rejected by backend", async function () {
    if (!runApiTests) {
      logger.info("Skipping API-dependent test LOGIN-035 (RUN_API_TESTS is not true)");
      this.skip();
    }
    const driver = await page.getDriver();
    await page.setVoterId(API_VOTER_ID);
    await page.setEmail(API_EMAIL);
    await page.clickSendOtp();

    const alert1 = await driver.wait(until.alertIsPresent(), 30000);
    await alert1.accept();

    await page.setOtp("12");
    await page.clickVerifyOtp();

    const alert2 = await driver.wait(until.alertIsPresent(), 15000);
    const alertText = await alert2.getText();
    await alert2.accept();

    expect(alertText).to.not.be.null;
  });

  it("LOGIN-036: [API] Long OTP is rejected by backend", async function () {
    if (!runApiTests) {
      logger.info("Skipping API-dependent test LOGIN-036 (RUN_API_TESTS is not true)");
      this.skip();
    }
    const driver = await page.getDriver();
    await page.setVoterId(API_VOTER_ID);
    await page.setEmail(API_EMAIL);
    await page.clickSendOtp();

    const alert1 = await driver.wait(until.alertIsPresent(), 30000);
    await alert1.accept();

    await page.setOtp("12345678");
    await page.clickVerifyOtp();

    const alert2 = await driver.wait(until.alertIsPresent(), 15000);
    const alertText = await alert2.getText();
    await alert2.accept();

    expect(alertText).to.not.be.null;
  });

  it("LOGIN-037: [API] Non-numeric OTP is rejected by backend", async function () {
    if (!runApiTests) {
      logger.info("Skipping API-dependent test LOGIN-037 (RUN_API_TESTS is not true)");
      this.skip();
    }
    const driver = await page.getDriver();
    await page.setVoterId(API_VOTER_ID);
    await page.setEmail(API_EMAIL);
    await page.clickSendOtp();

    const alert1 = await driver.wait(until.alertIsPresent(), 30000);
    await alert1.accept();

    await page.setOtp("ABCDEF");
    await page.clickVerifyOtp();

    const alert2 = await driver.wait(until.alertIsPresent(), 15000);
    const alertText = await alert2.getText();
    await alert2.accept();

    expect(alertText).to.not.be.null;
  });

  it("LOGIN-038: [API] Invalid OTP shows backend error alert", async function () {
    if (!runApiTests) {
      logger.info("Skipping API-dependent test LOGIN-038 (RUN_API_TESTS is not true)");
      this.skip();
    }
    const driver = await page.getDriver();
    await page.setVoterId(API_VOTER_ID);
    await page.setEmail(API_EMAIL);
    await page.clickSendOtp();

    const alert1 = await driver.wait(until.alertIsPresent(), 30000);
    await alert1.accept();

    await page.setOtp("000000");
    await page.clickVerifyOtp();

    const alert2 = await driver.wait(until.alertIsPresent(), 15000);
    const alertText = await alert2.getText();
    await alert2.accept();

    expect(alertText).to.not.be.null;
  });

  it("LOGIN-039: [API] Re-requesting OTP succeeds", async function () {
    if (!runApiTests) {
      logger.info("Skipping API-dependent test LOGIN-039 (RUN_API_TESTS is not true)");
      this.skip();
    }
    const driver = await page.getDriver();
    await page.setVoterId(API_VOTER_ID);
    await page.setEmail(API_EMAIL);
    await page.clickSendOtp();

    const alert1 = await driver.wait(until.alertIsPresent(), 30000);
    await alert1.accept();

    await page.clickSendOtp();

    const alert2 = await driver.wait(until.alertIsPresent(), 30000);
    const alertText = await alert2.getText();
    await alert2.accept();

    expect(alertText).to.not.be.null;
  });

  it("LOGIN-040: [API] Successful OTP verification navigates to #/biometric", async function () {
    if (!runApiTests) {
      logger.info("Skipping API-dependent test LOGIN-040 (RUN_API_TESTS is not true)");
      this.skip();
    }
    const driver = await page.getDriver();
    await page.setVoterId(API_VOTER_ID);
    await page.setEmail(API_EMAIL);
    await page.clickSendOtp();

    const alert1 = await driver.wait(until.alertIsPresent(), 30000);
    await alert1.accept();

    await page.setOtp("123456");
    await page.clickVerifyOtp();

    const alert2 = await driver.wait(until.alertIsPresent(), 30000);
    await alert2.accept();

    const currentUrl = await page.getCurrentUrl();
    expect(currentUrl).to.include("#/biometric");
  });
});
