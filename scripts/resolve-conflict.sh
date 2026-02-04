#!/bin/bash
# Conflict Resolution Helper: Interactive guide for resolving merge/rebase conflicts
# Usage: ./scripts/resolve-conflict.sh
#
# Provides step-by-step guidance and common resolution strategies.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

show_help() {
    echo "Conflict Resolution Helper"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  status    Show current conflict status (default)"
    echo "  guide     Show step-by-step resolution guide"
    echo "  abort     Show how to abort and start over"
    echo "  help      Show this help message"
    echo ""
}

# Check what kind of operation is in progress
detect_operation() {
    if [ -d ".git/rebase-merge" ] || [ -d ".git/rebase-apply" ]; then
        echo "rebase"
    elif [ -f ".git/MERGE_HEAD" ]; then
        echo "merge"
    elif [ -f ".git/CHERRY_PICK_HEAD" ]; then
        echo "cherry-pick"
    else
        echo "none"
    fi
}

# Get list of conflicted files
get_conflicts() {
    git diff --name-only --diff-filter=U 2>/dev/null
}

show_status() {
    echo "============================================"
    echo "Conflict Resolution Status"
    echo "============================================"
    echo ""

    local operation=$(detect_operation)

    case "$operation" in
        rebase)
            echo -e "Operation: ${YELLOW}Rebase in progress${NC}"
            echo ""
            # Show rebase progress
            if [ -d ".git/rebase-merge" ]; then
                local current=$(cat ".git/rebase-merge/msgnum" 2>/dev/null || echo "?")
                local total=$(cat ".git/rebase-merge/end" 2>/dev/null || echo "?")
                echo "Progress: commit $current of $total"
            fi
            ;;
        merge)
            echo -e "Operation: ${YELLOW}Merge in progress${NC}"
            ;;
        cherry-pick)
            echo -e "Operation: ${YELLOW}Cherry-pick in progress${NC}"
            ;;
        none)
            # Check if there are still unmerged files
            local conflicts=$(get_conflicts)
            if [ -z "$conflicts" ]; then
                echo -e "${GREEN}No conflicts detected.${NC}"
                echo ""
                echo "If you're having other git issues, try:"
                echo "  git status"
                echo "  git log --oneline -5"
                return 0
            else
                echo -e "Operation: ${YELLOW}Unknown (but conflicts exist)${NC}"
            fi
            ;;
    esac

    echo ""

    # List conflicted files
    local conflicts=$(get_conflicts)
    if [ -n "$conflicts" ]; then
        local count=$(echo "$conflicts" | wc -l | tr -d ' ')
        echo -e "Conflicted files: ${RED}$count${NC}"
        echo ""
        echo "$conflicts" | while read -r file; do
            echo -e "  ${RED}✗${NC} $file"
        done
    else
        echo -e "${GREEN}All conflicts resolved!${NC}"
        echo ""
        echo "Next steps:"
        case "$operation" in
            rebase)
                echo "  git rebase --continue"
                ;;
            merge)
                echo "  git commit"
                ;;
            cherry-pick)
                echo "  git cherry-pick --continue"
                ;;
        esac
    fi

    echo ""
}

