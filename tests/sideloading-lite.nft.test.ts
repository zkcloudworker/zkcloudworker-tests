import { describe, expect, it } from "@jest/globals";
import {
  initBlockchain,
  fee,
  fetchMinaAccount,
  blockchain,
  sleep,
  accountBalanceMina,
} from "zkcloudworker";
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
  FeatureFlags,
} from "o1js";
import { TEST_ACCOUNTS } from "../env.json";

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

class PluginProof extends ZkProgram.Proof(pluginProgram) {}

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
      privateInputs: [PublicKey, Signature],
      async method(
        initialState: NFTStateInput,
        newOwner: PublicKey,
        // https://github.com/o1-labs/o1js/issues/1854
        signature: Signature
      ) {
        signature
          .verify(initialState.owner, [
            ...NFTStateInput.toFields(initialState),
            ...newOwner.toFields(),
          ])
          .assertTrue();
        return new NFTStateOutput({
          metadata: initialState.metadata,
          owner: newOwner,
        });
      },
    },
    // Commenting the add method will make the test pass
    add: {
      privateInputs: [PluginProof], // , VerificationKey
      async method(
        initialState: NFTStateInput,
        proof: PluginProof
        //vk: VerificationKey
      ) {
        proof.publicInput.assertEquals(initialState.metadata);
        proof.verify();
        return new NFTStateOutput({
          metadata: proof.publicOutput,
          owner: initialState.owner,
        });
      },
    },
  },
});

// export class NFTProof extends DynamicProof<NFTStateInput, NFTStateOutput> {
//   static publicInputType = NFTStateInput;
//   static publicOutputType = NFTStateOutput;
//   static maxProofsVerified = 0 as const;
//   static featureFlags = FeatureFlags.allMaybe;
// }

