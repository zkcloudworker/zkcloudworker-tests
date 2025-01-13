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
  Field,
  PublicKey,
  Bool,
} from "o1js";
import {
  blockchain,
  initBlockchain,
  sendTx,
  fetchMinaAccount,
  accountBalanceMina,
  sleep,
} from "zkcloudworker";
const { TestPublicKey } = Mina;
type TestPublicKey = Mina.TestPublicKey;
const zkKey1 = TestPublicKey.random();
const zkKey2 = TestPublicKey.random();
import { TEST_ACCOUNTS } from "../env.json";

const chain: blockchain = "local" as blockchain;
let sender: TestPublicKey;

class MyContract1 extends SmartContract {
  @state(Field) value = State<Field>(Field(1));

  @method
  public async setValue(value: Field) {
    this.value.set(value);
  }
}

class MyContract2 extends SmartContract {
  @state(Field) value = State<Field>(Field(1));

  @method
  public async setValue(value: Field, address: PublicKey) {
    const update = AccountUpdate.create(address);
    update.body.preconditions.account.actionState = {
      isSome: Bool(false),
      value: Field(0),
    };
    this.value.set(value);
  }
}

const contract1 = new MyContract1(zkKey1);
const contract2 = new MyContract2(zkKey2);

describe("balance instability check", () => {
  it(`should compile`, async () => {
    const { keys } = await initBlockchain(chain);
    sender =
      chain === "local"
        ? keys[0]
        : TestPublicKey.fromBase58(TEST_ACCOUNTS[0].privateKey);

    await MyContract1.compile();
    await MyContract2.compile();
  });
  it(`should deploy`, async () => {
    await fetchMinaAccount({ publicKey: sender, force: true });
    console.log("sender", sender.toJSON());
    console.log("sender balance", await accountBalanceMina(sender));
    console.log("contract 1", zkKey1.toBase58());
    console.log("contract 2", zkKey2.toBase58());
    const tx = await Mina.transaction(
      { sender, fee: 100_000_000, memo: "balance contract deploy" },
      async () => {
        AccountUpdate.fundNewAccount(sender, 2);
        await contract1.deploy({});
        await contract2.deploy({});
      }
    );

    expect(
      (
        await sendTx({
          tx: tx.sign([sender.key, zkKey1.key, zkKey2.key]),
          chain,
          description: "contracts deploy",
          verbose: true,
          wait: true,
        })
      )?.status
    ).toBe("included");
  });

  it(`should update`, async () => {
    await fetchMinaAccount({ publicKey: sender, force: true });
    await fetchMinaAccount({ publicKey: zkKey1, force: true });
    await fetchMinaAccount({ publicKey: zkKey2, force: true });

    const tx = await Mina.transaction(
      { sender, fee: 100_000_000, memo: `update` },
      async () => {
        await contract2.setValue(Field(1), zkKey1);
      }
    );
    await tx.prove();
    expect(
      (
        await sendTx({
          tx: tx.sign([sender.key]),
          chain,
          description: `update`,
          verbose: true,
          wait: true,
        })
      )?.status
    ).toBe("included");
  });
});
