import { Cache, Mina } from "o1js";
import { FungibleTokenAdmin } from "../src/FungibleTokenAdmin.js";
import { verificationKeys } from "../src/vkft.js";

async function compile() {
  const network = await Mina.LocalBlockchain();
  Mina.setActiveInstance(network);
  const cache = Cache.FileSystem("./cache");

  console.log("Compiling FungibleTokenAdmin");
  const vk = (await FungibleTokenAdmin.compile({ cache })).verificationKey;
  console.log("vk", vk.hash.toJSON());
  expect(vk.hash.toJSON()).toBe(verificationKeys.testnet.admin.hash);
}

compile();
