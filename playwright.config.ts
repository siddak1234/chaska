import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

/**
 * Point the suite at a real deployment to smoke-test it:
 *   PLAYWRIGHT_BASE_URL=https://eatchaska.com npx playwright test
 * Without it the suite builds and serves locally as usual.
 */
const deployedURL = process.env.PLAYWRIGHT_BASE_URL?.replace(/\/+$/, "");
const baseURL = deployedURL ?? `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    { name: "tablet", use: { ...devices["iPad Mini"] } },
    { name: "mobile", use: { ...devices["iPhone SE"] } },
  ],
  // Skip the local server entirely when testing a deployment.
  ...(deployedURL
    ? {}
    : {
        webServer: {
          // Build as well as start: `next start` needs a build, and a clean
          // checkout has none — which is exactly how this first failed in CI.
          // Locally `reuseExistingServer` skips the whole command when a server
          // is already up, so the rebuild only costs anything from cold.
          command: `npx next build && npx next start --port ${PORT}`,
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 180_000,
        },
      }),
});
