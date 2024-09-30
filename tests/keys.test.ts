import { describe, expect, it } from "@jest/globals";
import { PublicKey, PrivateKey } from "o1js";

describe("Keys", () => {
  it(`should check random keys`, async () => {
    const names = ["user", "admin", "tokenContract", "adminContract", "hacker"];
    const keys: any = {};
    for (const name of names) {
      const privateKey = PrivateKey.random();
      const publicKey = privateKey.toPublicKey();
      keys[name] = {
        privateKey: privateKey.toBase58(),
        publicKey: publicKey.toBase58(),
      };
    }
    console.log(keys);
  });
});
