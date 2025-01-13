import { describe, expect, it } from "@jest/globals";
import { accountBalanceMina, initBlockchain } from "zkcloudworker";
import { PrivateKey, Mina, AccountUpdate, Field } from "o1js";

const AMOUNT = 2_000_000_000n;

describe("Event", () => {
  it(`should issue event`, async () => {
    const Local = await Mina.LocalBlockchain();
    Mina.setActiveInstance(Local);
    const deployer = Local.testAccounts[0].key;
    const sender = deployer.toPublicKey();
    const receiver = PrivateKey.random().toPublicKey();
    const transaction = await Mina.transaction(
      { sender, fee: "100000000", memo: "event" },
      async () => {
        const senderUpdate = AccountUpdate.createSigned(sender);
        senderUpdate.balance.subInPlace(1000000000);
        senderUpdate.send({ to: receiver, amount: AMOUNT });
      }
    );
    console.log(transaction.transaction.accountUpdates.length);
    await transaction.sign([deployer]).send();
    console.log("balance of the receiver:", await accountBalanceMina(receiver));
  });
});
