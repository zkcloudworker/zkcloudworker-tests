import { describe, expect, it } from "@jest/globals";
import {
  Devnet,
  sleep,
  initBlockchain,
  accountBalance,
  fee,
} from "zkcloudworker";
import { PrivateKey, PublicKey, Mina, AccountUpdate } from "o1js";
import { faucetDevnet } from "../src/faucet";

const addressesToTopup = [
  "B62qo69VLUPMXEC6AFWRgjdTEGsA3xKvqeU5CgYm3jAbBJL7dTvaQkv",
  "B62qjpZBVp8NDku1nQLMmxVGe4ucYdXQ1DCJYW4ikgCjyaFTUGsbb6w",
  "B62qobAYQBkpC8wVnRzydrtCgWdkYTqsfXTcaLdGq1imtqtKgAHN29K",
  "B62qiq7iTTP7Z2KEpQ9eF9UVGLiEKAjBpz1yxyd2MwMrxVwpAMLta2h",
];

const tanks: {
  privateKey: string;
  publicKey: string;
}[] = [];

describe("Balance", () => {
  it(`should get the funds`, async () => {
    for (let i = 0; i < addressesToTopup.length; i++) {
      try {
        const privateKey = PrivateKey.random();
        const publicKey = privateKey.toPublicKey();
        const response = await faucetDevnet({
          publicKey: publicKey.toBase58(),
          explorerUrl: Devnet.explorerAccountUrl ?? "",
          network: "devnet",
          faucetUrl: "https://faucet.minaprotocol.com/api/v1/faucet",
        });

        console.log(
          `${i}: ${privateKey.toBase58()} ${publicKey.toBase58()}`,
          response?.result?.status
        );
        tanks.push({
          privateKey: privateKey.toBase58(),
          publicKey: publicKey.toBase58(),
        });
      } catch (e) {
        console.log(e);
        await sleep(120000);
      }
      await sleep(30000);
    }
  });
  it(`should get the balances`, async () => {
    await initBlockchain("devnet");
    const txFee = await fee();
    for (let i = 0; i < tanks.length; i++) {
      const publicKey = PublicKey.fromBase58(tanks[i].publicKey);
      let balance = await accountBalance(publicKey);
      console.log(`${i}: ${publicKey.toBase58()}: ${balance}`);
      while (balance.toBigInt() < 100_000_000_000n) {
        await sleep(10000);
        balance = await accountBalance(publicKey);
      }
      console.log(`${i}: ${publicKey.toBase58()}: ${balance}`);
      const sender = publicKey;
      const receiver = PublicKey.fromBase58(addressesToTopup[i]);
      const deployer = PrivateKey.fromBase58(tanks[i].privateKey);
      const transaction = await Mina.transaction(
        { sender: publicKey, fee: txFee },
        async () => {
          const senderUpdate = AccountUpdate.createSigned(sender);
          senderUpdate.send({
            to: receiver,
            amount: balance.sub(txFee),
          });
        }
      );
      const txSent = await transaction.sign([deployer]).send();
      console.log(`Sent tx${i}: ${receiver.toBase58()}: ${txSent.hash}`);
    }
  });
});
