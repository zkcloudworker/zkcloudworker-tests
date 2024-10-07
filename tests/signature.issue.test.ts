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
  DeployArgs,
  Cache,
  Signature,
  verify,
  Void,
} from "o1js";

const program = ZkProgram({
  name: "SignatureIssue",
  publicInput: Field,
  methods: {
    setValue: {
      privateInputs: [PublicKey, Signature],
      async method(data: Field, publicKey: PublicKey, signature: Signature) {
        signature.verify(publicKey, [data]).assertTrue();
      },
    },
  },
});

class SignatureProof extends ZkProgram.Proof(program) {}

export class Contract extends SmartContract {
  @state(Field) value = State<Field>();

  @method async setValue(proof: SignatureProof, vk: VerificationKey) {
    this.value.set(proof.publicInput);
  }
}

let vk: VerificationKey;
const cache: Cache = Cache.FileSystem("./cache");
const owner = PrivateKey.randomKeypair();
const zkAppKey = PrivateKey.randomKeypair();
const contract = new Contract(zkAppKey.publicKey);
let sender: Mina.TestPublicKey;
const fee = 100_000_000;

describe("Proof checking the signature", () => {
  it("should compile", async () => {
    vk = (await program.compile({ cache })).verificationKey;
    await Contract.compile({ cache });
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

  it("should set value", async () => {
    const newData = Field(10);
    const signature = Signature.create(owner.privateKey, [newData]);
    expect(signature.verify(owner.publicKey, [newData]).toBoolean()).toBe(true);
    const proof = await program.setValue(newData, owner.publicKey, signature);
    expect(await verify(proof, vk)).toBe(true);
    const tx = await Mina.transaction({ sender, fee }, async () => {
      await contract.setValue(proof, vk);
    });
    await tx.prove();
    await (await tx.sign([sender.key]).send()).wait();
  });
});
