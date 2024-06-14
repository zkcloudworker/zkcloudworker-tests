import { describe, expect, it } from "@jest/globals";
import { Field, Gadgets, Encoding, UInt64, Provable } from "o1js";
import { makeString } from "zkcloudworker";

describe("Range check", () => {
  it.skip(`should get range`, async () => {
    let maxValue: bigint = 1n;
    let oldBits = 0;
    for (let i = 1; i < 33; i++) {
      let isValid = true;
      for (let j = 0; j < 10000; j++) {
        const fields = Encoding.stringToFields(makeString(i));
        if (fields.length !== 1) isValid = false;
        while (fields[0].greaterThan(maxValue).toBoolean())
          maxValue = maxValue * 2n;
      }
      const bits = maxValue.toString(2).length;
      console.log(`${i} ${bits} ${bits - oldBits} ${isValid ? "" : "INVALID"}`);
      oldBits = bits;
    }
  });
  it(`should check formula`, async () => {
    for (let j = 0; j < 100000; j++) {
      const name = makeString(Math.floor(Math.random() * 29) + 1);
      const fields = Encoding.stringToFields(name);
      if (fields.length !== 1)
        throw new Error(`Invalid name ${name} ${fields.length} ${name.length}`);
      const priceField = fieldPrice(fields[0]);
      const priceMina = price(name);
      if (
        priceField
          .equals(UInt64.from(BigInt(priceMina) * 1_000_000_000n))
          .toBoolean() === false
      )
        throw new Error(
          `Invalid price ${name} ${priceField.toJSON()} ${priceMina}`
        );
      if (j < 10) console.log(`${name} ${priceField.toJSON()} ${priceMina}`);
    }
  });
});

function price(name: string): number {
  if (name.length > 5) return 10;
  if (name.length <= 3) return 99;
  return 19;
}

function fieldPrice(name: Field): UInt64 {
  const price: UInt64 = Provable.if(
    name.greaterThan(Field(BigInt(2 ** 43))),
    UInt64.from(10_000_000_000n),
    Provable.if(
      name.lessThan(Field(BigInt(2 ** 27))),
      UInt64.from(99_000_000_000n),
      UInt64.from(19_000_000_000n)
    )
  );
  return price;
}

/*
[1:16:01 PM] 1 512
[1:16:01 PM] 2 131072
[1:16:01 PM] 3 33554432
[1:16:01 PM] 4 8589934592
[1:16:01 PM] 5 2199023255552
[1:16:01 PM] 6 562949953421312
[1:16:01 PM] 7 144115188075855872
[1:16:01 PM] 8 36893488147419103232
[1:16:01 PM] 9 9444732965739290427392
[1:16:01 PM] 10 2417851639229258349412352
[1:16:01 PM] 11 618970019642690137449562112
[1:16:02 PM] 12 158456325028528675187087900672
[1:16:02 PM] 13 40564819207303340847894502572032
[1:16:02 PM] 14 10384593717069655257060992658440192
[1:16:02 PM] 15 2658455991569831745807614120560689152
[1:16:02 PM] 16 680564733841876926926749214863536422912
[1:16:02 PM] 17 174224571863520493293247799005065324265472
[1:16:02 PM] 18 44601490397061246283071436545296723011960832
[1:16:02 PM] 19 11417981541647679048466287755595961091061972992
[1:16:02 PM] 20 2923003274661805836407369665432566039311865085952
[1:16:02 PM] 21 748288838313422294120286634350736906063837462003712
[1:16:02 PM] 22 191561942608236107294793378393788647952342390272950272
[1:16:02 PM] 23 49039857307708443467467104868809893875799651909875269632
[1:16:03 PM] 24 12554203470773361527671578846415332832204710888928069025792
[1:16:03 PM] 25 3213876088517980551083924184682325205044405987565585670602752
[1:16:03 PM] 26 822752278660603021077484591278675252491367932816789931674304512
[1:16:03 PM] 27 210624583337114373395836055367340864637790190801098222508621955072
[1:16:03 PM] 28 53919893334301279589334030174039261347274288845081144962207220498432
[1:16:03 PM] 29 13803492693581127574869511724554050904902217944340773110325048447598592

[7:49:28 AM] 1 10 10
[7:49:28 AM] 2 18 8
[7:49:28 AM] 3 26 8
[7:49:28 AM] 4 34 8
[7:49:28 AM] 5 42 8
[7:49:28 AM] 6 50 8
[7:49:28 AM] 7 58 8
[7:49:28 AM] 8 66 8
[7:49:28 AM] 9 74 8
[7:49:29 AM] 10 82 8
[7:49:29 AM] 11 90 8
[7:49:29 AM] 12 98 8
[7:49:29 AM] 13 106 8
[7:49:29 AM] 14 114 8
[7:49:29 AM] 15 122 8
[7:49:29 AM] 16 130 8
[7:49:29 AM] 17 138 8
[7:49:29 AM] 18 146 8
[7:49:29 AM] 19 154 8
[7:49:29 AM] 20 162 8
[7:49:29 AM] 21 170 8
[7:49:29 AM] 22 178 8
[7:49:30 AM] 23 186 8
[7:49:30 AM] 24 194 8
[7:49:30 AM] 25 202 8
[7:49:30 AM] 26 210 8
[7:49:30 AM] 27 218 8
[7:49:30 AM] 28 226 8
[7:49:30 AM] 29 234 8

*/
