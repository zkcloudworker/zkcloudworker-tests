import { describe, expect, it } from "@jest/globals";
import Parser from "rss-parser";
import { sendMessageToDiscord } from "../src/discord";
import { DISCORD_TOKEN } from "../env.json";

let feed: any;
let item: any;

describe("RSS", () => {
  it.skip(`should parse Netlify RSS`, async () => {
    console.log("Parsing RSS...");

    const parser = new Parser({});
    feed = await parser.parseURL("https://www.netlifystatus.com/history.rss");
    console.log(feed.title);
    item = feed.items[0];
    console.log(item);
    const time = new Date(item.isoDate).getTime();
    console.log(time);
  });
  it.skip(`should parse Pinata RSS`, async () => {
    console.log("Parsing RSS...");

    const parser = new Parser({});
    feed = await parser.parseURL("https://pinata.statuspage.io/history.rss");
    console.log(feed.title);
    item = feed.items[0];
    console.log(item);
    const time = new Date(item.pubDate).getTime();
    console.log(time);
  });
  it(`should parse Infura RSS`, async () => {
    console.log("Parsing RSS...");

    const parser = new Parser({});
    feed = await parser.parseURL("https://status.infura.io/history.rss");
    console.log(feed.title);
    item = feed.items[0];
    console.log(item);
    const time = new Date(item.pubDate).getTime();
    console.log(time);
  });

  it(`should send the message`, async () => {
    console.log("Sending message to Discord...");
    /*
    item:
     {
    title: 'Delay in purging stale content across our HP Edge network',
    link: 'https://www.netlifystatus.com/incidents/wtxkthkr4lvz',
    pubDate: 'Thu, 15 Aug 2024 17:47:51 +0000',
    content: '\n' +
      "<p><small>Aug <var data-var='date'>15</var>, <var data-var='time'>17:47</var> UTC</small><br><strong>Resolved</strong> - The issue has been resolved. Purging of expired assets has returned to expected levels and is no longer experiencing delays.</p><p><small>Aug <var data-var='date'>15</var>, <var data-var='time'>17:34</var> UTC</small><br><strong>Monitoring</strong> - Our engineers were able to identify the issue and have remedied the situation. Cache purging is returning to expected levels as we continue to monitor it.</p><p><small>Aug <var data-var='date'>15</var>, <var data-var='time'>17:18</var> UTC</small><br><strong>Investigating</strong> - Around 17:00 UTC, we began observing a delay in purging stale cache. As a result, some customers may see stale content unexpectedly. We are working to identify and resolve the issue.</p>      ",
    contentSnippet: 'Aug 15, 17:47 UTC\n' +
      'Resolved - The issue has been resolved. Purging of expired assets has returned to expected levels and is no longer experiencing delays.\n' +
      'Aug 15, 17:34 UTC\n' +
      'Monitoring - Our engineers were able to identify the issue and have remedied the situation. Cache purging is returning to expected levels as we continue to monitor it.\n' +
      'Aug 15, 17:18 UTC\n' +
      'Investigating - Around 17:00 UTC, we began observing a delay in purging stale cache. As a result, some customers may see stale content unexpectedly. We are working to identify and resolve the issue.',
    guid: 'https://www.netlifystatus.com/incidents/wtxkthkr4lvz',
    isoDate: '2024-08-15T17:47:51.000Z'
  }


    */
    const message = `**[${item.title}](${item.link})**
<t:${Math.floor(new Date(item.isoDate).getTime() / 1000)}:F> 

${item.contentSnippet}`;
    await sendMessageToDiscord({
      message,
      botToken: DISCORD_TOKEN,
      channelId: "1274833275092734117",
    });
  });
});
