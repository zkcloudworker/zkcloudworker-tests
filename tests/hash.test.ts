import { describe, expect, it } from "@jest/globals";
import axios from "axios";
import { fieldToBase56, makeString } from "zkcloudworker";
import { PublicKey, Mina, TokenId, PrivateKey, Field } from "o1js";
import crypto from "crypto";

// Define a struct (interface in TypeScript) for the data
interface DataStruct {
  currentTime: string;
  dataString: string;
}

// Function to get the current time in ISO format
function getCurrentTime(): string {
  return new Date().toISOString();
}

// Function to create a DataStruct
function createDataStruct(dataString: string): DataStruct {
  return {
    currentTime: getCurrentTime(),
    dataString,
  };
}

// Function to calculate SHA-256 hash of the DataStruct
function calculateSHA256(data: DataStruct): string {
  const jsonString = JSON.stringify(data);
  const hash = crypto.createHash("sha256");
  hash.update(jsonString);
  return hash.digest("hex");
}

describe("Balance", () => {
  it(`should get the balance`, async () => {
    const field = Field.random();
    const str = fieldToBase56(field);
    console.log("field:", str);
    const struct = createDataStruct(makeString(50));
    console.log("struct:", struct);
    const hash = calculateSHA256(struct);
    console.log("hash:", hash);
  });
});
