#!/bin/bash
# Session Registry: Track active Claude Code sessions and file claims
# Usage: ./scripts/session-registry.sh <command> [args]
#
# This provides advisory file reservation - warnings but not blocking.
# Helps coordinate work across multiple parallel Claude Code sessions.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SESSIONS_DIR="$PROJECT_ROOT/.sessions"
MANIFEST_FILE="$SESSIONS_DIR/manifest.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Ensure sessions directory exists
mkdir -p "$SESSIONS_DIR"

# Initialize manifest if it doesn't exist
init_manifest() {
    if [ ! -f "$MANIFEST_FILE" ]; then
        echo '{"sessions": {}, "lastUpdated": ""}' > "$MANIFEST_FILE"
    fi
}

show_help() {
    echo "Session Registry - Coordinate Parallel Claude Code Sessions"
    echo ""
    echo "Usage: $0 <command> [arguments]"
    echo ""
    echo "Commands:"
    echo "  register <session> [description]   Register a new session"
    echo "  claim <session> <files...>         Claim files for a session"
    echo "  release <session>                  Release all claims for a session"
    echo "  unregister <session>               Remove a session from registry"
    echo "  list                               List all sessions and claims"
    echo "  check <files...>                   Check if files are claimed"
    echo "  cleanup                            Remove stale sessions (>24h old)"
    echo "  help                               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 register auth-feature \"Working on auth flow\""
    echo "  $0 claim auth-feature src/auth/*.ts src/middleware/auth.ts"
    echo "  $0 check src/auth/login.ts"
    echo "  $0 release auth-feature"
    echo ""
    echo "Notes:"
    echo "  - File claims are ADVISORY only (warnings, not blocking)"
    echo "  - Session names should match your worktree/branch names"
    echo "  - Claims use glob patterns for flexible matching"
}

# Get current timestamp in ISO format
get_timestamp() {
    date -u +"%Y-%m-%dT%H:%M:%SZ"
}

# Check if jq is available, fall back to simple parsing if not
has_jq() {
    command -v jq &> /dev/null
}

register_session() {
    local session="$1"
    local description="${2:-No description}"

    if [ -z "$session" ]; then
        echo -e "${RED}Error: Session name is required${NC}"
        echo "Usage: $0 register <session> [description]"
        exit 1
    fi

    init_manifest

    local timestamp=$(get_timestamp)

    if has_jq; then
        local exists=$(jq -r ".sessions.\"$session\" // empty" "$MANIFEST_FILE")
        if [ -n "$exists" ]; then
            echo -e "${YELLOW}Warning: Session '$session' already registered, updating...${NC}"
        fi

        jq --arg session "$session" \
           --arg desc "$description" \
           --arg ts "$timestamp" \
           '.sessions[$session] = {
               "description": $desc,
               "files": (.sessions[$session].files // []),
               "registered": $ts,
               "lastActive": $ts
           } | .lastUpdated = $ts' \
           "$MANIFEST_FILE" > "${MANIFEST_FILE}.tmp" && mv "${MANIFEST_FILE}.tmp" "$MANIFEST_FILE"
    else
        # Simple fallback - just overwrite
        echo "{\"sessions\": {\"$session\": {\"description\": \"$description\", \"files\": [], \"registered\": \"$timestamp\", \"lastActive\": \"$timestamp\"}}, \"lastUpdated\": \"$timestamp\"}" > "$MANIFEST_FILE"
    fi

    echo -e "${GREEN}✓ Registered session: $session${NC}"
    echo "  Description: $description"
}

