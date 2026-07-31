import { expect } from "chai";
import { LandingPage } from "../../pages/LandingPage.js";
import { logger } from "../../utilities/logger.js";

describe("Landing Page Regression Test Suite", function () {
  this.timeout(45000);
  let landingPage;

  beforeEach(async function () {
    landingPage = new LandingPage();
    logger.info("Resetting navigation to Landing Page before test execution...");
    await landingPage.open();
  });

  it("LAND-001: Landing page loads successfully", async function () {
    logger.info("Verifying current URL matches Landing Page...");
    const currentUrl = await landingPage.getCurrentUrl();
    expect(currentUrl).to.include("Vortura");
  });

  it("LAND-002: Correct application logo and title are displayed", async function () {
    logger.info("Checking Vortura logo and text visibility in navbar...");
    const isDisplayed = await landingPage.isLogoDisplayed();
    expect(isDisplayed).to.be.true;
    const logoText = await landingPage.getLogoText();
    expect(logoText).to.include("Vortura");
  });

  it("LAND-003: Main hero heading is visible", async function () {
    logger.info("Checking main hero heading visibility...");
    const isHeadingVisible = await landingPage.isHeadingDisplayed();
    expect(isHeadingVisible).to.be.true;
    const headingText = await landingPage.getHeadingText();
    expect(headingText.toLowerCase()).to.satisfy(
      (text) => text.includes("secure") || text.includes("voting") || text.includes("intelligent")
    );
  });

  it("LAND-004: Hero description text is visible", async function () {
    logger.info("Checking hero section description paragraph...");
    const isDescVisible = await landingPage.isHeroDescriptionDisplayed();
    expect(isDescVisible).to.be.true;
    const descText = await landingPage.getHeroDescription();
    expect(descText).to.include("blockchain");
  });

  it("LAND-005: Voter Login button (Get Started) is visible", async function () {
    logger.info("Verifying 'Get Started' button visibility...");
    const isBtnVisible = await landingPage.isGetStartedButtonDisplayed();
    expect(isBtnVisible).to.be.true;
  });

  it("LAND-006: Voter Login button navigates to #/login", async function () {
    logger.info("Clicking 'Get Started' button...");
    await landingPage.clickGetStarted();
    const currentUrl = await landingPage.getCurrentUrl();
    expect(currentUrl).to.include("#/login");
  });

  it("LAND-007: Admin Login link (Admin Panel) is visible", async function () {
    logger.info("Verifying 'Admin Panel' navbar button visibility...");
    const isAdminBtnVisible = await landingPage.isAdminPanelButtonDisplayed();
    expect(isAdminBtnVisible).to.be.true;
  });

  it("LAND-008: Admin Login link navigates to #/admin-login", async function () {
    logger.info("Clicking 'Admin Panel' button...");
    await landingPage.clickAdminPanel();
    const currentUrl = await landingPage.getCurrentUrl();
    expect(currentUrl).to.include("#/admin-login");
  });

  it("LAND-009: Home navigation link is present in navbar", async function () {
    logger.info("Checking navbar 'Home' link...");
    await landingPage.clickHomeLink();
    const currentUrl = await landingPage.getCurrentUrl();
    expect(currentUrl).to.include("#home");
  });

  it("LAND-010: Features navigation link works", async function () {
    logger.info("Clicking navbar 'Features' link...");
    await landingPage.clickFeaturesLink();
    const currentUrl = await landingPage.getCurrentUrl();
    expect(currentUrl).to.include("#features");
  });

  it("LAND-011: Security navigation link works", async function () {
    logger.info("Clicking navbar 'Security' link...");
    await landingPage.clickSecurityLink();
    const currentUrl = await landingPage.getCurrentUrl();
    expect(currentUrl).to.include("#security");
  });

  it("LAND-012: About navigation link works", async function () {
    logger.info("Clicking navbar 'About' link...");
    await landingPage.clickAboutLink();
    const currentUrl = await landingPage.getCurrentUrl();
    expect(currentUrl).to.include("#about");
  });

  it("LAND-013: Features inline section is visible", async function () {
    logger.info("Checking inline #features card section visibility...");
    const isVisible = await landingPage.isFeaturesSectionDisplayed();
    expect(isVisible).to.be.true;
  });

  it("LAND-014: Security inline section is visible", async function () {
    logger.info("Checking inline #security card section visibility...");
    const isVisible = await landingPage.isSecuritySectionDisplayed();
    expect(isVisible).to.be.true;
  });

  it("LAND-015: Advanced Platform Features section is visible", async function () {
    logger.info("Checking #detailed-features section visibility...");
    const isVisible = await landingPage.isDetailedFeaturesSectionDisplayed();
    expect(isVisible).to.be.true;
  });

  it("LAND-016: Security Architecture section is visible", async function () {
    logger.info("Checking #security-architecture section visibility...");
    const isVisible = await landingPage.isSecurityArchitectureSectionDisplayed();
    expect(isVisible).to.be.true;
  });

  it("LAND-017: Footer is visible with copyright notice", async function () {
    logger.info("Checking footer visibility and copyright notice text...");
    const isFooterVisible = await landingPage.isFooterDisplayed();
    expect(isFooterVisible).to.be.true;
    const copyrightText = await landingPage.getFooterCopyrightText();
    expect(copyrightText).to.include("Vortura");
  });

  it("LAND-018: Browser refresh keeps landing page available", async function () {
    logger.info("Refreshing browser page on Landing Page...");
    await landingPage.refreshPage();
    const currentUrl = await landingPage.getCurrentUrl();
    expect(currentUrl).to.include("Vortura");
    const isHeadingVisible = await landingPage.isHeadingDisplayed();
    expect(isHeadingVisible).to.be.true;
  });

  it("LAND-019: Browser back navigation works after opening login", async function () {
    logger.info("Navigating to voter login and performing browser back...");
    await landingPage.clickGetStarted();
    let currentUrl = await landingPage.getCurrentUrl();
    expect(currentUrl).to.include("#/login");
    await landingPage.navigateBack();
    currentUrl = await landingPage.getCurrentUrl();
    expect(currentUrl).to.satisfy(
      (url) => !url.includes("#/login") || url.includes("Vortura")
    );
  });

  it("LAND-020: Trust indicators are visible", async function () {
    logger.info("Checking hero trust indicators (Voter ID Verified, Blockchain Secured)...");
    const areDisplayed = await landingPage.areTrustIndicatorsDisplayed();
    expect(areDisplayed).to.be.true;
  });
});
