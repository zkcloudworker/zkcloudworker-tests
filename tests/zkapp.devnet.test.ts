import { describe, expect, it } from "@jest/globals";
import { getAccountFromGraphQL, Devnet, sleep } from "zkcloudworker";
import { TestContract } from "../src/contract";
import { verifySmartContract } from "../src/vk";

describe("Account", () => {
  it(`should get the account`, async () => {
    const account = await getAccountFromGraphQL({
      publicKey: "B62qnzkHunByjReoEwMKCJ9HQxZP2MSYcUe8Lfesy4SpufxWp3viNFT",
      mina: ["https://api.minascan.io/node/devnet/v1/graphql"],
    });

    console.log("account:", account);

    /*

    const methods = await TestContract.analyzeMethods();
    const name = TestContract.name;
    console.log("methods:", { name, methods, gates: methods.setValue.gates });
    const vk = await TestContract.compile();
    console.log("vk1:", vk.verificationKey);
    
    const vk = await verifySmartContract(TestContract);
    console.log("vk2:", vk);
    */
  });
});
