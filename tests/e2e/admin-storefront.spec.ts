import path from "node:path";
import { test, expect } from "@playwright/test";

const categoryName = `Playwright Category ${Date.now()}`;
const productName = `Playwright Stone ${Date.now()}`;
const editedProductName = `${productName} Edited`;

async function login(page: import("@playwright/test").Page) {
  await page.goto("/admin/login");
  const emailInput = page.getByLabel("Email");
  const passwordInput = page.getByLabel("Password");
  await emailInput.fill(await emailInput.inputValue());
  await passwordInput.fill(await passwordInput.inputValue());
  await page.getByRole("button", { name: "Enter admin portal" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test.describe.serial("admin and storefront flows", () => {
  test("unauthorized visitor cannot access /admin", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("owner can log in", async ({ page }) => {
    await login(page);
    await expect(page.getByRole("heading", { name: "STONZA Control Room" })).toBeVisible();
  });

  test("owner can create a category", async ({ page }) => {
    await login(page);
    await page.goto("/admin/categories/new");
    await page.getByLabel("Name").fill(categoryName);
    await page.getByLabel("Short description").fill("Playwright generated category for critical admin mutation testing.");
    await page.getByLabel("Full description").fill("Playwright generated category for critical admin mutation testing with full editorial detail.");
    await page.getByLabel("Alt text").fill(`${categoryName} image`);
    await page.locator('input[type="file"]').first().setInputFiles(path.join(process.cwd(), "public", "brand", "stonza-logo.png"));
    await page.waitForTimeout(1500);
    await page.getByRole("button", { name: "Save category" }).click();
    await expect(page).toHaveURL(/\/admin\/categories\//);
    await expect(page.getByRole("heading", { name: categoryName })).toBeVisible();
  });

  test("owner can upload product media", async ({ page }) => {
    await login(page);
    await page.goto("/admin/media");
    await page.locator('input[type="file"]').setInputFiles(path.join(process.cwd(), "public", "brand", "stonza-logo.png"));
    await page.waitForTimeout(1500);
    await expect(page.locator("p.truncate").filter({ hasText: "stonza-logo.png" }).first()).toBeVisible();
  });

  test("owner can create and publish a product", async ({ page }) => {
    await login(page);
    await page.goto("/admin/products/new");
    await page.getByLabel("Name").fill(productName);
    await page.getByLabel("SKU").fill(`PW-${Date.now()}`);
    await page.getByLabel("Short description").fill("Playwright product created to verify admin and storefront publication.");
    await page.getByLabel("Full description").fill("<p>Long Playwright verification description for STONZA.</p>");
    await page.getByLabel("Price", { exact: true }).fill("999");
    await page.getByLabel("Inventory", { exact: true }).fill("1");
    await page.getByLabel("Stone type").fill("Quartz");
    await page.getByLabel("Origin").fill("Pakistan");
    await page.locator('input[type="file"]').first().setInputFiles(path.join(process.cwd(), "public", "brand", "stonza-logo.png"));
    await page.waitForTimeout(1500);
    await page.getByLabel("Status").selectOption("published");
    await page.getByRole("button", { name: "Save product" }).click();
    await expect(page).toHaveURL(/\/admin\/products\//);
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: productName })).toBeVisible({ timeout: 15000 });
  });

  test("published product appears on the public storefront", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.getByText(productName)).toBeVisible();
  });

  test("owner can edit a product", async ({ page }) => {
    await login(page);
    await page.goto("/admin/products");
    await page.getByRole("link", { name: productName }).click();
    await page.getByLabel("Name").fill(editedProductName);
    await page.getByRole("button", { name: "Save product" }).click();
    await expect(page.getByText(editedProductName)).toBeVisible();
  });

  test("storefront reflects the update without redeployment", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.getByText(editedProductName)).toBeVisible();
  });

  test("owner can archive and restore a product", async ({ page }) => {
    await login(page);
    await page.goto("/admin/products");
    await page.getByRole("link", { name: editedProductName }).click();
    await page.getByRole("button", { name: "Archive" }).click();
    await expect(page.getByRole("button", { name: "Restore" })).toBeVisible();
    await page.getByRole("button", { name: "Restore" }).click();
    await expect(page.getByRole("button", { name: "Archive" })).toBeVisible();
  });

  test("hero can switch between image and video configuration", async ({ page }) => {
    await login(page);
    await page.goto("/admin/hero");
    await page.getByRole("button", { name: "Background Video" }).click();
    await page.getByRole("button", { name: "Save hero" }).click();
    await expect(page.locator('input[name="activeMode"]')).toHaveValue("video");
    await page.getByRole("button", { name: "Interactive 3D Hero" }).click();
    await page.getByRole("button", { name: "Save hero" }).click();
    await expect(page.locator('input[name="activeMode"]')).toHaveValue("interactive-3d");
  });

  test("public users cannot call protected admin mutations", async ({ request }) => {
    const response = await request.post("/api/admin/upload");
    expect(response.status()).toBe(401);
  });

  test("application displays a mobile navigation correctly", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto("/");
    await page.getByLabel("Open navigation").click();
    await expect(page.getByRole("navigation").getByRole("link", { name: "Collections" })).toBeVisible();
    await page.close();
  });
});
