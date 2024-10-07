import { describe, expect, it } from "@jest/globals";
import { Experimental, Field } from "o1js";
import { bigintToBase64, bigintFromBase64 } from "zkcloudworker";
import { serializeIndexedMap, deserializeIndexedMap } from "../src/indexed-map";
import assert from "assert";
const { IndexedMerkleMap } = Experimental;
const MAP_HEIGHT = 11;
class MerkleMap extends IndexedMerkleMap(MAP_HEIGHT) {}

describe("Indexed Map", () => {
  it(`should create a map`, async () => {
    const map = new MerkleMap();
    map.set(1n, 2n);
    map.set(2n, 3n);
    const element1 = map.get(1n);
    expect(element1.toBigInt()).toBe(2n);
    const element2 = map.get(2n);
    expect(element2.toBigInt()).toBe(3n);
    const clonedMap = map.clone();

    const serializedMap = serializeIndexedMap(map);
    const restoredMap = deserializeIndexedMap(serializedMap);
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
  });
});
