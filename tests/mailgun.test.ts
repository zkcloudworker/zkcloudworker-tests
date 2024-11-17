import { describe, expect, it } from "@jest/globals";
import formData from "form-data";

import {
  MAILGUN_API_ENDPOINT,
  MAILGUN_API_SEND_KEY,
  SLACK_WEBHOOK_URL,
} from "../env.json";

describe("Mailgun", () => {
  it.skip("should send email", async () => {
    await sendEmail();
  });
  it("should send Slack notification", async () => {
    await sendSlackNotification();
  });
});

const message = {
  blocks: [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "Weekly Report :bar_chart:",
        emoji: true,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Sales:* $10,000\n*New Customers:* 50\n*Website Visits:* 1,200",
      },
    },
    {
      type: "divider",
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "Here is the breakdown of the weekly performance:",
      },
    },
    {
      type: "image",
      image_url:
        "https://via.placeholder.com/400x200.png?text=Performance+Chart",
      alt_text: "Performance Chart",
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "View Details",
            emoji: true,
          },
          url: "https://yourdomain.com/weekly-report",
        },
      ],
    },
  ],
};

/*
{
  type: "section",
  text: {
    type: "mrkdwn",
    text: "View the full report here: <https://yourdomain.com/weekly-report|View Details>"
  }
}
*/

async function sendSlackNotification() {
  const response = await fetch(SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
  if (!response.ok) {
    console.error(`Failed to send Slack notification: ${response.statusText}`);
  } else {
    console.log(await response.text());
  }
}

async function sendEmail() {
  /*
curl -s --user 'api:API_KEY' \
 https://api.eu.mailgun.net/v3/minatokens.com/messages \
 -F from='MinaTokens API <api@minatokens.com>' \
 -F to=mk@dfst.io \
 -F subject='Hello' \
 -F text='Hello world'


curl -s --user 'api:YOUR_API_KEY' \
    https://api.mailgun.net/v3/YOUR_DOMAIN_NAME/messages \
    -F from="Excited User <postmaster@YOUR_DOMAIN_NAME>" \
    -F to="recipient@example.com" \
    -F subject="Mailgun is awesome" \
    -F template="My Great Template Name" \
    -F t:variables="{\"name\":\"Foo Bar\"}"

*/

  const form = new formData();
  form.append("from", "MinaTokens API <api@minatokens.com>");
  form.append("to", "support@minanft.io");
  form.append("subject", "Hello");
  form.append("text", "Hello world");
  form.append("html", "<h1>Hello world</h1>");

  const response = await fetch(MAILGUN_API_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(
        `api:${MAILGUN_API_SEND_KEY}`
      ).toString("base64")}`,
      ...form.getHeaders(),
    },
    body: Uint8Array.from(form.getBuffer()),
  });
  if (!response.ok) {
    console.error(`Failed to send email: ${response.statusText}`);
  } else {
    console.log(await response.json());
  }
}
