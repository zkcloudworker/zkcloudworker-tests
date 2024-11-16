import { describe, expect, it } from "@jest/globals";
import {
  PrivateKey,
  Encryption,
  Bytes,
  Encoding,
  initializeBindings,
  Field,
  Group,
} from "o1js";

type CipherTextBytes = Encryption.CipherTextBytes;

let encrypted: any;
const key = PrivateKey.random();

describe("String encryption", () => {
  it("should encrypt", async () => {
    console.log("Encrypting...");
    await initializeBindings();
    class Bytes256 extends Bytes(256) {}
    const priv = PrivateKey.random();
    const pub = priv.toPublicKey();

    const plainMsg = "The quick brown fox jumped over the angry dog.";
    console.log("plain message", plainMsg);

    const cipher2 = Encryption.encrypt(Encoding.stringToFields(plainMsg), pub);
    const encrypted = {
      cipherText: cipher2.cipherText.map((b) => b.toJSON()).join("."),
      publicKey: cipher2.publicKey.toJSON(),
    };
    console.log(encrypted);
    const plainText2 = Encryption.decrypt(cipher2, priv);
    expect(Encoding.stringFromFields(plainText2)).toBe(plainMsg);

    const encryptedReceived = {
      cipherText: encrypted.cipherText.split(".").map((b) => Field.fromJSON(b)),
      publicKey: Group.fromJSON(encrypted.publicKey),
    };
    const plainText3 = Encoding.stringFromFields(
      Encryption.decrypt(encryptedReceived, priv)
    );
    console.log("decrypted", plainText3);

    expect(plainText3).toBe(plainMsg);

    console.log("en/decryption of bytes");
    const message = Bytes256.fromString(plainMsg);
    console.log("plain message", plainMsg);
    const cipher = Encryption.encryptBytes(message, pub);
    const plainText = Encryption.decryptBytes(cipher, priv);
    console.log(
      "decrypted message",
      Buffer.from(plainText.toBytes()).toString()
    );
  });

  //   encrypted = Encryption.encryptBytes(
  //     Bytes.fromString("Hello, world!"),
  //     key.toPublicKey()
  //   ).cipherText.map((b) => b.toJSON()).join(".");
  //   console.log(encrypted);
  // });
  // it("should decrypt", async () => {
  //   console.log("Decrypting...");
  //   const cipherText = Encryption.CipherText.fromHex(encrypted);
  //   const decrypted = Encryption.decryptBytes( encrypted, key);
  //   console.log(decrypted);
  // });
  //     Bytes.fromString("Hello, world!"),
  //     key.toPublicKey()
  //   );
  //   console.log(encrypted);
  // });
});
