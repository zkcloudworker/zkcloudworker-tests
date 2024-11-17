import { describe, expect, it } from "@jest/globals";
import { PrivateKey } from "o1js";

const NUMBER_OF_ITERATIONS = 10000;

/*
  address    String  @id @pattern("^B62[1-9A-HJ-NP-Za-km-z]{52}$") 
  email      String  @db.VarChar(255) @pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")
  jobId String @pattern("^zkCW[1-9A-HJ-NP-Za-km-z]+$")
*/

describe("Regex", () => {
  it("should test regex", async () => {
    for (let i = 0; i < NUMBER_OF_ITERATIONS; i++) {
      const address = PrivateKey.random().toPublicKey().toBase58();
      const result = checkAddress(address);
      expect(result).toBe(true);
      if (!result) {
        console.log("Failed:", address);
      }
      const result1 = checkAddress(address.slice(-1));
      expect(result1).toBe(false);
      if (result1) {
        console.log("Failed -1:", address.slice(-1));
      }
      const result2 = checkAddress(address + "0");
      expect(result2).toBe(false);
      if (result2) {
        console.log("Failed 0:", address + "0");
      }
      let address3 = address;
      address3 =
        address3.substring(0, Math.floor(Math.random() * address.length)) +
        "0" +
        address3.substring(Math.floor(Math.random() * address.length) + 1);
      const result3 = checkAddress(address3);
      expect(result3).toBe(false);
      if (result3) {
        console.log("Failed random:", address3);
      }
    }
  });
});

function checkAddress(address: string): boolean {
  const regex = /^B62[1-9A-HJ-NP-Za-km-z]{52}$/;
  return regex.test(address);
}
