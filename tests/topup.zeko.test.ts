import { describe, expect, it } from "@jest/globals";
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
const addresses = [
  "B62qndL8GwsyzVhHH8byHAui9NPUEwc6ZezuBUqZG3DqUDMxb1sGFZK",
  "B62qqjaPDq9bgBhNF2vHXWSknhyCP2YQhZTuTYv74YNZ2TuCXHdRzj9",
  "B62qmHJMk4aD1y5CLJfmJz7unMnJS25ko8ovNDzMpAs6CiNXHwkfEH6",
  "B62qqZnXi9UV4mz4nckzwP2yZ8h4hh5njxhsht3wX5w7fHY2kCbX4qe",
  "B62qqEALSaCCMqXBwLSbW7zBfDwWHTkxYEvF5xwD3cfhYCuDqrK9RCz",
  "B62qjFmTAzmLvPXRhUn8H83BoqtQxFtqHe8DkYBrj44TP6uKWWNfa1a",
  "B62qmoZqbXP3zRDFiVhczH6XXzHN2jhEq6dT9XqZ4trc1Y8oXyCAJgK",
  "B62qoQ7oMLTHHaW4g2DtRiKbAi41xGWRGhm59A9mof5pVZuUJhwLyUG",
  "B62qjrWFfTuosipqFV2wrWCPWHo2UHk3sdcJAsvNj61eowfrXBq4X8F",
  "B62qpiTxGZAc2j82g8DMW2oS4zou3fcDb8meENk9jmjhvrwHDJFbczv",
  "B62qqqcQrWD18jitNAiF9WnJf7bcrmUabXShYTubKktuGSLyidUhY4U",
  "B62qr1e4NfXx5MeHV6v8x4HL5moQn5TbYZjfQiC35c9hquAaEi4pM7w",
  "B62qitELE9GswXzdu6jqmZsWPMBGYEY5sUDt2dGpXZV11g4RcTbxfzR",
  "B62qrmSE3DB2gcCcHuu4LVKKBf4TPw1JFh6EFwwkZETKSep4TG1CL94",
  "B62qnqP6CB9AUp3ueZJe3yQbuBeyEchdD9bpFsJ32QQZLqxgWTphMem",
  "B62qiZ8NrM8S6YJSrJdheFtEH69vVpxdq794C469CdV6Vxcc2RMPRWC",
];
const deployer = PrivateKey.fromBase58(TEST_ACCOUNTS_MINA[0].privateKey);
const sender = deployer.toPublicKey();

describe("Balance", () => {
  it(`should get the balances`, async () => {
    for (let i = 0; i < addresses.length; i++) {
      //const privateKey = addresses[i].privateKey;
      const publicKey = addresses[i];

      const balance = await getBalanceFromGraphQL({
        publicKey,
        mina: Zeko.mina,
      });

      console.log(`${i}: ${publicKey} ${balance / 1_000_000_000n}`);
    }
  });
  it(`should topup the balances with faucet`, async () => {
    for (let i = 0; i < addresses.length; i++) {
      const publicKey = addresses[i];

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
        await sleep(5_000);
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
      const publicKey = addresses[i];

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
