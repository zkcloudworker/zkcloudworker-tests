import { describe, expect, it } from "@jest/globals";
import { Cache, Experimental, Field, ZkProgram, verify } from "o1js";
import { serializeIndexedMap, deserializeIndexedMap } from "../src/indexed-map";
const { IndexedMerkleMap } = Experimental;
const MAP_HEIGHT = 20;
const NUMBER_OF_ELEMENTS = 10;
class MerkleMap extends IndexedMerkleMap(MAP_HEIGHT) {}

const zkMapProgram = ZkProgram({
  name: "zkMapProgram",
  publicInput: Field,
  publicOutput: Field,
  methods: {
    set: {
      privateInputs: [MerkleMap, Field, Field],
      async method(oldRoot: Field, map: MerkleMap, key: Field, value: Field) {
        oldRoot.assertEquals(map.root);
        map.insert(key, value);
        return map.root;
      },
    },
  },
});

describe("ZkProgram withIndexed Map serialization", () => {
  it(`should measure the size of the serialized map and time of serialization and deserialization`, async () => {
    const map = new MerkleMap();
    const maxElements = 2 ** (MAP_HEIGHT - 1);
    console.log("maxElements:", maxElements);
    console.log("NUMBER_OF_ELEMENTS:", NUMBER_OF_ELEMENTS);
    if (NUMBER_OF_ELEMENTS > maxElements) {
      throw new Error(`NUMBER_OF_ELEMENTS must be less than ${maxElements}`);
    }
    console.time("setting elements");
    for (let i = 0; i < NUMBER_OF_ELEMENTS; i++) {
      map.set(Field.random(), Field.random());
    }
    console.timeEnd("setting elements");
    const key = Field.random();
    const value = Field.random();
    console.time("serialization");
    const serializedMap = serializeIndexedMap(map);
    console.timeEnd("serialization");
    map.set(key, value);
    console.log("serializedMap.length:", serializedMap.length);
    console.time("deserialization");
    const restoredMap = deserializeIndexedMap({
      serializedIndexedMap: serializedMap,
      type: MerkleMap,
    });
    console.timeEnd("deserialization");
    expect(restoredMap).not.toBeUndefined();
    if (restoredMap === undefined) {
      throw new Error("restoredMap is undefined");
    }
    console.time("compiled");
    const cache: Cache = Cache.FileSystem("./cache");
    const vk = (await zkMapProgram.compile({ cache })).verificationKey;
    console.timeEnd("compiled");
    console.time("proving");
    const proof = await zkMapProgram.set(
      restoredMap.root,
      restoredMap.clone(),
      key,
      value
    );
    console.timeEnd("proving");
    console.time("verifying");
    const ok = await verify(proof, vk);
    console.timeEnd("verifying");
    expect(ok).toBe(true);
    expect(proof.publicOutput.toJSON()).toEqual(map.root.toJSON());
    // https://github.com/o1-labs/o1js/issues/1790
    // expect(proof.publicOutput.toJSON()).toEqual(restoredMap.root.toJSON());
  });
});
