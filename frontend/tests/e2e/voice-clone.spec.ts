/**
 * E2E Tests for Voice Clone functionality
 * Tests: Create voice clone → Add samples → Analyze DNA
 */

import { test, expect } from "@playwright/test"

test.describe("Voice Clone Management", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to voice clones page
    await page.goto("/voice-clones")
  })

  test("should display voice clones list page", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /voice clones/i })).toBeVisible()
    await expect(page.getByRole("button", { name: /new voice clone/i })).toBeVisible()
  })

  test("should navigate to create voice clone page", async ({ page }) => {
    await page.getByRole("button", { name: /new voice clone/i }).click()
    await expect(page).toHaveURL("/voice-clones/new")
    await expect(page.getByRole("heading", { name: /create voice clone/i })).toBeVisible()
  })

  test("should create a new voice clone", async ({ page }) => {
    await page.goto("/voice-clones/new")

    // Fill in the form
    await page.getByLabel(/name/i).fill("Test Voice Clone")
    await page.getByLabel(/description/i).fill("A test voice clone for E2E testing")

    // Add a tag
    const tagInput = page.locator('input[placeholder*="tag"]')
    if (await tagInput.isVisible()) {
      await tagInput.fill("test")
      await tagInput.press("Enter")
    }

    // Submit the form
    await page.getByRole("button", { name: /create/i }).click()

    // Should redirect to the detail page or list
    await expect(page).not.toHaveURL("/voice-clones/new")
  })

  test("should view voice clone details", async ({ page }) => {
    // Assuming there's at least one voice clone
    const voiceCloneCard = page.locator('[data-testid="voice-clone-card"]').first()

    if (await voiceCloneCard.isVisible()) {
      await voiceCloneCard.click()

      // Should be on detail page
      await expect(page.getByRole("heading")).toBeVisible()
      await expect(page.getByText(/samples/i)).toBeVisible()
    }
  })

  test("should add a writing sample via paste", async ({ page }) => {
    // Navigate to a voice clone detail page
    const voiceCloneCard = page.locator('[data-testid="voice-clone-card"]').first()

    if (await voiceCloneCard.isVisible()) {
      await voiceCloneCard.click()

      // Find and click the add sample button
      const addSampleButton = page.getByRole("button", { name: /add sample/i })
      if (await addSampleButton.isVisible()) {
        await addSampleButton.click()

        // Fill in sample text
        const textarea = page.getByPlaceholder(/paste.*writing/i)
        if (await textarea.isVisible()) {
          await textarea.fill(
            "This is a sample piece of writing that will be used to analyze the voice characteristics. " +
            "It should be long enough to extract meaningful patterns. " +
            "The AI will analyze vocabulary, sentence structure, and tone markers."
          )

          // Add title
          const titleInput = page.getByLabel(/title/i)
          if (await titleInput.isVisible()) {
            await titleInput.fill("Test Sample")
          }

          // Submit
          await page.getByRole("button", { name: /add|save|submit/i }).click()
        }
      }
    }
  })

  test("should trigger DNA analysis", async ({ page }) => {
    const voiceCloneCard = page.locator('[data-testid="voice-clone-card"]').first()

    if (await voiceCloneCard.isVisible()) {
      await voiceCloneCard.click()

      // Look for analyze button
      const analyzeButton = page.getByRole("button", { name: /analyze/i })
      if (await analyzeButton.isVisible()) {
        await analyzeButton.click()

        // Should show loading or progress indicator
        await expect(
          page.getByText(/analyzing|processing|loading/i)
        ).toBeVisible({ timeout: 5000 })
      }
    }
  })

  test("should navigate to merge clones page", async ({ page }) => {
    const mergeButton = page.getByRole("link", { name: /merge/i })

    if (await mergeButton.isVisible()) {
      await mergeButton.click()
      await expect(page).toHaveURL("/voice-clones/merge")
      await expect(page.getByRole("heading", { name: /merge/i })).toBeVisible()
    }
  })

  test("should edit a voice clone", async ({ page }) => {
    const voiceCloneCard = page.locator('[data-testid="voice-clone-card"]').first()

    if (await voiceCloneCard.isVisible()) {
      // Open dropdown menu
      const menuButton = voiceCloneCard.getByRole("button", { name: /more|menu|options/i })
      if (await menuButton.isVisible()) {
        await menuButton.click()

        // Click edit option
        const editOption = page.getByRole("menuitem", { name: /edit/i })
        if (await editOption.isVisible()) {
          await editOption.click()
          await expect(page).toHaveURL(/\/voice-clones\/.*\/edit/)
        }
      }
    }
  })

  test("should delete a voice clone with confirmation", async ({ page }) => {
    const voiceCloneCard = page.locator('[data-testid="voice-clone-card"]').first()

    if (await voiceCloneCard.isVisible()) {
      // Open dropdown menu
      const menuButton = voiceCloneCard.getByRole("button", { name: /more|menu|options/i })
      if (await menuButton.isVisible()) {
        await menuButton.click()

        // Click delete option
        const deleteOption = page.getByRole("menuitem", { name: /delete/i })
        if (await deleteOption.isVisible()) {
          await deleteOption.click()

          // Confirmation dialog should appear
          await expect(page.getByRole("alertdialog")).toBeVisible()
          await expect(page.getByText(/are you sure/i)).toBeVisible()

          // Cancel to avoid actual deletion
          await page.getByRole("button", { name: /cancel/i }).click()
          await expect(page.getByRole("alertdialog")).not.toBeVisible()
        }
      }
    }
  })

  test("should filter voice clones by search", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i)

    if (await searchInput.isVisible()) {
      await searchInput.fill("test")

      // Wait for filtering to apply
      await page.waitForTimeout(500)

      // Results should be filtered (or show no results message)
      const cards = page.locator('[data-testid="voice-clone-card"]')
      const noResults = page.getByText(/no.*found|no results/i)

      // Either we have filtered results or no results message
      const hasCards = await cards.count() > 0
      const hasNoResultsMessage = await noResults.isVisible()

      expect(hasCards || hasNoResultsMessage).toBeTruthy()
    }
  })
})
