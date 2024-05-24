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

export const program1 = ZkProgram({
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

export class Program2Struct extends Struct({
  field1: Field,
  field2: Field,
}) {}

export const program2 = ZkProgram({
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

export class SampleSideloadedProof extends DynamicProof<Field, Void> {
  static publicInputType = Field;
  static publicOutputType = Void;
  static maxProofsVerified = 0 as const;
}

export class SampleSideloadedProof2 extends DynamicProof<
  Program2Struct,
  Field
> {
  static publicInputType = Program2Struct;
  static publicOutputType = Field;
  static maxProofsVerified = 0 as const;
}

export const sideloadedProgram = ZkProgram({
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

export const sideloadedProgram2 = ZkProgram({
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
