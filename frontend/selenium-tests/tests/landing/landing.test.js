import { expect } from "chai";
import { LandingPage } from "../../pages/LandingPage.js";

describe("Landing Page Smoke Tests", function () {
  this.timeout(30000);
  let landingPage;

  beforeEach(function () {
    landingPage = new LandingPage();
  });

  it("1. Landing page loads successfully", async function () {
    await landingPage.open();
    const currentUrl = await landingPage.getCurrentUrl();
    expect(currentUrl).to.include("Vortura");
  });

  it("2. Landing page title or main heading is visible", async function () {
    await landingPage.open();
    const isHeadingVisible = await landingPage.isHeadingDisplayed();
    expect(isHeadingVisible).to.be.true;
    const headingText = await landingPage.getHeadingText();
    expect(headingText.toLowerCase()).to.satisfy(
      (text) => text.includes("vortura") || text.includes("secure") || text.includes("voting")
    );
  });
});
