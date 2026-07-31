import { expect } from "chai";
import { CandidateManagementPage } from "../../pages/CandidateManagementPage.js";

describe("Candidate Management Smoke Tests", function () {
  this.timeout(30000);
  let page;

  beforeEach(function () {
    page = new CandidateManagementPage();
  });

  it("7. Candidate management route opens", async function () {
    await page.open();
    const currentUrl = await page.getCurrentUrl();
    expect(currentUrl).to.include("#/candidate-management");
    const isLoaded = await page.isPageLoaded();
    expect(isLoaded).to.be.true;
  });
});
