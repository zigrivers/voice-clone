#!/bin/bash
# Setup script: Install git hooks from scripts/hooks/ to .git/hooks/
# Usage: bash scripts/setup-hooks.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
HOOKS_SOURCE="$SCRIPT_DIR/hooks"
HOOKS_TARGET="$PROJECT_ROOT/.git/hooks"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "============================================"
echo "Git Hooks Setup"
echo "============================================"
echo ""

# Check if we're in a git repository
if [ ! -d "$PROJECT_ROOT/.git" ]; then
    # Check if this is a worktree
    if [ -f "$PROJECT_ROOT/.git" ]; then
        # It's a worktree, read the actual git dir
        git_dir=$(cat "$PROJECT_ROOT/.git" | sed 's/gitdir: //')
        HOOKS_TARGET="$git_dir/hooks"
        echo -e "${YELLOW}Detected git worktree${NC}"
        echo "Installing hooks to: $HOOKS_TARGET"
    else
        echo -e "${RED}Error: Not a git repository${NC}"
        exit 1
    fi
fi

# Check if hooks source directory exists
if [ ! -d "$HOOKS_SOURCE" ]; then
    echo -e "${RED}Error: Hooks source directory not found: $HOOKS_SOURCE${NC}"
    exit 1
fi

# Create hooks target directory if it doesn't exist
mkdir -p "$HOOKS_TARGET"

# Install each hook
installed=0
for hook in "$HOOKS_SOURCE"/*; do
    if [ -f "$hook" ]; then
        hook_name=$(basename "$hook")
        target="$HOOKS_TARGET/$hook_name"

        # Copy the hook
        cp "$hook" "$target"
        chmod +x "$target"

        echo -e "${GREEN}✓${NC} Installed: $hook_name"
        ((installed++))
    fi
done

echo ""
if [ $installed -eq 0 ]; then
    echo -e "${YELLOW}No hooks found to install${NC}"
else
    echo -e "${GREEN}Successfully installed $installed hook(s)${NC}"
fi

echo ""
echo "Installed hooks:"
echo "  - pre-commit  : Blocks commits to main/master"
echo "  - commit-msg  : Validates conventional commit format"
echo ""
echo "============================================"
