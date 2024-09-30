import { time } from "console";
import { BLOCKBERRY_API } from "../env.json";
import { sleep } from "zkcloudworker";

export async function getZkAppFromBlockberry(params: {
  account: string;
}): Promise<any> {
  const { account } = params;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-api-key": BLOCKBERRY_API,
    },
  };
  while (true) {
    try {
      const response = await fetch(
        "https://api.blockberry.one/mina-mainnet/v1/zkapps/" + account,
        options
      );
      const result = await response.json();
      //console.log("result:", result);
      return result;
    } catch (err) {
      console.error(err);
      await sleep(10000);
    }
  }
}

export async function getZkAppTxsFromBlockberry(params: {
  account: string;
  chain: "mainnet" | "devnet";
}): Promise<any> {
  const { account, chain } = params;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-api-key": BLOCKBERRY_API,
    },
  };
  while (true) {
    try {
      const response = await fetch(
        `https://api.blockberry.one/mina-${chain}/v1/zkapps/accounts/${account}/txs?size=20&orderBy=DESC&sortBy=AGE`,
        options
      );
      const result = await response.json();
      //console.log("result:", result);
      return result;
    } catch (err) {
      console.error(err);
      await sleep(10000);
    }
  }
}

export async function getZkAppTxFromBlockberry(params: {
  hash: string;
  chain: "mainnet" | "devnet";
}): Promise<any> {
  const { hash, chain } = params;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-api-key": BLOCKBERRY_API,
    },
  };
  try {
    const response = await fetch(
      // https://api.blockberry.one/mina-devnet/v1/zkapps/txs/{txHash}
      // https://api.blockberry.one/mina-devnet/v1/zkapps/txs/raw/{txHash}
      `https://api.blockberry.one/mina-${chain}/v1/zkapps/txs/raw/${hash}`,
      options
    );
    const result = await response.json();
    //console.log("result:", result);
    return result;
  } catch (err) {
    console.error(err);
    await sleep(10000);
  }
}

export async function getAllZkAppTxsFromBlockberry(params: {
  page: number;
}): Promise<any> {
  const { page } = params;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-api-key": BLOCKBERRY_API,
    },
  };

  while (true) {
    try {
      const response = await fetch(
        `https://api.blockberry.one/mina-mainnet/v1/zkapps/txs?page=${page}&size=50&orderBy=DESC&sortBy=AGE`,
        options
      );
      const result = await response.json();
      //console.log("result:", result);
      return result;
    } catch (err) {
      console.error(err);
      await sleep(10000);
    }
  }
}

//https://api.blockberry.one/mina-mainnet/v1/zkapps/B62qnVvgzispkNmAoPCFGn5bpUiYxd84aakDnqHQDaPsYew2nL3SSKH

//--url 'https://api.blockberry.one/mina-mainnet/v1/zkapps/accounts/B62qnVvgzispkNmAoPCFGn5bpUiYxd84aakDnqHQDaPsYew2nL3SSKH/txs?page=0&size=20&orderBy=DESC&sortBy=AGE'
//--url https://api.blockberry.one/mina-mainnet/v1/zkapps/B62qnVvgzispkNmAoPCFGn5bpUiYxd84aakDnqHQDaPsYew2nL3SSKH \
