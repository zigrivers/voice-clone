#!/bin/bash
# Conflict Detection: Scan all worktrees for potential file conflicts
# Usage: ./scripts/check-conflicts.sh [files...]
#
# Checks for uncommitted changes across all worktrees that might conflict
# with files you're about to edit.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PROJECT_NAME=$(basename "$PROJECT_ROOT")
WORKTREES_DIR="$(dirname "$PROJECT_ROOT")/${PROJECT_NAME}-worktrees"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

show_help() {
    echo "Conflict Detection - Check for file conflicts across worktrees"
    echo ""
    echo "Usage: $0 [files...]"
    echo ""
    echo "Without arguments: Shows all modified files in all worktrees"
    echo "With arguments:    Checks if specific files are modified elsewhere"
    echo ""
    echo "Examples:"
    echo "  $0                           # Show all modifications"
    echo "  $0 src/auth/login.ts         # Check specific file"
    echo "  $0 src/auth/*.ts             # Check with glob pattern"
    echo ""
}

# Get list of all worktrees
get_worktrees() {
    cd "$PROJECT_ROOT"
    git worktree list --porcelain | grep "^worktree " | sed 's/worktree //'
}

# Get modified files in a worktree (both staged and unstaged)
get_modified_files() {
    local worktree="$1"
    git -C "$worktree" status --porcelain 2>/dev/null | awk '{print $2}'
}

# Get the branch name for a worktree
get_worktree_branch() {
    local worktree="$1"
    git -C "$worktree" branch --show-current 2>/dev/null || echo "(detached)"
}

# Main scan function
scan_all_worktrees() {
    echo "Scanning all worktrees for modifications..."
    echo "============================================"
    echo ""

    local worktrees=$(get_worktrees)
    local found_modifications=false

    while IFS= read -r worktree; do
        if [ -z "$worktree" ]; then
            continue
        fi

        local branch=$(get_worktree_branch "$worktree")
        local modified=$(get_modified_files "$worktree")

        if [ -n "$modified" ]; then
            found_modifications=true
            local worktree_name=$(basename "$worktree")

            echo -e "${BLUE}Worktree: $worktree_name${NC}"
            echo "  Path:   $worktree"
            echo "  Branch: $branch"
            echo "  Modified files:"

            echo "$modified" | while read -r file; do
                echo "    - $file"
            done
            echo ""
        fi
    done <<< "$worktrees"

    if [ "$found_modifications" = false ]; then
        echo -e "${GREEN}No modifications found in any worktree.${NC}"
    fi
}

# Check specific files for conflicts
check_specific_files() {
    local check_files=("$@")

    echo "Checking for conflicts with specified files..."
    echo "============================================"
    echo ""

    local worktrees=$(get_worktrees)
    local current_worktree=$(pwd)
    local conflicts_found=false

    # Build a list of modified files across all worktrees (except current)
    declare -A file_owners

    while IFS= read -r worktree; do
        if [ -z "$worktree" ]; then
            continue
        fi

        # Skip current worktree
        if [ "$worktree" = "$current_worktree" ]; then
            continue
        fi

        local branch=$(get_worktree_branch "$worktree")
        local worktree_name=$(basename "$worktree")
        local modified=$(get_modified_files "$worktree")

        while IFS= read -r file; do
            if [ -n "$file" ]; then
                file_owners["$file"]="$worktree_name ($branch)"
            fi
        done <<< "$modified"
    done <<< "$worktrees"

    # Check each requested file against modified files
    for check_file in "${check_files[@]}"; do
        local found=false

        # Check for exact match or pattern match
        for modified_file in "${!file_owners[@]}"; do
            # Exact match
            if [ "$check_file" = "$modified_file" ]; then
                found=true
                echo -e "${YELLOW}⚠ CONFLICT:${NC} $check_file"
                echo "  Modified in: ${file_owners[$modified_file]}"
                conflicts_found=true
            # Pattern match (if check_file contains wildcards)
            elif [[ "$modified_file" == $check_file ]]; then
                found=true
                echo -e "${YELLOW}⚠ CONFLICT:${NC} $modified_file (matched pattern: $check_file)"
                echo "  Modified in: ${file_owners[$modified_file]}"
                conflicts_found=true
            fi
        done

        if [ "$found" = false ]; then
            echo -e "${GREEN}✓${NC} $check_file - no conflicts"
        fi
    done

    echo ""
    if [ "$conflicts_found" = true ]; then
        echo "============================================"
        echo -e "${YELLOW}Conflicts detected!${NC}"
        echo ""
        echo "Options:"
        echo "  1. Coordinate with the other session before proceeding"
        echo "  2. Wait for the other session to commit/merge"
        echo "  3. Proceed carefully (may need to resolve conflicts later)"
        return 1
    else
        echo -e "${GREEN}No conflicts detected.${NC}"
        return 0
    fi
}

# Compare branches for potential merge conflicts
compare_branches() {
    echo "Analyzing branch divergence..."
    echo "============================================"
    echo ""

    cd "$PROJECT_ROOT"
    local worktrees=$(get_worktrees)

    # Get all branches in worktrees
    local branches=()
    while IFS= read -r worktree; do
        if [ -z "$worktree" ]; then
            continue
        fi
        local branch=$(get_worktree_branch "$worktree")
        if [ "$branch" != "(detached)" ] && [ "$branch" != "main" ] && [ "$branch" != "master" ]; then
            branches+=("$branch:$worktree")
        fi
    done <<< "$worktrees"

    if [ ${#branches[@]} -lt 2 ]; then
        echo "Need at least 2 feature branches for comparison."
        return
    fi

    echo "Feature branches in worktrees:"
    for branch_info in "${branches[@]}"; do
        local branch="${branch_info%%:*}"
        local worktree="${branch_info#*:}"
        local ahead=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo "?")
        echo "  - $branch ($(basename "$worktree")): $ahead commits ahead of main"
    done

    echo ""
    echo "Tip: Run 'scripts/sync-worktree.sh' to rebase on main and reduce conflicts"
}

# Main
case "${1:-}" in
    -h|--help|help)
        show_help
        ;;
    "")
        scan_all_worktrees
        echo ""
        compare_branches
        ;;
    *)
        check_specific_files "$@"
        ;;
esac
