import Anthropic from "@anthropic-ai/sdk";
import { WebClient } from "@slack/web-api";

const anthropic = new Anthropic();
const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

const ICEBREAKER_PROMPT = `Generate a single fun, inclusive icebreaker question for a team meeting.

Requirements:
- Should be appropriate for a professional workplace
- Easy for everyone to answer (no specialized knowledge needed)
- Encourages sharing without being too personal
- Takes about 30 seconds to answer
- Varied topics: could be about preferences, hypotheticals, experiences, or light opinions

Examples of good icebreakers:
- "What's a skill you'd love to learn if you had unlimited time?"
- "If you could have dinner with any fictional character, who would it be?"
- "What's the best meal you've had recently?"

Respond with ONLY the question, no explanation or preamble.`;

async function generateIcebreaker() {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 150,
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
    text: `🧊 *Icebreaker Time!*\n\nBefore our 12:30 meeting, here's today's question:\n\n> ${icebreaker}\n\nShare your answer in the thread below! 👇`,
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
