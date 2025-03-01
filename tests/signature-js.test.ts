import { describe, expect, it } from "@jest/globals";
import { verifyFields } from "src/signature/mina-signer.js";

const privateKeyBigint: bigint[] = [
  1n,
  8587964826761095463462842966570135459501268030774015181276223112360299085188n,
];
const publicKeyBigint: bigint[] = [
  23870790172301888504759036806304867767472357997524493282691794869180801897430n,
  1n,
];
const publicKeyString =
  "B62qqdx1tLZix6NFPzytZZwppGiXBPrsxByjyDMs9yp9XmuVmYHDXqN";

const message = [123n, 456n];
let signature: string =
  "7mXSdHUousVBHBvnrqwjhGPkMWcokkDzv5P4AH93eUR7xegDrtms8uZeoQN98A6c3uA68M3hCD2TqRx1NKXfLTbdZ2tH6Sdo";
let signatureBigint: bigint[] = [
  19996910013141570341263734673999978016031842709489071252992906391155381778902n,
  0n,
  1977752958886643393594701383065684494627963631570008137587699340120037729684n,
];

describe("Signature", () => {
  it(`should verify signature`, async () => {
    const verified = verifyFields({
      data: message,
      signature: signature,
      publicKey: publicKeyString,
    });
    console.log("verified:", verified);
  });
});
