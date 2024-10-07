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
import {
  accountBalanceMina,
  initBlockchain,
  TinyContract,
} from "zkcloudworker";
import { GASTANKS } from "../env.json";

let privateKey = PrivateKey.fromBase58(GASTANKS[0].privateKey);
let sender = privateKey.toPublicKey();
const zkAppKey = PrivateKey.randomKeypair();
const zkApp = new TinyContract(zkAppKey.publicKey);
let verificationKey: VerificationKey;

describe("Proving speed", () => {
  it("should compile", async () => {
    const blockchain = await initBlockchain("devnet");
    //privateKey = blockchain.keys[0].key;
    //sender = privateKey.toPublicKey();
    console.log("Sender balance", await accountBalanceMina(sender));
    console.log("Compiling...");
    verificationKey = (await TinyContract.compile()).verificationKey;
  });

  it("should deploy and prove", async () => {
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
