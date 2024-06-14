import { describe, expect, it } from "@jest/globals";
import { NFTContractV2, NameContractV2 } from "../src/nft";
import { Mina } from "o1js";

describe("Compile v1", () => {
  it(`should compile`, async () => {
    const Local = await Mina.LocalBlockchain();
    Mina.setActiveInstance(Local);
    const vkNFT = (await NFTContractV2.compile()).verificationKey;
    console.log("vk 1 nft", vkNFT.hash.toJSON());
    const vkName = (await NameContractV2.compile()).verificationKey;
    console.log("vk 1 name", vkName.hash.toJSON());
  });
});
