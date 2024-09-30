import { describe, expect, it } from "@jest/globals";
import axios from "axios";
import { getPaymentsFromBlockberry } from "../src/blockberry-payments";

describe("Transaction", () => {
  it(`should get the transaction status`, async () => {
    const transaction = await getPaymentsFromBlockberry({
      account: "B62qrXxjA1hHYWWEzXwyAYpjGEuEdS5oZsQh97Z5adxGLyRLEqAfLah", //"B62qqYBxenUcYTRmf4gE3nEjMVHnpqFNHfiHWFDLGm6EKuR6XhYUWXd",
    });
    const list = transaction?.data ?? [];
    //console.log("transaction:", list);
    const lastBlockHeight = 0;
    /*
  {
    type: 'payment',
    direction: 'IN',
    accountAddress: 'B62qouNvgzGaA3fe6G9mKtktCfsEinqj27eqTSvDu4jSKReDEx7A8Vx',
    accountName: 'Binance Wallet 1',
    accountImg: 'https://strapi-dev.scand.app/uploads/binance_Logo_257bfb2b20.png',
    txHash: 'CkpZtdZgXQw2CY3jLpn3EfPZpJJHeoAscwpYsWdwjjWnT92jQgZp1',
    status: 'Applied',
    age: 1713939840000,
    amount: 3981188.717,
    fee: 0.0305,
    blockHeight: 348379,
    stateHash: '3NLMgoPw96bZ7VztnMe6uShmkhaAoswee1jYJgD9vRm8UUb7QXqC',
    memo: '',
    isAmountChangeable: false,
    isZkappAccount: null
  },

    */
    for (const item of list) {
      if (
        item.type === "payment" &&
        item.blockHeight > lastBlockHeight &&
        item.direction === "IN" &&
        item.status === "Applied"
      ) {
        const from = item.accountAddress;
        const amount = item.amount;
        console.log("new transaction:", { from, amount });
      }
    }
  });
});
