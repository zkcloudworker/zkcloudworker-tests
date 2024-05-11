import { describe, expect, it } from "@jest/globals";
import { GASTANKS } from "../env.json";
import { getBalanceFromGraphQL, Zeko, Devnet, sleep } from "zkcloudworker";
import { PrivateKey } from "o1js";
import { faucet } from "../src/faucet";

const endpoint = "https://api.minascan.io/node/devnet/v1/graphql";
// "https://proxy.devnet.minaexplorer.com/graphql"; //

describe("Balance", () => {
  it.skip(`should get the balances`, async () => {
    for (let i = 1; i < 15; i++) {
      const privateKey = GASTANKS[i].privateKey;
      const publicKey = GASTANKS[i].publicKey;
      expect(PrivateKey.fromBase58(privateKey).toPublicKey().toBase58()).toBe(
        publicKey
      );

      const balance = await getBalanceFromGraphQL({
        publicKey,
        mina: Zeko.mina,
      });

      console.log(`${i}: ${publicKey} ${balance / 1_000_000_000n}`);
    }
  });
  it(`should topup the balances`, async () => {
    for (let i = 0; i < GASTANKS.length; i++) {
      const privateKey = GASTANKS[i].privateKey;
      const publicKey = GASTANKS[i].publicKey;
      expect(PrivateKey.fromBase58(privateKey).toPublicKey().toBase58()).toBe(
        publicKey
      );
      let balance = await getBalanceFromGraphQL({
        publicKey,
        mina: Zeko.mina,
      });
      let topup = "";
      if (balance === 0n) {
        const response = await faucet({
          publicKey,
          explorerUrl: Zeko.explorerAccountUrl ?? "",
          network: "devnet",
          faucetUrl: "https://zeko-faucet-a1ct.onrender.com/",
        });
        if (response.result !== "Successfully sent") {
          console.log("faucet error:", response);
          return;
        }
        await sleep(60_000);
        balance = await getBalanceFromGraphQL({
          publicKey,
          mina: Zeko.mina,
        });
        topup = "topup";
      }
      console.log(`${i}: ${topup} ${publicKey} ${balance / 1_000_000_000n}`);
    }
  });
});
