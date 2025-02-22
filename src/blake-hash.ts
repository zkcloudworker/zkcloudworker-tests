import { Bool, Field, Gadgets, Bytes, UInt8 } from "o1js";

export { Bytes32, BlakeHash, BlakeHashBigInt, conditionalSwap };

class Bytes32 extends Bytes(32) {
  toBigInt(): bigint {
    const hex = this.toHex();
    return BigInt(`0x${hex}`);
  }

  static fromBigInt(value: bigint): Bytes32 {
    const hex = value.toString(16).padStart(64, "0");
    return Bytes32.fromHex(hex) as Bytes32;
  }
}

function BlakeHash(input: Bytes32[]): Bytes32 {
  const bytes: UInt8[] = input.map((v) => v.bytes).flat();
  return Bytes32.from(Gadgets.BLAKE2B.hash(bytes, 32)) as Bytes32;
}

function BlakeHashBigInt(input: bigint[]): bigint {
  const hash = Gadgets.BLAKE2B.hash(input, 32);
  return (Bytes32.from(hash) as Bytes32).toBigInt();
}

// swap two values if the boolean is false, otherwise keep them as they are
// more efficient than 2x `Provable.if()` by reusing an intermediate variable
function conditionalSwap(b: Bool, x: Bytes32, y: Bytes32): [Bytes32, Bytes32] {
  const _x = Field(x.toBigInt());
  const _y = Field(y.toBigInt());
  let m = b.toField().mul(_x.sub(_y)); // b*(x - y)
  const x_ = _y.add(m); // y + b*(x - y)
  const y_ = _x.sub(m); // x - b*(x - y) = x + b*(y - x)
  return [Bytes32.fromBigInt(x_.toBigInt()), Bytes32.fromBigInt(y_.toBigInt())];
}
