import { describe, expect, it } from "@jest/globals";
import { PublicKey } from "o1js";
import { initBlockchain, accountBalanceMina, sleep } from "zkcloudworker";

describe("Devnet", () => {
  it(`should get the balance`, async () => {
    initBlockchain("devnet");
    while (true) {
      const balance = await accountBalanceMina(
        PublicKey.fromBase58(
          "B62qpC77Fr5rDqsGrGwDJdgPcQtqCE4euHddDNPoT8vBVmbXCRKDFST"
        )
      );
      console.log("balance:", balance);
      await sleep(10000);
    }
  });
});
