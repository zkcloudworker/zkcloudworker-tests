import { describe, expect, it } from "@jest/globals";
import {
  PublicKey,
  Mina,
  TokenId,
  PrivateKey,
  Field,
  Struct,
  ProvableHashable,
  ProvableExtended,
} from "o1js";

class MyStruct extends Struct({
  field1: Field,
  field2: Field,
  key: PublicKey,
}) {}

describe("Balance", () => {
  it(`should get the balance`, async () => {
    class MyClass {
      a: number;
      b: string;
    }

    const instance = new MyClass();

    console.log(instance.constructor.name); // MyClass
    console.log(MyClass.name);

    const a = new MyStruct({
      field1: Field(1),
      field2: Field(2),
      key: PrivateKey.random().toPublicKey(),
    });

    console.log(a.constructor.name); // MyClass
    console.log(MyStruct.name);
    const s = serializeStruct(a, MyStruct);
    console.log("s", s);
  });
});

function serializeStruct(value: any, type: any) {
  //console.log(struct.name);
  console.log("Name:", value.constructor.name);
  const fields = (type.toFields(value) as Field[]).map((field) =>
    field.toJSON()
  );

  return fields;
}
