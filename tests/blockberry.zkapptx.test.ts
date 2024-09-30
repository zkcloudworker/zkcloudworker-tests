import { describe, expect, it } from "@jest/globals";
import { getZkAppTxFromBlockberry } from "../src/blockberry-zkapp";
import fs from "fs/promises";

const hash = "5JvQtGB1pShSNmj4B7x2W4eLtitAY9STZxqezHzRyru1r5N1kXin";
describe("Transaction", () => {
  it(`should get the transaction`, async () => {
    const zkapp = await getZkAppTxFromBlockberry({
      hash,
      chain: "devnet",
    });
    //console.log("zkapp txs:", zkapp);
    await fs.writeFile(`${hash}.json`, JSON.stringify(zkapp, null, 2));
  });
});
