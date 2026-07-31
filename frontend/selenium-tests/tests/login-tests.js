import { expect } from "chai";
import { VoterLoginPage } from "../pages/VoterLoginPage.js";
import { AdminLoginPage } from "../pages/AdminLoginPage.js";
import { logger } from "../utilities/logger.js";
import { until } from "selenium-webdriver";

describe("Combined Login Smoke & Regression Tests (Voter & Admin)", function () {
  this.timeout(45000);
  let voterPage;
  let adminPage;

  beforeEach(async function () {
    voterPage = new VoterLoginPage();
    adminPage = new AdminLoginPage();
    try {
      const driver = await voterPage.getDriver();
      const alert = await driver.switchTo().alert();
      await alert.accept();
    } catch {}
  });

  // A. Voter Login Tests
  describe("Voter Login Suite", function () {
    it("WEB-LOGIN-001: Voter Login Page loads correctly", async function () {
      await voterPage.open();
      const currentUrl = await voterPage.getCurrentUrl();
      expect(currentUrl).to.include("#/login");
      const isHeadingVisible = await voterPage.isHeadingDisplayed();
      expect(isHeadingVisible).to.be.true;
    });

    it("WEB-LOGIN-002: Voter ID input field is visible and accessible", async function () {
      await voterPage.open();
      const isVisible = await voterPage.isVoterIdInputDisplayed();
      expect(isVisible).to.be.true;
    });

    it("WEB-LOGIN-003: Email input field is visible and accessible", async function () {
      await voterPage.open();
      const isVisible = await voterPage.isEmailInputDisplayed();
      expect(isVisible).to.be.true;
    });

    it("WEB-LOGIN-004: Send OTP button is displayed", async function () {
      await voterPage.open();
      const isVisible = await voterPage.isSendOtpButtonDisplayed();
      expect(isVisible).to.be.true;
    });

    it("WEB-LOGIN-005: Empty voter submission shows validation alert", async function () {
      await voterPage.open();
      await voterPage.clearInputs();
      await voterPage.clickSendOtp();

      const driver = await voterPage.getDriver();
      const alert = await driver.wait(
        until.alertIsPresent(),
        15000,
        "Validation alert did not appear"
      );
      const alertText = await alert.getText();
      await alert.accept();

      expect(alertText.toLowerCase()).to.satisfy(
        (t) => t.includes("please enter") || t.includes("voter id") || t.includes("inactive") || t.includes("unable")
      );
    });

    it("WEB-LOGIN-006: Invalid Voter ID format shows alert", async function () {
      await voterPage.open();
      await voterPage.setVoterId("INVALID123");
      await voterPage.setEmail("voter@example.com");
      await voterPage.clickSendOtp();

      const driver = await voterPage.getDriver();
      const alert = await driver.wait(until.alertIsPresent(), 15000);
      const alertText = await alert.getText();
      await alert.accept();

      expect(alertText).to.not.be.null;
    });

    it("WEB-LOGIN-007: Invalid email format shows alert", async function () {
      await voterPage.open();
      await voterPage.setVoterId("TN2026001");
      await voterPage.setEmail("invalid-email");
      await voterPage.clickSendOtp();

      const driver = await voterPage.getDriver();
      const alert = await driver.wait(until.alertIsPresent(), 15000);
      const alertText = await alert.getText();
      await alert.accept();

      expect(alertText).to.not.be.null;
    });
  });

  // B. Admin Login Tests
  describe("Admin Login Suite", function () {
    it("WEB-ADMIN-001: Admin Login Page loads correctly", async function () {
      await adminPage.open();
      const currentUrl = await adminPage.getCurrentUrl();
      expect(currentUrl).to.include("#/admin-login");
    });

    it("WEB-ADMIN-002: Admin credentials input fields are visible", async function () {
      await adminPage.open();
      const isLoaded = await adminPage.isPageLoaded();
      expect(isLoaded).to.be.true;
    });

    it("WEB-ADMIN-003: Empty admin login submission shows error message", async function () {
      await adminPage.open();
      await adminPage.clickLogin();
      const errorText = await adminPage.getErrorMessageText();
      expect(errorText.length).to.be.greaterThan(0);
    });

    it("WEB-ADMIN-004: Invalid admin credentials display authentication error", async function () {
      await adminPage.open();
      await adminPage.setUsername("wrongadmin");
      await adminPage.setPassword("wrongpassword");
      await adminPage.clickLogin();
      const errorText = await adminPage.getErrorMessageText();
      expect(errorText.toLowerCase()).to.satisfy(
        (t) => t.includes("invalid") || t.includes("failed") || t.includes("error") || t.includes("denied")
      );
    });
  });
});
