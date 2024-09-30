import { describe, expect, it } from "@jest/globals";
import { fetchLastBlock, Mina } from "o1js";
import { blockchain, initBlockchain } from "zkcloudworker";

const chain: blockchain = "mainnet";

describe("fetchLastBlock", () => {
  it(`should fetch last block on devnet`, async () => {
    /*
    const networkInstance = Mina.Network({
      mina: "https://api.minascan.io/node/devnet/v1/graphql",
    });
    Mina.setActiveInstance(networkInstance);
    */
    console.log("networkId before init", Mina.getNetworkId().toString());
    await initBlockchain(chain);
    console.log("networkId after init", Mina.getNetworkId().toString());
    const lastBlock = await fetchLastBlock();
    console.log(
      `${chain} globalSlotSinceGenesis:`,
      lastBlock.globalSlotSinceGenesis.toBigint()
    );
  });
  it.skip(`should fetch last block on local blockchain`, async () => {
    const Local = await Mina.LocalBlockchain();
    Mina.setActiveInstance(Local);
    const lastBlock = await fetchLastBlock();
    console.log("local lastBlock:", lastBlock);
  });
});
