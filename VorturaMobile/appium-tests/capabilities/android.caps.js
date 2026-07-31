export const androidCapabilities = {
  platformName: "Android",
  "appium:automationName": "UiAutomator2",
  "appium:deviceName": process.env.ANDROID_DEVICE_NAME || "Android Emulator",
  "appium:platformVersion": process.env.ANDROID_PLATFORM_VERSION || "13.0",
  "appium:app": process.env.ANDROID_APK_PATH || "./build/VorturaMobile.apk",
  "appium:appPackage": "com.vortura.mobile",
  "appium:appActivity": ".MainActivity",
  "appium:noReset": false,
  "appium:fullReset": false,
  "appium:newCommandTimeout": 60,
  "appium:autoGrantPermissions": true
};
