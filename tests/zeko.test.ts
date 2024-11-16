import { describe, expect, it } from "@jest/globals";
import {
  Mina,
  Field,
  AccountUpdate,
  fetchAccount,
  Cache,
  IncludedTransaction,
  RejectedTransaction,
  PendingTransaction,
  SmartContract,
  method,
  state,
  State,
} from "o1js";
import {
  accountBalanceMina,
  blockchain,
  initBlockchain,
  sleep,
} from "zkcloudworker";
import { TEST_ACCOUNTS } from "../env.json";

export class TinyContract extends SmartContract {
  @state(Field) value = State<Field>();

  events = {
    valueSet: Field,
  };

  @method async setValue(value: Field) {
    this.value.set(value);
    this.emitEvent("valueSet", value);
  }
}

const COUNT = 10;
const chain = "zeko" as blockchain;

let sender: Mina.TestPublicKey = Mina.TestPublicKey.fromBase58(
  TEST_ACCOUNTS[0].privateKey
);

describe("Zeko", () => {
  it("should compile", async () => {
    //await initBlockchain("zeko");
    const networkInstance = Mina.Network({
      mina: "https://devnet.zeko.io/graphql",
      archive: "https://devnet.zeko.io/graphql",
    });
    Mina.setActiveInstance(networkInstance);
    console.log("sender", sender.toBase58());
    console.log("Sender's balance:", await accountBalanceMina(sender));
    const cache: Cache = Cache.FileSystem("./cache");
    await TinyContract.compile({ cache });
  });

  it("should deploy and prove", async () => {
    const appKey = Mina.TestPublicKey.random();
    console.log("contract:", appKey.toBase58());
    const zkApp = new TinyContract(appKey);
    await fetchAccount({ publicKey: sender });
    const tx = await Mina.transaction(
      { sender, fee: "100000000", memo: "deploy" },
      async () => {
        AccountUpdate.fundNewAccount(sender);
        await zkApp.deploy();
      }
    );

    await sendTx(tx.sign([sender.key, appKey.key]), "deploy", false);
    await fetchAccount({ publicKey: sender });
    //const nonce = Number(Mina.getAccount(sender).nonce.toBigint());

    for (let i = 1; i <= COUNT; i++) {
      try {
        await fetchAccount({ publicKey: sender });
        await fetchAccount({ publicKey: appKey });
        const tx = await Mina.transaction(
          { sender, fee: "100000000" },
          async () => {
            await zkApp.setValue(new Field(i));
          }
        );
        await tx.prove();
        await sendTx(tx.sign([sender.key]), `tx ${i}`, false);
        await fetchAccount({ publicKey: appKey });
        const value = zkApp.value.get();
        console.log(`${i}:`, Number(value.toBigInt()));
        if (value.toBigInt() !== BigInt(i))
          console.error("value is not correct");
        const events = await zkApp.fetchEvents();
        console.log("events", events);
      } catch (e) {
        console.log(e);
      }
    }
  });
});

export async function sendTx(
  tx: Mina.Transaction<false, true> | Mina.Transaction<true, true>,
  description?: string,
  wait?: boolean
): Promise<
  PendingTransaction | RejectedTransaction | IncludedTransaction | undefined
> {
  const zekoPoolError = "Maximum pool size reached";
  try {
    let txSent;
    let sent = false;
    while (!sent) {
      txSent = await tx.safeSend();
      if (txSent.status == "pending") {
        sent = true;
        console.log(
          `${description ?? ""} tx sent: hash: ${txSent.hash} status: ${
            txSent.status
          }`
        );
      } else if (
        chain === "zeko" &&
        txSent?.errors?.some((e) => e?.includes(zekoPoolError))
      ) {
        console.log("Zeko pool is full, retrying...", txSent);
        await sleep(10000);
      } else {
        console.log(
          `${description ?? ""} tx NOT sent: hash: ${txSent?.hash} status: ${
            txSent?.status
          }`,
          txSent.errors,
          txSent
        );
        return undefined;
      }
    }
    if (txSent === undefined) throw new Error("txSent is undefined");
    if (txSent.errors.length > 0) {
      console.error(
        `${description ?? ""} tx error: hash: ${txSent.hash} status: ${
          txSent.status
        }  errors: ${txSent.errors}`
      );
    }

    if (txSent.status === "pending" && wait !== false) {
      console.log(`Waiting for tx inclusion...`);
      const txIncluded = await txSent.safeWait();
      console.log(
        `${description ?? ""} tx included into block: hash: ${
          txIncluded.hash
        } status: ${txIncluded.status}`
      );
      return txIncluded;
    } else return txSent;
  } catch (error) {
    if (chain !== "zeko") console.error("Error sending tx", error);
  }
  if (chain !== "local") await sleep(10000);
}
