import { describe, expect, it } from "@jest/globals";
import { accountBalanceMina, initBlockchain } from "zkcloudworker";
import { PublicKey, Mina, TokenId, PrivateKey } from "o1js";
import {
  getBalanceFromGraphQL,
  defaultToken,
  getAccountFromGraphQL,
  getTransactionFromGraphQL,
} from "../src/graphql";
const address = "B62qkypHv1JJkW3kHw9jxe8tPz6guj5d8BQQuDt4atVHGq4qyvBNAME";
const endpoint = "https://api.minascan.io/node/devnet/v1/graphql";

describe("Balance", () => {
  it(`should get the balance`, async () => {
    await initBlockchain("devnet");

    const publicKey = PublicKey.fromBase58(address);
    const balance = await accountBalanceMina(publicKey);
    console.log("address:", publicKey.toBase58());
    console.log("balance:", balance);

    const balanceGraphQL = await getBalanceFromGraphQL({
      publicKey: address,
      mina: [endpoint],
    });
    console.log("balance graphQL:", balanceGraphQL);
  });
});
