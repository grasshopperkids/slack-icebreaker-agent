import Anthropic from "@anthropic-ai/sdk";
import { WebClient } from "@slack/web-api";

const anthropic = new Anthropic();
const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

const ICEBREAKER_CATEGORIES = [
  "hypothetical superpowers or abilities",
  "food and cooking experiences",
  "travel and adventure",
  "childhood nostalgia",
  "entertainment and media",
  "random fun preferences",
  "dream scenarios",
  "unpopular opinions (light-hearted)",
  "bucket list items",
  "workplace and productivity quirks",
];

function pickRandomCategory() {
  return ICEBREAKER_CATEGORIES[
    Math.floor(Math.random() * ICEBREAKER_CATEGORIES.length)
  ];
}

const ICEBREAKER_PROMPT = `Generate a single fun, inclusive icebreaker question for a team meeting.

The question MUST be in the category of: ${pickRandomCategory()}

Requirements:
- Should be appropriate for a professional workplace
- Easy for everyone to answer (no specialized knowledge needed)
- Encourages sharing without being too personal
- Takes about 30 seconds to answer
- Be creative and surprising — avoid generic or overused questions
- Do NOT ask about "becoming an expert" or "learning a skill"

Respond with ONLY the question, no explanation or preamble.`;

async function generateIcebreaker() {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 150,
    temperature: 1,
    messages: [
      {
        role: "user",
        content: ICEBREAKER_PROMPT,
      },
    ],
  });

  return response.content[0].text.trim();
}

async function sendToSlack(icebreaker) {
  const channelId = process.env.SLACK_CHANNEL_ID;

  const result = await slack.chat.postMessage({
    channel: channelId,
    text: `🧊 *Icebreaker Time!*\n\nBefore our 12:30 meeting, here's today's question:\n\n> ${icebreaker}`,
    unfurl_links: false,
  });

  console.log(`Message sent to channel ${channelId}: ${result.ts}`);
  return result;
}

async function main() {
  try {
    console.log("Generating icebreaker question...");
    const icebreaker = await generateIcebreaker();
    console.log(`Generated: ${icebreaker}`);

    console.log("Sending to Slack...");
    await sendToSlack(icebreaker);
    console.log("Done!");
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main();
