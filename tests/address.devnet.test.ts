import { describe, expect, it } from "@jest/globals";
import { getBalanceFromGraphQL, Zeko, Devnet, sleep } from "zkcloudworker";
import { PrivateKey } from "o1js";
import { faucetDevnet } from "../src/faucet";
import fs from "fs";
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
    let json: { privateKey: string; publicKey: string }[] = [];
    for (let i = 0; i < 10; i++) {
      try {
        const privateKey = PrivateKey.random();
        const publicKey = privateKey.toPublicKey();
        // const response = await faucetDevnet({
        //   publicKey: publicKey.toBase58(),
        //   explorerUrl: Devnet.explorerAccountUrl ?? "",
        //   network: "devnet",
        //   faucetUrl: "https://faucet.minaprotocol.com/api/v1/faucet",
        // });

        // console.log(
        //   `${i}: ${privateKey.toBase58()} ${publicKey.toBase58()}`,
        //   response?.result?.status
        // );
        json.push({
          privateKey: privateKey.toBase58(),
          publicKey: publicKey.toBase58(),
        });
      } catch (e) {
        console.log(e);
        // await sleep(120000);
      }
      // await sleep(30000);
    }
    fs.writeFileSync("addresses.json", JSON.stringify(json, null, 2));
  });
});
