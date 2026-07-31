import { expect } from "chai";
import { AuditLogsPage } from "../../pages/AuditLogsPage.js";

describe("Audit Logs Smoke Tests", function () {
  this.timeout(30000);
  let page;

  beforeEach(function () {
    page = new AuditLogsPage();
  });

  it("10. Audit logs route opens", async function () {
    await page.open();
    const currentUrl = await page.getCurrentUrl();
    expect(currentUrl).to.include("#/audit-logs");
    const isLoaded = await page.isPageLoaded();
    expect(isLoaded).to.be.true;
  });
});
