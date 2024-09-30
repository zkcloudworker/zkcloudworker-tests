import { describe, expect, it } from "@jest/globals";
import { bigintToBase56, LocalStorage } from "zkcloudworker";

describe("Node", () => {
  it(`node`, async () => {
    console.log("Node test", bigintToBase56(200n));
    LocalStorage.data["test"] = "test";
    console.log("bi", bigintToBase56);
  });
});
