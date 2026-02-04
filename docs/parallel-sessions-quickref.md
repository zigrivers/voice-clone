# Parallel Sessions Quick Reference

One-page reference for running multiple Claude Code sessions simultaneously.

---

## Session Setup

### Starting a New Parallel Session

```bash
# 1. Create worktree with new branch
./scripts/worktree.sh create feat my-feature

# 2. Navigate to worktree
cd ../voice-clone-worktrees/my-feature

# 3. Run pre-session check
./scripts/pre-session-check.sh my-feature

# 4. Start Claude Code
claude
```

### After Finishing

```bash
# 1. Complete PR workflow (from worktree)
git push -u origin feat/my-feature && \
gh pr create --title "feat(scope): description" --body "..." && \
gh pr merge --squash --delete-branch && \
git checkout main && git pull

# 2. Return to main project
cd /path/to/voice-clone

# 3. Remove worktree
./scripts/worktree.sh remove my-feature

# 4. Release session claims
./scripts/session-registry.sh release my-feature
```

---

## Script Commands

| Script | Command | Description |
|--------|---------|-------------|
| **worktree.sh** | `create <prefix> <name>` | Create worktree with branch |
| | `list` | List all worktrees |
| | `remove <name>` | Remove worktree |
| | `status` | Show status of all worktrees |
| | `prune` | Clean stale references |
| **session-registry.sh** | `register <session>` | Register a session |
| | `claim <session> <files>` | Claim files (advisory) |
| | `release <session>` | Release all claims |
| | `check <files>` | Check if files claimed |
| | `list` | List all sessions |
| **check-conflicts.sh** | (no args) | Scan all worktrees |
| | `<files>` | Check specific files |
| **sync-worktree.sh** | (no args) | Rebase on origin/main |
| | `--dry-run` | Preview without changes |
| **pre-session-check.sh** | `[session]` | Validate environment |
| **resolve-conflict.sh** | `status` | Show conflict status |
| | `guide` | Resolution steps |
| | `abort` | How to abort |

---

## Sync Schedule

| Session Duration | Sync Frequency |
|-----------------|----------------|
| < 1 hour | Start only |
| 1-4 hours | Every 2 hours |
| > 4 hours | Every hour |
| Before PR | Always |

```bash
./scripts/sync-worktree.sh
```

---

## File Coordination

### Claim Files Before Editing

```bash
./scripts/session-registry.sh claim my-session src/auth/*.ts src/middleware/auth.ts
```

### Check for Conflicts

```bash
# Before editing a file
./scripts/check-conflicts.sh src/auth/login.ts

# See all active modifications
./scripts/check-conflicts.sh
```

### View Active Sessions

```bash
./scripts/session-registry.sh list
```

---

## Conflict Resolution

### When Conflicts Occur

```bash
# 1. Check status
./scripts/resolve-conflict.sh status

# 2. Follow guide
./scripts/resolve-conflict.sh guide

# 3. After resolving all files
git add <resolved-files>
git rebase --continue  # or git commit for merges
```

### Quick Resolution

```bash
# Accept your changes
git checkout --ours <file>

# Accept their changes
git checkout --theirs <file>
```

### Abort if Needed

```bash
git rebase --abort   # Cancel rebase
git merge --abort    # Cancel merge
```

---

## Task Division Best Practices

### Good ✓

| Session | Task | Files |
|---------|------|-------|
| A | Authentication | `src/auth/*` |
| B | Event Management | `src/events/*` |
| C | API Endpoints | `src/api/*` |

### Bad ✗

| Session | Task | Problem |
|---------|------|---------|
| A | Files 1-10 | May overlap logically |
| B | Files 11-20 | Hard to reason about |
| Both | Same utility file | Guaranteed conflicts |

---

## Emergency Recovery

### Lost Work

```bash
git reflog                     # Find lost commits
git cherry-pick <commit-hash>  # Recover specific commit
```

### Reset to Known State

```bash
git stash                              # Save current work
git reset --hard origin/your-branch    # Reset to remote
```

### Recreate Branch

```bash
git checkout main && git pull
git branch -D feat/broken
git checkout -b feat/broken
```

---

## Checklist

### Before Starting Session

- [ ] Created worktree: `./scripts/worktree.sh create ...`
- [ ] Ran pre-check: `./scripts/pre-session-check.sh`
- [ ] Claimed files: `./scripts/session-registry.sh claim ...`
- [ ] Hooks installed: `bash scripts/setup-hooks.sh`

### During Session

- [ ] On feature branch (not main)
- [ ] Committing frequently
- [ ] Syncing if session > 1 hour

### Before PR

- [ ] Synced with main: `./scripts/sync-worktree.sh`
- [ ] Tests pass
- [ ] No lint errors

### After Merge

- [ ] Worktree removed: `./scripts/worktree.sh remove ...`
- [ ] Claims released: `./scripts/session-registry.sh release ...`
