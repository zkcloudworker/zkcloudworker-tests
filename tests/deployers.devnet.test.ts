import { describe, expect, it } from "@jest/globals";
import { GASTANKS } from "../env.json";
import { getBalanceFromGraphQL, Zeko, Devnet, sleep } from "zkcloudworker";
import { PrivateKey } from "o1js";
import { faucetDevnet } from "../src/faucet";

/*
const GASTANKS = GASTANKS_NFT.map((x) => {
  return {
    privateKey: x,
    publicKey: PrivateKey.fromBase58(x).toPublicKey().toBase58(),
  };
});
*/

describe("Balance", () => {
  it(`should get the balances`, async () => {
    for (let i = 1; i < 15; i++) {
      const privateKey = GASTANKS[i].privateKey;
      const publicKey = GASTANKS[i].publicKey;
      expect(PrivateKey.fromBase58(privateKey).toPublicKey().toBase58()).toBe(
        publicKey
      );

      const balance = await getBalanceFromGraphQL({
        publicKey,
        mina: ["https://api.minascan.io/node/devnet/v1/graphql"],
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
        mina: Devnet.mina,
      });
      let topup = "";
      if (balance === 0n) {
        const response = await faucetDevnet({
          publicKey,
          explorerUrl: Devnet.explorerAccountUrl ?? "",
          network: "devnet",
          faucetUrl: "https://faucet.minaprotocol.com/api/v1/faucet",
        });
        await sleep(1000 * 60 * 5);
        balance = await getBalanceFromGraphQL({
          publicKey,
          mina: ["https://api.minascan.io/node/devnet/v1/graphql"],
        });
        topup = "topup";
      }
      console.log(`${i}: ${topup} ${publicKey} ${balance / 1_000_000_000n}`);
    }
  });
});
