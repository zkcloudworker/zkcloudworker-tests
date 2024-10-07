import { describe, expect, it } from "@jest/globals";
import { Experimental, Field } from "o1js";
import {
  deserializeFields,
  serializeFields,
  bigintToBase64,
  bigintFromBase64,
} from "zkcloudworker";
import assert from "node:assert/strict";
const { IndexedMerkleMap } = Experimental;
class MerkleMap extends IndexedMerkleMap(11) {}

describe("Indexed Map", () => {
  it(`should create a map`, async () => {
    const map = new MerkleMap();
    console.log("root:", map.root.toJSON());
    map.set(1n, 2n);
    map.set(2n, 3n);
    console.log("root:", map.root.toJSON());
    const element1 = map.get(1n);
    expect(element1.toBigInt()).toBe(2n);
    const element2 = map.get(2n);
    expect(element2.toBigInt()).toBe(3n);
    console.log(
      "2n",
      map.getOption(2n).isSome.toBoolean(),
      map.getOption(2n).value.toBigInt()
    );
    console.log(
      "3n",
      map.getOption(3n).isSome.toBoolean(),
      map.getOption(3n).value.toBigInt()
    );
    console.log("included 1", map.isIncluded(1n).toBoolean());
    console.log("included 3", map.isIncluded(3n).toBoolean());
    map.insert(4n, 4n);
    map.update(2n, 5n);
    const snapshot = map.clone();
    console.log("root map1:", map.root.toJSON());
    console.log("root map2:", snapshot.root.toJSON());
    /*
    const fields = MerkleMap.provable.toFields(snapshot);
    const aux = MerkleMap.provable.toAuxiliary(snapshot);
    //console.log("aux:", aux[2][0].option.value.nodes[0][0]);
    const auxStr = JSON.stringify(
      aux,
      (_, v) => (typeof v === "bigint" ? "n" + v.toString() : v),
      2
    );
    console.log("aux:", auxStr);
    const str = serializeFields(fields);
    console.log("fields:", str);
    const auxRestored = JSON.parse(auxStr, (_, v) => {
      // Check if the value is a string that represents a BigInt
      if (typeof v === "string" && v[0] === "n") {
        // Remove the first 'n' and convert the string to a BigInt
        return BigInt(v.slice(1));
      }
      return v;
    });
    const map3 = MerkleMap.provable.fromFields(
      deserializeFields(str),
      auxRestored
    ) as MerkleMap;
    const map4 = map3.clone();
    console.log("root map3:", snapshot.root.toJSON());
    expect(map3.root.toJSON()).toBe(map.root.toJSON());
    map4.set(5n, 6n);
    //assert.deepEqual(map3, map);
    */
    const serializedMap = JSON.stringify(
      {
        root: snapshot.root.toJSON(),
        length: snapshot.length.toJSON(),
        nodes: JSON.stringify(snapshot.data.get().nodes, (_, v) =>
          typeof v === "bigint" ? "n" + bigintToBase64(v) : v
        ),
        sortedLeaves: JSON.stringify(
          snapshot.data
            .get()
            .sortedLeaves.map((v) => [
              bigintToBase64(v.key),
              bigintToBase64(v.nextKey),
              bigintToBase64(v.value),
              bigintToBase64(BigInt(v.index)),
            ])
        ),
      },
      null,
      2
    );
    console.log("serializedMap:", serializedMap);
    const json = JSON.parse(serializedMap);
    const nodes = JSON.parse(json.nodes, (_, v) => {
      // Check if the value is a string that represents a BigInt
      if (typeof v === "string" && v[0] === "n") {
        // Remove the first 'n' and convert the string to a BigInt
        return bigintFromBase64(v.slice(1));
      }
      return v;
    });
    const sortedLeaves = JSON.parse(json.sortedLeaves).map((row: any) => {
      return {
        key: bigintFromBase64(row[0]),
        nextKey: bigintFromBase64(row[1]),
        value: bigintFromBase64(row[2]),
        index: Number(bigintFromBase64(row[3])),
      };
    });
    //console.log("data:", data);
    const restoredMap = new MerkleMap();
    restoredMap.root = Field.fromJSON(json.root);
    restoredMap.length = Field.fromJSON(json.length);
    restoredMap.data.updateAsProver(() => {
      return {
        nodes: nodes.map((row: any) => [...row]),
        sortedLeaves: [...sortedLeaves],
      };
    });
    console.log("root restored:", restoredMap.root.toJSON());
    expect(restoredMap.root.toJSON()).toBe(snapshot.root.toJSON());
    restoredMap.set(5n, 6n);
  });
});
