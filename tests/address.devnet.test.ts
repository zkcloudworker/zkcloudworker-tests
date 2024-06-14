import { describe, expect, it } from "@jest/globals";
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
  it(`should topup the balances`, async () => {
    for (let i = 0; i < 5; i++) {
      const privateKey = PrivateKey.random();
      const publicKey = privateKey.toPublicKey();
      const response = await faucetDevnet({
        publicKey: publicKey.toBase58(),
        explorerUrl: Devnet.explorerAccountUrl ?? "",
        network: "devnet",
        faucetUrl: "https://faucet.minaprotocol.com/api/v1/faucet",
      });

      console.log(`${i}: ${privateKey.toBase58()}`, response);
    }
  });
});
