import { describe, expect, it } from "@jest/globals";
import { PublicKey } from "o1js";

const address = "B62qjpZBVp8NDku1nQLMmxVGe4ucYdXQ1DCJYW4ikgCjyaFTUGsbb6w";

describe("Public Key", () => {
  it(`should decode public key`, async () => {
    const pk = PublicKey.fromBase58(address);
    console.log("public key:", pk.x.toJSON(), pk.isOdd.toField().toJSON());
  });
});
