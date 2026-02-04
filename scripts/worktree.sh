#!/bin/bash
# Worktree management script for parallel Claude Code sessions
# Usage: ./scripts/worktree.sh <command> [args]

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
NC='\033[0m' # No Color

show_help() {
    echo "Git Worktree Manager for Parallel Sessions"
    echo ""
    echo "Usage: $0 <command> [arguments]"
    echo ""
    echo "Commands:"
    echo "  create <prefix> <name>   Create a new worktree with branch prefix/name"
    echo "  list                     List all worktrees"
    echo "  remove <name>            Remove a worktree by name"
    echo "  prune                    Clean up stale worktree references"
    echo "  status                   Show status of all worktrees"
    echo "  help                     Show this help message"
    echo ""
    echo "Branch Prefixes:"
    echo "  feat, fix, refactor, docs, test, chore, style, perf, build, ci"
    echo ""
    echo "Examples:"
    echo "  $0 create feat user-auth     # Creates feat/user-auth branch"
    echo "  $0 create fix login-bug      # Creates fix/login-bug branch"
    echo "  $0 list                      # Show all worktrees"
    echo "  $0 remove user-auth          # Remove worktree"
    echo "  $0 status                    # Show status of all worktrees"
    echo ""
    echo "Worktrees Location: $WORKTREES_DIR"
}

create_worktree() {
    local prefix="$1"
    local name="$2"

    if [ -z "$prefix" ] || [ -z "$name" ]; then
        echo -e "${RED}Error: Both prefix and name are required${NC}"
        echo "Usage: $0 create <prefix> <name>"
        echo "Example: $0 create feat my-feature"
        exit 1
    fi

    # Validate prefix
    valid_prefixes="feat fix refactor docs test chore style perf build ci"
    if ! echo "$valid_prefixes" | grep -qw "$prefix"; then
        echo -e "${RED}Error: Invalid prefix '$prefix'${NC}"
        echo "Valid prefixes: $valid_prefixes"
        exit 1
    fi

    local branch="${prefix}/${name}"
    local worktree_path="${WORKTREES_DIR}/${name}"

    # Create worktrees directory if it doesn't exist
    mkdir -p "$WORKTREES_DIR"

    # Check if worktree already exists
    if [ -d "$worktree_path" ]; then
        echo -e "${RED}Error: Worktree already exists at $worktree_path${NC}"
        echo "Remove it first: $0 remove $name"
        exit 1
    fi

    # Fetch latest from origin
    echo "Fetching latest from origin..."
    cd "$PROJECT_ROOT"
    git fetch origin main

    # Check if branch already exists
    if git show-ref --verify --quiet "refs/heads/$branch"; then
        echo -e "${YELLOW}Warning: Branch $branch already exists, using existing branch${NC}"
        git worktree add "$worktree_path" "$branch"
    else
        # Create worktree with new branch from origin/main
        echo "Creating worktree with new branch: $branch"
        git worktree add -b "$branch" "$worktree_path" origin/main
    fi

    # Install hooks in the worktree
    echo "Installing hooks in worktree..."
    bash "$SCRIPT_DIR/setup-hooks.sh" 2>/dev/null || true

    echo ""
    echo -e "${GREEN}============================================${NC}"
    echo -e "${GREEN}Worktree created successfully!${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo ""
    echo "Location: $worktree_path"
    echo "Branch:   $branch"
    echo ""
    echo "To start working:"
    echo "  cd $worktree_path"
    echo "  claude"
    echo ""
}

list_worktrees() {
    echo "Git Worktrees"
    echo "============================================"
    cd "$PROJECT_ROOT"
    git worktree list
    echo ""
}

remove_worktree() {
    local name="$1"

    if [ -z "$name" ]; then
        echo -e "${RED}Error: Worktree name is required${NC}"
        echo "Usage: $0 remove <name>"
        exit 1
    fi

    local worktree_path="${WORKTREES_DIR}/${name}"

    if [ ! -d "$worktree_path" ]; then
        echo -e "${RED}Error: Worktree not found at $worktree_path${NC}"
        exit 1
    fi

    cd "$PROJECT_ROOT"

    # Check for uncommitted changes
    if [ -n "$(git -C "$worktree_path" status --porcelain 2>/dev/null)" ]; then
        echo -e "${YELLOW}Warning: Worktree has uncommitted changes${NC}"
        read -p "Remove anyway? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Aborted."
            exit 1
        fi
    fi

    # Remove the worktree
    git worktree remove "$worktree_path" --force

    echo -e "${GREEN}Worktree removed: $name${NC}"
    echo ""
    echo "Note: The branch still exists. To delete it:"
    echo "  git branch -d <branch-name>"
}

prune_worktrees() {
    echo "Pruning stale worktree references..."
    cd "$PROJECT_ROOT"
    git worktree prune -v
    echo ""
    echo -e "${GREEN}Prune complete${NC}"
}

show_status() {
    echo "Worktree Status"
    echo "============================================"
    cd "$PROJECT_ROOT"

    # Get list of worktrees
    local worktrees=$(git worktree list --porcelain)

    if [ -z "$worktrees" ]; then
        echo "No worktrees found."
        return
    fi

    # Parse and display each worktree
    local current_worktree=""
    local current_branch=""

    while IFS= read -r line; do
        if [[ "$line" =~ ^worktree\ (.+)$ ]]; then
            # If we have a previous worktree, show its status
            if [ -n "$current_worktree" ]; then
                show_worktree_status "$current_worktree" "$current_branch"
            fi
            current_worktree="${BASH_REMATCH[1]}"
        elif [[ "$line" =~ ^branch\ refs/heads/(.+)$ ]]; then
            current_branch="${BASH_REMATCH[1]}"
        elif [[ "$line" =~ ^detached$ ]]; then
            current_branch="(detached HEAD)"
        fi
    done <<< "$worktrees"

    # Show status of last worktree
    if [ -n "$current_worktree" ]; then
        show_worktree_status "$current_worktree" "$current_branch"
    fi

    echo ""
}

show_worktree_status() {
    local path="$1"
    local branch="$2"

    echo ""
    echo -e "${BLUE}$path${NC}"
    echo "  Branch: $branch"

    if [ -d "$path" ]; then
        local status=$(git -C "$path" status --porcelain 2>/dev/null | head -5)
        if [ -z "$status" ]; then
            echo -e "  Status: ${GREEN}Clean${NC}"
        else
            echo -e "  Status: ${YELLOW}Modified${NC}"
            echo "$status" | while read line; do
                echo "    $line"
            done
            local count=$(git -C "$path" status --porcelain 2>/dev/null | wc -l | tr -d ' ')
            if [ "$count" -gt 5 ]; then
                echo "    ... and $((count - 5)) more"
            fi
        fi

        # Show commits ahead of main
        local ahead=$(git -C "$path" rev-list --count origin/main..HEAD 2>/dev/null || echo "0")
        if [ "$ahead" -gt 0 ]; then
            echo -e "  Commits ahead of main: ${YELLOW}$ahead${NC}"
        fi
    else
        echo -e "  Status: ${RED}Path not found${NC}"
    fi
}

# Main command router
case "${1:-help}" in
    create)
        create_worktree "$2" "$3"
        ;;
    list)
        list_worktrees
        ;;
    remove)
        remove_worktree "$2"
        ;;
    prune)
        prune_worktrees
        ;;
    status)
        show_status
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
