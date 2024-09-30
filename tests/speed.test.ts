import { describe, expect, it } from "@jest/globals";
import {
  Mina,
  PrivateKey,
  ZkProgram,
  Field,
  SmartContract,
  method,
  AccountUpdate,
  fetchAccount,
  state,
  State,
  Cache,
  MerkleMap,
  MerkleMapWitness,
} from "o1js";

const MyProgram = ZkProgram({
  name: "MyProgram",
  publicInput: Field,
  methods: {
    check: {
      privateInputs: [
        MerkleMapWitness,
        Field,
        Field,
        MerkleMapWitness,
        Field,
        Field,
      ],
      async method(
        root: Field,
        witness1: MerkleMapWitness,
        key1: Field,
        value1: Field,
        witness2: MerkleMapWitness,
        key2: Field,
        value2: Field
      ) {
        const [calculatedRoot1, calculatedKey1] =
          witness1.computeRootAndKeyV2(value1);
        root.assertEquals(calculatedRoot1);
        key1.assertEquals(calculatedKey1);
        const [calculatedRoot2, calculatedKey2] =
          witness2.computeRootAndKeyV2(value2);
        root.assertEquals(calculatedRoot2);
        key2.assertEquals(calculatedKey2);
      },
    },
  },
});

export class MyContract extends SmartContract {
  @state(Field) value = State<Field>();

  @method async check(
    root: Field,
    witness1: MerkleMapWitness,
    key1: Field,
    value1: Field,
    witness2: MerkleMapWitness,
    key2: Field,
    value2: Field
  ) {
    const [calculatedRoot1, calculatedKey1] =
      witness1.computeRootAndKeyV2(value1);
    root.assertEquals(calculatedRoot1);
    key1.assertEquals(calculatedKey1);
    const [calculatedRoot2, calculatedKey2] =
      witness2.computeRootAndKeyV2(value2);
    root.assertEquals(calculatedRoot2);
    key2.assertEquals(calculatedKey2);
  }
}

let sender: Mina.TestPublicKey;

describe("Proving speed", () => {
  it("should compile", async () => {
    const networkInstance = await Mina.LocalBlockchain();
    Mina.setActiveInstance(networkInstance);
    sender = networkInstance.testAccounts[0];
    const methods = [
      {
        name: "MyContract",
        result: await MyContract.analyzeMethods(),
      },
      {
        name: "MyProgram",
        result: await MyProgram.analyzeMethods(),
        skip: true,
      },
    ];
    const maxRows = 2 ** 16;
    for (const contract of methods) {
      // calculate the size of the contract - the sum or rows for each method
      const size = Object.values(contract.result).reduce(
        (acc, method) => acc + method.rows,
        0
      );
      // calculate percentage rounded to 0 decimal places
      const percentage = Math.round(((size * 100) / maxRows) * 100) / 100;

      console.log(
        `method's total size for a ${contract.name} is ${size} rows (${percentage}% of max ${maxRows} rows)`
      );
      if (contract.skip !== true)
        for (const method in contract.result) {
          console.log(method, `rows:`, (contract.result as any)[method].rows);
        }
    }
    const cache: Cache = Cache.FileSystem("./cache");
    await MyContract.compile({ cache });
    await MyProgram.compile({ cache });
  });

  it("should deploy and prove", async () => {
    const appKey = PrivateKey.randomKeypair();
    const zkApp = new MyContract(appKey.publicKey);
    await fetchAccount({ publicKey: sender });
    const tx = await Mina.transaction(
      { sender, fee: "100000000", memo: "deploy" },
      async () => {
        AccountUpdate.fundNewAccount(sender);
        await zkApp.deploy();
      }
    );
    await (await tx.sign([sender.key, appKey.privateKey]).send()).wait();

    const map = new MerkleMap();
    const key1 = Field(675483265);
    const value1 = Field(64538967453);
    const key2 = Field(65289323);
    const value2 = Field(64550533837);
    map.set(key1, value1);
    map.set(key2, value2);
    const witness1 = map.getWitness(key1);
    const witness2 = map.getWitness(key2);
    const root = map.getRoot();

    await fetchAccount({ publicKey: sender });
    await fetchAccount({ publicKey: appKey.publicKey });
    const tx2 = await Mina.transaction(
      { sender, fee: "100000000", memo: "check" },
      async () => {
        await zkApp.check(root, witness1, key1, value1, witness2, key2, value2);
      }
    );

    console.time("prove ZkProgram");
    const proof = await MyProgram.check(
      root,
      witness1,
      key1,
      value1,
      witness2,
      key2,
      value2
    );
    console.timeEnd("prove ZkProgram");

    console.time("prove SmartContract");
    await tx2.prove();
    console.timeEnd("prove SmartContract");
    await (await tx2.sign([sender.key]).send()).wait();
  });
});
