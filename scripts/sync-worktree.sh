#!/bin/bash
# Sync Worktree: Safely rebase current worktree on origin/main
# Usage: ./scripts/sync-worktree.sh [--dry-run]
#
# Fetches latest main and rebases your branch to stay up-to-date
# and reduce merge conflicts when creating PRs.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

DRY_RUN=false

show_help() {
    echo "Sync Worktree - Rebase on origin/main"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --dry-run    Show what would be done without making changes"
    echo "  -h, --help   Show this help message"
    echo ""
    echo "This script will:"
    echo "  1. Stash any uncommitted changes"
    echo "  2. Fetch latest from origin"
    echo "  3. Rebase your branch on origin/main"
    echo "  4. Restore stashed changes"
    echo ""
    echo "Sync Frequency Guidelines:"
    echo "  < 1 hour session:   Before starting only"
    echo "  1-4 hour session:   Every 2 hours"
    echo "  > 4 hour session:   Every hour"
    echo "  Before creating PR: Always sync first"
    echo ""
}

# Parse arguments
for arg in "$@"; do
    case $arg in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help|help)
            show_help
            exit 0
            ;;
    esac
done

echo "============================================"
echo "Sync Worktree with Main"
echo "============================================"
echo ""

# Check if in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}Error: Not a git repository${NC}"
    exit 1
fi

# Get current branch
BRANCH=$(git branch --show-current 2>/dev/null || echo "")
if [ -z "$BRANCH" ]; then
    echo -e "${RED}Error: Detached HEAD state - cannot rebase${NC}"
    exit 1
fi

if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo -e "${RED}Error: Already on $BRANCH - nothing to sync${NC}"
    echo "This script is for feature branches only."
    exit 1
fi

echo "Current branch: $BRANCH"
echo ""

# Check for uncommitted changes
HAS_CHANGES=false
if [ -n "$(git status --porcelain)" ]; then
    HAS_CHANGES=true
    echo -e "${YELLOW}Uncommitted changes detected - will stash${NC}"
    git status --short
    echo ""
fi

# Show what will happen
echo "Plan:"
echo "  1. ${HAS_CHANGES:+Stash uncommitted changes}"
echo "  2. Fetch origin/main"
echo "  3. Rebase $BRANCH on origin/main"
echo "  ${HAS_CHANGES:+4. Restore stashed changes}"
echo ""

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}DRY RUN - no changes will be made${NC}"
    echo ""

    # Show current state
    echo "Current state:"
    git fetch origin main --dry-run 2>&1 || true
    BEHIND=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo "?")
    AHEAD=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo "?")
    echo "  Commits behind main: $BEHIND"
    echo "  Commits ahead of main: $AHEAD"

    if [ "$BEHIND" != "0" ] && [ "$BEHIND" != "?" ]; then
        echo ""
        echo "Commits that would be rebased onto:"
        git log --oneline origin/main..HEAD 2>/dev/null | head -10
    fi

    exit 0
fi

# Step 1: Stash changes if needed
STASH_CREATED=false
if [ "$HAS_CHANGES" = true ]; then
    echo -n "Stashing changes... "
    STASH_MSG="sync-worktree: auto-stash before rebase on $(date '+%Y-%m-%d %H:%M')"
    if git stash push -m "$STASH_MSG" > /dev/null 2>&1; then
        STASH_CREATED=true
        echo -e "${GREEN}OK${NC}"
    else
        echo -e "${RED}FAIL${NC}"
        echo "Could not stash changes. Please commit or discard them first."
        exit 1
    fi
fi

# Function to restore stash on failure
cleanup() {
    if [ "$STASH_CREATED" = true ]; then
        echo ""
        echo -n "Restoring stashed changes... "
        if git stash pop > /dev/null 2>&1; then
            echo -e "${GREEN}OK${NC}"
        else
            echo -e "${YELLOW}WARN${NC}"
            echo "Could not auto-restore. Use 'git stash pop' manually."
        fi
    fi
}

# Set trap to restore stash on error
trap cleanup EXIT

# Step 2: Fetch latest
echo -n "Fetching origin/main... "
if git fetch origin main > /dev/null 2>&1; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAIL${NC}"
    echo "Could not fetch from origin. Check your connection."
    exit 1
fi

# Check if rebase is needed
BEHIND=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo "0")
if [ "$BEHIND" = "0" ]; then
    echo ""
    echo -e "${GREEN}Already up to date with origin/main${NC}"
    trap - EXIT
    cleanup
    exit 0
fi

echo "  $BEHIND new commit(s) on main to incorporate"
echo ""

# Step 3: Rebase
echo "Rebasing $BRANCH on origin/main..."
if git rebase origin/main; then
    echo ""
    echo -e "${GREEN}✓ Rebase successful!${NC}"
else
    echo ""
    echo -e "${RED}✗ Rebase failed - conflicts detected${NC}"
    echo ""
    echo "To resolve:"
    echo "  1. Fix conflicts in the listed files"
    echo "  2. git add <resolved-files>"
    echo "  3. git rebase --continue"
    echo ""
    echo "Or to abort:"
    echo "  git rebase --abort"
    echo ""
    echo "Your stashed changes will be restored after resolving."
    # Don't auto-restore stash on conflict
    STASH_CREATED=false
    exit 1
fi

# Step 4: Restore stash (handled by trap, but disable trap first)
trap - EXIT
if [ "$STASH_CREATED" = true ]; then
    echo -n "Restoring stashed changes... "
    if git stash pop > /dev/null 2>&1; then
        echo -e "${GREEN}OK${NC}"
    else
        echo -e "${YELLOW}WARN${NC}"
        echo "Stash may have conflicts. Use 'git stash show' to review."
    fi
fi

# Summary
echo ""
echo "============================================"
echo "Sync Complete"
echo "============================================"

AHEAD=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo "?")
echo "Branch: $BRANCH"
echo "Commits ahead of main: $AHEAD"
echo ""
echo "Your branch is now up to date with origin/main."
echo ""
echo "When ready to create PR:"
echo "  git push -u origin $BRANCH"
