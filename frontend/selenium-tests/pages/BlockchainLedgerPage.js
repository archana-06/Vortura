import { By } from "selenium-webdriver";
import { BasePage } from "./BasePage.js";
import { config } from "../config/config.js";

export class BlockchainLedgerPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.pageHeading = By.xpath("//h1[contains(text(), 'Blockchain Ledger')]");
  }

  async open() {
    await this.navigateTo(config.routes.blockchain);
  }

  async isPageLoaded() {
    return await this.isDisplayed(this.pageHeading);
  }
}
