import { describe, expect, it } from "@jest/globals";
import axios from "axios";
import { accountBalance, initBlockchain } from "zkcloudworker";
import { PublicKey, Mina, TokenId, PrivateKey } from "o1js";
import {
  getBalanceFromGraphQL,
  defaultToken,
  getAccountFromGraphQL,
  getTransactionFromGraphQL,
} from "../src/graphql";

const endpoint = "https://api.minascan.io/node/devnet/v1/graphql";
//"https://proxy.berkeley.minaexplorer.com/graphql";
//"https://api.minascan.io/node/devnet/v1/graphql";
// "https://proxy.devnet.minaexplorer.com/graphql"; //

const archiveEndpoint = "https://api.minascan.io/archive/devnet/v1/graphql";

describe("Balance", () => {
  it(`should get the balance`, async () => {
    //initBlockchain("devnet");
    /*
    const networkInstance = Mina.Network({
      mina: endpoint,
    });
    Mina.setActiveInstance(networkInstance);
    const receiver1 = PublicKey.fromBase58(
      "B62qoUR5QuY1A19PwK3xBNKYkW4iPVNxfBTmU1TPQutgRu4gqBvDFST"
    );
    const receiver2 = PublicKey.fromBase58(
      "B62qiTrtDyWmDFMQvUDRUdWVsVwNFhUV4rkPVgeANi4adKhrUwfdNFT"
    );

    const receiverZero = PrivateKey.random().toPublicKey();

    const defaultTokenCalculated = TokenId.toBase58(TokenId.default);
    console.log("default tokeId:", defaultToken);
    expect(defaultTokenCalculated).toBe(defaultToken);
    const balance1GraphQL = await getBalanceFromGraphQL({
      publicKey: receiver1.toBase58(),
      mina: [endpoint],
    });
    const balance2GraphQL = await getBalanceFromGraphQL({
      publicKey: receiver2.toBase58(),
      mina: [endpoint],
    });
    const balanceZeroGraphQL = await getBalanceFromGraphQL({
      publicKey: receiverZero.toBase58(),
      mina: [endpoint],
    });
    const balance1 = await accountBalance(receiver1);
    const balance2 = await accountBalance(receiver2);

    expect(balance1GraphQL).toBe(balance1.toBigInt());
    expect(balance2GraphQL).toBe(balance2.toBigInt());
    expect(balanceZeroGraphQL).toBe(0n);
    console.log("balance of the receivers:", {
      balance1: balance1GraphQL,
      balance2: balance2GraphQL,
      balanceZero: balanceZeroGraphQL,
    });
    

    const account = await getAccountFromGraphQL({
      publicKey: "B62qoUR5QuY1A19PwK3xBNKYkW4iPVNxfBTmU1TPQutgRu4gqBvDFST",
      mina: [endpoint],
    });
    console.log("account:", account);

    const transaction = await getTransactionFromGraphQL({
      txnId: "5JuL8CrReDFXvr4UY5Ux9hqPPpPA3NnTqm3sye574o6bn4W7rknq",
      mina: [endpoint],
    });
    console.log("transaction:", transaction);


    const balance1GraphQL = await getBalanceFromGraphQL({
      publicKey: "B62qoUR5QuY1A19PwK3xBNKYkW4iPVNxfBTmU1TPQutgRu4gqBvDFST",
      mina: [endpoint],
    });
    console.log("balance1GraphQL:", balance1GraphQL);
*/

    const response = await axios.post(archiveEndpoint, {
      query: `{\n  zkapp(query: {hash: "5JuL8CrReDFXvr4UY5Ux9hqPPpPA3NnTqm3sye574o6bn4W7rknq"}) {
        blockHeight
        failureReason {
          failures
          index
        }    
      }\n}`,
      variables: null,
    });
    console.log("response:", response.data, response.data.errors[0].locations);
  });
});
