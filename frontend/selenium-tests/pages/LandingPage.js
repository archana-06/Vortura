import { By } from "selenium-webdriver";
import { BasePage } from "./BasePage.js";
import { config } from "../config/config.js";

export class LandingPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.mainHeading = By.xpath("//h1[contains(text(), 'Secure') or contains(text(), 'Digital Voting')]");
    this.logoText = By.xpath("//nav//h1[contains(text(), 'Vortura')]");
    this.heroDescription = By.xpath("//p[contains(text(), 'Vortura combines blockchain security')]");
    this.getStartedButton = By.css("a[href*='login']:not([href*='admin'])");
    this.adminPanelButton = By.css("a[href*='admin-login']");
    this.learnMoreButton = By.css("a[href*='detailed-features']");

    this.navHome = By.css("a[href='#home']");
    this.navFeatures = By.css("a[href='#features']");
    this.navSecurity = By.css("a[href='#security']");
    this.navAbout = By.css("a[href='#about']");

    this.featuresSection = By.css("#features");
    this.securitySection = By.css("#security");
    this.detailedFeaturesSection = By.css("#detailed-features");
    this.securityArchitectureSection = By.css("#security-architecture");

    this.detailedFeaturesHeading = By.xpath("//h2[contains(text(), 'Advanced Platform Features')]");
    this.securityArchitectureHeading = By.xpath("//h2[contains(text(), 'Security Architecture')]");

    this.trustIndicators = By.xpath("//div[contains(text(), 'Voter ID Verified')]");
    this.footer = By.css("footer#about");
    this.footerCopyright = By.xpath("//footer[contains(., '© 2026 Vortura')]");
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

  async getLogoText() {
    return await this.getText(this.logoText);
  }

  async isLogoDisplayed() {
    return await this.isDisplayed(this.logoText);
  }

  async getHeroDescription() {
    return await this.getText(this.heroDescription);
  }

  async isHeroDescriptionDisplayed() {
    return await this.isDisplayed(this.heroDescription);
  }

  async isGetStartedButtonDisplayed() {
    return await this.isDisplayed(this.getStartedButton);
  }

  async clickGetStarted() {
    await this.click(this.getStartedButton);
  }

  async isAdminPanelButtonDisplayed() {
    return await this.isDisplayed(this.adminPanelButton);
  }

  async clickAdminPanel() {
    await this.click(this.adminPanelButton);
  }

  async clickHomeLink() {
    await this.click(this.navHome);
  }

  async clickFeaturesLink() {
    await this.click(this.navFeatures);
  }

  async clickSecurityLink() {
    await this.click(this.navSecurity);
  }

  async clickAboutLink() {
    await this.click(this.navAbout);
  }

  async isFeaturesSectionDisplayed() {
    return await this.isDisplayed(this.featuresSection);
  }

  async isSecuritySectionDisplayed() {
    return await this.isDisplayed(this.securitySection);
  }

  async isDetailedFeaturesSectionDisplayed() {
    return (
      (await this.isDisplayed(this.detailedFeaturesSection)) ||
      (await this.isDisplayed(this.detailedFeaturesHeading))
    );
  }

  async isSecurityArchitectureSectionDisplayed() {
    return (
      (await this.isDisplayed(this.securityArchitectureSection)) ||
      (await this.isDisplayed(this.securityArchitectureHeading))
    );
  }

  async isFooterDisplayed() {
    return await this.isDisplayed(this.footer);
  }

  async getFooterCopyrightText() {
    return await this.getText(this.footerCopyright);
  }

  async areTrustIndicatorsDisplayed() {
    return await this.isDisplayed(this.trustIndicators);
  }

  async refreshPage() {
    const driver = await this.getDriver();
    await driver.navigate().refresh();
  }

  async navigateBack() {
    const driver = await this.getDriver();
    await driver.navigate().back();
  }
}
