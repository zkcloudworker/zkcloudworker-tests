import { describe, expect, it } from "@jest/globals";
import {
  Field,
  PublicKey,
  Bytes,
  Struct,
  PrivateKey,
  Encoding,
  Provable,
  InferProvable,
} from "o1js";
import { deserializeFields, serializeFields } from "zkcloudworker";

class MyStruct extends Struct({
  field1: Field,
  field2: Field,
  key: PublicKey,
}) {}

describe("Base64", () => {
  it.skip(`should convert Field to base64 and back`, async () => {
    const field = Field(1);
    let str = field.toBigInt().toString(16);
    if (str.length % 2) {
      str = "0" + str;
    }
    const base64 = Buffer.from(str, "hex").toString("base64");

    console.log("base64", base64);
    console.log("serializeFields", serializeFields([field]));
  });
  it(`should serialize Struct`, async () => {
    const value = new MyStruct({
      field1: Field(1),
      field2: Field(2),
      key: PrivateKey.random().toPublicKey(),
    });
    const str = serializeStruct({ type: MyStruct, value });

    console.log("str", str);

    const value2 = deserializeStruct({
      type: MyStruct,
      serializedStruct: str,
    }) as MyStruct;
    //console.log("value2", value2);
    expect(value2.field1.toBigInt()).toEqual(value.field1.toBigInt());
    expect(value2.field2.toBigInt()).toEqual(value.field2.toBigInt());
    expect(value2.key.toBase58()).toEqual(value.key.toBase58());
    const t = typeof value;
    console.log(
      "t",
      t,
      MyStruct.name,
      value.constructor.name,
      value2.constructor.name
    );
  });
});

export function serializeStruct<P extends Provable<any>>(params: {
  type: P;
  value: InferProvable<P>;
}): string {
  const { type, value } = params;
  console.log("Name:", value.constructor.name);
  console.log("type Name:", (type as any).name);
  if ((type as any).name !== value.constructor.name)
    throw new Error("Type mismatch");
  if ((type as any).name === undefined)
    throw new Error("Type name is undefined");
  return serializeFields([
    Encoding.stringToFields(value.constructor.name)[0],
    ...(type.toFields(value) as Field[]),
  ]);
}

export function deserializeStruct<P extends Provable<any>>(params: {
  type: P;
  serializedStruct: string;
}): InferProvable<P> {
  const { type, serializedStruct } = params;

  if ((type as any).name === undefined)
    throw new Error("Type name is undefined");
  const fields = deserializeFields(serializedStruct);
  if (
    fields[0].toBigInt() !==
    Encoding.stringToFields((type as any).name)[0].toBigInt()
  )
    throw new Error("Type mismatch");

  return (type as any).fromFields(fields.slice(1));
}

/*
export function serializeStruct(params: { type: any; value: any }) {
  const { type, value } = params;
  if (type.name !== value.constructor.name) throw new Error("Type mismatch");
  if (type.name === undefined) throw new Error("Type name is undefined");
  return serializeFields([
    Encoding.stringToFields(type.name)[0],
    ...(type.toFields(value) as Field[]),
  ]);
}

export function deserializeStruct(params: {
  type: any;
  serializedStruct: string;
}) {
  const { type, serializedStruct } = params;
  if (type.name === undefined) throw new Error("Type name is undefined");
  const fields = deserializeFields(serializedStruct);
  if (fields[0].toBigInt() !== Encoding.stringToFields(type.name)[0].toBigInt())
    throw new Error("Type mismatch");
  return type.fromFields(fields.slice(1));
}
*/
/*
describe("Balance", () => {
  it(`should get the balance`, async () => {
    class MyClass {
      a: number;
      b: string;
    }

    const instance = new MyClass();

    console.log(instance.constructor.name); // MyClass
    console.log(MyClass.name);



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
*/
