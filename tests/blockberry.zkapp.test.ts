import { describe, expect, it } from "@jest/globals";
import axios from "axios";
import { getZkAppFromBlockberry } from "../src/blockberry-zkapp";

describe("Transaction", () => {
  it(`should get the transaction status`, async () => {
    const zkapp = await getZkAppFromBlockberry({
      account: "B62qnzkHunByjReoEwMKCJ9HQxZP2MSYcUe8Lfesy4SpufxWp3viNFT",
    });
    console.log("zkapp:", zkapp);
  });
});
