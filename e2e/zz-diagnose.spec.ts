import { test } from "@playwright/test";

// TEMPORARY diagnostic for the WebKit no-JS /menu load hang. Not for main.
test.use({ javaScriptEnabled: false });

for (const route of ["/menu", "/"]) {
  test(`diagnose no-JS load of ${route}`, async ({ page }, testInfo) => {
    test.setTimeout(60_000);
    const pending = new Map<string, number>();
    const t0 = Date.now();
    page.on("request", (r) => pending.set(r.url(), Date.now() - t0));
    page.on("requestfinished", (r) => pending.delete(r.url()));
    page.on("requestfailed", (r) => {
      console.log(
        `[${testInfo.project.name}] FAILED ${r.url()} ${r.failure()?.errorText}`,
      );
      pending.delete(r.url());
    });
    await page.goto(route, { waitUntil: "domcontentloaded" });
    const loaded = await page
      .waitForLoadState("load", { timeout: 20_000 })
      .then(() => `load after ${Date.now() - t0}ms`)
      .catch(() => "NO LOAD EVENT in 20s");
    const imgs = await page.$$eval("img", (list) =>
      list.map(
        (i) =>
          `${i.complete ? "done" : "WAIT"} ${i.naturalWidth}w ${i.getAttribute("loading")} ${i.currentSrc.slice(-60)}`,
      ),
    );
    console.log(
      `[${testInfo.project.name}] ${route}: ${loaded}; readyState=${await page.evaluate(() => document.readyState).catch(() => "?")}`,
    );
    console.log(`[${testInfo.project.name}] pending: ${JSON.stringify([...pending])}`);
    console.log(`[${testInfo.project.name}] imgs:\n  ${imgs.join("\n  ")}`);
  });
}
