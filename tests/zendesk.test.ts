import { describe, expect, it } from "@jest/globals";
import { ZENDESK_API_KEY, TEST_EMAIL } from "../env.json";

describe("Zendesk", () => {
  it(`should create a ticket`, async () => {
    const auth = Buffer.from(`${TEST_EMAIL}/token:${ZENDESK_API_KEY}`).toString(
      "base64"
    );
    const response = await fetch(
      "https://minatokens.zendesk.com/api/v2/tickets.json",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticket: {
            subject: "Test ticket 3",
            comment: { body: "This is a test comment 3" },
            priority: "urgent",
            requester: {
              name: "Test User",
              email: "support@zkcloudworker.com",
            },
            tags: ["test1", "test2"],
            status: "open",
            type: "question",
          },
        }),
      }
    );
    console.log(
      response.ok
        ? await response.json()
        : { status: response.status, statusText: response.statusText }
    );
  });
});
