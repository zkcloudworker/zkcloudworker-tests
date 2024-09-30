import { describe, expect, it } from "@jest/globals";
import {
  accountBalanceMina,
  Devnet,
  initBlockchain,
  sleep,
} from "zkcloudworker";
import { PrivateKey } from "o1js";
import { faucetDevnet } from "../src/faucet";

const keys: PrivateKey[] = [];
const COUNT = 20;

describe("Faucet", () => {
  it(`should generate the keys`, async () => {
    for (let i = 0; i < COUNT; i++) {
      keys.push(PrivateKey.random());
    }
    console.log(
      "private keys",
      keys.map((key) => key.toBase58())
    );
    console.log(
      "public keys",
      keys.map((key) => key.toPublicKey().toBase58())
    );
  });

  it.skip(`should topup the balances`, async () => {
    console.log("topping up the balances");
    for (let i = 0; i < COUNT; i++) {
      const privateKey = keys[i];
      const publicKey = privateKey.toPublicKey();
      const response = await faucetDevnet({
        publicKey: publicKey.toBase58(),
        explorerUrl: Devnet.explorerAccountUrl ?? "",
        network: "devnet",
        faucetUrl: "https://faucet.minaprotocol.com/api/v1/faucet",
      });

      console.log(`${i}: ${publicKey.toBase58()}`, response);
      await sleep(10000);
    }
  });

  it.skip(`should check the balances`, async () => {
    await initBlockchain("devnet");
    console.log("checking balances");
    for (let i = 0; i < COUNT; i++) {
      const publicKey = keys[i].toPublicKey();
      let balance = await accountBalanceMina(publicKey);
      while (balance === 0) {
        await sleep(10000);
        balance = await accountBalanceMina(publicKey);
      }
      console.log(`${i}: ${publicKey.toBase58()}`, balance);
    }
  });
});
