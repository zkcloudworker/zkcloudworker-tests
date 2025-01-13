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
  PublicKey,
} from "o1js";
import {
  accountBalanceMina,
  initBlockchain,
  TinyContract,
  FungibleTokenAdmin,
} from "zkcloudworker";
import { GASTANKS } from "../env.json";
import { Storage } from "@minatokens/storage";

export class TestContract2 extends SmartContract {
  @state(Field) value = State<Field>();

  @method async setValue(value: Field, key: PublicKey, storage: Storage) {
    const timestamp = this.network.timestamp.getAndRequireEquals();
    this.value.set(value);
  }

  @method async setValue2(value2: Field, storage2: Storage) {
    const timestamp = this.network.timestamp.getAndRequireEquals();
    this.value.set(value2);
  }
}

let privateKey = PrivateKey.fromBase58(GASTANKS[0].privateKey);
let sender = privateKey.toPublicKey();
const zkAppKey = PrivateKey.randomKeypair();
const zkApp = new TinyContract(zkAppKey.publicKey);
let verificationKey: VerificationKey;

function getArgName(arg: string) {
  // Extract the class/type name from the argument string
  const match = arg.match(/class _(\w+)|function (\w+)/);
  if (!match) throw new Error("No match found");

  // Get the matched name, either from class or function group
  const name = match[1] || match[2];

  // Map known types to their return values
  switch (name) {
    case "PublicKey":
      return "PublicKey";
    case "Storage":
      return "Storage";
    case "Constructor":
      return "Field";
    default:
      return "";
  }
}

describe("Proving speed", () => {
  it("should compile", async () => {
    const blockchain = await initBlockchain("devnet");
    //privateKey = blockchain.keys[0].key;
    //sender = privateKey.toPublicKey();
    console.log("Sender balance", await accountBalanceMina(sender));
    console.log("Compiling...");
    //verificationKey = (await TinyContract.compile()).verificationKey;
    const methods = await TestContract2.analyzeMethods({
      printSummary: false,
    });
    const app = new TestContract2(zkAppKey.publicKey);
    console.log(TestContract2 as any);
    for (const method of TestContract2._methods!) {
      console.log(method.methodName, ":");
      console.log(method as any);
      for (let i = 2; i < method.args.length; i++) {
        console.log(getArgName((method.args[i] as any).toString()));
      }
    }
    // console.log(
    //   "TestContract2:",
    //   (TestContract2._methods as any)[0].args[4].toString()
    // );
  });

  it.skip("should deploy and prove", async () => {
    console.log("Contract", zkAppKey.publicKey.toBase58());
    console.log("Deploying...");
    await fetchAccount({ publicKey: sender });
    let tx = await Mina.transaction(
      { sender, fee: "100000000", memo: "deploy TinyContract" },
      async () => {
        AccountUpdate.fundNewAccount(sender);
        await zkApp.deploy();
      }
    );
    await tx.prove();
    let sendTx = await (
      await tx.sign([privateKey, zkAppKey.privateKey]).send()
    ).wait();
    console.log("Deployed", sendTx.hash);
  });
});
