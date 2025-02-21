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
  FlexibleProvablePure,
  Signature,
  PublicKey,
  Struct,
} from "o1js";
import {
  blockchain,
  initBlockchain,
  sendTx,
  fetchMinaAccount,
  accountBalanceMina,
  sleep,
  Memory,
} from "zkcloudworker";
const { TestPublicKey } = Mina;
type TestPublicKey = Mina.TestPublicKey;
const zkKey = TestPublicKey.random();
import { TEST_ACCOUNTS } from "../env.json";
// https://minascan.io/devnet/tx/5Jts1zHxi1wfFpc2jf6HicVzwzg2bC6SKV9iCLNAoKHQWzP3vYgc?type=zk-tx
const chain: blockchain = "devnet" as blockchain;
const INCREMENT = UInt64.from(1);
let sender: TestPublicKey;

class SignatureEvent extends Struct({
  amount: UInt64,
  signature: Signature,
}) {}

class BalanceContract extends SmartContract {
  @state(UInt64) record = State<UInt64>(UInt64.zero);

  events = {
    "topup-event": SignatureEvent,
  };

  @method
  public async topup(amount: UInt64, signature: Signature) {
    const balance = this.account.balance.getAndRequireEquals();
    const record = this.record.getAndRequireEquals();
    Provable.log("balance", balance);
    Provable.log("record", record);
    balance.assertEquals(record);
    const sender = this.sender.getUnconstrained();
    const senderUpdate = AccountUpdate.createSigned(sender);
    signature.verify(sender, [amount.value]).assertTrue();
    senderUpdate.balance.subInPlace(amount);
    this.balance.addInPlace(amount);
    this.record.set(record.add(amount));
    this.emitEvent("topup-event", {
      amount,
      signature,
    });
  }
}

const balanceContract = new BalanceContract(zkKey);

describe("balance instability check", () => {
  it(`should compile`, async () => {
    console.log("Signature.sizeInFields", Signature.sizeInFields());
    const { keys } = await initBlockchain(chain);
    sender =
      chain === "local"
        ? keys[0]
        : TestPublicKey.fromBase58(TEST_ACCOUNTS[0].privateKey);

    const vk = (await BalanceContract.compile()).verificationKey;
    console.log("vk", vk.hash.toJSON());
  });
  it(`should deploy`, async () => {
    await fetchMinaAccount({ publicKey: sender, force: true });
    console.log("sender", sender.toJSON());
    console.log("sender balance", await accountBalanceMina(sender));
    console.log("contract", zkKey.toBase58());
    const tx = await Mina.transaction(
      { sender, fee: 100_000_000, memo: "balance contract deploy" },
      async () => {
        AccountUpdate.fundNewAccount(sender);
        await balanceContract.deploy({});
      }
    );

    expect(
      (
        await sendTx({
          tx: tx.sign([sender.key, zkKey.key]),
          chain,
          description: "balance contract deploy",
          verbose: true,
          wait: true,
        })
      )?.status
    ).toBe("included");
  });

  for (let i = 0; i < 1000; i++) {
    it(`should run ${i}`, async () => {
      const timeStart = Date.now();
      await fetchMinaAccount({ publicKey: sender, force: true });
      await fetchMinaAccount({ publicKey: zkKey, force: true });
      let balance = Mina.getAccount(zkKey).balance.toBigInt();
      let record = balanceContract.record.get().toBigInt();
      let attempt = 1;

      while (Number(balance) !== i || Number(record) !== i) {
        console.log(
          `\x1b[31mwaiting for balance ${i}: ${formatTime(
            Date.now() - timeStart
          )}\x1b[0m`
        );
        await sleep(10000 * attempt);
        attempt++;
        await fetchMinaAccount({ publicKey: sender, force: true });
        await fetchMinaAccount({ publicKey: zkKey, force: true });
        balance = Mina.getAccount(zkKey).balance.toBigInt();
        record = balanceContract.record.get().toBigInt();
      }
      console.log(`balance ${i}:`, Number(balance));
      console.log(`record ${i}:`, Number(record));
      expect(balance).toBe(record);
      expect(Number(balance)).toBe(i);
      Memory.info(`iteration ${i}`);
      const amount = UInt64.from(1);
      const signature = Signature.create(sender.key, [amount.value]);

      const tx = await Mina.transaction(
        { sender, fee: 100_000_000, memo: `step ${i + 1}` },
        async () => {
          await balanceContract.topup(amount, signature);
        }
      );
      await tx.prove();
      expect(
        (
          await sendTx({
            tx: tx.sign([sender.key]),
            chain,
            description: `step ${i + 1}`,
            verbose: true,
            wait: true,
            delay: 0,
            retry: 1000,
          })
        )?.status
      ).toBe("included");
    });
  }
});

function formatTime(time: number) {
  const ms = time % 1000;
  const minutes = Math.floor(time / 60000);
  const seconds = Math.floor((time % 60000) / 1000);
  return `${minutes === 0 ? "" : `${minutes} min `}${
    seconds === 0 ? "" : `${seconds} sec`
  }${seconds === 0 && minutes === 0 ? `${ms} ms` : ""}`;
}
