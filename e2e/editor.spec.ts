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

test("File menu offers New document, Open and Print", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "New document" }).click();
  await expect(page.locator(".prose-editor")).toBeVisible();

  await page.getByRole("button", { name: "File", exact: true }).click();
  const menu = page.locator(".file-menu-popover");
  await expect(menu).toBeVisible();

  for (const item of [
    "New document",
    "Open .textdoc",
    "Import DOCX",
    "Save .textdoc",
    "Export DOCX",
    "Print",
    "Print preview / PDF",
    "Back to documents",
  ]) {
    await expect(menu.getByRole("button", { name: item, exact: true })).toBeVisible();
  }
});

test("File > New document creates a second document", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "New document" }).click();
  await expect(page.locator(".prose-editor")).toBeVisible();
  const firstUrl = page.url();

  await page.getByLabel("Document title").fill("First document");
  await page.waitForTimeout(1200);

  await page.getByRole("button", { name: "File", exact: true }).click();
  await page.locator(".file-menu-popover").getByRole("button", { name: "New document", exact: true }).click();

  await expect(page).not.toHaveURL(firstUrl);
  await expect(page.locator(".prose-editor")).toBeVisible();
  await expect(page.getByLabel("Document title")).toHaveValue("Untitled document");

  await page.goto("/");
  await expect(page.locator(".document-card", { hasText: "First document" })).toBeVisible();
});

test("File > Print preview opens the print view", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "New document" }).click();
  await expect(page.locator(".prose-editor")).toBeVisible();
  await page.getByLabel("Document title").fill("Printable");
  await page.waitForTimeout(1200);

  await page.getByRole("button", { name: "File", exact: true }).click();
  await page.locator(".file-menu-popover")
    .getByRole("button", { name: "Print preview / PDF", exact: true })
    .click();

  await expect(page).toHaveURL(/\/print\?doc=/);
  await expect(page.getByRole("heading", { name: "Printable" })).toBeVisible();
  await expect(page.locator(".print-page")).toBeVisible();

  await page.getByRole("link", { name: "Editor" }).click();
  await expect(page).toHaveURL(/\/editor\?doc=/);
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
