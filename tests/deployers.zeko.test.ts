import { describe, expect, it } from "@jest/globals";
import { GASTANKS, GASTANKS_NFT } from "../env.json";
import { getBalanceFromGraphQL, Zeko, Devnet, sleep } from "zkcloudworker";
import { PrivateKey } from "o1js";
import { faucet } from "../src/faucet";

const endpoint = "https://api.minascan.io/node/devnet/v1/graphql";
// "https://proxy.devnet.minaexplorer.com/graphql"; //

/*
const GASTANKS = GASTANKS_NFT.map((x) => {
  return {
    privateKey: x,
    publicKey: PrivateKey.fromBase58(x).toPublicKey().toBase58(),
  };
});
*/

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
      if (GASTANKS_NFT.includes(privateKey)) console.log("NFT");
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
          await sleep(600_000);
        }
        await sleep(180_000);
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
