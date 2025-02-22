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
  Poseidon,
  UInt64,
  Bool,
  Field,
  Struct,
  SelfProof,
  ZkProgram,
  Cache,
  Gadgets,
  Bytes,
  UInt32,
  UInt8,
} from "o1js";

const Bytes64 = Bytes(64);
export class AddValue extends Struct({
  value: UInt32,
  limit: UInt32,
}) {
  toState() {
    return [this.value.value, this.limit.value];
  }
  toBytes() {
    const value = this.value.toBytes();
    const limit = this.limit.toBytes();
    return Bytes64.from([...value, ...limit]);
  }
}

export const AddProgram = ZkProgram({
  name: "AddProgram",
  publicOutput: Bytes(64),

  methods: {
    create: {
      privateInputs: [AddValue],
      async method(addValue: AddValue) {
        addValue.value.assertLessThan(addValue.limit, "Value exceeds limit");
        addValue.value.assertGreaterThan(
          UInt32.from(0),
          "Value must be positive"
        );
        const bytes = addValue.toBytes();
        const hash = Gadgets.BLAKE2B.hash(bytes);
        return { publicOutput: hash };
      },
    },
  },
});

export const AddProgramPoseidon = ZkProgram({
  name: "AddProgramPoseidon",
  publicOutput: Field,

  methods: {
    create: {
      privateInputs: [AddValue],
      async method(addValue: AddValue) {
        addValue.value.assertLessThan(addValue.limit, "Value exceeds limit");
        addValue.value.assertGreaterThan(
          UInt32.from(0),
          "Value must be positive"
        );
        const hash = Poseidon.hash([
          addValue.limit.value,
          addValue.value.value,
        ]);
        return { publicOutput: hash };
      },
    },
  },
});

export class AddProgramProof extends ZkProgram.Proof(AddProgram) {}

const ITERATIONS = 1;

describe("Calculate", () => {
  it(`should calculate the Blake2b hash`, async () => {
    const values: UInt64[] = [
      UInt64.from(123n),
      UInt64.from(256n),
      UInt64.from(1235735873657836587n),
      UInt64.from(7684974986948578787n),
      UInt64.from(9858467863563667345n),
      UInt64.from(837558356534763658n),
      UInt64.from(8538547465n),
    ];
    const bytes: UInt8[] = values
      .map((value) => {
        const bits = value.value.toBits(64);
        const i1 = UInt32.Unsafe.fromField(Field.fromBits(bits.slice(0, 32)));
        const i2 = UInt32.Unsafe.fromField(Field.fromBits(bits.slice(32, 64)));
        return [...i1.toBytes(), ...i2.toBytes()];
      })
      .flat();
    console.log(bytes.map((b) => b.toBigInt()));
    const hash = Gadgets.BLAKE2B.hash(bytes, 32);
    const hashBytes = hash.toBytes();
    console.log("length", hashBytes.length);
    console.log("hash:", "0x" + hash.toHex());
    const maxField = Field.ORDER;
    const maxBits = 256 - 2;
    const max = BigInt(2) ** BigInt(maxBits) - BigInt(1);
    console.log("Max number that fits in 254 bits:", max.toString());
    console.log("Max field                       :", maxField.toString());
    expect(max).toBeLessThan(maxField);
  });

  it(`should calculate the state`, async () => {
    const addValues = [];
    for (let i = 0; i < ITERATIONS * 40_000; i++) {
      addValues.push(
        new AddValue({
          value: UInt32.from(Math.floor(Math.random() * 90) + 1),
          limit: UInt32.from(100),
        })
      );
    }

    console.time("create");
    for (let i = 0; i < ITERATIONS * 5_000; i++) {
      await AddProgram.rawMethods.create(addValues[i]);
    }
    console.timeEnd("create");

    console.time("compile");
    const methods = await AddProgram.analyzeMethods();
    console.log(methods.create.summary());
    const methodsPoseidon = await AddProgramPoseidon.analyzeMethods();
    console.log(methodsPoseidon.create.summary());
    const cache = Cache.FileSystem("./cache");
    const vk = (await AddProgram.compile({ cache })).verificationKey;
    const vkPoseidon = (await AddProgramPoseidon.compile({ cache }))
      .verificationKey;

    console.timeEnd("compile");
    console.log(vk.hash.toJSON());
    console.time("create2");
    for (let i = 0; i < ITERATIONS; i++) {
      await AddProgram.create(addValues[i]);
    }
    console.timeEnd("create2");
  });
});
