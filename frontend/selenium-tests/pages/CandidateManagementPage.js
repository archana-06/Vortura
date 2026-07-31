import { By } from "selenium-webdriver";
import { BasePage } from "./BasePage.js";
import { config } from "../config/config.js";

export class CandidateManagementPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.pageHeading = By.xpath("//h1[contains(text(), 'Candidate Management')]");
  }

  async open() {
    await this.navigateTo(config.routes.candidateManagement);
  }

  async isPageLoaded() {
    return await this.isDisplayed(this.pageHeading);
  }
}
