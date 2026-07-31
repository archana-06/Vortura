import { expect } from "chai";
import { VoterLoginPage } from "../../pages/VoterLoginPage.js";
import { until } from "selenium-webdriver";

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
    await voterLoginPage.clearInputs();
    await voterLoginPage.clickSendOtp();

    const driver = await voterLoginPage.getDriver();
    const alert = await driver.wait(
      until.alertIsPresent(),
      15000,
      "Validation alert did not appear"
    );

    const alertText = await alert.getText();
    await alert.accept();

    expect(alertText.toLowerCase()).to.satisfy(
      (text) => text.includes("please enter") || text.includes("voter id") || text.includes("inactive") || text.includes("unable")
    );
  });
});
