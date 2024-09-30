import { describe, expect, it } from "@jest/globals";
import { TestContract } from "../src/contract";

interface TestEvent {
  event: object;
}

describe("Events", () => {
  it(`should test events`, async () => {
    const event = {
      key: "value",
    };
    const testEvent: TestEvent = { event };
  });
});
