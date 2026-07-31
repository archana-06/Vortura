import { expect } from "chai";
import { BlockchainLedgerPage } from "../../pages/BlockchainLedgerPage.js";

describe("Blockchain Ledger Smoke Tests", function () {
  this.timeout(30000);
  let page;

  beforeEach(function () {
    page = new BlockchainLedgerPage();
  });

  it("9. Blockchain ledger route opens", async function () {
    await page.open();
    const currentUrl = await page.getCurrentUrl();
    expect(currentUrl).to.include("#/blockchain");
    const isLoaded = await page.isPageLoaded();
    expect(isLoaded).to.be.true;
  });
});
