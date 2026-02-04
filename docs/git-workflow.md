# Git Workflow Guide

This document defines the complete git workflow for the project, including branch management, commit conventions, pull requests, and parallel development with multiple Claude Code sessions.

## Table of Contents

- [Core Principles](#core-principles)
- [Branch Strategy](#branch-strategy)
- [Commit Conventions](#commit-conventions)
- [Pull Request Workflow](#pull-request-workflow)
- [Git Hooks](#git-hooks)
- [Parallel Development](#parallel-development)
- [Quick Reference](#quick-reference)
- [Troubleshooting](#troubleshooting)

---

## Core Principles

1. **Never commit directly to main** - All changes go through feature branches and PRs
2. **Conventional commits** - All commit messages follow the conventional commits format
3. **Squash merge** - PRs are squash-merged to keep history clean
4. **Branch-first development** - Create the branch BEFORE writing any code
5. **Isolated parallel work** - Multiple Claude Code sessions use git worktrees

---

## Branch Strategy

### Main Branch

The `main` branch is protected and represents production-ready code:
- Direct commits are blocked by pre-commit hook
- All changes must come through squash-merged PRs
- Should always be in a deployable state

### Feature Branches

All development happens on feature branches following this naming convention:

| Prefix | Use Case | Example |
|--------|----------|---------|
| `feat/` | New features | `feat/player-registration` |
| `fix/` | Bug fixes | `fix/login-redirect-loop` |
| `refactor/` | Code restructuring | `refactor/event-service` |
| `docs/` | Documentation | `docs/api-endpoints` |
| `test/` | Test additions | `test/registration-edge-cases` |
| `chore/` | Maintenance | `chore/update-dependencies` |
| `style/` | Formatting/style | `style/lint-fixes` |
| `perf/` | Performance | `perf/query-optimization` |
| `build/` | Build system | `build/docker-config` |
| `ci/` | CI/CD changes | `ci/github-actions` |

### Creating a Feature Branch

```bash
# Always start from an updated main
git checkout main
git pull origin main

# Create and switch to feature branch
git checkout -b feat/my-feature-name
```

---

## Commit Conventions

All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>
```

### Components

| Component | Required | Description |
|-----------|----------|-------------|
| `type` | Yes | Category of change (feat, fix, etc.) |
| `scope` | Recommended | Area of codebase affected |
| `subject` | Yes | Short description (imperative mood) |
| `body` | Optional | Detailed explanation

### Types

| Type | Description | Bumps Version |
|------|-------------|---------------|
| `feat` | New feature | Minor |
| `fix` | Bug fix | Patch |
| `refactor` | Code restructuring (no behavior change) | - |
| `docs` | Documentation only | - |
| `test` | Adding/updating tests | - |
| `chore` | Maintenance tasks | - |
| `style` | Formatting, whitespace | - |
| `perf` | Performance improvement | Patch |
| `build` | Build system changes | - |
| `ci` | CI/CD changes | - |

### Examples

```bash
# Feature commit
git commit -m "feat(events): add waitlist capacity configuration

Allow game managers to set maximum waitlist size per event.
Includes validation to ensure waitlist_max >= 0."

# Bug fix
git commit -m "fix(auth): resolve token refresh race condition

Tokens were being refreshed simultaneously causing 401 errors.
Added mutex lock around refresh logic."

# Documentation
git commit -m "docs(api): document event registration endpoints"
```

### Using HEREDOC for Multi-line Messages

For complex commit messages, use HEREDOC to preserve formatting:

```bash
git commit -m "$(cat <<'EOF'
feat(tournaments): add bracket generation

Automatically generate tournament brackets based on:
- Number of registered players
- Seeding preferences
- Format (single/double elimination)

Closes #42
EOF
)"
```

---

## Pull Request Workflow

### Creating and Merging a PR

The complete PR workflow is a single continuous process: push, create PR, merge, cleanup.

```bash
# Push, create PR, merge, and return to main (single continuous flow)
git push -u origin feat/my-feature && \
gh pr create --title "feat(scope): description" --body "$(cat <<'EOF'
## Summary
- Brief description of changes

## Changes
- Specific change 1
- Specific change 2

EOF
)" && \
gh pr merge --squash --delete-branch && \
git checkout main && \
git pull
```

This creates the PR and immediately merges it via squash merge, then syncs local main.

### PR Checklist

Before creating a PR, verify:
- [ ] All tests pass locally
- [ ] Code follows project conventions
- [ ] Commit messages follow conventional format
- [ ] No sensitive data in commits (`.env`, credentials)
- [ ] Documentation updated if needed

---

## Git Hooks

The project uses git hooks to enforce workflow rules. Hooks are stored in `scripts/hooks/` and installed to `.git/hooks/`.

### Installing Hooks

```bash
bash scripts/setup-hooks.sh
```

### Pre-commit Hook

**Location**: `scripts/hooks/pre-commit`

**Purpose**: Prevents direct commits to main/master branches.

**Behavior**:
- Checks current branch name
- Blocks commit if on `main` or `master`
- Provides guidance on creating a feature branch

### Commit-msg Hook

**Location**: `scripts/hooks/commit-msg`

**Purpose**: Validates commit message format.

**Validation Pattern**:
```regex
^(feat|fix|refactor|docs|test|chore|style|perf|build|ci)(\([a-zA-Z0-9_-]+\))?: .+
```

**Behavior**:
- Validates message matches conventional commit format
- Allows optional scope in parentheses
- Rejects commits with invalid format

---

## Parallel Development

Running multiple Claude Code sessions simultaneously requires isolation to prevent file conflicts.

### Git Worktrees

Git worktrees allow multiple working directories to share the same repository, each on a different branch.

**Benefits**:
- Lightweight (shared `.git` directory)
- Independent file states
- Each worktree has its own branch
- Hooks work in all worktrees

### Worktree Helper Script

Use `scripts/worktree.sh` to manage worktrees:

```bash
# Create a new worktree for a feature
./scripts/worktree.sh create feat user-auth

# List all worktrees
./scripts/worktree.sh list

# Remove a worktree after PR is merged
./scripts/worktree.sh remove user-auth

# Clean up stale worktree references
./scripts/worktree.sh prune
```

### Worktree Locations

- **Main project**: `/path/to/pickleball-manager/`
- **Worktrees**: `/path/to/pickleball-manager-worktrees/<name>/`

### Parallel Session Workflow

1. **Identify Independent Tasks**

   Before creating parallel sessions, ensure tasks don't conflict:

   | Safe to Parallelize | Avoid Parallelizing |
   |---------------------|---------------------|
   | Different features | Same models |
   | Different domains | Same services |
   | Backend + Frontend | Shared utilities |
   | Tests + Implementation | Database migrations |

2. **Create Worktrees**
   ```bash
   # Session 1
   ./scripts/worktree.sh create feat user-auth

   # Session 2
   ./scripts/worktree.sh create feat event-export
   ```

3. **Launch Claude Code Sessions**
   ```bash
   # Terminal 1
   cd ../pickleball-manager-worktrees/user-auth
   claude

   # Terminal 2
   cd ../pickleball-manager-worktrees/event-export
   claude
   ```

4. **Work and Create PRs**
   - Each session commits to its own branch
   - Each creates its own PR
   - Review and merge independently

5. **Cleanup**
   ```bash
   ./scripts/worktree.sh remove user-auth
   ./scripts/worktree.sh remove event-export
   ./scripts/worktree.sh prune
   ```

### Best Practices

| Do | Don't |
|----|-------|
| Plan tasks before creating sessions | Start sessions without planning |
| Use descriptive worktree names | Use generic names like `session-1` |
| Clean up worktrees after merge | Leave stale worktrees |
| Fetch main before creating worktree | Create from stale main |
| Review each PR carefully | Batch merge without review |
| Assign truly independent tasks | Have sessions touch same files |

---

## Quick Reference

### Daily Workflow

```bash
# Start new work
git checkout main && git pull
git checkout -b feat/my-feature

# Stage specific files (never use git add . or -A)
git add backend/app/services/my_service.py
git add backend/tests/unit/test_my_service.py

# Commit with detailed conventional format (use HEREDOC for multi-line)
git commit -m "$(cat <<'EOF'
feat(service): add my feature

- Implement core functionality for X
- Add validation for edge cases
- Update related configuration
EOF
)"

# Push, create PR, merge, and sync (single continuous flow)
git push -u origin feat/my-feature && \
gh pr create --title "feat(service): add my feature" --body "..." && \
gh pr merge --squash --delete-branch && \
git checkout main && git pull
```

### Parallel Session Workflow

```bash
# Create worktrees
./scripts/worktree.sh create feat feature-a
./scripts/worktree.sh create feat feature-b

# Work in separate terminals
cd ../pickleball-manager-worktrees/feature-a && claude
cd ../pickleball-manager-worktrees/feature-b && claude

# After PRs merged
./scripts/worktree.sh remove feature-a
./scripts/worktree.sh remove feature-b
./scripts/worktree.sh prune
```

### Common Commands

| Task | Command |
|------|---------|
| Check status | `git status` |
| View branches | `git branch -a` |
| View log | `git log --oneline -10` |
| View diff | `git diff` |
| Stage file | `git add <file>` |
| Unstage file | `git restore --staged <file>` |
| Create branch | `git checkout -b <branch>` |
| Switch branch | `git checkout <branch>` |
| Push branch | `git push -u origin <branch>` |
| Create PR | `gh pr create` |
| View PR | `gh pr view` |
| Merge PR | `gh pr merge --squash --delete-branch` |

---

## Troubleshooting

### "Cannot commit to main"

The pre-commit hook blocks direct commits to main.

**Solution**: Create a feature branch first:
```bash
git checkout -b feat/my-feature
```

### "Invalid commit message format"

The commit-msg hook validates conventional commit format.

**Solution**: Use the correct format:
```bash
git commit -m "type(scope): description"
```

### "Worktree already exists"

A worktree with that name already exists.

**Solution**: Choose a different name or remove the existing one:
```bash
./scripts/worktree.sh remove existing-name
./scripts/worktree.sh create feat new-name
```

### "Branch already exists"

Trying to create a worktree with a branch that already exists.

**Solution**: Use a different branch name or delete the existing branch:
```bash
git branch -d feat/old-branch
```

### Hooks Not Working

Hooks may not be installed or executable.

**Solution**: Reinstall hooks:
```bash
bash scripts/setup-hooks.sh
```

### Merge Conflicts in Parallel Sessions

Two sessions modified the same file.

**Solution**:
1. This shouldn't happen if tasks are truly independent
2. If it does, resolve manually in one worktree:
   ```bash
   git fetch origin main
   git merge origin/main
   # Resolve conflicts
   git add <resolved-files>
   git commit
   ```

---

## Prohibited Actions

These actions are explicitly forbidden:

- Committing directly to `main`
- Using `git add .` or `git add -A`
- Using `git push --force` on shared branches
- Skipping the feature branch step
- Amending commits after pushing
- Using `--no-verify` to skip hooks
- Force pushing to main/master
- Running parallel sessions in the same directory
