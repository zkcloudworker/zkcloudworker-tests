import { describe, expect, it } from "@jest/globals";

import {
  Mina,
  PrivateKey,
  Field,
  SmartContract,
  method,
  AccountUpdate,
  fetchAccount,
  state,
  State,
  VerificationKey,
  Bool,
} from "o1js";
import {
  accountBalanceMina,
  initBlockchain,
  sleep,
  TinyContract,
} from "zkcloudworker";
import sdk from "matrix-js-sdk";
const CONTENT_TOPIC = "test123";

const client = sdk.createClient({ baseUrl: "https://matrix.org" });

describe("Matrix", () => {
  it("should connect", async () => {
    console.log("Connecting to Matrix...");
    await client.startClient({ initialSyncLimit: 10 });

    await client.sendEvent("!room:matrix.org", sdk.EventType.RoomMessage, {
      msgtype: sdk.MsgType.Text,
      body: "Test message from zkcloudworker test",
    });
    await sleep(1000);
  });
});
