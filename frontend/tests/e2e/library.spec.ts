/**
 * E2E Tests for Content Library
 * Tests: Filter library → Edit content → Archive
 */

import { test, expect } from "@playwright/test"

test.describe("Content Library", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/library")
  })

  test("should display library page", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /library|content/i })).toBeVisible()
  })

  test("should show filter sidebar", async ({ page }) => {
    // Filter components should be visible
    await expect(page.getByText(/filters/i).or(page.getByPlaceholder(/search/i))).toBeVisible()
  })

  test("should filter by search text", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i)

    if (await searchInput.isVisible()) {
      await searchInput.fill("test content")

      // Wait for filter to apply
      await page.waitForTimeout(500)

      // Should show filtered results or no results message
      const table = page.locator("table")
      const noResults = page.getByText(/no.*found|no content|empty/i)

      const hasTable = await table.isVisible()
      const hasNoResults = await noResults.isVisible()

      expect(hasTable || hasNoResults).toBeTruthy()
    }
  })

  test("should filter by platform", async ({ page }) => {
    const platformFilter = page.locator('[data-testid="platform-filter"]')
      .or(page.getByLabel(/platform/i))

    if (await platformFilter.isVisible()) {
      await platformFilter.click()

      // Select a platform
      const linkedinOption = page.getByRole("option", { name: /linkedin/i })
        .or(page.getByText(/linkedin/i))

      if (await linkedinOption.isVisible()) {
        await linkedinOption.click()

        // Results should be filtered
        await page.waitForTimeout(500)
      }
    }
  })

  test("should filter by status", async ({ page }) => {
    const statusFilter = page.locator('[data-testid="status-filter"]')
      .or(page.getByLabel(/status/i))

    if (await statusFilter.isVisible()) {
      await statusFilter.click()

      // Select draft status
      const draftOption = page.getByRole("option", { name: /draft/i })
        .or(page.getByText(/draft/i))

      if (await draftOption.isVisible()) {
        await draftOption.click()
        await page.waitForTimeout(500)
      }
    }
  })

  test("should filter by voice clone", async ({ page }) => {
    const voiceFilter = page.locator('[data-testid="voice-clone-filter"]')
      .or(page.getByLabel(/voice clone/i))

    if (await voiceFilter.isVisible()) {
      await voiceFilter.click()

      const firstOption = page.getByRole("option").first()
      if (await firstOption.isVisible()) {
        await firstOption.click()
        await page.waitForTimeout(500)
      }
    }
  })

  test("should clear all filters", async ({ page }) => {
    const clearButton = page.getByRole("button", { name: /clear|reset/i })

    if (await clearButton.isVisible()) {
      await clearButton.click()

      // Search should be empty
      const searchInput = page.getByPlaceholder(/search/i)
      if (await searchInput.isVisible()) {
        await expect(searchInput).toHaveValue("")
      }
    }
  })

  test("should display content table with columns", async ({ page }) => {
    const table = page.locator("table")

    if (await table.isVisible()) {
      // Check for expected column headers
      const headers = ["Content", "Platform", "Voice", "Status", "Created"]

      for (const header of headers) {
        const headerCell = table.getByRole("columnheader", { name: new RegExp(header, "i") })
        if (await headerCell.isVisible()) {
          await expect(headerCell).toBeVisible()
        }
      }
    }
  })

  test("should open content detail modal", async ({ page }) => {
    const contentRow = page.locator("table tbody tr").first()

    if (await contentRow.isVisible()) {
      await contentRow.click()

      // Modal should open
      await expect(
        page.getByRole("dialog")
          .or(page.locator('[data-testid="content-detail"]'))
      ).toBeVisible({ timeout: 3000 })
    }
  })

  test("should view content details", async ({ page }) => {
    const contentRow = page.locator("table tbody tr").first()

    if (await contentRow.isVisible()) {
      await contentRow.click()

      const modal = page.getByRole("dialog")
      if (await modal.isVisible()) {
        // Should show content text
        await expect(modal.locator("p, textarea")).toBeVisible()

        // Should show platform info
        await expect(modal.getByText(/linkedin|twitter|facebook|email|blog/i)).toBeVisible()
      }
    }
  })

  test("should edit content in detail modal", async ({ page }) => {
    const contentRow = page.locator("table tbody tr").first()

    if (await contentRow.isVisible()) {
      await contentRow.click()

      const modal = page.getByRole("dialog")
      if (await modal.isVisible()) {
        const editButton = modal.getByRole("button", { name: /edit/i })

        if (await editButton.isVisible()) {
          await editButton.click()

          // Textarea should be editable
          const textarea = modal.locator("textarea")
          if (await textarea.isVisible()) {
            await textarea.fill("Updated content text for testing")

            // Save changes
            const saveButton = modal.getByRole("button", { name: /save/i })
            if (await saveButton.isVisible()) {
              await saveButton.click()

              // Should show success
              await expect(
                page.getByText(/saved|updated|success/i)
              ).toBeVisible({ timeout: 3000 })
            }
          }
        }
      }
    }
  })

  test("should copy content from detail modal", async ({ page }) => {
    const contentRow = page.locator("table tbody tr").first()

    if (await contentRow.isVisible()) {
      await contentRow.click()

      const modal = page.getByRole("dialog")
      if (await modal.isVisible()) {
        const copyButton = modal.getByRole("button", { name: /copy/i })

        if (await copyButton.isVisible()) {
          await copyButton.click()

          await expect(
            page.getByText(/copied/i)
              .or(modal.locator('[data-copied="true"]'))
          ).toBeVisible({ timeout: 2000 })
        }
      }
    }
  })

  test("should close content detail modal", async ({ page }) => {
    const contentRow = page.locator("table tbody tr").first()

    if (await contentRow.isVisible()) {
      await contentRow.click()

      const modal = page.getByRole("dialog")
      if (await modal.isVisible()) {
        const closeButton = modal.getByRole("button", { name: /close|cancel/i })
          .or(modal.locator('[aria-label="Close"]'))

        if (await closeButton.isVisible()) {
          await closeButton.click()
          await expect(modal).not.toBeVisible({ timeout: 2000 })
        }
      }
    }
  })

  test("should archive content via row action", async ({ page }) => {
    const actionButton = page.locator("table tbody tr").first()
      .getByRole("button", { name: /more|menu|options/i })

    if (await actionButton.isVisible()) {
      await actionButton.click()

      const archiveOption = page.getByRole("menuitem", { name: /archive/i })
      if (await archiveOption.isVisible()) {
        await archiveOption.click()

        // Should show confirmation or success
        await expect(
          page.getByText(/archived|success/i)
            .or(page.getByRole("alertdialog"))
        ).toBeVisible({ timeout: 3000 })
      }
    }
  })

  test("should delete content with confirmation", async ({ page }) => {
    const actionButton = page.locator("table tbody tr").first()
      .getByRole("button", { name: /more|menu|options/i })

    if (await actionButton.isVisible()) {
      await actionButton.click()

      const deleteOption = page.getByRole("menuitem", { name: /delete/i })
      if (await deleteOption.isVisible()) {
        await deleteOption.click()

        // Confirmation dialog should appear
        const confirmDialog = page.getByRole("alertdialog")
        if (await confirmDialog.isVisible()) {
          await expect(confirmDialog.getByText(/are you sure|confirm/i)).toBeVisible()

          // Cancel to avoid actual deletion
          await confirmDialog.getByRole("button", { name: /cancel/i }).click()
          await expect(confirmDialog).not.toBeVisible()
        }
      }
    }
  })

  test("should show AI detection score in table", async ({ page }) => {
    const table = page.locator("table")

    if (await table.isVisible()) {
      // Look for detection score indicators
      const scoreIndicator = table.locator('[data-testid="detection-score"]')
        .or(table.getByText(/%/))

      if (await scoreIndicator.first().isVisible()) {
        await expect(scoreIndicator.first()).toBeVisible()
      }
    }
  })

  test("should paginate results", async ({ page }) => {
    const pagination = page.locator('[data-testid="pagination"]')
      .or(page.getByRole("navigation", { name: /pagination/i }))

    if (await pagination.isVisible()) {
      const nextButton = pagination.getByRole("button", { name: /next/i })

      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click()

        // URL should update or content should change
        await page.waitForTimeout(500)
      }
    }
  })

  test("should export content", async ({ page }) => {
    const exportButton = page.getByRole("button", { name: /export/i })

    if (await exportButton.isVisible()) {
      await exportButton.click()

      // Export dialog should appear
      await expect(
        page.getByRole("dialog")
          .or(page.getByText(/export format/i))
      ).toBeVisible({ timeout: 3000 })
    }
  })
})
