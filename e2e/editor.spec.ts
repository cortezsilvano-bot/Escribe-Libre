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
  const menu = page.locator(".menu-popover");
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
  await page.locator(".menu-popover").getByRole("button", { name: "New document", exact: true }).click();

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
  await page.locator(".menu-popover")
    .getByRole("button", { name: "Print preview / PDF", exact: true })
    .click();

  await expect(page).toHaveURL(/\/print\?doc=/);
  await expect(page.getByRole("heading", { name: "Printable" })).toBeVisible();
  await expect(page.locator(".print-page")).toBeVisible();

  await page.getByRole("link", { name: "Editor" }).click();
  await expect(page).toHaveURL(/\/editor\?doc=/);
});

test("every menu opens its own entries, not the command palette", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "New document" }).click();
  await expect(page.locator(".prose-editor")).toBeVisible();

  const menu = page.locator(".menu-popover");

  // Each menu must show something specific to itself.
  const expected: Array<[string, string]> = [
    ["Edit", "Select all"],
    ["View", "Zoom 100%"],
    ["Insert", "Table"],
    ["Format", "Clear formatting"],
    ["Tools", "Word count"],
    ["Help", "Command palette"],
  ];

  for (const [menuName, entry] of expected) {
    await page.getByRole("button", { name: menuName, exact: true }).click();
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("button", { name: entry, exact: true })).toBeVisible();
    // The command palette must not be what opened.
    await expect(page.locator(".command-palette")).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);
  }
});

test("Format menu applies formatting to the document", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "New document" }).click();
  const editor = page.locator(".prose-editor");
  await expect(editor).toBeVisible();

  await editor.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.type("Menu formatted");
  await page.keyboard.press("ControlOrMeta+a");

  await page.getByRole("button", { name: "Format", exact: true }).click();
  await page.locator(".menu-popover").getByRole("button", { name: "Italic", exact: true }).click();

  await expect(editor.locator("em")).toContainText("Menu formatted");
});

test("View menu toggles panels and zoom", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "New document" }).click();
  await expect(page.locator(".prose-editor")).toBeVisible();

  await expect(page.locator(".right-panel")).not.toBeVisible();
  await page.getByRole("button", { name: "View", exact: true }).click();
  await page.locator(".menu-popover").getByRole("button", { name: "Inspector panel", exact: true }).click();
  await expect(page.locator(".right-panel")).toBeVisible();

  await page.getByRole("button", { name: "View", exact: true }).click();
  await page.locator(".menu-popover").getByRole("button", { name: "Zoom 50%", exact: true }).click();
  await expect(page.locator(".page-frame")).toHaveCSS("zoom", "0.5");
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
