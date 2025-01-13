import { Field, SmartContract, method, state, State, PublicKey } from "o1js";
import { Storage } from "@minatokens/storage";

export class TestContract extends SmartContract {
  @state(Field) value = State<Field>();

  @method async setValue(value: Field) {
    const timestamp = this.network.timestamp.getAndRequireEquals();
    this.value.set(value);
  }
}

export class TestContract2 extends SmartContract {
  @state(Field) value = State<Field>();

  @method async setValue(value: Field, key: PublicKey, storage: Storage) {
    const timestamp = this.network.timestamp.getAndRequireEquals();
    this.value.set(value);
  }
}
