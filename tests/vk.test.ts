import { describe, expect, it } from "@jest/globals";
import {
  Mina,
  PrivateKey,
  Field,
  SmartContract,
  method,
  AccountUpdate,
  fetchAccount,
  state,
  State,
  VerificationKey,
  Bool,
} from "o1js";
import { accountBalanceMina, initBlockchain } from "zkcloudworker";
import { GASTANKS } from "../env.json";

export class MyContract1 extends SmartContract {
  @state(Field) value = State<Field>();

  @method async setValue(value: Field) {
    this.value.set(value);
  }
}

export class MyContract2 extends SmartContract {
  @state(Field) value1 = State<Field>();
  @state(Field) value2 = State<Field>();

  @method async setValue(value1: Field, value2: Field) {
    this.value1.set(value1);
    this.value2.set(value2);
  }
}

export class MyContract3 extends SmartContract {
  @state(Field) value1 = State<Field>();
  @state(Field) value2 = State<Field>();
  @state(Field) value3 = State<Field>();
  @method async setValue(value1: Field, value2: Field, value3: Field) {
    this.value1.set(value1);
    this.value2.set(value2);
    this.value3.set(value3);
  }
}

let privateKey = PrivateKey.fromBase58(GASTANKS[0].privateKey);
let sender = privateKey.toPublicKey();
const zkAppKey = PrivateKey.randomKeypair();
const zkApp1 = new MyContract1(zkAppKey.publicKey);
const zkApp2 = new MyContract2(zkAppKey.publicKey);
const zkApp3 = new MyContract3(zkAppKey.publicKey);
let verificationKey1: VerificationKey;
let verificationKey2: VerificationKey;
let verificationKey3: VerificationKey;

describe("Proving speed", () => {
  it("should compile", async () => {
    const blockchain = await initBlockchain("devnet");
    //privateKey = blockchain.keys[0].key;
    //sender = privateKey.toPublicKey();
    console.log("Sender balance", await accountBalanceMina(sender));
    console.log("Compiling MyContract1");
    verificationKey1 = (await MyContract1.compile()).verificationKey;
    console.log("Compiling MyContract2");
    verificationKey2 = (await MyContract2.compile()).verificationKey;
    console.log("Compiling MyContract3");
    verificationKey3 = (await MyContract3.compile()).verificationKey;
  });

  it("should deploy and prove", async () => {
    console.log("Contract", zkAppKey.publicKey.toBase58());
    console.log("Deploying MyContract1");
    await fetchAccount({ publicKey: sender });
    let tx = await Mina.transaction(
      { sender, fee: "100000000", memo: "deploy" },
      async () => {
        AccountUpdate.fundNewAccount(sender);
        await zkApp1.deploy();
      }
    );
    await tx.prove();
    let sendTx = await (
      await tx.sign([privateKey, zkAppKey.privateKey]).send()
    ).wait();
    console.log("Deployed MyContract1", sendTx.hash);

    tx = await Mina.transaction(
      { sender, fee: "100000000", memo: "set value 1" },
      async () => {
        await zkApp1.setValue(Field(1));
      }
    );
    await tx.prove();
    sendTx = await (await tx.sign([privateKey]).send()).wait();
    console.log("Set value 1", sendTx.hash);

    tx = await Mina.transaction(
      { sender, fee: "100000000", memo: "change vk 1" },
      async () => {
        const update = AccountUpdate.createSigned(zkAppKey.publicKey);
        update.update.verificationKey = {
          isSome: Bool(true),
          value: verificationKey2,
        };
      }
    );
    await tx.prove();
    sendTx = await (
      await tx.sign([privateKey, zkAppKey.privateKey]).send()
    ).wait();
    console.log("change vk 1", sendTx.hash);

    tx = await Mina.transaction(
      { sender, fee: "100000000", memo: "set value 2" },
      async () => {
        await zkApp2.setValue(Field(2), Field(3));
      }
    );
    await tx.prove();
    sendTx = await (await tx.sign([privateKey]).send()).wait();
    console.log("set value 2", sendTx.hash);

    tx = await Mina.transaction(
      { sender, fee: "100000000", memo: "change vk 2" },
      async () => {
        const update = AccountUpdate.createSigned(zkAppKey.publicKey);
        update.update.verificationKey = {
          isSome: Bool(true),
          value: verificationKey3,
        };
      }
    );
    await tx.prove();
    sendTx = await (
      await tx.sign([privateKey, zkAppKey.privateKey]).send()
    ).wait();
    console.log("change vk 2", sendTx.hash);

    tx = await Mina.transaction(
      { sender, fee: "100000000", memo: "set value 3" },
      async () => {
        await zkApp3.setValue(Field(4), Field(5), Field(6));
      }
    );
    await tx.prove();
    sendTx = await (await tx.sign([privateKey]).send()).wait();
    console.log("set value 3", sendTx.hash);
  });
});
