# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Voice-clone is a Next.js application with TypeScript, Tailwind CSS, and ESLint. The project uses the App Router with a `src/` directory structure and `@/*` import aliases.

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build
npm start            # Run production server
npm run lint         # ESLint checks
```

## Git Workflow

**Critical**: Follow the workflow defined in `docs/git-workflow.md`.

### Branch-First Development

Always create a feature branch before writing code:
```bash
git checkout main && git pull
git checkout -b feat/feature-name
```

Branch prefixes: `feat/`, `fix/`, `refactor/`, `docs/`, `test/`, `chore/`, `style/`, `perf/`, `build/`, `ci/`

### Commit Conventions

All commits must follow Conventional Commits format:
```
<type>(<scope>): <subject>
```

Use HEREDOC for multi-line messages:
```bash
git commit -m "$(cat <<'EOF'
feat(scope): description

- Detail 1
- Detail 2
EOF
)"
```

### Pull Request Flow

Single continuous command for push, PR creation, merge, and cleanup:
```bash
git push -u origin feat/my-feature && \
gh pr create --title "feat(scope): description" --body "..." && \
gh pr merge --squash --delete-branch && \
git checkout main && git pull
```

### Git Hooks

Install hooks with `bash scripts/setup-hooks.sh`. Hooks are in `scripts/hooks/`:
- **pre-commit**: Blocks commits to main/master
- **commit-msg**: Validates conventional commit format

### Prohibited Actions

- Never commit directly to `main`
- Never use `git add .` or `git add -A` (stage specific files only)
- Never use `git push --force` on shared branches
- Never use `--no-verify` to skip hooks
- Never amend commits after pushing

### Parallel Development

Use git worktrees for multiple Claude Code sessions:
```bash
./scripts/worktree.sh create feat feature-name    # Create worktree
./scripts/worktree.sh list                        # List worktrees
./scripts/worktree.sh remove feature-name         # Remove after merge
./scripts/worktree.sh status                      # Show all worktree status
./scripts/worktree.sh prune                       # Clean stale references
```

Worktrees are created in `../<project>-worktrees/<name>/`. Only parallelize truly independent tasks that don't touch the same files.

### Session Coordination Scripts

For managing multiple parallel sessions:
```bash
# Pre-session validation
./scripts/pre-session-check.sh my-session

# File claim coordination (advisory)
./scripts/session-registry.sh register my-session "Working on auth"
./scripts/session-registry.sh claim my-session src/auth/*.ts
./scripts/session-registry.sh check src/auth/login.ts
./scripts/session-registry.sh list
./scripts/session-registry.sh release my-session

# Conflict detection across worktrees
./scripts/check-conflicts.sh                  # Scan all worktrees
./scripts/check-conflicts.sh src/file.ts      # Check specific files

# Sync with main (rebase)
./scripts/sync-worktree.sh                    # Rebase on origin/main
./scripts/sync-worktree.sh --dry-run          # Preview changes

# Conflict resolution helper
./scripts/resolve-conflict.sh status          # Check conflict status
./scripts/resolve-conflict.sh guide           # Step-by-step resolution
./scripts/resolve-conflict.sh abort           # How to abort
```

See `docs/parallel-sessions-quickref.md` for a complete quick reference.
