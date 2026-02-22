# Slack Icebreaker Agent — Developer Guide

## Shared Guidelines

**Read this alongside the shared master reference:**
[`dev-docs/CLAUDE.md`](https://github.com/grasshopperkids/dev-docs/blob/main/CLAUDE.md) — GHK dev standards and team info. Everything below is specific to this repo.

---

## What This Is

A GitHub Actions bot that posts a weekly icebreaker question to a Slack channel every Monday before the 12:30 PM PT team meeting. Claude generates a unique question each week from rotating categories (travel, food, dream scenarios, nostalgia, etc.) so questions don't repeat.

**Deployment:** Runs via GitHub Actions — no server, no Vercel URL.
**Repo:** github.com/grasshopperkids/slack-icebreaker-agent

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Runtime | Node.js |
| Trigger | GitHub Actions cron (Mondays 19:00 UTC ≈ noon PT) |
| AI | Claude API (question generation) |
| Messaging | Slack Web API (`chat:write`) |

## Commands

```bash
npm install    # Install dependencies
npm start      # Run locally (requires .env with credentials)
```

To trigger manually without waiting for Monday:
```bash
gh workflow run icebreaker.yml
```

---

## Environment Variables

Stored as **GitHub Actions Secrets** (not Vercel — this has no deployment):
Settings → Secrets and variables → Actions

| Secret | Purpose |
|--------|---------|
| `ANTHROPIC_API_KEY` | Claude API |
| `SLACK_BOT_TOKEN` | Slack bot token (`xoxb-...`) |
| `SLACK_CHANNEL_ID` | Target channel ID |

For local development, copy `.env.example` to `.env` and fill in credentials.

---

## How It Works

1. GitHub Actions cron fires every Monday at 19:00 UTC
2. Script calls Claude to generate a fresh icebreaker question
3. Question is posted to the configured Slack channel via Slack API

The workflow file is at `.github/workflows/icebreaker.yml`.
