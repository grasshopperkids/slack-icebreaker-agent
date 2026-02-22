---
description: Orient Claude Code for a new work session — reads CLAUDE.md, docs, recent git history, and any session handoff notes to build a complete picture before starting work. Pass optional context about what you want to work on today.
model: opus
allowed-tools: Task, Read, Write, Glob, Grep, Bash, TaskOutput, AskUserQuestion
---

# Session Orientation — Get Up to Speed Before Starting

You are beginning a new work session. Before doing anything else, build a complete picture of the current project so you can work effectively without the user needing to re-explain context.

## Context from User

$ARGUMENTS

If the user passed notes here, treat them as a hint about what they want to work on today. Incorporate it into the closing summary.

---

## Step 1: Identify the Project

Run these in parallel:

1. `git rev-parse --show-toplevel` — find the repo root. If not in a git repo, use the current working directory.
2. `git remote get-url origin` — identify the GitHub repo.
3. `git branch --show-current` — see the active branch.
4. `git log --oneline -10` — see recent commit history.
5. `git status --short` — see uncommitted changes.

---

## Step 2: Read CLAUDE.md

Find and read ALL relevant CLAUDE.md files:

1. Check for `CLAUDE.md` in the repo root — read it fully.
2. Check for `CLAUDE.md` in the parent directory — read it if it exists.
3. Check for `CLAUDE.md` in any subdirectory you'll be working in.

CLAUDE.md is the authoritative guide. Absorb everything: architecture, team conventions, voice/style rules, known gotchas, tech stack, and workflow expectations. This is the most important file.

---

## Step 3: Read Key Documentation

Look for and read (in priority order):

1. `README.md` in the repo root
2. `CONTEXT.md` if it exists
3. Files in a `docs/` folder — read anything that looks architectural or reference-oriented
4. Any `.md` files in the root with names suggesting architecture, setup, planning, or specs (e.g., `proposed-ghk-codebase-architecture.md`, `ops-workflow-notes.md`, `scaling-claude-code-dev.md`)

Don't read everything blindly. Prioritize files that give you architectural and contextual understanding. Stop when you have enough to brief the user accurately.

---

## Step 4: Check for Session Handoff Notes

These files carry critical context from where previous sessions left off. Read any that exist:

- Files matching `next-session*.md`
- Files matching `session-notes*.md` — if multiple, read the **most recent** one only
- `tasks/todo.md` or any task tracking files
- `tasks/lessons.md` — contains accumulated lessons from past mistakes
- Any file whose name suggests it's a handoff or prompt for the next developer

If there are multiple session notes, use `ls -lt` to find the newest one by modification time.

---

## Step 5: Assess Current State

1. If `git status --short` showed uncommitted changes, read those files to understand what work is in progress.
2. If `package.json` exists, check the `scripts` section for available commands (build, test, lint, dev).
3. If there's a `.env.example` or `.env` file (don't read secrets), note what environment variables are expected.

---

## Step 6: Deliver the Session Brief

Present a clean, synthesized summary. This is **not** a dump of everything you read — it's a focused brief that gets the user straight into productive work.

Use this format exactly:

---

## Session Brief — [Project Name]

**Branch:** `[branch]` | **Repo:** `[GitHub remote]`

### What This Project Is
[1–2 sentences. What does this app/tool do, and who uses it?]

### Where We Left Off
[Pull the most actionable context from session notes, recent commits, and in-progress changes. Be specific — "we were in the middle of X" is more useful than "some work was in progress."]

### Current State
- **Uncommitted changes:** [list files, or "working tree clean"]
- **Recent commits:** [2–3 most relevant, with messages]
- **In-progress work:** [anything obvious from file state or session notes]

### Key Architecture & Patterns
[3–5 bullets from CLAUDE.md and docs. Focus on things that matter for writing code in this project: tech stack, naming conventions, critical patterns, deployment setup.]

### Watch Out For
[Known gotchas, things to avoid, lessons from `tasks/lessons.md` or CLAUDE.md "Learnings" sections. Only include if genuinely useful — skip if nothing notable.]

### Ready to Work
[If $ARGUMENTS included a goal for today's session, confirm it here and say you're ready to start. If no goal was given, ask the user what they'd like to tackle.]

---

**Keep the brief tight.** A good session brief fits on one screen. If you need to surface more detail, offer to go deeper on a specific area.
