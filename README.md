# Slack Icebreaker Agent

Sends a weekly icebreaker question to a Slack channel every Monday at 12:15 PM PT, 15 minutes before the 12:30 team meeting.

Uses Claude to generate a unique question each week from a rotating set of categories (travel, food, dream scenarios, nostalgia, etc.) so questions don't repeat.

## How it works

1. GitHub Actions cron triggers every Monday at 12:15 PM Pacific
2. Claude generates a fun, workplace-appropriate icebreaker question
3. The question is posted to the configured Slack channel

## Setup

### Prerequisites

- A [Slack App](https://api.slack.com/apps) with `chat:write` scope
- An [Anthropic API key](https://console.anthropic.com/)
- The Slack bot invited to your target channel

### GitHub Actions Secrets

Add these three secrets in **Settings > Secrets and variables > Actions**:

| Secret | Description |
|--------|-------------|
| `ANTHROPIC_API_KEY` | API key from Anthropic console |
| `SLACK_BOT_TOKEN` | Bot User OAuth Token (`xoxb-...`) from Slack App settings |
| `SLACK_CHANNEL_ID` | Target channel ID (right-click channel > View channel details > scroll to bottom) |

### Manual trigger

You can trigger a run anytime from the **Actions** tab > **Monday Icebreaker** > **Run workflow**.

Or via CLI:

```bash
gh workflow run icebreaker.yml
```

## Local development

```bash
cp .env.example .env
# Fill in your credentials in .env
npm install
npm start
```