show_guide() {
    echo "============================================"
    echo "Conflict Resolution Guide"
    echo "============================================"
    echo ""

    local operation=$(detect_operation)
    local conflicts=$(get_conflicts)

    if [ -z "$conflicts" ] && [ "$operation" = "none" ]; then
        echo -e "${GREEN}No conflicts to resolve.${NC}"
        return 0
    fi

    echo -e "${BLUE}Step 1: Understand the conflict${NC}"
    echo ""
    echo "For each conflicted file, you'll see markers like:"
    echo ""
    echo -e "  ${CYAN}<<<<<<< HEAD${NC}"
    echo "  Your changes (current branch)"
    echo -e "  ${CYAN}=======${NC}"
    echo "  Their changes (incoming)"
    echo -e "  ${CYAN}>>>>>>> branch-name${NC}"
    echo ""

    echo -e "${BLUE}Step 2: View the conflicts${NC}"
    echo ""
    echo "Option A - View raw conflict markers:"
    if [ -n "$conflicts" ]; then
        local first_file=$(echo "$conflicts" | head -1)
        echo "  cat \"$first_file\""
    else
        echo "  cat <conflicted-file>"
    fi
    echo ""
    echo "Option B - Use git's merge tool (if configured):"
    echo "  git mergetool"
    echo ""

    echo -e "${BLUE}Step 3: Resolve each conflict${NC}"
    echo ""
    echo "Edit each file to:"
    echo "  - Keep your changes (delete theirs)"
    echo "  - Keep their changes (delete yours)"
    echo "  - Combine both changes manually"
    echo "  - Write completely new code"
    echo ""
    echo "Make sure to remove ALL conflict markers (<<<<, ====, >>>>)"
    echo ""

    echo -e "${BLUE}Step 4: Mark as resolved${NC}"
    echo ""
    echo "After fixing each file:"
    if [ -n "$conflicts" ]; then
        echo "$conflicts" | while read -r file; do
            echo "  git add \"$file\""
        done
    else
        echo "  git add <resolved-file>"
    fi
    echo ""

    echo -e "${BLUE}Step 5: Continue the operation${NC}"
    echo ""
    case "$operation" in
        rebase)
            echo "  git rebase --continue"
            echo ""
            echo "Note: You may need to resolve conflicts multiple times"
            echo "      during a rebase (once per conflicting commit)."
            ;;
        merge)
            echo "  git commit"
            echo ""
            echo "Git will auto-generate a merge commit message."
            ;;
        cherry-pick)
            echo "  git cherry-pick --continue"
            ;;
        *)
            echo "  git rebase --continue   (if rebasing)"
            echo "  git commit              (if merging)"
            ;;
    esac

    echo ""
    echo "============================================"
    echo ""
    echo "Quick Commands:"
    echo ""
    echo "  View conflict status:    $0 status"
    echo "  Abort and start over:    $0 abort"
    echo "  Accept all 'ours':       git checkout --ours <file>"
    echo "  Accept all 'theirs':     git checkout --theirs <file>"
    echo ""
}

show_abort() {
    echo "============================================"
    echo "Aborting the Current Operation"
    echo "============================================"
    echo ""

    local operation=$(detect_operation)

    case "$operation" in
        rebase)
            echo "To abort the rebase and return to your previous state:"
            echo ""
            echo -e "  ${YELLOW}git rebase --abort${NC}"
            echo ""
            echo "This will:"
            echo "  - Cancel the rebase"
            echo "  - Return to your branch as it was before"
            echo "  - Discard any conflict resolutions you made"
            ;;
        merge)
            echo "To abort the merge and return to your previous state:"
            echo ""
            echo -e "  ${YELLOW}git merge --abort${NC}"
            echo ""
            echo "This will:"
            echo "  - Cancel the merge"
            echo "  - Return to your branch as it was before"
            echo "  - Discard any conflict resolutions you made"
            ;;
        cherry-pick)
            echo "To abort the cherry-pick and return to your previous state:"
            echo ""
            echo -e "  ${YELLOW}git cherry-pick --abort${NC}"
            ;;
        none)
            echo "No operation in progress to abort."
            echo ""
            echo "If you want to discard uncommitted changes:"
            echo "  git checkout -- <file>    (discard changes to specific file)"
            echo "  git restore .             (discard all changes - CAREFUL!)"
            ;;
    esac

    echo ""
    echo "After aborting, you can:"
    echo "  1. Review what caused the conflict"
    echo "  2. Make smaller, incremental changes"
    echo "  3. Sync with main more frequently"
    echo "  4. Coordinate with other sessions to avoid file overlap"
    echo ""
}

# Main command router
case "${1:-status}" in
    status)
        show_status
        ;;
    guide)
        show_guide
        ;;
    abort)
        show_abort
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
