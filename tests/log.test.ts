import { describe, expect, it } from "@jest/globals";
import { sleep } from "zkcloudworker";

describe("Log", () => {
  it(`should log`, async () => {
    for (let i = 0; i < 10; i++) {
      process.stdout.write(`Log ${i}\r`);
      await sleep(1000);
    }
  });
});
