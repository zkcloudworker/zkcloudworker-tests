import { describe, expect, it } from "@jest/globals";
import { geo } from "../src/geo";

describe("Geo", () => {
  it(`should get the geo`, async () => {
    const result = await geo();
    console.log("geo:", result);
  });
});
