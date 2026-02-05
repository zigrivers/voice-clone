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

## Workflow Orchestration

### Plan Mode
- Enter plan mode for non-trivial tasks (3+ steps or architectural decisions)
- If something goes wrong, STOP and re-plan—don't keep pushing
- Write detailed specs upfront to reduce ambiguity

### Subagents
- Offload research and exploration to subagents to keep main context clean
- One task per subagent for focused execution

### Verification
- Never mark a task complete without proving it works
- Run tests, check logs, demonstrate correctness
- Ask yourself: "Would a staff engineer approve this?"

### Quality
- For non-trivial changes: pause to consider "is there a more elegant way?"
- If a fix feels hacky: rethink the approach
- Skip this for simple, obvious fixes—don't over-engineer

### Autonomous Bug Fixing
- When given a bug report: just fix it without asking for hand-holding
- Point at logs, errors, failing tests → then resolve them
- Go fix failing CI tests without being told how

## Testing & TDD

**Critical**: Follow the TDD standards defined in `docs/tdd-standards.md`.

### Test-Driven Generation (TDG) Workflow

Follow the RED-GREEN-REFACTOR cycle strictly:

1. **RED**: Write test first (test must fail)
2. **GREEN**: Implement just enough to pass the test
3. **REFACTOR**: Improve code while keeping tests passing

### TDD Rules for AI

| Rule | Rationale |
|------|-----------|
| **Test First, Always** | Write the test before implementing. No exceptions. |
| **Never generate test AND implementation together** | AI tests will pass its own bugs |
| **Run tests after every AI interaction** | Verify AI understood correctly |
| **One logical change per cycle** | Keeps AI focused, prevents confusion |

### Test Commands

```bash
# Backend
cd backend
uv run pytest tests/ -v                    # Run all tests
uv run pytest tests/test_file.py -v        # Run single file
uv run pytest --cov=voice_clone            # Run with coverage

# Frontend
cd frontend
npm test                                   # Run all tests
npm test -- --run tests/file.test.tsx     # Run single file
npm test -- --coverage                    # Run with coverage
```

### Coverage Requirements

| Code Area | Minimum | Target |
|-----------|---------|--------|
| Services (business logic) | 85% | 90% |
| API Routes | 75% | 80% |
| Utilities | 90% | 95% |
| React Hooks | 80% | 90% |
| React Components | 60% | 75% |

### Verification Checkpoint

Before marking any task complete:
- [ ] All related tests pass
- [ ] New code has tests
- [ ] Coverage meets minimums
- [ ] No test skips or failures

## Task Management

Track work in `tasks/` folder (both files are git-tracked for cross-session continuity):

### Planning Workflow
1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Get user sign-off before implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Update `tasks/todo.md` with outcomes

### Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md`
- Write rules that prevent the same mistake
- Review lessons at session start for relevant patterns

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Minimal code impact.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.
