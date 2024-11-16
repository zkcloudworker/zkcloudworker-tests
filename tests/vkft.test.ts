import { describe, expect, it } from "@jest/globals";
import { Cache } from "o1js";
import {
  initBlockchain,
  FungibleTokenAdmin as FTAdmin,
  FungibleToken as FT,
  blockchain,
} from "zkcloudworker";
import { FungibleTokenAdmin } from "../src/FungibleTokenAdmin";
import { verificationKeys } from "../src/vkft";
const chain = "devnet" as blockchain;
const cache = Cache.FileSystem("./cache");

describe("Compile", () => {
  it("should init blockchain", async () => {
    await initBlockchain("devnet");
  });

  it("should compile FungibleTokenAdmin from zkCloudWorker library", async () => {
    console.log("Compiling FungibleTokenAdmin");
    const vk = (await FTAdmin.compile({ cache })).verificationKey;
    console.log("vk", vk.hash.toJSON());
    expect(vk.hash.toJSON()).toBe(verificationKeys.testnet.admin.hash);
  });
  it("should compile from FungibleToken from zkCloudWorker library", async () => {
    console.log("Compiling FungibleToken");
    const vk2 = (await FT.compile({ cache })).verificationKey;
    console.log("vk2", vk2.hash.toJSON());
    expect(vk2.hash.toJSON()).toBe(verificationKeys.testnet.token.hash);
  });
  it("should compile from mina-fungible-token library", async () => {
    console.log("Compiling FungibleTokenAdmin");
    const vk = (await FungibleTokenAdmin.compile({ cache })).verificationKey;
    console.log("vk", vk.hash.toJSON());
    expect(vk.hash.toJSON()).toBe(verificationKeys.testnet.admin.hash);
  });
});
