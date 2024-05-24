import { describe, expect, it } from "@jest/globals";
import axios from "axios";
import { CELESTIA_AUTH_TOKEN } from "../env.json";
import { Field, Gadgets } from "o1js";
import crypto from "crypto";

const endpoint = "http://cloud.zkcloudworker.com:26658";
//"http://34.252.140.110:26658";
const fieldsData = [
  "6946470356961621595306082048105168006231226859093840185496755289268233254129",
  "9779008882806809730012475308931447603546825069688982903126074912124583002448",
  "3638023429223257039772211469465809435825724346023180243398875172684169623472",
  "13284029357613275155357392166425079759455811050547006419798874557872592295393",
];

function getNamespace(params: { version: number; id: string }) {
  const { version, id } = params;
  const versionString = version.toString(16).padStart(2, "0");
  const idString = crypto
    .createHash("sha256")
    .update(id)
    .digest("hex")
    .slice(0, 20)
    .padStart(56, "0");
  /*
  const tenBytes = crypto
    .createHash("sha256")
    .update(id)
    .digest("hex")
    .slice(0, 20);
  console.log("tenBytes", tenBytes);
  const str = versionString + idString;
  for (let i = 0; i < str.length; i += 2) {
    console.log(Number("0x" + str.slice(i, i + 2)));
  }
  */
  const buffer = Buffer.from(versionString + idString, "hex");
  const base64String = buffer.toString("base64");
  return base64String;
}

function fieldsToBase64(fields: Field[]) {
  const data = fields
    .map((field) => field.toBigInt().toString(16).padStart(64, "0"))
    .join("");

  const buffer = Buffer.from(data, "hex");
  const base64String = buffer.toString("base64");
  return base64String;
}

/*
function hash(data: string) {
  const buffer = Buffer.from(data, "hex");
  const hash = crypto.createHash("sha256");
  hash.update(buffer);
  return hash.digest("base64");
}
*/

function hash(data: string) {
  const buffer = Buffer.from(data, "hex");
  const hash = crypto.createHash("sha256");
  hash.update(buffer);
  return hash.digest("base64");
}

function fieldsFromBase64(data: string) {
  const buffer = Buffer.from(data, "base64");
  const hexString = buffer.toString("hex");
  const fields = [];
  for (let i = 0; i < hexString.length; i += 64) {
    const field = Field(BigInt("0x" + hexString.slice(i, i + 64)));
    fields.push(field);
  }
  return fields;
}

const namespace = getNamespace({
  version: 0,
  id: JSON.stringify({ developer: "DFST", repo: "celestia" }),
});
const fields = fieldsData.map((field) => Field.fromJSON(field));
//const data = fieldsToBase64(fields);
//console.log("data", data);
const data1field = fieldsToBase64([fields[0]]);
//console.log("data1field", data1field);
const hexString = Buffer.from(data1field, "base64").toString("hex");

