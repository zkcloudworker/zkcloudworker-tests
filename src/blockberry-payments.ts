import { BLOCKBERRY_API } from "../env.json";

export async function getPaymentsFromBlockberry(params: {
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

  try {
    const response = await fetch(
      "https://api.blockberry.one/mina-mainnet/v1/accounts/" +
        account +
        "/txs?page=0&size=10&orderBy=DESC&sortBy=AGE&direction=IN",
      options
    );
    const result = await response.json();
    //console.log("result:", result);
    return result;
  } catch (err) {
    console.error(err);
    return undefined;
  }
}

export async function getLastTxFromBlockberry(params: {
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

  try {
    const response = await fetch(
      "https://api.blockberry.one/mina-mainnet/v1/accounts/" +
        account +
        "/txs?page=0&size=2&orderBy=DESC&sortBy=AGE&direction=OUT",
      options
    );
    const result = await response.json();
    //console.log("result:", result);
    return result;
  } catch (err) {
    console.error(err);
    return undefined;
  }
}
