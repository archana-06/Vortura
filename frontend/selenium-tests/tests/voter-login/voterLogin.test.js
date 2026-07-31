import { expect } from "chai";
import { VoterLoginPage } from "../../pages/VoterLoginPage.js";

describe("Voter Login Smoke Tests", function () {
  this.timeout(30000);
  let voterLoginPage;

  beforeEach(function () {
    voterLoginPage = new VoterLoginPage();
  });

  it("3. Voter login page opens", async function () {
    await voterLoginPage.open();
    const currentUrl = await voterLoginPage.getCurrentUrl();
    expect(currentUrl).to.include("#/login");
    const isLoaded = await voterLoginPage.isPageLoaded();
    expect(isLoaded).to.be.true;
  });

  it("5. Empty voter login submission shows validation", async function () {
    await voterLoginPage.open();
    await voterLoginPage.clickSendOtp();
    const alertText = await voterLoginPage.getAlertTextAndAccept();
    expect(alertText).to.not.be.null;
    expect(alertText.toLowerCase()).to.satisfy(
      (text) => text.includes("voter id") || text.includes("email") || text.includes("please enter") || text.includes("inactive")
    );
  });
});
