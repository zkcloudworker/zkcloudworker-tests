import { describe, expect, it } from "@jest/globals";
import { BLOCKBERRY_API } from "../env.json";

const account = "B62qjfdH7rsiSb8p8yxLKBwCjUuBqgu36bVjjaAqTPm7aNGN42AWPkF";

describe("Transaction", () => {
  it(`should get the transaction status`, async () => {
    const zkAppTxs = await getZkAppTxsFromBlockberry(account);
    console.log("zkAppTxs", zkAppTxs);
    const paymentTxs = await getPaymentTxsFromBlockberry(account);
    console.log("paymentTxs", paymentTxs);
    let zkNonce = -1;
    let found = false;
    const size = zkAppTxs?.data?.length ?? 0;
    let i = 0;
    while (!found && i < size) {
      if (zkAppTxs?.data[i]?.proverAddress === account) {
        zkNonce = zkAppTxs?.data[i]?.nonce;
        found = true;
      }
      i++;
    }
    const paymentNonce = paymentTxs?.data[0]?.nonce ?? -1;
    const nonce = Math.max(zkNonce, paymentNonce);
    console.log("nonce", { zkNonce, paymentNonce, nonce });
  });
});

async function getZkAppTxsFromBlockberry(account: string) {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-api-key": BLOCKBERRY_API,
    },
  };
  try {
    const response = await fetch(
      `https://api.blockberry.one/mina-mainnet/v1/zkapps/accounts/${account}/txs?size=10&orderBy=DESC&sortBy=AGE`,
      options
    );
    const result = await response.json();
    //console.log("zkAppTxs", result);
    return result;
  } catch (err) {
    console.error(err);
    return undefined;
  }
}

async function getPaymentTxsFromBlockberry(account: string) {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-api-key": BLOCKBERRY_API,
    },
  };

  try {
    const response = await fetch(
      "https://api.blockberry.one/mina-mainnet/v1/accounts/" +
        account +
        "/txs?page=0&size=1&orderBy=DESC&sortBy=AGE&direction=OUT",
      options
    );
    const result = await response.json();
    //console.log("paymentTxs", result);
    return result;
  } catch (err) {
    console.error(err);
    return undefined;
  }
}
