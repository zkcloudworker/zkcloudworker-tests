import { describe, expect, it } from "@jest/globals";
import {
  getTokensByAddress,
  getAllTokensByAddress,
} from "../src/blockberry-tokens";
import { PublicKey, TokenId } from "o1js";
import { FungibleToken } from "zkcloudworker";

const tokenIdStr = "xxTGeJUBw8ExJGhq5MvrPzLTEpybnht6zU9Rux4kJyEdsmHzuU";

describe("Tokens", () => {
  it(`should get the tokens by address`, async () => {
    const tokens = await getAllTokensByAddress({
      account: "B62qobAYQBkpC8wVnRzydrtCgWdkYTqsfXTcaLdGq1imtqtKgAHN29K",
      //"B62qmZsubZXnjZr9XpTKJVtcyiDSDHN7o5tcctupQPgeLUZSMYnzqyH",
      chain: "devnet",
    });
    console.log("tokens:", tokens.length);
  });
  it.skip(`should calculate the tokenId`, async () => {
    const address = "B62qipaYZLRBsAKA9pxsyqnfkTWrgEDNmLQt9sEkUnog3JsfW6FCJ1e";
    const tokenIdStr = "xxTGeJUBw8ExJGhq5MvrPzLTEpybnht6zU9Rux4kJyEdsmHzuU";
    const token = new FungibleToken(PublicKey.fromBase58(address));
    const tokenId = token.deriveTokenId();
    const tokenIdStr1 = TokenId.toBase58(tokenId);
    console.log("tokenIdStr1:", tokenIdStr1);
    expect(tokenIdStr1).toBe(tokenIdStr);

    // TokenId.toBase58
  });
});
