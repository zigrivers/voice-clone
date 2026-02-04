# Conflict Resolution Guide

This guide covers how to handle merge conflicts when running multiple parallel Claude Code sessions.

## Table of Contents

- [Prevention is Better Than Cure](#prevention-is-better-than-cure)
- [Understanding Conflicts](#understanding-conflicts)
- [Resolution Process](#resolution-process)
- [Common Scenarios](#common-scenarios)
- [Recovery Procedures](#recovery-procedures)
- [Best Practices](#best-practices)

---

## Prevention is Better Than Cure

### Before Starting Work

1. **Run the pre-session check**
   ```bash
   ./scripts/pre-session-check.sh my-session
   ```

2. **Claim your files** (advisory)
   ```bash
   ./scripts/session-registry.sh claim my-session src/auth/*.ts
   ```

3. **Check for conflicts with other sessions**
   ```bash
   ./scripts/check-conflicts.sh src/auth/login.ts
   ```

### During Work

1. **Sync with main regularly**

   | Session Duration | Recommended Sync Frequency |
   |-----------------|---------------------------|
   | < 1 hour | Before starting only |
   | 1-4 hours | Every 2 hours |
   | > 4 hours | Every hour |
   | Before PR | Always |

   ```bash
   ./scripts/sync-worktree.sh
   ```

2. **Commit frequently** - Smaller commits are easier to resolve

3. **Communicate** - If working with others, coordinate file assignments

---

## Understanding Conflicts

### What Causes Conflicts

Conflicts occur when:
- Two branches modify the same lines in a file
- One branch deletes a file that another modifies
- Both branches add a file with the same name

### Conflict Markers

When Git can't auto-merge, it adds markers:

```
<<<<<<< HEAD
Your changes (current branch)
=======
Their changes (incoming branch)
>>>>>>> branch-name
```

### Types of Conflicts

| Type | Description | Difficulty |
|------|-------------|------------|
| **Text conflict** | Same lines modified | Easy |
| **Semantic conflict** | Different lines, but related logic | Medium |
| **Structural conflict** | File reorganization | Hard |
| **Delete/modify** | One deleted, other modified | Medium |

---

## Resolution Process

### Using the Helper Script

```bash
# Check current status
./scripts/resolve-conflict.sh status

# Get step-by-step guide
./scripts/resolve-conflict.sh guide

# Learn how to abort
./scripts/resolve-conflict.sh abort
```

### Manual Resolution Steps

#### Step 1: Identify Conflicts

```bash
# See all conflicted files
git status

# Or use the helper
./scripts/resolve-conflict.sh status
```

#### Step 2: Understand Each Conflict

```bash
# View the conflict markers
cat path/to/conflicted/file.ts

# See what each side changed
git diff --ours path/to/file.ts    # Your changes
git diff --theirs path/to/file.ts  # Their changes
```

#### Step 3: Resolve Each File

Edit the file to:
1. Remove all conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
2. Keep the correct code (yours, theirs, or a combination)
3. Ensure the result compiles/runs correctly

#### Step 4: Mark as Resolved

```bash
git add path/to/resolved/file.ts
```

#### Step 5: Continue the Operation

```bash
# If rebasing
git rebase --continue

# If merging
git commit

# If cherry-picking
git cherry-pick --continue
```

---

## Common Scenarios

### Scenario 1: Simple Text Conflict

**Situation**: Both branches changed the same function.

```typescript
<<<<<<< HEAD
function greet(name: string) {
  return `Hello, ${name}!`;
}
=======
function greet(name: string) {
  return `Hi, ${name}!`;
}
>>>>>>> feature/greeting-update
```

**Resolution**: Choose one or combine:
```typescript
function greet(name: string, formal: boolean = false) {
  return formal ? `Hello, ${name}!` : `Hi, ${name}!`;
}
```

### Scenario 2: Import Conflicts

**Situation**: Both branches added imports.

```typescript
<<<<<<< HEAD
import { foo } from './foo';
import { bar } from './bar';
=======
import { foo } from './foo';
import { baz } from './baz';
>>>>>>> feature/baz
```

**Resolution**: Keep both (usually):
```typescript
import { foo } from './foo';
import { bar } from './bar';
import { baz } from './baz';
```

### Scenario 3: Delete vs Modify

**Situation**: You deleted a file, they modified it.

```bash
# Their changes were to a file you deleted
CONFLICT (modify/delete): src/old-feature.ts deleted in HEAD
and modified in feature/update
```

**Resolution options**:
```bash
# Keep the deletion (your choice)
git rm src/old-feature.ts

# Keep their modified version
git checkout --theirs src/old-feature.ts
git add src/old-feature.ts
```

### Scenario 4: Package.json Conflicts

**Situation**: Both branches added dependencies.

```json
<<<<<<< HEAD
  "dependencies": {
    "react": "^18.0.0",
    "lodash": "^4.17.0"
  }
=======
  "dependencies": {
    "react": "^18.0.0",
    "axios": "^1.0.0"
  }
>>>>>>> feature/api
```

**Resolution**: Merge the dependencies:
```json
  "dependencies": {
    "react": "^18.0.0",
    "lodash": "^4.17.0",
    "axios": "^1.0.0"
  }
```

Then run `npm install` to update the lockfile.

---

## Recovery Procedures

### Aborting a Rebase

If conflicts are too complex or you need to start over:

```bash
git rebase --abort
```

This returns your branch to its state before the rebase.

### Aborting a Merge

```bash
git merge --abort
```

### Starting Fresh

If things are really broken:

```bash
# Save your work somewhere
git stash

# Reset to a known good state
git reset --hard origin/your-branch

# Or, recreate the branch from main
git checkout main
git pull
git branch -D feat/broken-feature
git checkout -b feat/broken-feature
```

### Recovering Lost Work

If you accidentally lost commits:

```bash
# Find lost commits
git reflog

# Recover a specific commit
git cherry-pick <commit-hash>
```

---

## Best Practices

### For Parallel Sessions

1. **Divide work by feature/domain**, not by file

   | Good Division | Bad Division |
   |--------------|--------------|
   | Session A: Authentication | Session A: Files 1-10 |
   | Session B: Event Management | Session B: Files 11-20 |

2. **Use the session registry**
   ```bash
   ./scripts/session-registry.sh claim auth-work src/auth/**/*
   ```

3. **Check before touching shared files**
   ```bash
   ./scripts/check-conflicts.sh src/shared/utils.ts
   ```

4. **Sync frequently in long sessions**
   ```bash
   ./scripts/sync-worktree.sh
   ```

### When Resolving Conflicts

1. **Understand before resolving** - Don't just pick "ours" or "theirs" blindly
2. **Test after resolving** - Make sure the code still works
3. **Keep both changes when possible** - Especially for additions
4. **Ask when unsure** - If changes conflict semantically, coordinate with the other session

### After Resolution

1. **Run tests** to verify nothing broke
2. **Review the merge commit** to ensure correctness
3. **Update session registry** if needed
4. **Document** any decisions made during resolution

---

## Quick Reference

| Task | Command |
|------|---------|
| Check conflict status | `./scripts/resolve-conflict.sh status` |
| Get resolution guide | `./scripts/resolve-conflict.sh guide` |
| Accept your version | `git checkout --ours <file>` |
| Accept their version | `git checkout --theirs <file>` |
| Mark file resolved | `git add <file>` |
| Continue rebase | `git rebase --continue` |
| Abort rebase | `git rebase --abort` |
| Continue merge | `git commit` |
| Abort merge | `git merge --abort` |
| View conflict diff | `git diff` |
| Find lost commits | `git reflog` |
