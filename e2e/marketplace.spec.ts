import { expect, test } from "@playwright/test";

test("guest searches Houston and opens a listing", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Find a Houston rental/ })).toBeVisible();
  await page.getByLabel("Search Houston rentals").fill("Midtown");
  await page.getByRole("button", { name: "Search Houston" }).click();
  await expect(page).toHaveURL(/\/search\?q=Midtown/);
  await expect(page.getByRole("heading", { name: "Houston rentals" })).toBeVisible();
  const listing = page.locator(".listing-card").first();
  await expect(listing).toContainText(/estimated total/);
  await listing.getByRole("link").filter({ has: page.locator("h3") }).click();
  await expect(page).toHaveURL(/\/listing\//, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Monthly and move-in costs" })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/Never send money before verifying the property/).last()).toBeVisible();
});

test("filters are shareable and verification is explicit", async ({ page }) => {
  await page.goto("/search?type=house&verified=true&maxRent=3000&sort=total_asc");
  await expect(page).toHaveURL(/verified=true/);
  await expect(page.locator(".listing-card").first()).toContainText(/verified/i);
  await expect(page.getByLabel("Sort results")).toHaveValue("total_asc");
});

test("renter saves and compares listings on device", async ({ page }) => {
  await page.goto("/search");
  const first = page.locator(".listing-card").first();
  await first.getByRole("button", { name: /^Save / }).click();
  await first.getByRole("button", { name: "Compare" }).click();
  await page.goto("/saved");
  await expect(page.locator(".listing-card")).toHaveCount(1);
  await page.goto("/compare");
  await expect(page.getByText("Estimated monthly total")).toBeVisible();
});

test("provider enters fees and submits to moderation", async ({ page }) => {
  await page.goto("/provider/listings/new");
  await page.getByLabel("Listing title").fill("Synthetic Midtown apartment");
  await page.getByLabel("Street address").fill("123 Example Street");
  await page.getByLabel("Neighborhood").fill("Midtown");
  await page.getByLabel("Description").fill("A synthetic apartment description with factual details for local development and moderation testing only.");
  await page.getByLabel(/I attest/).check();
  await page.getByRole("button", { name: "Submit for moderation" }).click();
  await expect(page.getByText(/status "submitted"/)).toBeVisible();
});

test("admin decisions require a written reason", async ({ page }) => {
  await page.goto("/admin/listings/5");
  await page.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByText(/Demo decision recorded/)).toHaveCount(0);
  await page.getByLabel("Required moderation reason").fill("Pricing, provenance, address, fees, and provider authority were reviewed.");
  await page.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByText(/Demo decision recorded as approved/)).toBeVisible();
});

test("primary pages have no serious automated accessibility violations", async ({ page }) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  for (const path of ["/", "/search", "/provider", "/admin"]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? "")), path).toEqual([]);
  }
});
