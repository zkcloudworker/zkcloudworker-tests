import { Field, SmartContract, method, state, State } from "o1js";

export class TestContract extends SmartContract {
  @state(Field) value = State<Field>();

  @method async setValue(value: Field) {
    const timestamp = this.network.timestamp.getAndRequireEquals();
    this.value.set(value);
  }
}
