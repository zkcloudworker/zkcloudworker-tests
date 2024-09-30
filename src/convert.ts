import { sha256 } from "js-sha256";

const versionByte = 203;
const versionNumber = 1;

export function convertFieldsToPublicKey(fields: string[]): string {
  if (fields.length !== 2) throw new Error("Fields length must be 2");
  if (BigInt(fields[1]) !== 0n && BigInt(fields[1]) !== 1n)
    throw new Error("Fields[1] must be 0 or 1");
  let bytes = toBytesWithVersionNumber(fields.map(BigInt));
  return toBase58Check(bytes, versionByte);
}

function toBytesWithVersionNumber(t: bigint[]) {
  let bytes = toBytes(t);
  bytes.unshift(versionNumber);
  return bytes;
}

/*
const p = 0x40000000000000000000000000000000224698fc094cf91b992d30ed00000001n;
let sizeInBits = log2(p);
function log2(n: number | bigint) {
  if (typeof n === "number") n = BigInt(n);
  if (n === 1n) return 0;
  return (n - 1n).toString(2).length;
}
let sizeInBytes = Math.ceil(sizeInBits / 8); //32
console.log("sizeInBytes", sizeInBytes); //32
*/

function bigIntToBytes(x: bigint, length: number) {
  if (x < 0n) {
    throw Error(`bigIntToBytes: negative numbers are not supported, got ${x}`);
  }
  let bytes: number[] = Array(length);
  for (let i = 0; i < length; i++, x >>= 8n) {
    bytes[i] = Number(x & 0xffn);
  }
  if (x > 0n) {
    throw Error(`bigIntToBytes: input does not fit in ${length} bytes`);
  }
  return bytes;
}

function toBytes(t: bigint[]) {
  if (t.length !== 2) throw new Error("Expected 2 elements in t");

  let bytes: number[] = [];
  /*
  let n = 2;
  for (let i = 0; i < 2; i++) {
    let subBytes = bigIntToBytes(t[i], 32);
    bytes.push(...subBytes);
  }
    */

  let subBytes1 = bigIntToBytes(t[0], 32);
  subBytes1.unshift(versionNumber);
  bytes.push(...subBytes1);
  bytes.push(Number(t[1]));

  return bytes;
}

const alphabet =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz".split("");
let inverseAlphabet: Record<string, number> = {};
alphabet.forEach((c, i) => {
  inverseAlphabet[c] = i;
});

function toBase58Check(input: number[] | Uint8Array, versionByte: number) {
  let withVersion = [versionByte, ...input];
  let checksum = computeChecksum(withVersion);
  let withChecksum = withVersion.concat(checksum);
  return toBase58(withChecksum);
}

function toBase58(bytes: number[] | Uint8Array) {
  // count the leading zeroes. these get turned into leading zeroes in the output
  let z = 0;
  while (bytes[z] === 0) z++;
  // for some reason, this is big-endian, so we need to reverse
  let digits = [...bytes].map(BigInt).reverse();
  // change base and reverse
  let base58Digits = changeBase(digits, 256n, 58n).reverse();
  // add leading zeroes, map into alphabet
  base58Digits = Array(z).fill(0n).concat(base58Digits);
  return base58Digits.map((x) => alphabet[Number(x)]).join("");
}

function computeChecksum(input: number[] | Uint8Array) {
  let hash1 = sha256.create();
  hash1.update(input);
  let hash2 = sha256.create();
  hash2.update(hash1.array());
  return hash2.array().slice(0, 4);
}

function changeBase(digits: bigint[], base: bigint, newBase: bigint) {
  // 1. accumulate digits into one gigantic bigint `x`
  let x = fromBase(digits, base);
  // 2. compute new digits from `x`
  let newDigits = toBase(x, newBase);
  return newDigits;
}

function fromBase(digits: bigint[], base: bigint) {
  if (base <= 0n) throw Error("fromBase: base must be positive");
  // compute powers base, base^2, base^4, ..., base^(2^k)
  // with largest k s.t. n = 2^k < digits.length
  let basePowers = [];
  for (let power = base, n = 1; n < digits.length; power **= 2n, n *= 2) {
    basePowers.push(power);
  }
  let k = basePowers.length;
  // pad digits array with zeros s.t. digits.length === 2^k
  digits = digits.concat(Array(2 ** k - digits.length).fill(0n));
  // accumulate [x0, x1, x2, x3, ...] -> [x0 + base*x1, x2 + base*x3, ...] -> [x0 + base*x1 + base^2*(x2 + base*x3), ...] -> ...
  // until we end up with a single element
  for (let i = 0; i < k; i++) {
    let newDigits = Array(digits.length >> 1);
    let basePower = basePowers[i];
    for (let j = 0; j < newDigits.length; j++) {
      newDigits[j] = digits[2 * j] + basePower * digits[2 * j + 1];
    }
    digits = newDigits;
  }
  console.assert(digits.length === 1);
  let [digit] = digits;
  return digit;
}
// https://github.com/o1-labs/o1js-bindings/issues/265
function toBase(x: bigint, base: bigint) {
  if (base <= 0n) throw Error("toBase: base must be positive");
  // compute powers base, base^2, base^4, ..., base^(2^k)
  // with largest k s.t. base^(2^k) < x
  let basePowers = [];
  for (let power = base; power < x; power **= 2n) {
    basePowers.push(power);
  }
  let digits = [x]; // single digit w.r.t base^(2^(k+1))
  // successively split digits w.r.t. base^(2^j) into digits w.r.t. base^(2^(j-1))
  // until we arrive at digits w.r.t. base
  let k = basePowers.length;
  for (let i = 0; i < k; i++) {
    let newDigits = Array(2 * digits.length);
    let basePower = basePowers[k - 1 - i];
    for (let j = 0; j < digits.length; j++) {
      let x = digits[j];
      let high = x / basePower;
      newDigits[2 * j + 1] = high;
      newDigits[2 * j] = x - high * basePower;
    }
    digits = newDigits;
  }
  // pop "leading" zero digits
  while (digits[digits.length - 1] === 0n) {
    digits.pop();
  }
  return digits;
}
