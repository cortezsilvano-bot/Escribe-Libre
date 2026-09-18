import { expect, test } from "@playwright/test";

test("dashboard creates a document and opens the editor", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page.getByRole("button", { name: "New document" }).click();
  await expect(page).toHaveURL(/\/editor\?doc=[\w-]+/);

  await expect(page.getByLabel("Document title")).toBeVisible();
  await expect(page.locator(".page-frame")).toBeVisible();
});

test("typing updates the word count and persists across a reload", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "New document" }).click();
  await expect(page.locator(".prose-editor")).toBeVisible();

  await page.getByLabel("Document title").fill("Persistence check");
  const editor = page.locator(".prose-editor");
  await editor.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.type("Sentences saved to this browser.");

  await expect(page.getByLabel("Document word count")).toContainText("Words: 5");

  // Autosave is debounced; give it room before reloading.
  await page.waitForTimeout(1500);
  await page.reload();

  await expect(page.getByLabel("Document title")).toHaveValue("Persistence check");
  await expect(page.locator(".prose-editor")).toContainText("Sentences saved to this browser.");
});

test("formatting and page settings apply to the document", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "New document" }).click();
  await expect(page.locator(".prose-editor")).toBeVisible();

  const editor = page.locator(".prose-editor");
  await editor.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.type("Formatted text");
  await page.keyboard.press("ControlOrMeta+a");
  await page.getByRole("button", { name: "Bold", exact: true }).click();
  await expect(editor.locator("strong")).toContainText("Formatted text");

  await page.getByLabel("Inspector").first().click();
  await page.getByLabel("Header").fill("Quarterly report");
  await expect(page.locator(".page-header-text")).toHaveText("Quarterly report");
});

test("a saved document is listed on the dashboard and can be deleted", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "New document" }).click();
  await page.getByLabel("Document title").fill("Listed document");
  await page.waitForTimeout(1500);

  await page.goto("/");
  const card = page.locator(".document-card", { hasText: "Listed document" });
  await expect(card).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await card.getByRole("button", { name: /^Delete / }).click();
  await expect(card).toHaveCount(0);
});

test("primary views have no serious automated accessibility violations", async ({ page }) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");

  await page.goto("/");
  let results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? "")), "/").toEqual([]);

  await page.getByRole("button", { name: "New document" }).click();
  await expect(page.locator(".prose-editor")).toBeVisible();
  results = await new AxeBuilder({ page }).analyze();
  expect(
    results.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? "")),
    "/editor",
  ).toEqual([]);
});
