import { describe, expect, it } from "@jest/globals";
import axios from "axios";
import { fieldToBase56, makeString, initBlockchain } from "zkcloudworker";
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
} from "o1js";

const program1 = ZkProgram({
  name: "program1",
  publicInput: Field,
  methods: {
    foo: {
      privateInputs: [Field],
      async method(publicInput: Field, field: Field) {
        publicInput.assertEquals(field);
      },
    },
  },
});

class Program2Struct extends Struct({
  field1: Field,
  field2: Field,
}) {}

const program2 = ZkProgram({
  name: "program2",
  publicInput: Program2Struct,
  publicOutput: Field,
  methods: {
    foo: {
      privateInputs: [Field],
      async method(publicInput: Program2Struct, field: Field) {
        return publicInput.field1.add(publicInput.field2).add(field);
      },
    },
  },
});

class SampleSideloadedProof extends DynamicProof<Field, Void> {
  static publicInputType = Field;
  static publicOutputType = Void;
  static maxProofsVerified = 0 as const;
}

class SampleSideloadedProof2 extends DynamicProof<Program2Struct, Field> {
  static publicInputType = Program2Struct;
  static publicOutputType = Field;
  static maxProofsVerified = 0 as const;
}

const sideloadedProgram = ZkProgram({
  name: "sideloadedProgram",
  publicInput: Field,
  methods: {
    recurseOneSideloaded: {
      privateInputs: [SampleSideloadedProof, VerificationKey],
      async method(
        publicInput: Field,
        proof: SampleSideloadedProof,
        vk: VerificationKey
      ) {
        proof.verify(vk);

        proof.publicInput.assertEquals(publicInput, "PublicInput not matching");
      },
    },
    recurseTwoSideloaded: {
      privateInputs: [
        SampleSideloadedProof,
        VerificationKey,
        SampleSideloadedProof2,
        VerificationKey,
      ],
      async method(
        publicInput: Field,
        proof1: SampleSideloadedProof,
        vk1: VerificationKey,
        proof2: SampleSideloadedProof2,
        vk2: VerificationKey
      ) {
        proof1.verify(vk1);
        proof2.verify(vk2);

        proof1.publicInput
          .add(proof2.publicInput.field1.add(proof2.publicInput.field2))
          .assertEquals(publicInput, "PublicInput not matching");
      },
    },
  },
});

const sideloadedProgram2 = ZkProgram({
  name: "sideloadedProgram2",
  publicInput: Field,
  methods: {
    recurseTwoSideloaded: {
      privateInputs: [
        SampleSideloadedProof,
        VerificationKey,
        SampleSideloadedProof2,
        VerificationKey,
      ],
      async method(
        publicInput: Field,
        proof1: SampleSideloadedProof,
        vk1: VerificationKey,
        proof2: SampleSideloadedProof2,
        vk2: VerificationKey
      ) {
        proof1.verify(vk1);
        proof2.verify(vk2);

        proof1.publicInput
          .add(proof2.publicInput.field1.add(proof2.publicInput.field2))
          .add(1)
          .assertEquals(publicInput, "PublicInput not matching");
      },
    },
  },
});

export class SideloadedSmartContract extends SmartContract {
  @state(Field) value = State<Field>();

  @method async setValue(
    value: Field,
    proof: SampleSideloadedProof,
    vk: VerificationKey
  ) {
    proof.verify(vk);
    proof.publicInput.assertEquals(value);
    this.value.set(value);
  }
}
let program1Vk: VerificationKey;
let program2Vk: VerificationKey;
let program1Proof: Proof<Field, void>;
let program2Proof: Proof<Program2Struct, Field>;
let proof: SampleSideloadedProof;

describe("Side loading", () => {
  it("should compile with SmartContracts", async () => {
    await SideloadedSmartContract.compile();
    console.log("SideloadedSmartContract compiled");
  });

  it("should compile", async () => {
    program1Vk = (await program1.compile()).verificationKey;
    program2Vk = (await program2.compile()).verificationKey;

    // Generate sample proofs
    program1Proof = await program1.foo(Field(1), Field(1));
    program2Proof = await program2.foo(
      { field1: Field(1), field2: Field(2) },
      Field(3)
    );

    await sideloadedProgram.compile();
  });

  it("should convert proof to DynamicProof", async () => {
    proof = SampleSideloadedProof.fromProof(program1Proof);

    expect(proof instanceof DynamicProof).toBe(true);
    expect(proof instanceof SampleSideloadedProof).toBe(true);
    expect(proof.constructor.name).toStrictEqual(SampleSideloadedProof.name);
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

    await fetchAccount({ publicKey: sender });
    await fetchAccount({ publicKey: appKey.publicKey });
    const tx2 = await Mina.transaction(
      { sender, fee: "100000000", memo: "sideloading send" },
      async () => {
        await zkApp.setValue(Field(1), proof, program1Vk);
      }
    );
    await tx2.prove();
    await (await tx2.sign([sender.key]).send()).wait();
    await fetchAccount({ publicKey: appKey.publicKey });
    const value = zkApp.value.get();
    expect(value.toJSON()).toEqual(Field(1).toJSON());
    console.log("SideloadedSmartContract value set");
  });
  /*
  it("recurse one proof with zkprogram", async () => {
    const proof = SampleSideloadedProof.fromProof(program1Proof);

    const finalProof = await sideloadedProgram.recurseOneSideloaded(
      Field(1),
      proof,
      program1Vk
    );

    expect(finalProof).toBeDefined();
    expect(finalProof.maxProofsVerified).toBe(2);
  });

  it("recurse two different proofs with zkprogram", async () => {
    const proof1 = SampleSideloadedProof.fromProof(program1Proof);
    const proof2 = SampleSideloadedProof2.fromProof(program2Proof);

    const finalProof = await sideloadedProgram.recurseTwoSideloaded(
      Field(4),
      proof1,
      program1Vk,
      proof2,
      program2Vk
    );

    expect(finalProof).toBeDefined();
  });

  it("should fail to prove with faulty vk", async () => {
    const proof1 = SampleSideloadedProof.fromProof(program1Proof);
    const proof2 = SampleSideloadedProof2.fromProof(program2Proof);

    // VK for proof2 wrong
    await expect(async () => {
      return await sideloadedProgram.recurseTwoSideloaded(
        Field(7),
        proof1,
        program1Vk,
        proof2,
        program1Vk
      );
    }).rejects.toThrow();
  });

  it("should work if SL Proof classes are used in different ZkPrograms", async () => {
    const proof1 = SampleSideloadedProof.fromProof(program1Proof);
    const proof2 = SampleSideloadedProof2.fromProof(program2Proof);

    await sideloadedProgram2.compile();

    const finalProof = await sideloadedProgram2.recurseTwoSideloaded(
      Field(5),
      proof1,
      program1Vk,
      proof2,
      program2Vk
    );
    expect(finalProof).toBeDefined();
  });

  it("different proof classes should have different tags", async () => {
    const tag1 = SampleSideloadedProof.tag();
    const tag2 = SampleSideloadedProof2.tag();

    expect(tag1).not.toStrictEqual(tag2);
  });
  */
});
