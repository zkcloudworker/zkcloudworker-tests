import { describe, expect, it } from "@jest/globals";
import { Mina, AccountUpdate, UInt64, PrivateKey } from "o1js";
import { accountBalanceMina, sendTx } from "zkcloudworker";

const NUMBER_OF_ACCOUNT_UPDATES = 1750; // it fails at 1755:
//  txSent {
//   status: 'rejected',
//   hash: '5Juxs5GY29SEocW1M7SKvw1oQVcEj2U7e3D3TQEA1bgdA5WPFAkC',
//   errors: [ 'Maximum call stack size exceeded' ]
// }

describe("No AccountUpdate limit", () => {
  it(`should send the tx with ${NUMBER_OF_ACCOUNT_UPDATES} AccountUpdates`, async () => {
    const Local = await Mina.LocalBlockchain({
      enforceTransactionLimits: false,
      proofsEnabled: true,
    });
    const sender = Local.testAccounts[0];
    Mina.setActiveInstance(Local);
    console.log("test accounts", Local.testAccounts.length);
    console.log("Number of AccountUpdates", NUMBER_OF_ACCOUNT_UPDATES);
    let txTopup = await Mina.transaction(
      {
        sender,
        fee: 100_000_000,
        memo: `topup`,
      },
      async () => {
        for (let index = 1; index < Local.testAccounts.length; index++) {
          const accountUpdate = AccountUpdate.create(Local.testAccounts[index]);
          accountUpdate.requireSignature();
          accountUpdate.send({
            to: sender,
            amount: UInt64.from(1000_000_000_000),
          });
        }
      }
    );
    txTopup.sign(Local.testAccounts.map((account) => account.key));
    await sendTx({
      tx: txTopup,
      wait: true,
      description: "topup",
      chain: "local",
    });
    console.log("sender balance", await accountBalanceMina(sender));
    console.time("build tx");
    let tx = await Mina.transaction(
      {
        sender,
        fee: 100_000_000,
        memo: `AccountUpdates: ${NUMBER_OF_ACCOUNT_UPDATES}`,
      },
      async () => {
        const accountUpdateSender = AccountUpdate.create(sender);
        accountUpdateSender.requireSignature();
        AccountUpdate.fundNewAccount(sender, NUMBER_OF_ACCOUNT_UPDATES);
        for (let index = 0; index < NUMBER_OF_ACCOUNT_UPDATES; index++) {
          const receiver = PrivateKey.random().toPublicKey();
          accountUpdateSender.send({ to: receiver, amount: UInt64.from(1) });
        }
      }
    );
    console.timeEnd("build tx");
    console.time("prove tx");
    await tx.prove();
    console.timeEnd("prove tx");
    // success with bypassTransactionLimits = true
    console.time("sign tx");
    tx.sign([sender.key]);
    console.timeEnd("sign tx");
    console.time("send tx");
    const txSent = await sendTx({
      tx,
      wait: true,
      description: "No limit",
      chain: "local",
    });
    console.timeEnd("send tx");
    console.log("txSent", {
      status: txSent?.status,
      hash: txSent?.hash,
      errors: txSent && "errors" in txSent ? txSent.errors : "",
    });

    console.log("sender balance", await accountBalanceMina(sender));
  });
});
