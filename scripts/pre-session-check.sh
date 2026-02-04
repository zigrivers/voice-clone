#!/bin/bash
# Pre-Session Check: Validate environment before starting work
# Usage: ./scripts/pre-session-check.sh [session-name]
#
# Run this at the start of a Claude Code session to ensure
# everything is properly configured.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track overall status
WARNINGS=0
ERRORS=0

echo "============================================"
echo "Pre-Session Environment Check"
echo "============================================"
echo ""

# Check 1: Git repository
echo -n "Checking git repository... "
if git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAIL${NC}"
    echo "  Not a git repository!"
    ((ERRORS++))
fi

# Check 2: Not on main/master
echo -n "Checking current branch... "
BRANCH=$(git branch --show-current 2>/dev/null || echo "")
if [ -z "$BRANCH" ]; then
    echo -e "${YELLOW}WARN${NC} (detached HEAD)"
    ((WARNINGS++))
elif [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo -e "${RED}FAIL${NC}"
    echo "  Currently on $BRANCH - create a feature branch first!"
    echo "  Use: git checkout -b feat/your-feature"
    ((ERRORS++))
else
    echo -e "${GREEN}OK${NC} ($BRANCH)"
fi

# Check 3: Git hooks installed
echo -n "Checking git hooks... "
HOOKS_DIR=""
if [ -d ".git/hooks" ]; then
    HOOKS_DIR=".git/hooks"
elif [ -f ".git" ]; then
    # Worktree - read actual git dir
    GIT_DIR=$(cat ".git" | sed 's/gitdir: //')
    HOOKS_DIR="$GIT_DIR/hooks"
fi

if [ -z "$HOOKS_DIR" ]; then
    echo -e "${RED}FAIL${NC}"
    echo "  Could not find hooks directory"
    ((ERRORS++))
elif [ -x "$HOOKS_DIR/pre-commit" ] && [ -x "$HOOKS_DIR/commit-msg" ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${YELLOW}WARN${NC}"
    echo "  Hooks not installed. Run: bash scripts/setup-hooks.sh"
    ((WARNINGS++))
fi

# Check 4: Clean working tree
echo -n "Checking working tree... "
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${GREEN}OK${NC} (clean)"
else
    MODIFIED=$(git status --porcelain | wc -l | tr -d ' ')
    echo -e "${YELLOW}WARN${NC} ($MODIFIED modified files)"
    echo "  Consider committing or stashing changes before starting new work"
    ((WARNINGS++))
fi

# Check 5: Sync with origin/main
echo -n "Checking sync with origin/main... "
git fetch origin main --quiet 2>/dev/null || true
BEHIND=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo "?")
AHEAD=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo "?")

if [ "$BEHIND" = "0" ]; then
    echo -e "${GREEN}OK${NC} ($AHEAD commits ahead)"
elif [ "$BEHIND" = "?" ]; then
    echo -e "${YELLOW}WARN${NC} (could not determine)"
    ((WARNINGS++))
else
    echo -e "${YELLOW}WARN${NC} ($BEHIND commits behind main)"
    echo "  Consider rebasing: git fetch origin main && git rebase origin/main"
    ((WARNINGS++))
fi

# Check 6: Check for conflicts with other worktrees
echo -n "Checking for worktree conflicts... "
if [ -x "$SCRIPT_DIR/check-conflicts.sh" ]; then
    CONFLICTS=$("$SCRIPT_DIR/check-conflicts.sh" 2>/dev/null | grep -c "CONFLICT:" || echo "0")
    if [ "$CONFLICTS" = "0" ]; then
        echo -e "${GREEN}OK${NC}"
    else
        echo -e "${YELLOW}WARN${NC} ($CONFLICTS potential conflicts)"
        echo "  Run: ./scripts/check-conflicts.sh for details"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}SKIP${NC} (check-conflicts.sh not found)"
fi

# Check 7: Session registration (if session name provided)
SESSION_NAME="${1:-}"
if [ -n "$SESSION_NAME" ]; then
    echo -n "Registering session '$SESSION_NAME'... "
    if [ -x "$SCRIPT_DIR/session-registry.sh" ]; then
        "$SCRIPT_DIR/session-registry.sh" register "$SESSION_NAME" "Started $(date '+%Y-%m-%d %H:%M')" > /dev/null 2>&1
        echo -e "${GREEN}OK${NC}"
    else
        echo -e "${YELLOW}SKIP${NC} (session-registry.sh not found)"
    fi
fi

# Summary
echo ""
echo "============================================"
echo "Summary"
echo "============================================"

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}✗ $ERRORS error(s) found - please fix before proceeding${NC}"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS warning(s) - review above for recommendations${NC}"
    echo ""
    echo "You can proceed, but consider addressing warnings first."
    exit 0
else
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "You're ready to start working."
    exit 0
fi

echo ""
echo "Quick reference:"
echo "  Create branch:  git checkout -b feat/your-feature"
echo "  Install hooks:  bash scripts/setup-hooks.sh"
echo "  Sync with main: git fetch origin main && git rebase origin/main"
echo "  Check conflicts: ./scripts/check-conflicts.sh"
