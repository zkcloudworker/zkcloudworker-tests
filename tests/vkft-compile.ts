import { Cache, Mina } from "o1js";
import { FungibleTokenAdmin } from "mina-fungible-token";
import { verificationKeys } from "../src/vkft";

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
