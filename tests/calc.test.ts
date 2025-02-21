import { describe, expect, it } from "@jest/globals";
import { blockchain } from "zkcloudworker";
import {
  method,
  state,
  State,
  TokenContract,
  AccountUpdateForest,
  PublicKey,
  AccountUpdate,
  UInt64,
  Bool,
  Field,
  Struct,
  SelfProof,
  ZkProgram,
  Cache,
  Poseidon,
} from "o1js";

export class AddValue extends Struct({
  value: UInt64,
  limit: UInt64,
}) {
  toState() {
    return [this.value.value, this.limit.value];
  }
}

export const AddProgram = ZkProgram({
  name: "AddProgram",
  publicOutput: Field,

  methods: {
    create: {
      privateInputs: [AddValue],
      async method(addValue: AddValue) {
        addValue.value.assertLessThan(addValue.limit, "Value exceeds limit");
        addValue.value.assertGreaterThan(
          UInt64.from(0),
          "Value must be positive"
        );
        const hash = Poseidon.hashPacked(AddValue, addValue);
        return { publicOutput: hash };
      },
    },
  },
});

export class AddProgramProof extends ZkProgram.Proof(AddProgram) {}

const ITERATIONS = 10;

describe("Calculate", () => {
  it(`should calculate the state`, async () => {
    const addValues = [];
    for (let i = 0; i < ITERATIONS * 40_000; i++) {
      addValues.push(
        new AddValue({
          value: UInt64.from(Math.floor(Math.random() * 90) + 1),
          limit: UInt64.from(100),
        })
      );
    }

    console.time("create");
    for (let i = 0; i < ITERATIONS * 35_000; i++) {
      await AddProgram.rawMethods.create(addValues[i]);
    }
    console.timeEnd("create");
    console.time("compile");
    const cache = Cache.FileSystem("./cache");
    const vk = (await AddProgram.compile({ cache })).verificationKey;
    console.timeEnd("compile");
    console.log(vk.hash.toJSON());
    console.time("create2");
    for (let i = 0; i < ITERATIONS; i++) {
      await AddProgram.create(addValues[i]);
    }
    console.timeEnd("create2");
  });
});
