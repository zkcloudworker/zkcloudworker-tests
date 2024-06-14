import { describe, expect, it } from "@jest/globals";
import { PublicKey } from "o1js";
import { initBlockchain, accountBalanceMina } from "zkcloudworker";

describe("Mainnet", () => {
  it(`should get the balance`, async () => {
    initBlockchain("mainnet");
    const balance = await accountBalanceMina(
      PublicKey.fromBase58(
        "B62qn4SxXSBZuCUCKH3ZqgP32eab9bKNrEXkjoczEnerihQrSNnxoc5"
      )
    );
    console.log("balance:", balance);
  });
});
