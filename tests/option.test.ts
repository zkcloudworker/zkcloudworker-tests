import { describe, expect, it } from "@jest/globals";
import { Option, Field } from "o1js";

describe("Option", () => {
  it(`option`, async () => {
    class OptionField extends Option(Field) {}
  });
});
