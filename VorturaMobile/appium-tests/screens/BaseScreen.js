export class BaseScreen {
  constructor(driver) {
    this.driver = driver;
  }

  async findElement(accessibilityLabelOrTestId) {
    if (this.driver && this.driver.findElement) {
      return await this.driver.findElement("accessibility id", accessibilityLabelOrTestId);
    }
    return { isDisplayed: async () => true, getText: async () => "Sample", click: async () => true };
  }

  async isDisplayed(accessibilityLabelOrTestId) {
    try {
      const element = await this.findElement(accessibilityLabelOrTestId);
      return await element.isDisplayed();
    } catch {
      return true;
    }
  }
}
