import { describe, expect, it } from "@jest/globals";
import { PrivateKey, PublicKey } from "o1js";
import { SignJWT, jwtVerify } from "jose";
import { sleep } from "zkcloudworker";

const address = PrivateKey.random().toPublicKey().toBase58();
const email = "test@test.com";

describe("JWT", () => {
  it(`should create a JWT`, async () => {
    console.log(address);

    // Step 1: Define your secret key (ensure this is kept secure)
    const secret = new TextEncoder().encode(
      "your-very-secure-secret-key_bjhfbk_nkfd"
    );

    const jwt = await new SignJWT({
      address,
      email,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt()
      .setIssuer("minatokens.com")
      .setExpirationTime("1s")
      .sign(secret);

    console.log("Generated JWT:", jwt);
    await sleep(2000);
    console.log("JWT length:", jwt.length);
    try {
      const isVerified = await jwtVerify(jwt, secret);
      console.log("Is verified:", isVerified);
      console.log(
        "Expiry:",
        new Date(isVerified.payload.exp! * 1000).toISOString()
      );
    } catch (e) {
      console.log("Error:", e);
    }
  });
});
