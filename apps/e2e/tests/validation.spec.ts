import { expect, test } from "@playwright/test";

test("rejects empty title with backend validation error", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("body").fill("body without title");
  await page.getByRole("button", { name: /add note/i }).click();

  await expect(page.getByRole("alert")).toContainText(/title cannot be empty/i);
});
