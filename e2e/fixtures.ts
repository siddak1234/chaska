import { test as base, type Request } from "@playwright/test";

export { expect } from "@playwright/test";

/** Longest a test's teardown waits for photographs still loading. */
const SETTLE_TIMEOUT_MS = 15_000;

const isOptimizedImage = (request: Request) =>
  new URL(request.url()).pathname === "/_next/image";

/**
 * Every spec imports `test` from here rather than from `@playwright/test`.
 *
 * It adds one automatic step: before a test's page is closed, wait for any
 * `/_next/image` request still in flight to finish.
 *
 * Why. Next.js 16.3's built-in image optimizer, which `next start` uses (on
 * Vercel, images are served by Vercel's own image service instead), reads the
 * source photograph through an internal request that shares the visitor's
 * socket. If that socket closes within the first few milliseconds, `send`
 * sees the internal response as finished, destroys the file stream and never
 * ends it, so the optimizer's shared in-flight entry for that image, width
 * and quality never settles, and every later request for it hangs until the
 * server restarts. Closing a page while a photograph is loading is exactly
 * that disconnect. It once wedged `kutchi-dabeli` at 256px, and the
 * no-JavaScript Menu test, which loads every photograph, timed out on it
 * later in the run. Letting requests finish removes the trigger instead of
 * retrying around it.
 */
export const test = base.extend<{ settleImageRequests: void }>({
  settleImageRequests: [
    async ({ page }, use) => {
      const inFlight = new Set<Request>();
      page.on("request", (request) => {
        if (isOptimizedImage(request)) inFlight.add(request);
      });
      page.on("requestfinished", (request) => inFlight.delete(request));
      page.on("requestfailed", (request) => inFlight.delete(request));

      await use();

      const deadline = Date.now() + SETTLE_TIMEOUT_MS;
      while (inFlight.size > 0 && Date.now() < deadline && !page.isClosed()) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    },
    { auto: true },
  ],
});
