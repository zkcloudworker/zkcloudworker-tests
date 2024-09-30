import { describe, expect, it } from "@jest/globals";
import { getPivotPoints } from "../src/fetch";

describe("Fetch", () => {
  it(`should get the json`, async () => {
    const pivotPoints = await getPivotPoints();
    console.log("pivotPoints", pivotPoints);
  });
});
