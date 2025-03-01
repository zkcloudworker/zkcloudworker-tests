import {
  bitsToBytes,
  bytesToBits,
  record,
  withVersionNumber,
} from "./binable.js";
import { Field } from "./field-bigint.js";
import {
  Group,
  Scalar,
  PrivateKey,
  versionNumbers,
  PublicKey,
} from "./curve-bigint.js";
import { base58 } from "./base58.js";
import { versionBytes } from "./constants.js";
import type {
  SignedLegacy,
  SignatureJson,
  Signed,
  NetworkId,
  SignedRosetta,
} from "./types.js";
import { sign, Signature, verify } from "./signature.js";

/**
 * Verifies a signature created by {@link signFields}.
 *
 * @param signedFields The signed field elements
 * @returns True if the `signedFields` contains a valid signature matching
 * the fields and publicKey.
 */
export function verifyFields({ data, signature, publicKey }: Signed<bigint[]>) {
  return verify(
    Signature.fromBase58(signature),
    { fields: data },
    PublicKey.fromBase58(publicKey),
    "testnet"
  );
}