claim_files() {
    local session="$1"
    shift
    local files=("$@")

    if [ -z "$session" ]; then
        echo -e "${RED}Error: Session name is required${NC}"
        echo "Usage: $0 claim <session> <files...>"
        exit 1
    fi

    if [ ${#files[@]} -eq 0 ]; then
        echo -e "${RED}Error: At least one file pattern is required${NC}"
        echo "Usage: $0 claim <session> <files...>"
        exit 1
    fi

    init_manifest

    # Check for conflicts first
    echo "Checking for conflicts..."
    local has_conflicts=false

    for file in "${files[@]}"; do
        local conflict=$(check_file_claim "$file" "$session")
        if [ -n "$conflict" ]; then
            echo -e "${YELLOW}  Warning: $file claimed by $conflict${NC}"
            has_conflicts=true
        fi
    done

    if [ "$has_conflicts" = true ]; then
        echo ""
        echo -e "${YELLOW}Conflicts detected! Proceeding anyway (advisory only)${NC}"
        echo ""
    fi

    local timestamp=$(get_timestamp)

    if has_jq; then
        # Check if session exists
        local exists=$(jq -r ".sessions.\"$session\" // empty" "$MANIFEST_FILE")
        if [ -z "$exists" ]; then
            echo -e "${YELLOW}Session '$session' not registered, registering now...${NC}"
            register_session "$session" "Auto-registered"
        fi

        # Convert files array to JSON array
        local files_json=$(printf '%s\n' "${files[@]}" | jq -R . | jq -s .)

        jq --arg session "$session" \
           --argjson files "$files_json" \
           --arg ts "$timestamp" \
           '.sessions[$session].files = (.sessions[$session].files + $files | unique) |
            .sessions[$session].lastActive = $ts |
            .lastUpdated = $ts' \
           "$MANIFEST_FILE" > "${MANIFEST_FILE}.tmp" && mv "${MANIFEST_FILE}.tmp" "$MANIFEST_FILE"
    fi

    echo -e "${GREEN}✓ Claimed ${#files[@]} file pattern(s) for session: $session${NC}"
    for file in "${files[@]}"; do
        echo "  - $file"
    done
}

release_session() {
    local session="$1"

    if [ -z "$session" ]; then
        echo -e "${RED}Error: Session name is required${NC}"
        echo "Usage: $0 release <session>"
        exit 1
    fi

    init_manifest

    if has_jq; then
        local timestamp=$(get_timestamp)
        jq --arg session "$session" \
           --arg ts "$timestamp" \
           '.sessions[$session].files = [] |
            .sessions[$session].lastActive = $ts |
            .lastUpdated = $ts' \
           "$MANIFEST_FILE" > "${MANIFEST_FILE}.tmp" && mv "${MANIFEST_FILE}.tmp" "$MANIFEST_FILE"
    fi

    echo -e "${GREEN}✓ Released all claims for session: $session${NC}"
}

unregister_session() {
    local session="$1"

    if [ -z "$session" ]; then
        echo -e "${RED}Error: Session name is required${NC}"
        echo "Usage: $0 unregister <session>"
        exit 1
    fi

    init_manifest

    if has_jq; then
        local timestamp=$(get_timestamp)
        jq --arg session "$session" \
           --arg ts "$timestamp" \
           'del(.sessions[$session]) | .lastUpdated = $ts' \
           "$MANIFEST_FILE" > "${MANIFEST_FILE}.tmp" && mv "${MANIFEST_FILE}.tmp" "$MANIFEST_FILE"
    fi

    echo -e "${GREEN}✓ Unregistered session: $session${NC}"
}

# Check if a file is claimed by another session
# Returns the session name if claimed, empty otherwise
check_file_claim() {
    local file="$1"
    local exclude_session="${2:-}"

    if ! has_jq; then
        return
    fi

    # Get all sessions and their files
    local sessions=$(jq -r '.sessions | keys[]' "$MANIFEST_FILE" 2>/dev/null)

    for session in $sessions; do
        if [ "$session" = "$exclude_session" ]; then
            continue
        fi

        local files=$(jq -r ".sessions.\"$session\".files[]?" "$MANIFEST_FILE" 2>/dev/null)
        for claimed_file in $files; do
            # Check for exact match or glob pattern match
            if [[ "$file" == "$claimed_file" ]] || [[ "$file" == $claimed_file ]]; then
                echo "$session"
                return
            fi
        done
    done
}

check_files() {
    local files=("$@")

    if [ ${#files[@]} -eq 0 ]; then
        echo -e "${RED}Error: At least one file is required${NC}"
        echo "Usage: $0 check <files...>"
        exit 1
    fi

    init_manifest

    echo "Checking file claims..."
    echo ""

    local has_claims=false
    for file in "${files[@]}"; do
        local claimer=$(check_file_claim "$file")
        if [ -n "$claimer" ]; then
            echo -e "  ${YELLOW}⚠${NC}  $file - claimed by ${CYAN}$claimer${NC}"
            has_claims=true
        else
            echo -e "  ${GREEN}✓${NC}  $file - available"
        fi
    done

    echo ""
    if [ "$has_claims" = true ]; then
        echo -e "${YELLOW}Some files have existing claims. Coordinate with other sessions.${NC}"
    else
        echo -e "${GREEN}All files are available.${NC}"
    fi
}

list_sessions() {
    init_manifest

    echo "Active Sessions"
    echo "============================================"

    if ! has_jq; then
        echo -e "${YELLOW}Note: Install 'jq' for full functionality${NC}"
        cat "$MANIFEST_FILE"
        return
    fi

    local sessions=$(jq -r '.sessions | keys[]' "$MANIFEST_FILE" 2>/dev/null)

    if [ -z "$sessions" ]; then
        echo "No active sessions registered."
        echo ""
        echo "Register a session with:"
        echo "  $0 register <session-name> \"Description\""
        return
    fi

    for session in $sessions; do
        local desc=$(jq -r ".sessions.\"$session\".description" "$MANIFEST_FILE")
        local last_active=$(jq -r ".sessions.\"$session\".lastActive" "$MANIFEST_FILE")
        local file_count=$(jq -r ".sessions.\"$session\".files | length" "$MANIFEST_FILE")

        echo ""
        echo -e "${BLUE}Session: $session${NC}"
        echo "  Description: $desc"
        echo "  Last Active: $last_active"
        echo "  Claimed Files: $file_count"

        if [ "$file_count" -gt 0 ]; then
            jq -r ".sessions.\"$session\".files[]" "$MANIFEST_FILE" | while read file; do
                echo "    - $file"
            done
        fi
    done

    echo ""
    echo "============================================"
    local last_updated=$(jq -r '.lastUpdated' "$MANIFEST_FILE")
    echo "Registry last updated: $last_updated"
}

cleanup_sessions() {
    init_manifest

    if ! has_jq; then
        echo -e "${YELLOW}Note: Install 'jq' for cleanup functionality${NC}"
        return
    fi

    echo "Cleaning up stale sessions (>24 hours old)..."

    local cutoff=$(date -u -v-24H +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u -d "24 hours ago" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null)

    if [ -z "$cutoff" ]; then
        echo -e "${YELLOW}Warning: Could not calculate cutoff time, skipping cleanup${NC}"
        return
    fi

    local removed=0
    local sessions=$(jq -r '.sessions | keys[]' "$MANIFEST_FILE" 2>/dev/null)

    for session in $sessions; do
        local last_active=$(jq -r ".sessions.\"$session\".lastActive" "$MANIFEST_FILE")
        if [[ "$last_active" < "$cutoff" ]]; then
            echo "  Removing stale session: $session (last active: $last_active)"
            unregister_session "$session" > /dev/null
            ((removed++))
        fi
    done

    if [ $removed -eq 0 ]; then
        echo "No stale sessions found."
    else
        echo -e "${GREEN}Removed $removed stale session(s)${NC}"
    fi
}

# Main command router
case "${1:-help}" in
    register)
        register_session "$2" "$3"
        ;;
    claim)
        shift
        claim_files "$@"
        ;;
    release)
        release_session "$2"
        ;;
    unregister)
        unregister_session "$2"
        ;;
    list)
        list_sessions
        ;;
    check)
        shift
        check_files "$@"
        ;;
    cleanup)
        cleanup_sessions
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
