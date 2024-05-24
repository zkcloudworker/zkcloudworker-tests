import { describe, expect, it } from "@jest/globals";
import { Field } from "o1js";
import fs from "fs/promises";
import { program1, SampleSideloadedProof } from "../src/sideloading";

describe("Side loading", () => {
  it("should create proof", async () => {
    const { verificationKey } = await program1.compile();
    const program1Proof = await program1.foo(Field(1), Field(1));
    const proof = SampleSideloadedProof.fromProof(program1Proof);
    await fs.writeFile(
      "./json/vk.json",
      JSON.stringify(
        {
          verificationKey: {
            hash: verificationKey.hash.toJSON(),
            data: verificationKey.data,
          },
          proof: proof.toJSON(),
        },
        null,
        2
      )
    );
  });
});
