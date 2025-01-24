import { describe, expect, it } from "@jest/globals";
import { Field } from "o1js";

describe("Division", () => {
  it("should divide", async () => {
    const a: bigint = 2n; //171n * 10n ** 22n;
    const b: bigint = 5n; //315n * 10n ** 12n;
    const c = a / b;
    console.log("c", c); // 5428571428n
    const cField = Field(a).div(Field(b));
    console.log("cField", cField.toBigInt()); // 8270863516951156815969356072049136275246587566269017347415621932676847894382n
    const d = cField.mul(Field(b));
    console.log("d", d.toBigInt()); // 2n
  });
});