describe("Celestia", () => {
  it.skip(`should calculate commitment`, async () => {
    const data = "VGhpcyBpcyBhbiBleGFtcGxlIG9mIHNvbWUgYmxvYiBkYXRh";
    const buffer = Buffer.from(data, "base64");
    const commitment = crypto
      .createHash("sha256")
      .update(buffer)
      .digest("base64");
  });
  it.skip(`should create data`, async () => {
    const fields = fieldsData.map((field) => Field.fromJSON(field));
    const data = fieldsToBase64(fields);
    console.log(data);
  });
  it(`should send blob`, async () => {
    /*
    console.log("Hash", hash("01")); // Input "01", representing the byte 0x01
    return;

    console.log("hash", hash("01"));
    const goHash =
      "75 245 18 47 52 69 84 197 59 222 46 187 140 210 183 227 209 96 10 214 49 195 133 165 215 204 226 60 119 133 69 154";
    const goHashBytes = goHash
      .split(" ")
      .map((n) => Number(n).toString(16))
      .join("");
    console.log("goHashBytes", goHashBytes);
    // to base64
    const buffer1 = Buffer.from(goHashBytes, "hex");
    const base64String = buffer1.toString("base64");
    console.log("base64String", base64String);

    const o1hash = Gadgets.SHA256.hash([Field(1).toBigInt()]).toHex();
    console.log("o1hash", o1hash);
    const buffer2 = Buffer.from(o1hash, "hex");
    const base64String2 = buffer2.toString("base64");
    console.log(base64String2);
    console.log(base64String);
    console.log(hash("1"));

    
    /*
    console.log("hexString", hexString);
    const numbers = [];
    for (let i = 0; i < hexString.length; i += 2) {
      numbers.push(Number("0x" + hexString.slice(i, i + 2)));
    }
    console.log("numbers", numbers.map((n) => n.toString()).join(" "));
    
    const commitment = "d4WYV+eYYPOFy9sQWZDL2lPGmaLkLSj0sUqVXI8rBf8=";
    //convert to bytes in hex
    const bytes = Buffer.from(commitment, "base64").toString("hex");
    const numbers = [];
    for (let i = 0; i < bytes.length; i += 2) {
      numbers.push("0x" + bytes.slice(i, i + 2));
    }
    console.log("numbers", numbers.join(", "));
    */
    const share =
      "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 128 5 177 122 205 107 190 97 51 201 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 128 5 177 122 205 107 190 97 51 201 81 174 175 139 196 169 94 59 231 188 118 42 68 216 175 237 16 225 164 172 97 156 250 175 142 99 175 244 31 246 222 28";
    const commitment = "d4WYV+eYYPOFy9sQWZDL2lPGmaLkLSj0sUqVXI8rBf8=";

    const bytes = share
      .split(" ")
      .map((n) => Number(n).toString(16).padStart(2, "0"))
      .join("");
    console.log("bytes", bytes);
    const commitment1 = hash(bytes);
    const o1hash = Gadgets.SHA256.hash(Buffer.from(bytes, "hex")).toHex();
    console.log("o1hash", o1hash);
    const buffer2 = Buffer.from(o1hash, "hex");
    const base64String2 = buffer2.toString("base64");
    console.log(base64String2);
    console.log(commitment1);
    console.log(commitment);
    console.log("commitment1", commitment1);
    console.log("commitment", commitment);
    try {
      const data1 = {
        id: 1,
        jsonrpc: "2.0",
        method: "state.AccountAddress",
        params: [],
      };
      const data3 = {
        id: 1,
        jsonrpc: "2.0",
        method: "state.Balance",
        params: [],
      };
      const data4 = {
        id: 1,
        jsonrpc: "2.0",
        method: "blob.GetAll",
        params: [1071228, [namespace]],
      };
      const data2 = {
        id: 1,
        jsonrpc: "2.0",
        method: "blob.GetAll",
        params: [1075305, [namespace]],
      };
      const data7 = {
        id: 1,
        jsonrpc: "2.0",
        method: "blob.GetProof",
        params: [
          1071393,
          namespace,
          "nxbBGP7PnfTcag2GRN7VbiCHeswEyn33jnmfsAJJ5DA=",
        ],
      };
      const data8 = {
        id: 1,
        jsonrpc: "2.0",
        method: "blob.Included",
        params: [
          1071393,
          namespace,
          [
            {
              start: 7,
              end: 8,
              nodes: [
                "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAArOoB2GZtxyL1Ff7rObsGwuL6aJDcNW6H67C68XaJG2SAkbeLm2ZQkUV",
                "AAAAAAAAAAAAAAAAAAAAAAAAAAKzqAdhmbcci9QAAAAAAAAAAAAAAAAAAAAAAAAAArOoB2GZtxyL1KgD3Is7Fy/ooimRiH1FrZxfawk2ZyntC+oP9lCCrZjY",
                "AAAAAAAAAAAAAAAAAAAAAAAAAAKzqAdhmbcci9QAAAAAAAAAAAAAAAAAAAAAAAAAArOoB2GZtxyL1DYk+noaDez4sYti1xW8ZohlsjQOL+tZGOsaWzE9+qct",
                "AAAAAAAAAAAAAAAAAAAAAAAAAIBAQ2Jnsa1lIYMAAAAAAAAAAAAAAAAAAAAAAAAAgEBDYmexrWUhg5gWJUfdwJSAg2fSXB8BmliTnucIK3a7JxBMZ5jKoNPX",
                "AAAAAAAAAAAAAAAAAAAAAAAAAI+HNrb/ncCAZaYAAAAAAAAAAAAAAAAAAAAAAAAAj4c2tv+dwIBlpmkya2VK54bMelNO6PfZkzcQR0u9MDvyo+sbygm18yZ+",
                "/////////////////////////////////////////////////////////////////////////////xhuXn3Vv1c/dvpNwOLQIVE2fT9wivOn6upUhLZPIzQk",
              ],
              is_max_namespace_ignored: true,
            },
          ],
          "nxbBGP7PnfTcag2GRN7VbiCHeswEyn33jnmfsAJJ5DA=",
        ],
      };
      const data5 = {
        id: 1,
        jsonrpc: "2.0",
        method: "blob.Submit",
        params: [
          [
            {
              namespace,
              data: data1field,
              share_version: 0,
              //commitment: "AD5EzbG0/EMvpw0p8NIjMVnoCP4Bv6K+V6gjmwdXUKU=",
            },
          ],
          0.1,
        ],
      };

      const response = await axios.post(endpoint, data3, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${CELESTIA_AUTH_TOKEN}`,
        },
      });
      console.log("data", response.data);
      console.log("result", { result: response.data.result });
      //console.log("nodes", { nodes: response.data.result[0].nodes });
      /*
      console.log(response.data.result[0].data);
      expect(response.data.result[0].data).toBe(data);
      const fields2 = fieldsFromBase64(response.data.result[0].data);
      for (let i = 0; i < fields2.length; i++) {
        expect(fields2[i].equals(fields[i]).toBoolean()).toBe(true);
      }
      */
    } catch (error) {
      console.log(error);
    }
  });
});
