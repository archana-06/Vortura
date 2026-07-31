import { By } from "selenium-webdriver";
import { BasePage } from "./BasePage.js";
import { config } from "../config/config.js";

export class AuditLogsPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.pageHeading = By.xpath("//h1[contains(text(), 'Audit') or contains(text(), 'Logs')]");
  }

  async open() {
    await this.navigateTo(config.routes.auditLogs);
  }

  async isPageLoaded() {
    return await this.isDisplayed(this.pageHeading);
  }
}
