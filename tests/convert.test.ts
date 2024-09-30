import { describe, expect, it } from "@jest/globals";
import { Field, PublicKey, PrivateKey } from "o1js";
import { convertFieldsToPublicKey } from "../src/convert";

const addressFields: string[] = [
  "9938549834568348486024228125160774343795968951916393733251207678857993787005",
  "0",
];
const adminAddress = "B62qneUfhxHJASYytyzGTb3WaXZsSuor2scrCeLGkJPBy8pZhj6Q6bs";

describe("Convert", () => {
  it(`should convert with o1js`, async () => {
    const addressString = PublicKey.fromFields(
      addressFields.map((f) => Field.fromJSON(f))
    ).toBase58();
    console.log("addressString:", addressString); //B62qneUfhxHJASYytyzGTb3WaXZsSuor2scrCeLGkJPBy8pZhj6Q6bs
    expect(addressString).toBe(adminAddress);
  });
  it(`should convert with code`, async () => {
    const addressString = convertFieldsToPublicKey(addressFields);
    console.log("addressString:", addressString); //B62qneUfhxHJASYytyzGTb3WaXZsSuor2scrCeLGkJPBy8pZhj6Q6bs
    expect(addressString).toBe(adminAddress);
  });
  it(`should check random keys`, async () => {
    for (let i = 0; i < 1000; i++) {
      const privateKey = PrivateKey.random();
      const publicKey = privateKey.toPublicKey();
      const publicKeyString = publicKey.toBase58();
      const fields = publicKey.toFields().map((f) => f.toJSON());
      const addressString = convertFieldsToPublicKey(fields);
      expect(addressString).toBe(publicKeyString);
    }
  });
});
