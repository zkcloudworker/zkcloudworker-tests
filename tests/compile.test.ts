import { describe, expect, it } from "@jest/globals";
import {
  Field,
  SmartContract,
  method,
  state,
  State,
  Mina,
  PrivateKey,
  TokenId,
} from "o1js";

export class TestContract extends SmartContract {
  @state(Field) value = State<Field>();

  @method async setValue(value: Field) {
    const slot = this.network.globalSlotSinceGenesis;
    this.value.set(value);
  }
}

describe("Compile v1", () => {
  it(`should compile`, async () => {
    const Local = await Mina.LocalBlockchain();
    Mina.setActiveInstance(Local);
    const vk = (await TestContract.compile()).verificationKey;
    console.log("vk", vk.hash.toJSON());
    const zkApp = new TestContract(PrivateKey.random().toPublicKey());
    const tokenId = zkApp.tokenId;
    console.log("tokenId", TokenId.toBase58(tokenId));
  });
});
