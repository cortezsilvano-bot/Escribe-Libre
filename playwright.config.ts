import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: true,
  workers: 4,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    acceptDownloads: true,
    baseURL: "http://127.0.0.1:3107",
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm dev --hostname 127.0.0.1 --port 3107",
    reuseExistingServer: false,
    timeout: 120_000,
    url: "http://127.0.0.1:3107",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
    },
  ],
});
