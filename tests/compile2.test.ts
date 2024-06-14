import { describe, expect, it } from "@jest/globals";
import { NFTContractV2, NameContractV2 } from "../src/nft";
import { Mina, PrivateKey, UInt64 } from "o1js";

describe("Compile v2", () => {
  it(`should compile`, async () => {
    const Local = await Mina.LocalBlockchain();
    Mina.setActiveInstance(Local);
    const sender = Local.testAccounts[0];
    const privateKey = PrivateKey.random();
    const publicKey = privateKey.toPublicKey();
    const zkApp = new NameContractV2(publicKey);
    const tx = await Mina.transaction(sender, async () => {
      await zkApp.setPriceLimit(UInt64.from(500_000_000_000));
    });
    await NFTContractV2.compile();
    const vk = (await NameContractV2.compile()).verificationKey;
    console.log("vk 2", vk.hash.toJSON());
  });
});
