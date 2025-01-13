import { describe, expect, it } from "@jest/globals";
import axios from "axios";
import {
  getZkAppFromBlockberry,
  getZkAppTxsFromBlockberry,
  getAllZkAppTxsFromBlockberry,
} from "../src/blockberry-zkapp";

const hash = "5JtsHjSQhZxsdvhxJVDv2JxEVYTLGv9fXVoukbdMEcNdzRBijp2H";
//"5JuWEsnFvEzTJ7PuCPdRgXt9wGNGJTBL1V9Z8ecNL24j2YsTMisu";
//"5JvCKtiL6zqdNxN1kdLrRkhz7JGEQRMcsxfW4s4A16tsYGWRqHs6";
const lastTokenCount = 0;
const lastTokenAdminCount = 0;
// mainnet
const tokenVerificationKeyHash =
  "12320223354843720065815824451082596238990220882343256724550451075683722289248";
const adminVerificationKeyHash =
  "16115269877914581564299853766147447229664556890591132763176560855029019233817";
const account = "B62qs2NthDuxAT94tTFg6MtuaP1gaBxTZyNv9D3uQiQciy1VsaimNFT"; //"B62qnVvgzispkNmAoPCFGn5bpUiYxd84aakDnqHQDaPsYew2nL3SSKH";

const nft = "B62qs2NthDuxAT94tTFg6MtuaP1gaBxTZyNv9D3uQiQciy1VsaimNFT";
const punk = "B62qjwDWxjf4LtJ4YWJQDdTNPqZ69ZyeCzbpAFKN7EoZzYig5ZRz8JE";
const punkMemos = [
  "punk",
  "vote",
  "voting",
  "Deploy off-chain zkapp",
  "PUNK",
  "charge Tx Fee 10",
  "charge Tx Fee10",
  "charge Tx Fee 8",
  "charge Tx Fee 16",
  "Test ZKApp to Receiver",
  "PunkToMina",
  "MINA_TO_PUNK",
  "Swap",
];

const accounts: string[] = [];
const zkAppAccount: any[] = [];

describe("Transaction", () => {
  it.skip(`should get the zkApp`, async () => {
    const zkApp = await getZkAppFromBlockberry({
      account,
    });
    console.log("zkApp:", zkApp.zkAppURI);
  });
  it.skip(`should get the transaction status`, async () => {
    const transactions = await getZkAppTxsFromBlockberry({
      account,
      chain: "mainnet",
    });
    console.log("transactions:", transactions.totalElements);
  });
  it.skip(`should get the transaction number`, async () => {
    const zkApp = await getZkAppFromBlockberry({
      account,
    });
    const transactions = await getZkAppTxsFromBlockberry({
      account,
      chain: "mainnet",
    });
    console.log(account, zkApp.zkAppURI, transactions.totalElements);
  });
  it(`should get all transactions`, async () => {
    let last = false;
    let page = 0;
    let count = 0;
    let txsCount = 0;
    let tokenCount = 0;
    let tokenAdminCount = 0;
    let printed = false;
    let foundHash = false;
    while (!last) {
      const transactions = await getAllZkAppTxsFromBlockberry({ page: page++ });
      last = transactions.last;

      for (const item of transactions.data) {
        if (item.hash === hash) {
          last = true;
          foundHash = true;
        }
        if (!printed && item.status === "applied") {
          console.log("First item hash:", item.hash);
          printed = true;
        }
        if (foundHash === false) {
          txsCount++;
          if (item.updatedAccounts) {
            const updatedAccounts: string[] = [];
            for (const account of item.updatedAccounts) {
              updatedAccounts.push(account.accountAddress);
            }
            if (
              updatedAccounts.indexOf(nft) < 0 &&
              updatedAccounts.indexOf(punk) < 0
            ) {
              let punk = false;
              for (const memo of punkMemos) {
                // check if item.memo contains the substring memo
                if (item.memo.includes(memo)) punk = true;
              }
              if (!punk) {
                //console.log("item:", item);
                if (item.memo !== "" && item.memo !== undefined)
                  console.log("item:", item.memo);
                for (const account of updatedAccounts) {
                  if (accounts.indexOf(account) < 0) {
                    accounts.push(account);
                  }
                }
              }
            }
          } else console.error("item error:", item);
        }
      }
      console.log("page:", page, transactions.last, accounts.length);
    }
    console.log("txsCount:", txsCount);
    console.log("accounts:", accounts.length);
    console.log("accounts:", accounts);
    for (const account of accounts) {
      const zkApp = await getZkAppFromBlockberry({ account });
      let isToken = false;
      if (zkApp.verificationKeyHash === tokenVerificationKeyHash) {
        tokenCount++;
        isToken = true;
      }
      if (zkApp.verificationKeyHash === adminVerificationKeyHash) {
        tokenAdminCount++;
        isToken = true;
      }
      if (!isToken && zkApp.zkAppState !== null) {
        console.log("zkApp:", account, zkApp.zkAppURI);
        const txs = await getZkAppTxsFromBlockberry({
          account,
          chain: "mainnet",
        });

        for (const tx of txs.data) {
          //console.log(tx.hash, tx.status);
        }
        zkAppAccount.push({
          account,
          zkAppURI: zkApp.zkAppURI,
          txs: txs.totalElements,
        });
      }
    }
    console.log("zkAppAccounts:", zkAppAccount.length);
    console.log("new token accounts:", tokenCount - lastTokenCount);
    console.log(
      "new token admin accounts:",
      tokenAdminCount - lastTokenAdminCount
    );
  });
});
