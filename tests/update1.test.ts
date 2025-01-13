import { describe, expect, it } from "@jest/globals";

import {
  SmartContract,
  method,
  AccountUpdate,
  state,
  State,
  Mina,
  Field,
  PublicKey,
  Bool,
  fetchAccount,
} from "o1js";

const { TestPublicKey } = Mina;
type TestPublicKey = Mina.TestPublicKey;
const zkKey1 = TestPublicKey.random();
const zkKey2 = TestPublicKey.random();

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

describe("actionState error", () => {
  it(`should compile`, async () => {
    const Local = await Mina.LocalBlockchain();
    Mina.setActiveInstance(Local);
    sender = Local.testAccounts[0];
    await MyContract1.compile();
    await MyContract2.compile();
  });
  it(`should deploy`, async () => {
    await fetchAccount({ publicKey: sender });
    const tx = await Mina.transaction(
      { sender, fee: 100_000_000, memo: "deploy" },
      async () => {
        AccountUpdate.fundNewAccount(sender, 2);
        await contract1.deploy({});
        await contract2.deploy({});
      }
    );
    await tx.sign([sender.key, zkKey1.key, zkKey2.key]).send();
  });

  it(`should update`, async () => {
    await fetchAccount({ publicKey: sender });
    await fetchAccount({ publicKey: zkKey1 });
    await fetchAccount({ publicKey: zkKey2 });

    const tx = await Mina.transaction(
      { sender, fee: 100_000_000, memo: `update` },
      async () => {
        await contract2.setValue(Field(1), zkKey1);
      }
    );
    await tx.prove();
    await tx.sign([sender.key]).send();
  });
});
