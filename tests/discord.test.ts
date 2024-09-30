import { describe, expect, it } from "@jest/globals";
import { sendMessageToDiscord, deleteMessageFromDiscord } from "../src/discord";
import { DISCORD_TOKEN } from "../env.json";

describe("Discord", () => {
  it.skip(`should send the message`, async () => {
    console.log("Sending message to Discord...");
    await sendMessageToDiscord({
      message: `## Hello, Discord!
**This is a test message from the tests/discord.test.ts file.**
- This message is sent to the Discord channel.
  - items
  - items

### End of message
      `,
      botToken: DISCORD_TOKEN,
      channelId: "1159477501752508456",
    });
  });
  it(`should delete the message`, async () => {
    console.log("Deleting message from Discord...");
    await deleteMessageFromDiscord({
      messageId: "1274834241733267467",
      botToken: DISCORD_TOKEN,
      channelId: "1274833275092734117",
    });
  });
});
