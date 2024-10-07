import { describe, expect, it } from "@jest/globals";
import { Experimental, Field } from "o1js";
import { serializeIndexedMap, deserializeIndexedMap } from "../src/indexed-map";
const { IndexedMerkleMap } = Experimental;
const MAP_HEIGHT = 20;
const NUMBER_OF_ELEMENTS = 1000;
class MerkleMap extends IndexedMerkleMap(MAP_HEIGHT) {}

describe("Indexed Map serialization", () => {
  it(`should test a serialization and deserialization`, async () => {
    const map = new MerkleMap();
    map.set(1n, 2n);
    map.set(2n, 3n);
    const element1 = map.get(1n);
    expect(element1.toBigInt()).toBe(2n);
    const element2 = map.get(2n);
    expect(element2.toBigInt()).toBe(3n);
    const clonedMap = map.clone();

    const serializedMap = serializeIndexedMap(map);
    const restoredMap = deserializeIndexedMap({
      serializedIndexedMap: serializedMap,
      type: MerkleMap,
    });
    expect(restoredMap).toBeDefined();
    if (restoredMap === undefined) return;

    expect(clonedMap.root.toJSON()).toBe(restoredMap.root.toJSON());
    const mapPrototype = Object.getPrototypeOf(map);
    const restoredMapPrototype = Object.getPrototypeOf(restoredMap);
    const clonedMapPrototype = Object.getPrototypeOf(clonedMap);
    expect(mapPrototype).toEqual(restoredMapPrototype);
    expect(mapPrototype).toEqual(clonedMapPrototype);
    expect(restoredMapPrototype).toEqual(clonedMapPrototype);
    expect(map).toEqual(restoredMap);
    expect(map).toEqual(clonedMap);
    expect(restoredMap).toEqual(clonedMap);

    const restoredMap2 = deserializeIndexedMap({
      serializedIndexedMap: serializedMap,
      type: MerkleMap,
    });
    expect(restoredMap2).toBeDefined();
    if (restoredMap2 === undefined) return;
    expect(restoredMap2).toEqual(map);
  });
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
    console.time("clone");
    const clonedMap = map.clone();
    console.timeEnd("clone");
    console.time("serialization");
    const serializedMap = serializeIndexedMap(map);
    console.timeEnd("serialization");
    console.log("serializedMap.length:", serializedMap.length);
    console.time("deserialization");
    const restoredMap = deserializeIndexedMap({
      serializedIndexedMap: serializedMap,
      type: MerkleMap,
    });
    console.timeEnd("deserialization");
  });
});
