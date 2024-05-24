import { describe, expect, it } from "@jest/globals";
import { initBlockchain } from "zkcloudworker";
import {
  PublicKey,
  Mina,
  TokenId,
  PrivateKey,
  DynamicProof,
  Proof,
  VerificationKey,
  Void,
  ZkProgram,
  Field,
  SmartContract,
  Struct,
  method,
  AccountUpdate,
  fetchAccount,
  state,
  State,
  JsonProof,
} from "o1js";
import fs from "fs/promises";
import {
  SideloadedSmartContract,
  SampleSideloadedProof,
} from "../src/sideloading";

describe("Side loading", () => {
  it("should compile with SmartContracts", async () => {
    await SideloadedSmartContract.compile();
    console.log("SideloadedSmartContract compiled");
  });

  it("should deploy", async () => {
    const { keys } = await initBlockchain("local", 1);
    const sender = keys[0];
    const appKey = PrivateKey.randomKeypair();
    const zkApp = new SideloadedSmartContract(appKey.publicKey);
    await fetchAccount({ publicKey: sender });
    const tx = await Mina.transaction(
      { sender, fee: "100000000", memo: "sideloading deploy" },
      async () => {
        AccountUpdate.fundNewAccount(sender);
        await zkApp.deploy();
      }
    );
    await (await tx.sign([sender.key, appKey.privateKey]).send()).wait();
    console.log("SideloadedSmartContract deployed");

    const { verificationKey, proof } = JSON.parse(
      await fs.readFile("./json/vk.json", "utf-8")
    );

    const vk = {
      hash: Field.fromJSON(verificationKey.hash),
      data: verificationKey.data,
    } as VerificationKey;

    const loadedProof: SampleSideloadedProof =
      (await SampleSideloadedProof.fromJSON(
        proof as JsonProof
      )) as SampleSideloadedProof;

    await fetchAccount({ publicKey: sender });
    await fetchAccount({ publicKey: appKey.publicKey });
    const tx2 = await Mina.transaction(
      { sender, fee: "100000000", memo: "sideloading send" },
      async () => {
        await zkApp.setValue(Field(1), loadedProof, vk);
      }
    );
    await tx2.prove();
    await (await tx2.sign([sender.key]).send()).wait();
    await fetchAccount({ publicKey: appKey.publicKey });
    const value = zkApp.value.get();
    console.log("SideloadedSmartContract value:", value.toJSON());
    expect(value.toJSON()).toEqual(Field(1).toJSON());
    console.log("SideloadedSmartContract value set");
  });
});
