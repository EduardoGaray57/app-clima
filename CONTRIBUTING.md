# Contributing to app-clima

This is a small React + TypeScript weather app. The goal of this guide is simple: keep commits and PRs **reviewable by one person in one sitting**.

## Quick path

1. Make one change that works alone.
2. Include its tests in the same commit.
3. Commit with a Conventional Commit message (see below).
4. Open a PR when the branch stays under ~400 changed lines.

## Commit rules

| Rule | What it means |
|------|---------------|
| Commit by work unit | One commit = one deliverable behavior, fix, migration, or docs change. |
| Do not commit by file type | Never `models`, then `services`, then `tests` — each commit must work alone. |
| Keep tests with code | Tests belong in the same commit as the behavior they verify. |
| Keep docs with the change | Docs ship in the commit that makes the user-visible change. |
| Tell a story | A reviewer should understand why each commit exists from its diff and message. |
| Isolate dependency churn | Large `package-lock.json` changes go into their own `chore(deps): ...` commit. |

Message format: `type(scope): summary` — e.g. `fix(api): bound geocoding quota with cache`.

## Commit checklist

- [ ] One clear purpose
- [ ] Repo still makes sense after this commit alone
- [ ] Tests included with the behavior
- [ ] Rollback possible without reverting unrelated work
- [ ] Message explains the outcome, not the file list

## PR budget

- Default review budget: **400 changed lines** (additions + deletions of authored code).
- If a branch exceeds it, slice it into chained PRs by work unit — do NOT shrink the diff by deleting comments, blank lines, docs, or tests.
- If no honest split fits the budget, stop and report the smallest count instead of compressing code.

## Verification

Before committing, record the focused test command and its exact result. For this repo:

```bash
npm test
```

## Out of scope for first-time contributions

- Rewriting git history of merged PRs.
- Large dependency upgrades without a separate `chore(deps)` commit.
- Generated files (`dist/`) in review diff.
