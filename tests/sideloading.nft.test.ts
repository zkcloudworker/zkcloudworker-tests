import { describe, expect, it } from "@jest/globals";
import { initBlockchain, fee, fetchMinaAccount } from "zkcloudworker";
import {
  PublicKey,
  Mina,
  PrivateKey,
  DynamicProof,
  VerificationKey,
  ZkProgram,
  Field,
  SmartContract,
  Struct,
  method,
  AccountUpdate,
  state,
  State,
  UInt32,
  DeployArgs,
  Bool,
  Cache,
} from "o1js";

class NFTStateInput extends Struct({
  creator: PublicKey,
  metadata: Field,
  owner: PublicKey,
  version: UInt32,
}) {
  static assertEqual(a: NFTStateInput, b: NFTStateInput) {
    a.creator.assertEquals(b.creator);
    a.metadata.assertEquals(b.metadata);
    a.owner.assertEquals(b.owner);
    a.version.assertEquals(b.version);
  }
}

class NFTStateOutput extends Struct({
  metadata: Field,
  owner: PublicKey,
}) {}

const nftProgram = ZkProgram({
  name: "nftProgram",
  publicInput: NFTStateInput,
  publicOutput: NFTStateOutput,
  methods: {
    updateMetadata: {
      privateInputs: [Field, PublicKey],
      async method(
        initialState: NFTStateInput,
        metadata: Field,
        owner: PublicKey
      ) {
        initialState.owner.assertEquals(owner);
        return new NFTStateOutput({
          metadata,
          owner,
        });
      },
    },
  },
});

export class NFTProof extends DynamicProof<NFTStateInput, NFTStateOutput> {
  static publicInputType = NFTStateInput;
  static publicOutputType = NFTStateOutput;
  static maxProofsVerified = 0 as const;
}

interface NFTContractDeployParams extends Exclude<DeployArgs, undefined> {
  metadata: Field;
  owner: PublicKey;
  creator: PublicKey;
  metadataVerificationKeyHash: Field;
}

export class NFTContract extends SmartContract {
  @state(Field) metadata = State<Field>();
  @state(PublicKey) owner = State<PublicKey>();
  @state(PublicKey) creator = State<PublicKey>();
  @state(UInt32) version = State<UInt32>();
  @state(Field) metadataVerificationKeyHash = State<Field>();
  @state(Bool) canChangeOwner = State<Bool>();

  async deploy(props: NFTContractDeployParams) {
    await super.deploy(props);
    this.metadata.set(props.metadata);
    this.owner.set(props.owner);
    this.creator.set(props.creator);
    this.metadataVerificationKeyHash.set(props.metadataVerificationKeyHash);
    this.version.set(UInt32.from(1));
  }

  @method async updateMetadata(proof: NFTProof, vk: VerificationKey) {
    this.metadataVerificationKeyHash
      .getAndRequireEquals()
      .assertEquals(vk.hash);
    proof.verify(vk);
    NFTStateInput.assertEqual(
      proof.publicInput,
      new NFTStateInput({
        creator: this.creator.getAndRequireEquals(),
        metadata: this.metadata.getAndRequireEquals(),
        owner: this.owner.getAndRequireEquals(),
        version: this.version.getAndRequireEquals(),
      })
    );
    this.metadata.set(proof.publicOutput.metadata);
    // canChange ownerIsSame allowed
    // true true allowed
    // true false allowed
    // false true allowed
    // false false not allowed
    proof.publicOutput.owner
      .equals(this.owner.getAndRequireEquals())
      .or(this.canChangeOwner.getAndRequireEquals())
      .assertTrue();
    this.owner.set(proof.publicOutput.owner);
  }
}
let nftProgramVk: VerificationKey;
// let program1Proof: Proof<Field, void>;
// let program2Proof: Proof<Program2Struct, Field>;
// let proof: NFTProof;
const cache: Cache = Cache.FileSystem("./cache");
const owner = PrivateKey.randomKeypair();
const creator = PrivateKey.randomKeypair();
const metadata = Field(1);
const zkAppKey = PrivateKey.randomKeypair();
const nftContract = new NFTContract(zkAppKey.publicKey);
let deployer: PrivateKey = PrivateKey.random();
let sender: PublicKey = deployer.toPublicKey();

describe("NFT with Side loading verification key", () => {
  it("should compile with SmartContracts", async () => {
    console.log("compiling NFTContract...");
    console.time("compiled NFTContract");
    await NFTContract.compile({ cache });
    console.timeEnd("compiled NFTContract");
  });

  it("should compile ZkProgram", async () => {
    console.time("compiled NFTProgram");
    nftProgramVk = (await nftProgram.compile({ cache })).verificationKey;
    console.timeEnd("compiled NFTProgram");
  });

  it("should deploy a SmartContract", async () => {
    const { keys } = await initBlockchain("local", 1);
    deployer = keys[0].key;
    sender = deployer.toPublicKey();
    await fetchMinaAccount({ publicKey: sender, force: true });
    console.log("Contract address:", zkAppKey.publicKey.toBase58());
    console.log("Sender address:", sender.toBase58());
    const tx = await Mina.transaction(
      { sender, fee: await fee(), memo: "NFT contract deploy" },
      async () => {
        AccountUpdate.fundNewAccount(sender);
        await nftContract.deploy({
          creator: creator.publicKey,
          metadata,
          owner: owner.publicKey,
          metadataVerificationKeyHash: nftProgramVk.hash,
        });
      }
    );
    console.time("NFT contract deployed");
    const txIncluded = await (
      await tx.sign([deployer, zkAppKey.privateKey]).send()
    ).wait();
    console.timeEnd("NFT contract deployed");
    console.log("NFT contract deployed:", txIncluded.hash);
  });

  it("should update metadata", async () => {
    const newMetadata = Field(2);
    await fetchMinaAccount({ publicKey: zkAppKey.publicKey, force: true });
    const nftInputState = new NFTStateInput({
      creator: nftContract.creator.get(),
      metadata: nftContract.metadata.get(),
      owner: nftContract.owner.get(),
      version: nftContract.version.get(),
    });
    console.time("metadata proof generated");
    const proof = await nftProgram.updateMetadata(
      nftInputState,
      newMetadata,
      owner.publicKey
    );
    console.timeEnd("metadata proof generated");
    const metadataProof = NFTProof.fromProof(proof);
    console.time("prepare update metadata tx");
    await fetchMinaAccount({ publicKey: zkAppKey.publicKey, force: true });
    await fetchMinaAccount({ publicKey: sender, force: true });
    const tx = await Mina.transaction(
      { sender, fee: await fee(), memo: "Update metadata" },
      async () => {
        await nftContract.updateMetadata(metadataProof, nftProgramVk);
      }
    );
    await tx.prove();
    console.timeEnd("prepare update metadata tx");
    const txIncluded = await (await tx.sign([deployer]).send()).wait();
    console.log("update metadata tx:", txIncluded.hash);
  });
});
