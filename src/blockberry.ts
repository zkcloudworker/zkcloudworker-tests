import { BLOCKBERRY_API } from "../env.json";
import axios from "axios";

export async function getTransactionFromBlockberry(params: {
  hash: string;
}): Promise<any> {
  const { hash } = params;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-api-key": "CqSGrmsynz6bHJW6hzSRqokwKGKqGU",
    },
  };

  fetch(
    "https://api.blockberry.one/mina-devnet/v1/transactions/5JuNLMQPrNyLGHwDpttuLX8gVST4oVzobxhCXn7xwieu6XyYR5tn",
    options
  )
    .then((response) => response.json())
    .then((response) => console.log(response))
    .catch((err) => console.error(err));
  //console.log("response:", response.data);
  console.log("getTransactionFromBlockberry hash:", hash, BLOCKBERRY_API);
}
