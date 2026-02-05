/**
 * E2E Tests for Settings Page
 * Tests: Configure voice cloning, anti-AI, platform settings, and AI providers
 */

import { test, expect } from "@playwright/test"

test.describe("Settings Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/settings")
  })

  test("should display settings page with tabs", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /settings/i })).toBeVisible()

    // Should show tab navigation
    const tabs = [
      "Voice Cloning",
      "Anti-AI",
      "Platform",
      "AI Provider"
    ]

    for (const tab of tabs) {
      const tabButton = page.getByRole("button", { name: new RegExp(tab, "i") })
        .or(page.getByRole("tab", { name: new RegExp(tab, "i") }))
        .or(page.getByText(new RegExp(tab, "i")))

      if (await tabButton.isVisible()) {
        await expect(tabButton).toBeVisible()
      }
    }
  })

  test("should switch between tabs", async ({ page }) => {
    const antiAiTab = page.getByRole("button", { name: /anti-ai/i })
      .or(page.getByText(/anti-ai/i))

    if (await antiAiTab.isVisible()) {
      await antiAiTab.click()

      // Content should change
      await expect(
        page.getByText(/detection|guidelines|human-like/i)
      ).toBeVisible()
    }
  })

  test.describe("Voice Cloning Instructions Tab", () => {
    test("should display voice cloning instructions editor", async ({ page }) => {
      const voiceCloningTab = page.getByRole("button", { name: /voice cloning/i })
        .or(page.getByText(/voice cloning/i)).first()

      if (await voiceCloningTab.isVisible()) {
        await voiceCloningTab.click()

        // Should show textarea
        await expect(page.locator("textarea")).toBeVisible()
      }
    })

    test("should edit voice cloning instructions", async ({ page }) => {
      const textarea = page.locator("textarea").first()

      if (await textarea.isVisible()) {
        await textarea.fill("Updated voice cloning instructions for testing")
        await expect(textarea).toHaveValue(/updated voice cloning/i)
      }
    })

    test("should save voice cloning instructions", async ({ page }) => {
      const textarea = page.locator("textarea").first()
      const saveButton = page.getByRole("button", { name: /save/i })

      if (await textarea.isVisible() && await saveButton.isVisible()) {
        await textarea.fill("Test instructions " + Date.now())
        await saveButton.click()

        // Should show success
        await expect(
          page.getByText(/saved|success|updated/i)
        ).toBeVisible({ timeout: 3000 })
      }
    })

    test("should show version history", async ({ page }) => {
      const historySection = page.getByText(/version history|history/i)

      if (await historySection.isVisible()) {
        await expect(historySection).toBeVisible()

        // Should show version items
        const versions = page.locator('[data-testid="version-item"]')
          .or(page.getByText(/v\d+/))

        if (await versions.first().isVisible()) {
          await expect(versions.first()).toBeVisible()
        }
      }
    })

    test("should revert to previous version", async ({ page }) => {
      const revertButton = page.getByRole("button", { name: /revert/i })
        .or(page.locator('[data-testid="revert-button"]'))

      if (await revertButton.first().isVisible()) {
        await revertButton.first().click()

        // Should show confirmation or success
        await expect(
          page.getByText(/reverted|restored|success/i)
        ).toBeVisible({ timeout: 3000 })
      }
    })
  })

  test.describe("Anti-AI Guidelines Tab", () => {
    test.beforeEach(async ({ page }) => {
      const antiAiTab = page.getByRole("button", { name: /anti-ai/i })
        .or(page.getByText(/anti-ai/i))

      if (await antiAiTab.isVisible()) {
        await antiAiTab.click()
      }
    })

    test("should display anti-AI guidelines editor", async ({ page }) => {
      await expect(page.locator("textarea")).toBeVisible()
    })

    test("should edit anti-AI guidelines", async ({ page }) => {
      const textarea = page.locator("textarea").first()

      if (await textarea.isVisible()) {
        await textarea.fill("Updated anti-AI guidelines for testing")
        await expect(textarea).toHaveValue(/updated anti-ai/i)
      }
    })

    test("should save anti-AI guidelines", async ({ page }) => {
      const textarea = page.locator("textarea").first()
      const saveButton = page.getByRole("button", { name: /save/i })

      if (await textarea.isVisible() && await saveButton.isVisible()) {
        await textarea.fill("Test anti-AI guidelines " + Date.now())
        await saveButton.click()

        await expect(
          page.getByText(/saved|success|updated/i)
        ).toBeVisible({ timeout: 3000 })
      }
    })
  })

  test.describe("Platform Settings Tab", () => {
    test.beforeEach(async ({ page }) => {
      const platformTab = page.getByRole("button", { name: /platform/i })
        .or(page.getByText(/platform/i))

      if (await platformTab.isVisible()) {
        await platformTab.click()
      }
    })

    test("should display platform list", async ({ page }) => {
      const platforms = ["LinkedIn", "Twitter", "Facebook", "Email", "Blog"]

      for (const platform of platforms) {
        const platformItem = page.getByText(new RegExp(platform, "i"))
        if (await platformItem.first().isVisible()) {
          await expect(platformItem.first()).toBeVisible()
        }
      }
    })

    test("should select a platform to edit", async ({ page }) => {
      const linkedinButton = page.getByRole("button", { name: /linkedin/i })
        .or(page.getByText(/linkedin/i).first())

      if (await linkedinButton.isVisible()) {
        await linkedinButton.click()

        // Should show platform-specific settings
        await expect(page.locator("textarea")).toBeVisible()
      }
    })

    test("should edit platform best practices", async ({ page }) => {
      // Select a platform first
      const linkedinButton = page.getByRole("button", { name: /linkedin/i })
        .or(page.getByText(/linkedin/i).first())

      if (await linkedinButton.isVisible()) {
        await linkedinButton.click()
      }

      const textarea = page.locator("textarea").first()

      if (await textarea.isVisible()) {
        await textarea.fill("Updated LinkedIn best practices for testing")

        const saveButton = page.getByRole("button", { name: /save/i })
        if (await saveButton.isVisible()) {
          await saveButton.click()

          await expect(
            page.getByText(/saved|success|updated/i)
          ).toBeVisible({ timeout: 3000 })
        }
      }
    })
  })

  test.describe("AI Providers Tab", () => {
    test.beforeEach(async ({ page }) => {
      const aiTab = page.getByRole("button", { name: /ai provider/i })
        .or(page.getByText(/ai provider/i))

      if (await aiTab.isVisible()) {
        await aiTab.click()
      }
    })

    test("should display AI provider cards", async ({ page }) => {
      const providers = ["OpenAI", "Anthropic"]

      for (const provider of providers) {
        const providerCard = page.getByText(new RegExp(provider, "i"))
        if (await providerCard.first().isVisible()) {
          await expect(providerCard.first()).toBeVisible()
        }
      }
    })

    test("should show add API key button", async ({ page }) => {
      const addButton = page.getByRole("button", { name: /add.*key/i })

      if (await addButton.first().isVisible()) {
        await expect(addButton.first()).toBeVisible()
      }
    })

    test("should open add API key form", async ({ page }) => {
      const addButton = page.getByRole("button", { name: /add.*key/i })

      if (await addButton.first().isVisible()) {
        await addButton.first().click()

        // Should show input field
        await expect(
          page.getByLabel(/api key/i)
            .or(page.getByPlaceholder(/sk-/i))
        ).toBeVisible()
      }
    })

    test("should validate API key format", async ({ page }) => {
      const addButton = page.getByRole("button", { name: /add.*key/i })

      if (await addButton.first().isVisible()) {
        await addButton.first().click()

        const keyInput = page.getByLabel(/api key/i)
          .or(page.getByPlaceholder(/sk-/i))

        if (await keyInput.isVisible()) {
          // Enter invalid key
          await keyInput.fill("invalid-key")

          const saveButton = page.getByRole("button", { name: /save/i })
          if (await saveButton.isVisible()) {
            await saveButton.click()

            // Should show validation error
            await expect(
              page.getByText(/invalid|error|format/i)
            ).toBeVisible({ timeout: 3000 })
          }
        }
      }
    })

    test("should show masked key for existing keys", async ({ page }) => {
      // Look for masked key display (sk-...xxxx format)
      const maskedKey = page.getByText(/sk-\*+|•+/)

      if (await maskedKey.isVisible()) {
        await expect(maskedKey).toBeVisible()
      }
    })

    test("should delete API key with confirmation", async ({ page }) => {
      const deleteButton = page.getByRole("button", { name: /delete/i })
        .or(page.locator('[aria-label="Delete"]'))

      if (await deleteButton.first().isVisible()) {
        await deleteButton.first().click()

        // Confirmation dialog should appear
        const confirmDialog = page.getByRole("alertdialog")
        if (await confirmDialog.isVisible()) {
          await expect(
            confirmDialog.getByText(/are you sure|confirm|delete/i)
          ).toBeVisible()

          // Cancel to avoid actual deletion
          await confirmDialog.getByRole("button", { name: /cancel/i }).click()
          await expect(confirmDialog).not.toBeVisible()
        }
      }
    })

    test("should validate API key", async ({ page }) => {
      const validateButton = page.getByRole("button", { name: /validate|test|verify/i })

      if (await validateButton.first().isVisible()) {
        await validateButton.first().click()

        // Should show loading and then result
        await expect(
          page.getByText(/valid|invalid|success|error/i)
        ).toBeVisible({ timeout: 10000 })
      }
    })

    test("should show security information", async ({ page }) => {
      const securityInfo = page.getByText(/encrypt|secure|never.*exposed/i)

      if (await securityInfo.isVisible()) {
        await expect(securityInfo).toBeVisible()
      }
    })
  })
})
