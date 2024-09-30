import { describe, expect, it } from "@jest/globals";
import { Field, SmartContract, method, state, State, Mina, Cache } from "o1js";
import {
  FungibleToken,
  FungibleTokenAdmin,
  initBlockchain,
} from "zkcloudworker";

const cacheFull = "./cache-full";
const cacheMinimal = "./cache-minimal";

describe("Compile token", () => {
  it.skip(`should compile with full cache`, async () => {
    await initBlockchain("devnet");
    const cache = Cache.FileSystem(cacheFull);
    const vkAdmin = await FungibleTokenAdmin.compile({ cache });
    console.log("vkAdmin", vkAdmin.verificationKey.hash.toJSON());
    const vkToken = await FungibleToken.compile({ cache });
    console.log("vkToken", vkToken.verificationKey.hash.toJSON());
  });
  it.skip(`should compile with minimal cache`, async () => {
    await initBlockchain("devnet");
    const cache = Cache.FileSystem(cacheMinimal);
    const vkAdmin = await FungibleTokenAdmin.compile({ cache });
    console.log("vkAdmin", vkAdmin.verificationKey.hash.toJSON());
    const vkToken = await FungibleToken.compile({ cache });
    console.log("vkToken", vkToken.verificationKey.hash.toJSON());
  });
  it(`should get verification keys`, async () => {
    const chain = "devnet";
    await initBlockchain(chain);
    const cache = Cache.FileSystem(cacheFull);
    const adminVerificationKey = (await FungibleTokenAdmin.compile({ cache }))
      .verificationKey;
    const contractVerificationKey = (await FungibleToken.compile({ cache }))
      .verificationKey;
    const json = {
      admin: {
        hash: adminVerificationKey.hash.toJSON(),
        data: adminVerificationKey.data,
      },
      token: {
        hash: contractVerificationKey.hash.toJSON(),
        data: contractVerificationKey.data,
      },
    };
    console.log("chain", chain);
    console.log(json);
  });
});
