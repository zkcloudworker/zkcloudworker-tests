import { describe, expect, it } from "@jest/globals";
import TEST_ACCOUNTS from "../addresses.json";
import { TEST_ACCOUNTS as TEST_ACCOUNTS_MINA } from "../env.json";
import {
  getBalanceFromGraphQL,
  Zeko,
  Devnet,
  sleep,
  initBlockchain,
  accountBalanceMina,
} from "zkcloudworker";
import { PrivateKey, Mina, AccountUpdate, PublicKey, fetchAccount } from "o1js";
import { faucet } from "../src/faucet";

//const endpoint = "https://api.minascan.io/node/devnet/v1/graphql";
// "https://proxy.devnet.minaexplorer.com/graphql"; //

/*
const GASTANKS = GASTANKS_NFT.map((x) => {
  return {
    privateKey: x,
    publicKey: PrivateKey.fromBase58(x).toPublicKey().toBase58(),
  };
});
*/
const addresses = TEST_ACCOUNTS;
const deployer = PrivateKey.fromBase58(TEST_ACCOUNTS_MINA[0].privateKey);
const sender = deployer.toPublicKey();

describe("Balance", () => {
  it.skip(`should get the balances`, async () => {
    for (let i = 0; i < addresses.length; i++) {
      const privateKey = addresses[i].privateKey;
      const publicKey = addresses[i].publicKey;
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
  it(`should topup the balances with faucet`, async () => {
    for (let i = 0; i < addresses.length; i++) {
      const privateKey = addresses[i].privateKey;
      const publicKey = addresses[i].publicKey;
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
          await sleep(180_000);
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
  it.skip(`should topup the balances`, async () => {
    await initBlockchain("zeko");
    console.log("sender:", sender.toBase58());
    const account = await fetchAccount({ publicKey: sender });
    console.log(
      "Account balance:",
      account.account?.balance.toBigInt(),
      account
    );
    const balance = await accountBalanceMina(sender);
    console.log("Balance of sender:", balance);
    if (balance < 100_000_000_000) {
      return;
    }
    for (let i = 1; i < addresses.length; i++) {
      const privateKey = addresses[i].privateKey;
      const publicKey = addresses[i].publicKey;
      expect(PrivateKey.fromBase58(privateKey).toPublicKey().toBase58()).toBe(
        publicKey
      );
      const balance = await getBalanceFromGraphQL({
        publicKey,
        mina: Zeko.mina,
      });

      if (balance < 100_000_000_000) {
        await fetchAccount({ publicKey: sender });
        const transaction = await Mina.transaction(
          { sender, fee: "100000000", memo: "payment" },
          async () => {
            const senderUpdate = AccountUpdate.createSigned(sender);
            senderUpdate.balance.subInPlace(1_000_000_000);
            senderUpdate.send({
              to: PublicKey.fromBase58(publicKey),
              amount: 1000_000_000_000,
            });
          }
        );
        await transaction.sign([deployer]).send();
        await sleep(5_000);
        const balance = await getBalanceFromGraphQL({
          publicKey,
          mina: Zeko.mina,
        });
        console.log(`${i}: ${publicKey} ${balance / 1_000_000_000n}`);
      }
    }
  });
});
