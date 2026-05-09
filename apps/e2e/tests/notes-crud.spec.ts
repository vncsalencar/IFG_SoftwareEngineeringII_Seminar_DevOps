import { expect, test } from "@playwright/test";

test("creates and deletes a note end-to-end", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/no notes yet/i)).toBeVisible();

  await page.getByLabel("title").fill("My E2E note");
  await page.getByLabel("body").fill("Created from a Playwright test");
  await page.getByRole("button", { name: /add note/i }).click();

  await expect(page.getByRole("heading", { name: "My E2E note" })).toBeVisible();
  await expect(page.getByText("Created from a Playwright test")).toBeVisible();

  await page.getByLabel("delete My E2E note").click();
  await expect(page.getByText(/no notes yet/i)).toBeVisible();
});
