import { expect } from "chai";
import { ElectionControlPage } from "../../pages/ElectionControlPage.js";

describe("Election Control Smoke Tests", function () {
  this.timeout(30000);
  let page;

  beforeEach(function () {
    page = new ElectionControlPage();
  });

  it("8. Election control route opens", async function () {
    await page.open();
    const currentUrl = await page.getCurrentUrl();
    expect(currentUrl).to.include("#/election-control");
    const isLoaded = await page.isPageLoaded();
    expect(isLoaded).to.be.true;
  });
});
