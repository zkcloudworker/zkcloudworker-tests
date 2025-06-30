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
  fetchAccount,
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
const chain: blockchain = "zeko" as blockchain;
const INCREMENT = UInt64.from(1);
let sender: TestPublicKey;
let applied = 0;

class BalanceContract extends SmartContract {
  @state(UInt64) record = State<UInt64>(UInt64.zero);

  @method
  public async topup() {
    const balance = this.account.balance.getAndRequireEquals();
    const record = this.record.getAndRequireEquals();
    balance.assertEquals(record.mul(4));
    const sender = this.sender.getUnconstrained();
    const senderUpdate = AccountUpdate.createSigned(sender);
    const senderUpdate2 = AccountUpdate.createSigned(sender);
    const senderUpdate3 = AccountUpdate.createSigned(sender);
    const senderUpdate4 = AccountUpdate.createSigned(sender);
    senderUpdate.balance.subInPlace(INCREMENT);
    senderUpdate2.balance.subInPlace(INCREMENT);
    senderUpdate3.balance.subInPlace(INCREMENT);
    senderUpdate4.balance.subInPlace(INCREMENT);
    this.balance.addInPlace(INCREMENT.mul(4));
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
        : TestPublicKey.fromBase58(TEST_ACCOUNTS[1].privateKey);

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
        const au = AccountUpdate.createSigned(sender);
        au.balance.subInPlace(UInt64.from(100_000_000));
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
    ).toBe("pending");
  });

  for (let i = 0; i < 100; i++) {
    it(`should run ${i}`, async () => {
      const timeStart = Date.now();
      await fetchMinaAccount({ publicKey: sender, force: true });
      await fetchMinaAccount({ publicKey: zkKey, force: true });
      let balance = Mina.getAccount(zkKey).balance.toBigInt();
      let record = balanceContract.record.get().toBigInt();
      let attempt = 1;
      console.log(`balance ${i}:`, Number(balance));
      console.log(`record ${i}:`, Number(record));

      while (Number(balance) !== i * 4 || Number(record) !== i) {
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
        console.log(`balance retry ${i}:`, Number(balance));
        console.log(`record retry ${i}:`, Number(record));
      }
      console.log(`balance ${i}:`, Number(balance));
      console.log(`record ${i}:`, Number(record));
      expect(balance).toBe(record * 4n);
      expect(Number(balance)).toBe(i * 4);
      Memory.info(`iteration ${i}`);

      const tx = await Mina.transaction(
        { sender, fee: 100_000_000, memo: `step ${i + 1}` },
        async () => {
          await balanceContract.topup();
        }
      );
      await tx.prove();
      tx.sign([sender.key]);
      console.time("sendTx");
      let txSent = await tx.safeSend();
      while (txSent.status !== "pending") {
        console.log(
          `\x1b[31mtxSent errors ${i}:\x1b[0m`,
          txSent.hash,
          txSent.status,
          txSent.errors
        );
        await sleep(1000);
        txSent = await tx.safeSend();
      }
      console.timeEnd("sendTx");
      console.log(`txSent ${i}:`, txSent.hash, txSent.status);
      console.time("applied");
      const startApplied = Date.now();
      await fetchAccount({ publicKey: zkKey });
      let recordSent = balanceContract.record.get().toBigInt();
      let attemptSent = 1;

      while (Number(recordSent) !== i + 1) {
        attemptSent++;
        await fetchAccount({ publicKey: zkKey });
        recordSent = balanceContract.record.get().toBigInt();
      }
      console.timeEnd("applied");
      const appliedTime = Date.now() - startApplied;
      console.log(`record ${i}:`, Number(recordSent));
      console.log(`attempt ${i}:`, attemptSent);
      console.log(`txSent ${i}:`, txSent.hash, txSent.status);
      if (appliedTime > applied) {
        applied = appliedTime;
      }
    });
  }
  console.log(`applied:`, applied);
});

function formatTime(time: number) {
  const ms = time % 1000;
  const minutes = Math.floor(time / 60000);
  const seconds = Math.floor((time % 60000) / 1000);
  return `${minutes === 0 ? "" : `${minutes} min `}${
    seconds === 0 ? "" : `${seconds} sec`
  }${seconds === 0 && minutes === 0 ? `${ms} ms` : ""}`;
}
