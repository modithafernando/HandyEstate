import { expect, test, type Page } from "@playwright/test";

const rand = () => String(Math.floor(1_000_000 + Math.random() * 8_999_999));

const CUSTOMER = { phone: "0700000001", password: "customer123" };
const HANDYMAN = { phone: "0700000100", password: "handyman123" };
const ADMIN = { phone: "0700000000", password: "admin123" };

async function signIn(page: Page, who: { phone: string; password: string }) {
  await page.getByLabel("Mobile number").fill(who.phone);
  await page.getByLabel("Password", { exact: true }).fill(who.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL((u) => !u.pathname.startsWith("/login"));
}

async function register(page: Page, name: string, phone: string) {
  await page.getByLabel("Your name").fill(name);
  await page.getByLabel("Mobile number").fill(phone);
  await page.getByLabel("Password", { exact: true }).fill("secret123");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL((u) => !u.pathname.startsWith("/login"));
}

test("login is the first page; customer tab is the default", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("link", { name: "I need a handyman" })).toHaveAttribute("aria-current", "page");
  await page.getByLabel("Mobile number").fill(CUSTOMER.phone);
  await page.getByLabel("Password", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("That number and password don't match.")).toBeVisible();
  await page.getByLabel("Password", { exact: true }).fill(CUSTOMER.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Who do you need?" })).toBeVisible();
});

test("handyman signs in and lands on the dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("link", { name: "I'm a handyman" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Get calls from people nearby." })).toBeVisible();
  await signIn(page, HANDYMAN);
  await expect(page).toHaveURL(/\/pro$/);
  await expect(page.getByRole("switch", { name: "Taking work today" })).toBeVisible();
});

test("customer: category → results → profile → call", async ({ page }) => {
  await page.goto("/login");
  await signIn(page, CUSTOMER);
  await expect(page.getByRole("heading", { level: 1, name: "Who do you need?" })).toBeVisible();
  await page.getByRole("link", { name: "Electrician" }).first().click();
  await expect(page.getByRole("heading", { level: 1, name: "Electrician" })).toBeVisible();
  await page.getByRole("link", { name: "Kasun Electrical" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Kasun Electrical" })).toBeVisible();

  const contact = page.waitForResponse((r) => r.url().endsWith("/api/contact"));
  await page.getByRole("link", { name: /Call Kasun/ }).click();
  const body = await (await contact).json();
  expect(body.href).toMatch(/^tel:\+947/);
});

test("customer: natural search maps to a category", async ({ page }) => {
  await page.goto("/login");
  await signIn(page, CUSTOMER);
  await page.getByRole("searchbox").fill("tap leaking");
  await page.getByRole("searchbox").press("Enter");
  await expect(page.getByRole("heading", { level: 1, name: "Plumber" })).toBeVisible();
  await expect(page.getByText("Results for “tap leaking”")).toBeVisible();
});

test("customer: change area", async ({ page }) => {
  await page.goto("/login");
  await signIn(page, CUSTOMER);
  await page.goto("/search?cat=plumber", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Change area/ }).first().click();
  await page.getByRole("dialog").getByRole("button", { name: "Galle", exact: true }).click();
  await expect(page.getByRole("button", { name: /Change area: Galle/ }).first()).toBeVisible();
});

test("provider signs up, admin approves, provider goes live", async ({ page, browser }) => {
  const phone = `077${rand()}`;
  await page.goto("/login?as=handyman&mode=register");
  await register(page, "Test Pradeep", phone);
  await expect(page).toHaveURL(/\/pro\/setup\/1$/);

  await page.getByLabel("Your name").fill("Test Pradeep");
  await page.getByLabel("Business name (optional)").fill(`E2E Plumbing ${phone.slice(-4)}`);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Skip for now" }).click();
  await page.getByText("Plumber", { exact: true }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Your town").selectOption("weligama");
  await page.getByText("15 km").click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Job").fill("Leak repair");
  await page.getByLabel(/From \(Rs\)/).fill("1500");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: /checking your profile/ })).toBeVisible();
  await page.getByRole("link", { name: "Go to my dashboard" }).click();

  const sw = page.getByRole("switch", { name: "Taking work today" });
  await expect(sw).toHaveAttribute("aria-checked", "false");
  await sw.click();
  await expect(sw).toHaveAttribute("aria-checked", "true");

  // Admin approves
  const admin = await browser.newPage();
  await admin.goto("/login?next=/admin/providers?status=pending");
  await signIn(admin, ADMIN);
  await admin.getByRole("link", { name: `E2E Plumbing ${phone.slice(-4)}` }).click();
  await admin.getByRole("button", { name: "Approve / make live" }).click();
  await expect(admin.getByText("Status: approved")).toBeVisible();

  // Now visible to customers in Weligama
  await admin.goto("/search?cat=plumber&area=weligama");
  await expect(admin.getByRole("link", { name: `E2E Plumbing ${phone.slice(-4)}` })).toBeVisible();
});

test("customer writes a review", async ({ page }) => {
  const comment = `Came the same evening. (${rand()})`;
  await page.goto("/p/nimal-plumbing-works/review");
  await expect(page).toHaveURL(/\/login\?next=/);
  await page.getByRole("link", { name: "Create an account" }).click();
  await register(page, "Ishan", `071${rand()}`);
  await expect(page).toHaveURL(/\/p\/nimal-plumbing-works\/review$/);
  await page.getByText("4 stars").click({ force: true });
  await page.getByText("Punctual").click();
  await page.getByLabel(/Anything else/).fill(comment);
  await page.getByRole("button", { name: "Post review" }).click();
  await expect(page.getByText("Thanks. Your review is up.")).toBeVisible();
  await expect(page.getByText(comment)).toBeVisible();
});

test("provider uploads a large work photo", async ({ page }) => {
  await page.goto("/login?next=/pro/photos");
  await signIn(page, HANDYMAN);
  await expect(page).toHaveURL(/\/pro\/photos$/);
  const before = await page.getByRole("button", { name: "Remove" }).count();
  await page.locator('input[name="photos"]').setInputFiles("tests/e2e/fixtures/large-photo.jpg");
  await expect(page.getByRole("button", { name: "Remove" })).toHaveCount(before + 1, { timeout: 20_000 });
  const src = await page.getByRole("img", { name: /Work photo/ }).last().getAttribute("src");
  const res = await page.request.get(src!);
  expect(res.headers()["content-type"]).toBe("image/webp");
  // Clean up
  await page.getByRole("button", { name: "Remove" }).last().click();
  await expect(page.getByRole("button", { name: "Remove" })).toHaveCount(before);
});