class NFTProof extends ZkProgram.Proof(nftProgram) {}

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

  @method async updateMetadata(proof: NFTProof) {
    // , vk: VerificationKey
    // this.metadataVerificationKeyHash
    //   .getAndRequireEquals()
    //   .assertEquals(vk.hash);
    // proof.verify(vk);
    proof.verify();
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
let pluginProgramVk: VerificationKey;
const cache: Cache = Cache.FileSystem("./cache");
const owner = PrivateKey.randomKeypair();
const creator = PrivateKey.randomKeypair();
const metadata = Field(1);
const zkAppKey = PrivateKey.randomKeypair();
const nftContract = new NFTContract(zkAppKey.publicKey);
let deployer: PrivateKey = PrivateKey.random();
let sender: PublicKey = deployer.toPublicKey();

const chain: blockchain = "local" as blockchain;

describe("NFT with Side loading verification key", () => {
  it("should initialize a blockchain", async () => {
    if (chain === "devnet") {
      await initBlockchain("devnet");
      deployer = PrivateKey.fromBase58(TEST_ACCOUNTS[0].privateKey);
    } else {
      const { keys } = await initBlockchain("local", 1);
      deployer = keys[0].key;
    }
    sender = deployer.toPublicKey();
    console.log("chain:", chain);
    console.log("Contract address:", zkAppKey.publicKey.toBase58());
    console.log("Sender address:", sender.toBase58());
    console.log("Sender's balance:", await accountBalanceMina(sender));
  });

  it("should compile plugin ZkProgram", async () => {
    console.time("compiled plugin ZkProgram");
    pluginProgramVk = (await pluginProgram.compile({ cache })).verificationKey;
    console.timeEnd("compiled plugin ZkProgram");
  });

  it("should compile nft ZkProgram", async () => {
    console.time("compiled NFTProgram");
    nftProgramVk = (await nftProgram.compile({ cache })).verificationKey;
    console.timeEnd("compiled NFTProgram");
  });

  it("should compile with SmartContracts", async () => {
    console.log("compiling...");
    console.time("compiled NFTContract");
    await NFTContract.compile({ cache });
    console.timeEnd("compiled NFTContract");
  });

  it("should deploy a SmartContract", async () => {
    await fetchMinaAccount({ publicKey: sender, force: true });
    const tx = await Mina.transaction(
      { sender, fee: await fee(), memo: "NFT contract deploy" },
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
    console.time("NFT contract deployed");
    const txIncluded = await (
      await tx.sign([deployer, zkAppKey.privateKey]).send()
    ).wait();
    console.timeEnd("NFT contract deployed");
    console.log("NFT contract deployed:", txIncluded.hash);
  });

  // it.skip("should update metadata with plugin", async () => {
  //   if (chain === "devnet") {
  //     await sleep(10000);
  //   }
  //   await fetchMinaAccount({ publicKey: zkAppKey.publicKey, force: true });
  //   const nftInputState = new NFTStateInput({
  //     creator: nftContract.creator.get(),
  //     metadata: nftContract.metadata.get(),
  //     owner: nftContract.owner.get(),
  //     version: nftContract.version.get(),
  //     canChangeOwner: nftContract.canChangeOwner.get(),
  //   });
  //   const pluginProof = await pluginProgram.add(
  //     nftInputState.metadata,
  //     Field(10)
  //   );
  //   const pluginProofSideLoaded = AddProof.fromProof(pluginProof);

  //   console.time("metadata proof generated");
  //   const proof = await nftProgram.add(
  //     nftInputState,
  //     pluginProofSideLoaded,
  //     pluginProgramVk
  //   );
  //   console.timeEnd("metadata proof generated");
  //   const metadataProof = NFTProof.fromProof(proof);
  //   console.time("prepare update metadata tx");
  //   await fetchMinaAccount({ publicKey: zkAppKey.publicKey, force: true });
  //   await fetchMinaAccount({ publicKey: sender, force: true });
  //   const tx = await Mina.transaction(
  //     { sender, fee: await fee(), memo: "Update metadata" },
  //     async () => {
  //       await nftContract.updateMetadata(metadataProof, nftProgramVk);
  //     }
  //   );
  //   await tx.prove();
  //   console.timeEnd("prepare update metadata tx");
  //   const txIncluded = await (await tx.sign([deployer]).send()).wait();
  //   console.log("update metadata tx:", txIncluded.hash);
  //   if (chain === "devnet") {
  //     await sleep(10000);
  //   }
  //   await fetchMinaAccount({ publicKey: zkAppKey.publicKey, force: true });
  //   const metadata = nftContract.metadata.get();
  //   expect(metadata.toJSON()).toBe(
  //     nftInputState.metadata.add(Field(10)).toJSON()
  //   );
  // });

  it("should change owner", async () => {
    const newOwner = PrivateKey.randomKeypair().publicKey;
    await fetchMinaAccount({ publicKey: zkAppKey.publicKey, force: true });
    const nftInputState = new NFTStateInput({
      creator: nftContract.creator.get(),
      metadata: nftContract.metadata.get(),
      owner: nftContract.owner.get(),
      version: nftContract.version.get(),
      canChangeOwner: nftContract.canChangeOwner.get(),
    });
    console.time("change owner proof generated");
    const signature = Signature.create(owner.privateKey, [
      ...NFTStateInput.toFields(nftInputState),
      ...newOwner.toFields(),
    ]);
    const proof = await nftProgram.changeOwner(
      nftInputState,
      newOwner,
      signature
    );
    const ok = await verify(proof, nftProgramVk);
    expect(ok).toBe(true);
    if (!ok) {
      console.log("proof is invalid");
      return;
    }
    console.timeEnd("change owner proof generated");
    //const changeOwnerProof = NFTProof.fromProof(proof);
    console.time("prepare change owner tx");
    await fetchMinaAccount({ publicKey: zkAppKey.publicKey, force: true });
    await fetchMinaAccount({ publicKey: sender, force: true });
    const tx = await Mina.transaction(
      { sender, fee: await fee(), memo: "Update metadata" },
      async () => {
        await nftContract.updateMetadata(proof); // (changeOwnerProof, nftProgramVk);
      }
    );
    await tx.prove();
    console.timeEnd("prepare change owner tx");
    const txIncluded = await (await tx.sign([deployer]).send()).wait();
    console.log("change owner tx:", txIncluded.hash);
    if (chain === "devnet") {
      await sleep(10000);
    }
    await fetchMinaAccount({ publicKey: zkAppKey.publicKey, force: true });
    const checkOwner = nftContract.owner.get();
    expect(checkOwner.toBase58()).toBe(newOwner.toBase58());
  });

  it("should update metadata", async () => {
    if (chain === "devnet") {
      await sleep(10000);
    }
    const newMetadata = Field(7);
    await fetchMinaAccount({ publicKey: zkAppKey.publicKey, force: true });
    const nftInputState = new NFTStateInput({
      creator: nftContract.creator.get(),
      metadata: nftContract.metadata.get(),
      owner: nftContract.owner.get(),
      version: nftContract.version.get(),
      canChangeOwner: nftContract.canChangeOwner.get(),
    });
    console.time("metadata proof generated");
    const proof = await nftProgram.updateMetadata(
      nftInputState,
      newMetadata,
      nftContract.owner.get()
    );
    console.timeEnd("metadata proof generated");
    //const metadataProof = NFTProof.fromProof(proof);
    console.time("prepare update metadata tx");
    await fetchMinaAccount({ publicKey: zkAppKey.publicKey, force: true });
    await fetchMinaAccount({ publicKey: sender, force: true });
    const tx = await Mina.transaction(
      { sender, fee: await fee(), memo: "Update metadata" },
      async () => {
        await nftContract.updateMetadata(proof); // (metadataProof, nftProgramVk);
      }
    );
    await tx.prove();
    console.timeEnd("prepare update metadata tx");
    const txIncluded = await (await tx.sign([deployer]).send()).wait();
    console.log("update metadata tx:", txIncluded.hash);
    if (chain === "devnet") {
      await sleep(10000);
    }
    await fetchMinaAccount({ publicKey: zkAppKey.publicKey, force: true });
    const metadata = nftContract.metadata.get();
    expect(metadata.toJSON()).toBe(newMetadata.toJSON());
  });
});
