import { describe, expect, it } from "@jest/globals";

import {
  SmartContract,
  method,
  AccountUpdate,
  UInt64,
  state,
  State,
  Provable,
  Mina,
} from "o1js";
import { blockchain, initBlockchain } from "zkcloudworker";
const { TestPublicKey } = Mina;
type TestPublicKey = Mina.TestPublicKey;
const zkKey = TestPublicKey.random();
import { TEST_ACCOUNTS } from "../env.json";
const chain: blockchain = "devnet" as blockchain;
const INCREMENT = UInt64.from(1);
let sender: TestPublicKey;

class BalanceContract extends SmartContract {
  @state(UInt64) record = State<UInt64>(UInt64.zero);

  @method
  public async topup() {
    const balance = this.account.balance.getAndRequireEquals();
    const record = this.record.getAndRequireEquals();
    Provable.log("balance", balance);
    Provable.log("record", record);
    balance.assertEquals(record);
    const sender = this.sender.getUnconstrained();
    const senderUpdate = AccountUpdate.createSigned(sender);
    senderUpdate.balance.subInPlace(INCREMENT);
    this.balance.addInPlace(INCREMENT);
    this.record.set(record.add(INCREMENT));
  }
}

const balanceContract = new BalanceContract(zkKey);

describe("balance instability check", () => {
  it(`should compile`, async () => {
    const { keys } = await initBlockchain(chain);
    sender =
      chain === "local"
        ? keys[0]
        : TestPublicKey.fromBase58(TEST_ACCOUNTS[0].privateKey);

    const vk = (await BalanceContract.compile()).verificationKey;
    console.log("vk", vk.hash.toJSON());
  });
  it(`should deploy`, async () => {
    console.log("sender", sender.toJSON());
    console.log("contract", zkKey.toBase58());
    const tx = await Mina.transaction(
      { sender, fee: 100_000_000, memo: "balance contract deploy" },
      async () => {
        AccountUpdate.fundNewAccount(sender);
        await balanceContract.deploy({});
      }
    );

    tx.sign([sender.key, zkKey.key]);
    const txSent = await tx.send();

    console.log("hash:", txSent.hash, "status:", txSent.status);
    expect(txSent.status).toBe("pending");
    const txIncluded = await txSent.safeWait();
    console.log("status:", txIncluded.status);
    expect(txIncluded.status).toBe("included");
  });

  for (let i = 0; i < 3; i++) {
    it(`should run ${i}`, async () => {
      const tx = await Mina.transaction(
        { sender, fee: 100_000_000, memo: `step ${i + 1}` },
        async () => {
          await balanceContract.topup();
        }
      );
      await tx.prove();
      tx.sign([sender.key]);
      const txSent = await tx.send();
      console.log("hash:", txSent.hash, "status:", txSent.status);
      expect(txSent.status).toBe("pending");
      const txIncluded = await txSent.safeWait();
      console.log("status:", txIncluded.status);
      expect(txIncluded.status).toBe("included");
    });
  }
});
