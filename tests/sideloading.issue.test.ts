import { describe, expect, it } from "@jest/globals";
import {
  Mina,
  PrivateKey,
  DynamicProof,
  VerificationKey,
  Void,
  ZkProgram,
  Field,
  SmartContract,
  method,
  AccountUpdate,
  state,
  State,
  Cache,
} from "o1js";

class ProgramProof extends DynamicProof<Field, Void> {
  static publicInputType = Field;
  static publicOutputType = Void;
  static maxProofsVerified = 0 as const;
}

const program1 = ZkProgram({
  name: "program1",
  publicInput: Field,
  methods: {
    check: {
      privateInputs: [Field],
      async method(publicInput: Field, field: Field) {
        publicInput.assertEquals(field);
      },
    },
  },
});

const program2 = ZkProgram({
  name: "program2",
  publicInput: Field,
  methods: {
    check: {
      privateInputs: [ProgramProof, VerificationKey],
      async method(
        publicInput: Field,
        proof: ProgramProof,
        vk: VerificationKey
      ) {
        proof.verify(vk);
        proof.publicInput.assertEquals(publicInput);
      },
    },
  },
});

export class Contract extends SmartContract {
  @state(Field) value = State<Field>();

  @method async setValue(proof: ProgramProof, vk: VerificationKey) {
    proof.verify(vk);
    this.value.set(proof.publicInput);
  }
}

describe("Side loading", () => {
  let program1Vk: VerificationKey;
  let program2Vk: VerificationKey;
  let proof: ProgramProof;
  const value = Field(1);

  it("should compile", async () => {
    const cache: Cache = Cache.FileSystem("./cache");
    await Contract.compile({ cache });
    program1Vk = (await program1.compile({ cache })).verificationKey;
    program2Vk = (await program2.compile({ cache })).verificationKey;
  });

  it("should prove", async () => {
    const program1Proof = await program1.check(value, Field(1));
    const program1SideLoadedProof = ProgramProof.fromProof(program1Proof);
    const program2Proof = await program2.check(
      value,
      program1SideLoadedProof,
      program1Vk
    );
    proof = ProgramProof.fromProof(program2Proof);
    // Uncomment next line to make the test pass
    // proof = ProgramProof.fromProof(program1Proof);
  });

  it("should deploy SmartContract and set value", async () => {
    const network = await Mina.LocalBlockchain();
    Mina.setActiveInstance(network);
    const sender = network.testAccounts[0];
    const appKey = PrivateKey.randomKeypair();
    const zkApp = new Contract(appKey.publicKey);
    const tx = await Mina.transaction(
      { sender, fee: 100_000_000 },
      async () => {
        AccountUpdate.fundNewAccount(sender);
        await zkApp.deploy();
      }
    );
    await (await tx.sign([sender.key, appKey.privateKey]).send()).wait();

    const tx2 = await Mina.transaction(
      { sender, fee: 100_000_000 },
      async () => {
        // Replace program2Vk with program1Vk to make the test pass
        await zkApp.setValue(proof, program2Vk);
      }
    );
    await tx2.prove();
    await (await tx2.sign([sender.key]).send()).wait();
    expect(zkApp.value.get().toJSON()).toEqual(value.toJSON());
  });
});
