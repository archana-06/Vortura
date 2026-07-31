import { expect } from "chai";
import { AdminLoginPage } from "../../pages/AdminLoginPage.js";

describe("Admin Login Smoke Tests", function () {
  this.timeout(30000);
  let adminLoginPage;

  beforeEach(function () {
    adminLoginPage = new AdminLoginPage();
  });

  it("4. Admin login page opens", async function () {
    await adminLoginPage.open();
    const currentUrl = await adminLoginPage.getCurrentUrl();
    expect(currentUrl).to.include("#/admin-login");
    const isLoaded = await adminLoginPage.isPageLoaded();
    expect(isLoaded).to.be.true;
  });

  it("6. Empty admin login submission shows validation", async function () {
    await adminLoginPage.open();
    await adminLoginPage.clickAccessDashboard();
    const alertText = await adminLoginPage.getAlertTextAndAccept();
    expect(alertText).to.not.be.null;
    expect(alertText.toLowerCase()).to.satisfy(
      (text) => text.includes("invalid") || text.includes("credentials") || text.includes("enter")
    );
  });
});
