import { promises as fs } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const timestamp = Date.now();
const categoryName = `QA Category ${timestamp}`;
const productName = `QA Product ${timestamp}`;
const editedProductName = `${productName} Updated`;
const collectionName = `QA Collection ${timestamp}`;
const editedCollectionName = `${collectionName} Updated`;
const productSlug = slugify(productName);
const editedProductSlug = slugify(editedProductName);
const runtimeStorePath = path.join(process.cwd(), ".stonza", "runtime", "dev-store.json");
const remoteStoreBucket = "documents";
const remoteStoreObjectPath = "runtime/dev-store.json";

type RuntimeStore = {
  categories?: Array<{ name?: string; slug?: string }>;
  collections?: Array<{ name?: string; slug?: string }>;
  products?: Array<{ name?: string; slug?: string }>;
  orders?: Array<{ orderNumber?: string; customer?: { email?: string } }>;
  mediaAssets?: Array<{ fileName?: string; url?: string }>;
  activityLogs?: Array<{ detail?: string }>;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function login(page: import("@playwright/test").Page) {
  await page.goto("/admin/login");
  await page.getByRole("button", { name: "Enter admin portal" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

async function findCollectionFormByName(
  page: import("@playwright/test").Page,
  name: string,
) {
  const collectionForms = page
    .locator("form")
    .filter({ has: page.getByRole("button", { name: "Save changes" }) });

  for (let attempt = 0; attempt < 30; attempt += 1) {
    const count = await collectionForms.count();
    for (let index = 0; index < count; index += 1) {
      const form = collectionForms.nth(index);
      const value = await form.locator('input[name="name"]').inputValue();
      if (value === name) {
        return form;
      }
    }
    await page.waitForTimeout(1_000);
  }

  throw new Error(`Could not find collection form for ${name}`);
}

async function readRuntimeStore(): Promise<RuntimeStore> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceRoleKey) {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await supabase.storage.from(remoteStoreBucket).download(remoteStoreObjectPath);
    if (!error && data) {
      return JSON.parse(await data.text()) as RuntimeStore;
    }
  }

  return JSON.parse(await fs.readFile(runtimeStorePath, "utf8")) as RuntimeStore;
}

async function writeRuntimeStore(store: RuntimeStore) {
  const payload = `${JSON.stringify(store, null, 2)}\n`;
  await fs.mkdir(path.dirname(runtimeStorePath), { recursive: true });
  await fs.writeFile(runtimeStorePath, payload, "utf8");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceRoleKey) {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { error } = await supabase.storage.from(remoteStoreBucket).upload(
      remoteStoreObjectPath,
      Buffer.from(payload, "utf8"),
      {
        upsert: true,
        contentType: "application/json; charset=utf-8",
      },
    );

    if (error) {
      throw new Error(`Failed to upload cleaned runtime store: ${error.message}`);
    }
  }
}

function isQaArtifact(value: string | undefined) {
  return Boolean(value && /(QA Category|QA Product|QA Collection|Playwright|qa-\d+@stonza\.test)/i.test(value));
}

async function cleanupRuntimeArtifacts() {
  const store = await readRuntimeStore();
  store.categories = (store.categories ?? []).filter(
    (entry) => !isQaArtifact(`${entry.name ?? ""} ${entry.slug ?? ""}`),
  );
  store.collections = (store.collections ?? []).filter(
    (entry) => !isQaArtifact(`${entry.name ?? ""} ${entry.slug ?? ""}`),
  );
  store.products = (store.products ?? []).filter(
    (entry) => !isQaArtifact(`${entry.name ?? ""} ${entry.slug ?? ""}`),
  );
  store.orders = (store.orders ?? []).filter(
    (entry) => !isQaArtifact(`${entry.orderNumber ?? ""} ${entry.customer?.email ?? ""}`),
  );
  store.mediaAssets = (store.mediaAssets ?? []).filter(
    (entry) => !isQaArtifact(`${entry.fileName ?? ""} ${entry.url ?? ""}`),
  );
  store.activityLogs = (store.activityLogs ?? []).filter(
    (entry) => !isQaArtifact(entry.detail),
  );
  await writeRuntimeStore(store);
}

test.describe.serial("admin and storefront flows", () => {
  test.afterAll(async () => {
    await cleanupRuntimeArtifacts();
  });

  test("unauthorized visitor cannot access /admin", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
    await context.close();
  });

  test("owner can create a category", async ({ page }) => {
    test.setTimeout(120_000);
    await login(page);
    await page.getByRole("link", { name: "Categories" }).click();
    await expect(page).toHaveURL(/\/admin\/categories$/);
    await page.getByRole("link", { name: "New category" }).click();
    await expect(page.getByRole("heading", { name: "New category" })).toBeVisible();
    await page.getByLabel("Name").fill(categoryName);
    await page.getByLabel("Short description").fill("Temporary QA category used for admin CRUD verification.");
    await page.getByLabel("Full description").fill("Temporary QA category used for admin CRUD verification across the STONZA storefront and admin portal.");
    await page.getByLabel("Alt text").fill(`${categoryName} image`);
    await page.getByLabel("Status").selectOption("published");
    await page.getByRole("button", { name: "Save category" }).click();
    await page.waitForTimeout(10_000);
    await page.goto("/admin/categories");
    await expect(page.getByText(categoryName)).toBeVisible({ timeout: 60_000 });
  });

  test("owner can upload media for the next product mutation", async ({ page }) => {
    await login(page);
    await page.getByRole("link", { name: "Media" }).click();
    await expect(page).toHaveURL(/\/admin\/media$/);
    await page.locator('input[type="file"]').setInputFiles(path.join(process.cwd(), "public", "brand", "stonza-logo.png"));
    await expect(page.locator("p.truncate").filter({ hasText: "stonza-logo.png" }).first()).toBeVisible({ timeout: 15000 });
  });

  test("owner can create, publish, and edit a sized product", async ({ page }) => {
    test.setTimeout(180_000);
    await login(page);
    await page.getByRole("link", { name: "Products" }).click();
    await expect(page).toHaveURL(/\/admin\/products$/);
    await page.getByRole("link", { name: "New product" }).click();
    await expect(page.getByRole("heading", { name: "New product" })).toBeVisible();
    await page.locator('input[name="name"]').fill(productName);
    await page.locator('input[name="sku"]').fill(`QA-${timestamp}`);
    await page.locator('textarea[name="shortDescription"]').fill("Temporary QA product created to verify storefront purchase and size validation.");
    await page.locator('textarea[name="description"]').fill("<p>Temporary QA product description for end-to-end verification.</p>");
    await page.locator('input[name="price"]').fill("999");
    await page.locator('input[name="inventoryQuantity"]').fill("2");
    await page.locator('input[name="stoneType"]').fill("Quartz");
    await page.locator('input[name="origin"]').fill("Pakistan");
    await page.locator('input[name="sizes"]').fill("7, 8");
    await page.locator('input[type="file"]').first().setInputFiles(path.join(process.cwd(), "public", "brand", "stonza-logo.png"));
    await expect(page.getByText("stonza-logo.png")).toBeVisible({ timeout: 30_000 });
    await page.getByPlaceholder("Chart title").fill("Ring Size Chart");
    await page.getByRole("button", { name: "Add size row" }).click();
    await page.getByPlaceholder("Size label", { exact: true }).fill("7");
    await page.getByPlaceholder("Measurement", { exact: true }).fill("54.4 mm circumference");
    await page.getByLabel(categoryName).check();
    await page.getByLabel("Status").selectOption("published");
    await page.getByRole("button", { name: "Save product" }).click();
    await page.waitForTimeout(10_000);
    await page.goto("/admin/products");
    await expect(page.getByRole("link", { name: productName })).toBeVisible({ timeout: 60_000 });
    await page.getByRole("link", { name: productName }).click();
    await expect(page.getByRole("heading", { name: productName })).toBeVisible();
    await page.goto(`/stones/${productSlug}`);
    await expect(page.getByRole("heading", { name: productName })).toBeVisible();

    await page.goto("/admin/products");
    await page.getByRole("link", { name: productName }).click();

    await page.locator('input[name="name"]').fill(editedProductName);
    await page.getByRole("button", { name: "Save product" }).click();
    await page.waitForTimeout(10_000);
    await page.goto("/admin/products");
    await expect(page.getByRole("link", { name: editedProductName })).toBeVisible({ timeout: 60_000 });
    await page.goto(`/stones/${editedProductSlug}`);
    await expect(page.getByRole("heading", { name: editedProductName })).toBeVisible();
    await page.goto(`/stones/${productSlug}`);
    await expect(page).toHaveURL(new RegExp(`/stones/${editedProductSlug}$`));
  });

  test("owner can create, assign, rename, and delete a collection", async ({ page }) => {
    test.setTimeout(180_000);
    await login(page);
    await page.goto("/admin/collections");
    await expect(page).toHaveURL(/\/admin\/collections$/);

    await page.getByPlaceholder("Collection name").fill(collectionName);
    await page.getByPlaceholder("Short collection description").fill(
      "Temporary QA collection used for collection CRUD verification.",
    );
    await page.getByRole("button", { name: "Save collection" }).click();
    await page.waitForURL(/\/admin\/collections$/);
    let collectionForm = await findCollectionFormByName(page, collectionName);
    await expect(collectionForm).toBeVisible({ timeout: 30_000 });
    await expect(collectionForm.locator('input[name="name"]')).toHaveValue(collectionName);

    await collectionForm.locator('input[name="name"]').fill(editedCollectionName);
    await collectionForm.locator(`input[name="product:${editedProductSlug}"]`).check();
    await collectionForm.getByRole("button", { name: "Save changes" }).click();
    await page.waitForURL(/\/admin\/collections$/);

    collectionForm = await findCollectionFormByName(page, editedCollectionName);
    await expect(collectionForm).toBeVisible({ timeout: 30_000 });
    await expect(collectionForm.locator('input[name="name"]')).toHaveValue(editedCollectionName);
    const savedCollectionSlug = await collectionForm.locator('input[name="slug"]').inputValue();

    for (let attempt = 0; attempt < 10; attempt += 1) {
      await page.goto(`/collections/${savedCollectionSlug}`);
      if (await page.getByRole("heading", { name: editedCollectionName }).isVisible().catch(() => false)) {
        break;
      }
      await page.waitForTimeout(1_000);
    }
    await expect(page.getByRole("heading", { name: editedCollectionName })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("link", { name: new RegExp(editedProductName, "i") })).toBeVisible();

    await page.goto("/admin/collections");
    collectionForm = await findCollectionFormByName(page, editedCollectionName);
    await expect(collectionForm.locator('input[name="name"]')).toHaveValue(editedCollectionName);
    await collectionForm.getByRole("button", { name: "Delete collection" }).click();
    await page.waitForURL(/\/admin\/collections$/);
    for (let attempt = 0; attempt < 10; attempt += 1) {
      await page.goto(`/collections/${savedCollectionSlug}`);
      if ((await page.title()).includes("404")) {
        break;
      }
      await page.waitForTimeout(1_000);
    }
    await page.goto(`/collections/${savedCollectionSlug}`);
    await expect(page).toHaveTitle(/404/);
  });

  test("storefront enforces size selection and shows selected size in cart", async ({ page }) => {
    await page.goto("/shop");
    await page.getByText(editedProductName).click();
    await expect(page.getByRole("heading", { name: editedProductName })).toBeVisible();
    await expect(page.getByRole("button", { name: "Size Chart" })).toBeVisible();

    await page.getByRole("button", { name: "Add to cart" }).click();
    await expect(page.getByText(new RegExp(`Select a size for ${editedProductName}`, "i"))).toBeVisible();

    await page.getByLabel("Size").selectOption("7");
    await page.getByRole("button", { name: "Add to cart" }).click();
    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.getByText("Size: 7")).toBeVisible();
  });

  test("storefront checkout persists the order and restores inventory on cancellation", async ({ page }) => {
    test.setTimeout(180_000);
    await page.goto(`/stones/${editedProductSlug}`);
    await expect(page.getByRole("heading", { name: editedProductName })).toBeVisible();
    await page.getByLabel("Size").selectOption("7");
    await page.getByRole("button", { name: "Add to cart" }).click();
    await expect(page).toHaveURL(/\/cart$/);

    await page.locator('input[type="number"]').fill("2");
    await expect(page.locator('input[type="number"]')).toHaveValue("2");
    await page.getByRole("link", { name: "Proceed to checkout" }).click();
    await expect(page).toHaveURL(/\/checkout$/);

    await page.locator('input[name="fullName"]').fill("QA Customer");
    await page.locator('input[name="email"]').fill(`qa-${timestamp}@stonza.test`);
    await page.locator('input[name="phone"]').fill("03001234567");
    await page.locator('input[name="country"]').fill("Pakistan");
    await page.locator('input[name="city"]').fill("Lahore");
    await page.locator('input[name="postalCode"]').fill("54000");
    await page.locator('input[name="addressLine1"]').fill("123 QA Street");
    await page.locator('input[name="addressLine2"]').fill("Suite 2");
    await page.locator('textarea[name="orderNotes"]').fill("Temporary QA order for Phase 3 verification.");
    await page.locator('select[name="paymentMethod"]').selectOption("Bank Transfer");
    await Promise.all([
      page.waitForURL(/\/order-confirmation\/STZ-/, { timeout: 20_000 }),
      page.getByRole("button", { name: "Place order" }).dblclick(),
    ]);
    await expect(page).toHaveURL(/\/order-confirmation\/STZ-/, { timeout: 20_000 });
    await expect(page.getByText("Qty 2 - Size 7")).toBeVisible();
    await expect(page.getByText("Bank Transfer / pending")).toBeVisible();
    const orderNumber = page.url().split("/").pop() ?? "";
    expect(orderNumber).toMatch(/^STZ-/);

    const runtimeStore = await readRuntimeStore();
    expect(
      (runtimeStore.orders ?? []).filter((order) => order.customer?.email === `qa-${timestamp}@stonza.test`),
    ).toHaveLength(1);

    await login(page);
    await page.goto("/admin/orders");
    await expect(page.getByRole("link", { name: orderNumber })).toBeVisible();
    await page.getByRole("link", { name: orderNumber }).click();
    await expect(page.getByRole("heading", { name: orderNumber })).toBeVisible();
    await expect(page.getByText("Qty 2 - Size 7")).toBeVisible();
    await expect(page.getByText("Bank Transfer / pending")).toBeVisible();

    await page.goto("/admin/inventory");
    const inventoryCard = page.locator("div", { hasText: editedProductName }).first();
    await expect(inventoryCard.locator("p.text-sm", { hasText: "Qty 0" }).first()).toBeVisible();
    await expect(inventoryCard.locator("p.text-xs", { hasText: "Low stock" }).first()).toBeVisible();

    await page.goto(`/admin/orders/${orderNumber}`);
    await page.locator('select[name="status"]').selectOption("cancelled");
    await page.getByRole("button", { name: "Update status" }).click();
    await page.waitForTimeout(3000);
    await page.goto("/admin/inventory");
    const restoredInventoryCard = page.locator("div", { hasText: editedProductName }).first();
    await expect(restoredInventoryCard.locator("p.text-sm", { hasText: "Qty 2" }).first()).toBeVisible();
  });

  test("hero admin and mobile navigation load correctly", async ({ browser, page }) => {
    await login(page);
    await page.getByRole("link", { name: "Hero" }).click();
    await expect(page).toHaveURL(/\/admin\/hero$/);
    await expect(page.getByRole("heading", { name: "Hero banners" })).toBeVisible();
    await expect(page.locator('input[name="activeMode"]')).toHaveValue("carousel");

    const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mobilePage.goto("/");
    await mobilePage.getByLabel("Open navigation").click();
    await expect(mobilePage.getByRole("navigation").getByRole("link", { name: "Collections" })).toBeVisible();
    await mobilePage.close();
  });

  test("owner can delete temporary product and category", async ({ page }) => {
    test.setTimeout(120_000);
    await login(page);
    await page.getByRole("link", { name: "Products" }).click();
    await expect(page).toHaveURL(/\/admin\/products$/);
    await page.getByRole("link", { name: editedProductName }).click();
    await page.getByRole("button", { name: "Delete product" }).click();
    await expect(page).toHaveURL(/\/admin\/products$/, { timeout: 20_000 });
    await page.goto("/shop");
    await expect(page.getByText(editedProductName)).toHaveCount(0);

    await login(page);
    await page.getByRole("link", { name: "Categories" }).click();
    await expect(page).toHaveURL(/\/admin\/categories$/);
    const categoryRow = page.locator("div.border-t.border-white\\/8", { hasText: categoryName }).first();
    await categoryRow.getByRole("link", { name: "Open" }).click();
    await page.getByRole("button", { name: "Delete category" }).click();
    await expect(page).toHaveURL(/\/admin\/categories\?status=trash$/, { timeout: 20_000 });
    await expect(page.getByText(categoryName)).toHaveCount(0);
  });

  test("public users cannot call protected admin mutations", async ({ request }) => {
    const response = await request.post("/api/admin/upload");
    expect(response.status()).toBe(401);
  });
});
