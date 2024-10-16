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
  FeatureFlags,
} from "o1js";

describe("Side loading", () => {
  it("should test side loading", async () => {
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

    //const featureFlags1 = await FeatureFlags.fromZkProgram(program1);
    class NonRecursiveProof extends DynamicProof<Field, Void> {
      static publicInputType = Field;
      static publicOutputType = Void;
      static maxProofsVerified = 0 as const;
      static featureFlags = FeatureFlags.allMaybe;
    }

    const program2 = ZkProgram({
      name: "program2",
      publicInput: Field,
      methods: {
        check: {
          privateInputs: [NonRecursiveProof, VerificationKey],
          async method(
            publicInput: Field,
            proof: NonRecursiveProof,
            vk: VerificationKey
          ) {
            proof.verify(vk);
            proof.publicInput.assertEquals(publicInput);
          },
        },
      },
    });

    //const featureFlags2 = await FeatureFlags.fromZkProgram(program2);
    class RecursiveProof extends DynamicProof<Field, Void> {
      static publicInputType = Field;
      static publicOutputType = Void;
      static maxProofsVerified = 2 as const;
      static featureFlags = FeatureFlags.allMaybe;
    }
    class Contract extends SmartContract {
      @state(Field) value = State<Field>();

      @method async setValue(proof: RecursiveProof, vk: VerificationKey) {
        proof.verify(vk);
        this.value.set(proof.publicInput);
      }
    }
    const value = Field(1);
    const cache: Cache = Cache.FileSystem("./cache");
    await Contract.compile({ cache });
    const program1Vk = (await program1.compile({ cache })).verificationKey;
    const program2Vk = (await program2.compile({ cache })).verificationKey;

    const program1Proof = await program1.check(value, Field(1));
    const program1SideLoadedProof = NonRecursiveProof.fromProof(program1Proof);
    const program2Proof = await program2.check(
      value,
      program1SideLoadedProof,
      program1Vk
    );
    const proof = RecursiveProof.fromProof(program2Proof);
    // Uncomment next line to make the test pass
    // proof = ProgramProof.fromProof(program1Proof);
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
