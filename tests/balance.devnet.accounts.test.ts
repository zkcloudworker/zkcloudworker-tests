import { describe, expect, it } from "@jest/globals";
import { accountBalanceMina, initBlockchain } from "zkcloudworker";
import { PublicKey, Mina, TokenId, PrivateKey } from "o1js";
import { TEST_ACCOUNTS } from "../env.json";

describe("Balances", () => {
  it(`should get the balances`, async () => {
    await initBlockchain("devnet");
    let ok = true;
    for (let i = 0; i < TEST_ACCOUNTS.length; i++) {
      const publicKey = PublicKey.fromBase58(TEST_ACCOUNTS[i].publicKey);
      const balance = await accountBalanceMina(publicKey);
      console.log(`${i}: ${publicKey.toBase58()}: ${balance}`);
      if (balance < 100) {
        ok = false;
      }
    }
    if (!ok) {
      console.log("some accounts have low balance");
    }
    expect(ok).toBe(true);
  });
});
