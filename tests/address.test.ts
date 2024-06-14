import { describe, expect, it } from "@jest/globals";
import axios from "axios";
import { getTransactionFromBlockberry } from "../src/blockberry";

describe("Transaction", () => {
  it(`should get the transaction status`, async () => {
    const transaction = await getTransactionFromBlockberry({
      hash: "5JuL8CrReDFXvr4UY5Ux9hqPPpPA3NnTqm3sye574o6bn4W7rknq",
    });
    console.log("transaction:", transaction);
  });
});
