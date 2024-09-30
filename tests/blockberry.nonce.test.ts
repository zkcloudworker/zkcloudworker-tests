import { describe, expect, it } from "@jest/globals";
import { getZkAppTxsFromBlockberry } from "../src/blockberry-zkapp";
import { getLastTxFromBlockberry } from "../src/blockberry-payments";

describe("Transaction", () => {
  it(`should get the transaction status`, async () => {
    const zkTxs = await getZkAppTxsFromBlockberry({
      account: "B62qo69VLUPMXEC6AFWRgjdTEGsA3xKvqeU5CgYm3jAbBJL7dTvaQkv",
    });

    const paymentTx = await getLastTxFromBlockberry({
      account: "B62qo69VLUPMXEC6AFWRgjdTEGsA3xKvqeU5CgYm3jAbBJL7dTvaQkv",
    });
    const zkNonce = zkTxs?.data[0]?.nonce ?? 0;
    const paymentNonce = paymentTx?.data[0]?.nonce ?? 0;
    console.log("zkNonce:", zkNonce);
    console.log("paymentNonce:", paymentNonce);
    const nonce = Math.max(zkNonce, paymentNonce) + 1;
    console.log("nonce:", nonce);
  });
});
