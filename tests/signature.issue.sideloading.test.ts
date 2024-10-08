import { describe, expect, it } from "@jest/globals";
import {
  PublicKey,
  Mina,
  PrivateKey,
  DynamicProof,
  VerificationKey,
  ZkProgram,
  Field,
  SmartContract,
  method,
  AccountUpdate,
  state,
  State,
  Cache,
  Signature,
  verify,
  Void,
  FeatureFlags,
} from "o1js";

const program = ZkProgram({
  name: "SignatureIssue",
  publicInput: Field,
  publicOutput: Field,
  methods: {
    setValue: {
      privateInputs: [PublicKey, Signature],
      async method(data: Field, publicKey: PublicKey, signature: Signature) {
        // Commenting next line will allow the test to pass
        signature.verify(publicKey, [data]).assertTrue();
        return data;
      },
    },
  },
});

export class SignatureProof extends DynamicProof<Field, Field> {
  static publicInputType = Field;
  static publicOutputType = Field;
  static maxProofsVerified = 0 as const;
  static featureFlags = FeatureFlags.allMaybe;
}

export class Contract extends SmartContract {
  @state(Field) value = State<Field>();

  @method async setValue(proof: SignatureProof, vk: VerificationKey) {
    proof.verify(vk);
    this.value.set(proof.publicOutput);
  }
}

describe("Side loading verification key proof", () => {
  let vk: VerificationKey;
  const cache: Cache = Cache.FileSystem("./cache");
  const zkAppKey = PrivateKey.randomKeypair();
  const contract = new Contract(zkAppKey.publicKey);
  let sender: Mina.TestPublicKey;
  const fee = 100_000_000;
  let signatureProof: SignatureProof;

  it("should compile", async () => {
    await Contract.compile({ cache });
    vk = (await program.compile({ cache })).verificationKey;
  });

  it("should deploy a SmartContract", async () => {
    const network = await Mina.LocalBlockchain();
    Mina.setActiveInstance(network);
    sender = network.testAccounts[0];
    const tx = await Mina.transaction({ sender, fee }, async () => {
      AccountUpdate.fundNewAccount(sender);
      await contract.deploy({});
    });
    await (await tx.sign([sender.key, zkAppKey.privateKey]).send()).wait();
  });

  it("should calculate the proof", async () => {
    const newData = Field(2);
    const owner = PrivateKey.randomKeypair();
    const signature = Signature.create(owner.privateKey, [newData]);
    const proof = await program.setValue(newData, owner.publicKey, signature);
    const ok1 = await verify(proof, vk);
    expect(ok1).toBe(true);

    signatureProof = SignatureProof.fromProof(proof);
    const ok2 = await verify(signatureProof, vk);
    expect(ok2).toBe(true);
  });

  it("should set value in SmartContract", async () => {
    const tx = await Mina.transaction({ sender, fee }, async () => {
      await contract.setValue(signatureProof, vk);
    });
    await tx.prove();
    await (await tx.sign([sender.key]).send()).wait();
  });
});
