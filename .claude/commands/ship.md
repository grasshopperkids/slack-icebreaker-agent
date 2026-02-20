---
description: Run a full code review, fix issues, update docs, push to GitHub, and smoke test the live deployment. Pass an optional commit message or context as the argument.
model: opus
allowed-tools: Task, Read, Write, Edit, Glob, Grep, Bash, TaskOutput, WebFetch, AskUserQuestion, TodoWrite
---

# Ship It — Full Review, Fix, Push, Deploy & Verify

You are a senior engineer performing a full ship cycle on the current repo. Your job is to review all changes, fix issues, update documentation, push to GitHub, and verify the deployment is live and healthy.

## Context from User

$ARGUMENTS

## Step 0: Gather Repo Context

Before doing anything, gather the info you need:

1. **Repo root & name:** Run `git rev-parse --show-toplevel` and `basename` it.
2. **Current branch:** `git branch --show-current`
3. **Remote:** `git remote get-url origin`
4. **Changed files:** `git status --short` and `git diff --name-only` (staged + unstaged).
5. **Recent commits:** `git log --oneline -5` to understand recent work.
6. **Deployment URL:** Look for it in this order:
   - Vercel project config (`.vercel/project.json` or `vercel.json`)
   - `package.json` homepage field
   - CLAUDE.md mentions of a URL
   - Ask the user if not found
7. **Test command:** Check `package.json` scripts for `test`, `lint`, `typecheck`, or similar.
8. **Build command:** Check `package.json` scripts for `build`.

Create a TodoWrite task list with these phases:
- Run code review on all changed files
- Fix identified issues
- Run tests and build to verify fixes
- Check test coverage and write missing unit tests
- Update documentation (README/docs + CLAUDE.md)
- Commit and push to GitHub
- Wait for deployment and run smoke test

## Step 1: Code Review

Review ALL changed files (both staged and unstaged) thoroughly. For each file, check:

**Bugs & Logic:**
- Off-by-one errors, null/undefined access, race conditions
- Missing error handling at system boundaries
- Incorrect conditional logic or early returns
- State management issues (stale closures, missing dependency arrays in React)

**Security:**
- Secrets or API keys in client-side code (especially `VITE_` prefixed tokens in public apps)
- XSS vectors (dangerouslySetInnerHTML, unsanitized user input)
- SQL/NoSQL injection if applicable
- Hardcoded credentials or fallback passwords

**Style & Consistency:**
- Naming conventions matching the rest of the codebase
- Import organization
- Consistent patterns with existing code (check neighboring files)
- Dead code, unused imports, commented-out blocks

**Performance:**
- Unnecessary re-renders (missing memoization on expensive computations)
- Unbounded loops or missing pagination
- Missing cleanup on effects/timers/subscriptions

**TypeScript (if applicable):**
- `any` types that should be narrowed
- `as unknown as T` casts that hide real bugs
- Missing null checks

Present a summary of findings organized by severity (critical > high > medium > low). Include file paths and line numbers.

## Step 2: Fix Issues

Fix all critical and high-severity issues you found. For medium/low issues, fix them if the fix is straightforward and low-risk. For anything ambiguous, ask the user.

After fixing:
1. Run the test suite (`npm test` or whatever the repo uses). If tests fail, fix them.
2. Run the build (`npm run build`). If it fails, fix it.
3. Run linting if available (`npm run lint`). Fix any new lint errors your changes introduced.

If tests or build still fail after your fixes, stop and ask the user before proceeding.

## Step 3: Check Test Coverage & Write Missing Tests

After fixing issues and confirming the build passes, check whether the changed code has adequate test coverage.

1. **Identify what changed:** Look at all modified/added functions, components, and modules.
2. **Find existing tests:** Use Glob and Grep to locate test files (e.g., `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `__tests__/`). Check which of the changed functions already have test coverage.
3. **Study test patterns:** Read 1-2 existing test files to understand the repo's testing conventions (test runner, assertion style, mocking patterns, file naming, setup/teardown patterns).
4. **Write missing tests:** For any changed or added functions/components that lack tests, write unit tests following the existing patterns. Focus on:
   - Core logic and edge cases (boundary values, empty inputs, error paths)
   - Any bug you just fixed (write a regression test that would have caught it)
   - New functions or components you added during the fix phase
   - Don't write tests for trivial getters/setters or pure configuration
5. **Run the full test suite** to confirm all new and existing tests pass.
6. **Report:** Tell the user what tests you added and why. If you skipped coverage for something, explain the reasoning.

If the repo has no test infrastructure at all, note this in the review summary and skip this step.

## Step 4: Update Documentation

**README and docs files:**
- Read the existing README.md (and any docs/ folder).
- If your code changes added new features, changed behavior, or modified setup steps, update the relevant docs.
- If no docs changes are needed, skip this. Don't update docs for the sake of updating.

**CLAUDE.md:**
- Read the project's CLAUDE.md.
- If the code changes reveal new patterns, conventions, gotchas, or architectural decisions worth documenting, add them to the appropriate section.
- If you fixed a bug that others might encounter, add it to a "Learnings" section.
- Don't add trivial or speculative notes. Only add things confirmed by the actual code changes.

## Step 5: Commit and Push

1. Stage all changes: use specific file paths (not `git add -A`) to avoid accidentally including sensitive files. List the files you're staging.
2. Show the user a summary of what will be committed (files + a draft commit message).
3. Ask the user to confirm the commit message and that they want to push.
4. Commit with the confirmed message (include `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`).
5. Push to the current branch's remote.

If the push fails (e.g., behind remote), try `git pull --rebase` first. If there are merge conflicts, stop and ask the user.

## Step 6: Wait for Deployment

After pushing:
1. Wait 15 seconds for the deploy to start.
2. If this is a Vercel project, check deployment status using the Vercel CLI or API if available (`vercel ls` or check the Vercel dashboard URL).
3. If no Vercel CLI, poll the live URL with increasing intervals (15s, 30s, 30s, 60s) until it responds.
4. Maximum wait: 3 minutes. If deployment hasn't completed, tell the user and provide the Vercel dashboard link.

## Step 7: Smoke Test the Live Deployment

Once the URL is responding, run a full smoke test:

**HTTP Health:**
- Confirm the URL returns HTTP 200.
- Check that the response body is not empty and contains expected HTML structure.
- Verify no redirect loops.

**Content Verification:**
- Fetch the page and confirm key elements are present (app root div, main heading, or other identifiable content).
- If this is a React/Vite app, verify the JS bundle loads (check for `<script>` tags).

**Functional Checks (using WebFetch):**
- Load the live URL and check that it renders meaningful content (not a blank page, not an error page, not a Vercel 404).
- If the app has known routes or features, verify 1-2 of them are accessible.

**Report:**
Present the smoke test results as a clear pass/fail checklist:
```
Smoke Test Results — [URL]
  HTTP 200 .............. PASS/FAIL
  HTML structure ........ PASS/FAIL
  JS bundle loads ....... PASS/FAIL
  Content renders ....... PASS/FAIL
  No error page ......... PASS/FAIL
```

If any checks fail, investigate and report what went wrong. Suggest fixes if possible.

## Important Notes

- Never force-push. Never push to main/master without asking.
- Never commit `.env` files, credentials, or secrets.
- If the repo has no tests or build command, skip those checks and note it.
- If you can't determine the deployment URL, ask the user rather than guessing.
- Keep commit messages concise and descriptive (1-2 sentences focused on "why").
- If the user provided a commit message in $ARGUMENTS, use that as the basis.
- This skill is designed for Vercel-deployed projects but should work for other setups — just adapt the deploy/smoke test steps.
