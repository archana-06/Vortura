import { By } from "selenium-webdriver";
import { BasePage } from "./BasePage.js";
import { config } from "../config/config.js";

export class ElectionControlPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.pageHeading = By.xpath("//h1[contains(text(), 'Election Control Center')]");
  }

  async open() {
    await this.navigateTo(config.routes.electionControl);
  }

  async isPageLoaded() {
    return await this.isDisplayed(this.pageHeading);
  }
}
