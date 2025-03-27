import { describe, expect, it } from "@jest/globals";
import {
  PublicKey,
  Mina,
  TokenId,
  PrivateKey,
  Field,
  Signature,
  Poseidon,
} from "o1js";
import Client from "mina-signer";

const chain = "devnet" as string;

const client = new Client({
  network: chain === "mainnet" ? "mainnet" : "testnet",
});

const message = [659432634n, 129582692366n];

describe("Signature", () => {
  it(`should create keys`, async () => {
    const privateKey = PrivateKey.random();
    const publicKey = privateKey.toPublicKey();
    console.log("privateKey:", privateKey.toBase58());
    console.log("publicKey:", publicKey.toBase58());
    console.log(
      "privateKey bigints:",
      PrivateKey.toFields(privateKey).map((f) => f.toBigInt())
    );
    console.log("publicKey", {
      x: publicKey.x.toBigInt(),
      isOdd: publicKey.isOdd.toBoolean(),
    });
    const signedMessage = client.signFields(message, privateKey.toBase58());
    const signature = signedMessage.signature;
    console.log("signature:", signature);
    const signatureFields = Signature.fromBase58(signature);

    console.log("signature", {
      r: signatureFields.r.toBigInt(),
      s: signatureFields.s.toBigInt(),
    });
    const verified = client.verifyFields({
      data: message,
      signature,
      publicKey: publicKey.toBase58(),
    });
    console.log("verified:", verified);
    const hash = Poseidon.hash(message.map((m) => Field.from(m)));
    console.log("hash:", hash.toBigInt());
  });
});
