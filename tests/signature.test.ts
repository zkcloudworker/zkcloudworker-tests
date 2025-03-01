import { describe, expect, it } from "@jest/globals";
import { PublicKey, Mina, TokenId, PrivateKey, Field, Signature } from "o1js";
import Client from "mina-signer";

const chain = "devnet" as string;

const client = new Client({
  network: chain === "mainnet" ? "mainnet" : "testnet",
});

const privateKeyBigint: bigint[] = [
  1n,
  8587964826761095463462842966570135459501268030774015181276223112360299085188n,
];
const publicKeyBigint: bigint[] = [
  23870790172301888504759036806304867767472357997524493282691794869180801897430n,
  1n,
];

let privateKey: string;
let publicKey: string;
const message = [123n, 456n];
let signature: string;
let signatureBigint: bigint[] = [
  19996910013141570341263734673999978016031842709489071252992906391155381778902n,
  0n,
  1977752958886643393594701383065684494627963631570008137587699340120037729684n,
];

describe("Signature", () => {
  it(`should create keys`, async () => {
    const privateKeyFields = PrivateKey.fromFields(
      privateKeyBigint.map((f) => Field.from(f))
    );
    const publicKeyFields = PublicKey.fromFields(
      publicKeyBigint.map((f) => Field.from(f))
    );
    privateKey = privateKeyFields.toBase58();
    publicKey = publicKeyFields.toBase58();
    console.log("privateKey:", privateKey);
    console.log("publicKey:", publicKey);
    expect(privateKeyFields.toPublicKey().toBase58()).toBe(publicKey);
    // console.log(
    //   "privateKey bigints:",
    //   PrivateKey.toFields(privateKey).map((f) => f.toBigInt())
    // );
    // console.log(
    //   "publicKey bigints:",
    //   PublicKey.toFields(publicKey).map((f) => f.toBigInt())
    // );
  });
  it(`should sign`, async () => {
    const signedMessage = client.signFields(message, privateKey);
    signature = signedMessage.signature;
    console.log("signature:", signature);
    // const signatureFields = Signature.fromBase58(signature);
    // signatureBigint = Signature.toFields(signatureFields).map((f) =>
    //   f.toBigInt()
    // );
    // console.log("signatureBigint:", signatureBigint);
  });
  it(`should verify`, async () => {
    const verified = client.verifyFields({
      data: message,
      signature,
      publicKey,
    });
    console.log("verified:", verified);
  });
  it(`should verify bigint signature`, async () => {
    const signatureRestored = Signature.fromFields(
      signatureBigint.map((f) => Field.from(f))
    ).toBase58();
    const verified = client.verifyFields({
      data: message,
      signature: signatureRestored,
      publicKey,
    });
    console.log("verified restored:", verified);
  });
});
