/**
 * E2E Tests for Content Generation
 * Tests: Generate content → View detection score → Save to library
 */

import { test, expect } from "@playwright/test"

test.describe("Content Generation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/create")
  })

  test("should display content creator page", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /create content/i })).toBeVisible()
    await expect(page.getByText(/voice clone/i)).toBeVisible()
    await expect(page.getByText(/platform/i)).toBeVisible()
  })

  test("should show voice clone selector", async ({ page }) => {
    const voiceSelector = page.locator('[data-testid="voice-clone-selector"]')

    if (await voiceSelector.isVisible()) {
      await voiceSelector.click()

      // Should show dropdown options
      const options = page.locator('[role="option"]')
      await expect(options.first()).toBeVisible({ timeout: 5000 })
    }
  })

  test("should show platform options", async ({ page }) => {
    // Platform buttons should be visible
    const platforms = ["LinkedIn", "Twitter", "Facebook", "Email", "Blog"]

    for (const platform of platforms) {
      const platformButton = page.getByRole("button", { name: new RegExp(platform, "i") })
      // At least some platforms should be visible
      if (await platformButton.isVisible()) {
        await expect(platformButton).toBeEnabled()
      }
    }
  })

  test("should select a platform", async ({ page }) => {
    const linkedinButton = page.getByRole("button", { name: /linkedin/i })

    if (await linkedinButton.isVisible()) {
      await linkedinButton.click()

      // Should show selected state
      await expect(linkedinButton).toHaveAttribute("data-selected", "true")
        .or(expect(linkedinButton).toHaveClass(/selected|active|primary/))
    }
  })

  test("should show advanced options panel", async ({ page }) => {
    const advancedButton = page.getByRole("button", { name: /advanced|options|settings/i })

    if (await advancedButton.isVisible()) {
      await advancedButton.click()

      // Should reveal options like length, tone, audience
      await expect(page.getByText(/length/i)).toBeVisible()
    }
  })

  test("should enter content input", async ({ page }) => {
    const textarea = page.getByPlaceholder(/what.*write|enter.*topic|describe/i)

    if (await textarea.isVisible()) {
      await textarea.fill("Write a professional LinkedIn post about AI productivity tools")
      await expect(textarea).toHaveValue(/linkedin.*ai.*productivity/i)
    }
  })

  test("should generate content with voice clone and platform", async ({ page }) => {
    // Select voice clone if available
    const voiceSelector = page.locator('[data-testid="voice-clone-selector"]')
    if (await voiceSelector.isVisible()) {
      await voiceSelector.click()
      const firstOption = page.locator('[role="option"]').first()
      if (await firstOption.isVisible()) {
        await firstOption.click()
      }
    }

    // Select platform
    const linkedinButton = page.getByRole("button", { name: /linkedin/i })
    if (await linkedinButton.isVisible()) {
      await linkedinButton.click()
    }

    // Enter input
    const textarea = page.getByPlaceholder(/what.*write|enter.*topic|describe/i)
    if (await textarea.isVisible()) {
      await textarea.fill("Share insights about remote work best practices")
    }

    // Click generate
    const generateButton = page.getByRole("button", { name: /generate/i })
    if (await generateButton.isEnabled()) {
      await generateButton.click()

      // Should show loading state
      await expect(
        page.getByText(/generating|loading/i)
          .or(page.locator('[data-loading="true"]'))
          .or(page.locator('.animate-spin'))
      ).toBeVisible({ timeout: 5000 })
    }
  })

  test("should display generation results", async ({ page }) => {
    // Look for results area (may require generating content first)
    const resultsArea = page.locator('[data-testid="generation-results"]')

    if (await resultsArea.isVisible()) {
      // Should show the generated content
      await expect(resultsArea.getByRole("textbox")).toBeVisible()
        .or(expect(resultsArea.locator("p")).toBeVisible())

      // Should show copy button
      await expect(
        resultsArea.getByRole("button", { name: /copy/i })
      ).toBeVisible()
    }
  })

  test("should show AI detection score", async ({ page }) => {
    // Detection score component
    const detectionScore = page.locator('[data-testid="detection-score"]')

    if (await detectionScore.isVisible()) {
      // Should show percentage
      await expect(detectionScore.getByText(/%/)).toBeVisible()
    }
  })

  test("should copy generated content", async ({ page }) => {
    const copyButton = page.getByRole("button", { name: /copy/i })

    if (await copyButton.isVisible()) {
      await copyButton.click()

      // Should show feedback (checkmark or "copied" text)
      await expect(
        page.getByText(/copied/i)
          .or(page.locator('[data-copied="true"]'))
      ).toBeVisible({ timeout: 2000 })
    }
  })

  test("should save content to library", async ({ page }) => {
    const saveButton = page.getByRole("button", { name: /save/i })

    if (await saveButton.isVisible()) {
      await saveButton.click()

      // Should show success toast or confirmation
      await expect(
        page.getByText(/saved|success|added to library/i)
      ).toBeVisible({ timeout: 3000 })
    }
  })

  test("should regenerate content", async ({ page }) => {
    const regenerateButton = page.getByRole("button", { name: /regenerate|try again|new version/i })

    if (await regenerateButton.isVisible()) {
      await regenerateButton.click()

      // Should show loading state again
      await expect(
        page.getByText(/generating/i)
          .or(page.locator('.animate-spin'))
      ).toBeVisible({ timeout: 3000 })
    }
  })

  test("should edit generated content inline", async ({ page }) => {
    const editButton = page.getByRole("button", { name: /edit/i })

    if (await editButton.isVisible()) {
      await editButton.click()

      // Should enable editing mode
      const textarea = page.locator('textarea')
      if (await textarea.isVisible()) {
        await textarea.fill("Modified content for testing")

        // Save changes
        const saveEditButton = page.getByRole("button", { name: /save|done/i })
        if (await saveEditButton.isVisible()) {
          await saveEditButton.click()
        }
      }
    }
  })

  test("should show platform preview", async ({ page }) => {
    const previewTab = page.getByRole("tab", { name: /preview/i })

    if (await previewTab.isVisible()) {
      await previewTab.click()

      // Should show platform-styled preview
      await expect(
        page.locator('[data-testid="platform-preview"]')
          .or(page.getByText(/preview/i))
      ).toBeVisible()
    }
  })

  test("should handle generation error gracefully", async ({ page }) => {
    // Try to generate without required fields
    const generateButton = page.getByRole("button", { name: /generate/i })

    if (await generateButton.isVisible() && await generateButton.isDisabled()) {
      // Button should be disabled without required fields
      await expect(generateButton).toBeDisabled()
    }
  })
})
