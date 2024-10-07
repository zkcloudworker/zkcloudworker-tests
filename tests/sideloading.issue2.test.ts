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
  Struct,
  method,
  AccountUpdate,
  state,
  State,
  UInt32,
  DeployArgs,
  Bool,
  Cache,
  Signature,
  verify,
} from "o1js";

export class AddProof extends DynamicProof<Field, Field> {
  static publicInputType = Field;
  static publicOutputType = Field;
  static maxProofsVerified = 0 as const;
}

class NFTStateInput extends Struct({
  creator: PublicKey,
  metadata: Field,
  owner: PublicKey,
  version: UInt32,
  canChangeOwner: Bool,
}) {
  static assertEqual(a: NFTStateInput, b: NFTStateInput) {
    a.creator.assertEquals(b.creator);
    a.metadata.assertEquals(b.metadata);
    a.owner.assertEquals(b.owner);
    a.version.assertEquals(b.version);
    a.canChangeOwner.assertEquals(b.canChangeOwner);
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
    changeOwner: {
      privateInputs: [PublicKey], //, Signature
      async method(
        initialState: NFTStateInput,
        newOwner: PublicKey
        // https://github.com/o1-labs/o1js/issues/1854
        //signature: Signature
      ) {
        // signature
        //   .verify(initialState.owner, [
        //     ...NFTStateInput.toFields(initialState),
        //     ...newOwner.toFields(),
        //   ])
        //   .assertTrue();
        return new NFTStateOutput({
          metadata: initialState.metadata,
          owner: newOwner,
        });
      },
    },
    // https://github.com/o1-labs/o1js/issues/1854
    // Commenting the add method will make the test pass
    add: {
      privateInputs: [AddProof, VerificationKey],
      async method(
        initialState: NFTStateInput,
        proof: AddProof,
        vk: VerificationKey
      ) {
        proof.publicInput.assertEquals(initialState.metadata);
        proof.verify(vk);
        return new NFTStateOutput({
          metadata: proof.publicOutput,
          owner: initialState.owner,
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
  canChangeOwner: Bool;
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
    this.canChangeOwner.set(props.canChangeOwner);
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
        canChangeOwner: this.canChangeOwner.getAndRequireEquals(),
      })
    );
    this.metadata.set(proof.publicOutput.metadata);
    this.owner.set(proof.publicOutput.owner);
  }
}

const pluginProgram = ZkProgram({
  name: "pluginProgram",
  publicInput: Field,
  publicOutput: Field,
  methods: {
    add: {
      privateInputs: [Field],
      async method(a: Field, b: Field) {
        return a.add(b);
      },
    },
  },
});

let nftProgramVk: VerificationKey;
let pluginProgramVk: VerificationKey;
const cache: Cache = Cache.FileSystem("./cache");
const owner = PrivateKey.randomKeypair();
const creator = PrivateKey.randomKeypair();
const metadata = Field(1);
const zkAppKey = PrivateKey.randomKeypair();
const nftContract = new NFTContract(zkAppKey.publicKey);
let sender: Mina.TestPublicKey;

describe("NFT with Side loading verification key", () => {
  it("should initialize a blockchain", async () => {
    const network = await Mina.LocalBlockchain();
    Mina.setActiveInstance(network);
    sender = network.testAccounts[0];
  });

  it("should compile", async () => {
    await NFTContract.compile({ cache });
    nftProgramVk = (await nftProgram.compile({ cache })).verificationKey;
    pluginProgramVk = (await pluginProgram.compile({ cache })).verificationKey;
  });

  it("should deploy a SmartContract", async () => {
    const tx = await Mina.transaction(
      { sender, fee: 100_000_000 },
      async () => {
        AccountUpdate.fundNewAccount(sender);
        await nftContract.deploy({
          creator: creator.publicKey,
          metadata,
          owner: owner.publicKey,
          metadataVerificationKeyHash: nftProgramVk.hash,
          canChangeOwner: Bool(true),
        });
      }
    );
    await (await tx.sign([sender.key, zkAppKey.privateKey]).send()).wait();
  });

  it("should update metadata", async () => {
    const newMetadata = Field(7);
    const nftInputState = new NFTStateInput({
      creator: nftContract.creator.get(),
      metadata: nftContract.metadata.get(),
      owner: nftContract.owner.get(),
      version: nftContract.version.get(),
      canChangeOwner: nftContract.canChangeOwner.get(),
    });
    const proof = await nftProgram.updateMetadata(
      nftInputState,
      newMetadata,
      nftContract.owner.get()
    );
    const metadataProof = NFTProof.fromProof(proof);
    const tx = await Mina.transaction(
      { sender, fee: 100_000_000 },
      async () => {
        await nftContract.updateMetadata(metadataProof, nftProgramVk);
      }
    );
    await tx.prove();
    await (await tx.sign([sender.key]).send()).wait();
    const metadata = nftContract.metadata.get();
    expect(metadata.toJSON()).toBe(newMetadata.toJSON());
  });
});
