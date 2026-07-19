import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://localhost:3005",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: {
      executablePath: "D:/pw-browsers/chromium-1228/chrome-win64/chrome.exe",
    },
  },
  webServer: {
    command: "npm.cmd run dev -- --port 3005",
    url: "http://localhost:3005",
    reuseExistingServer: false,
    timeout: 120000,
  },
});
