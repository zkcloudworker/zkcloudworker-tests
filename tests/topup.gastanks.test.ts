import { describe, expect, it } from "@jest/globals";
import {
  Devnet,
  sleep,
  initBlockchain,
  accountBalance,
  accountBalanceMina,
  fee,
} from "zkcloudworker";
import { PrivateKey, PublicKey, Mina, AccountUpdate } from "o1js";
import { faucetDevnet } from "../src/faucet";
import { GASTANKS, TEST_ACCOUNTS, GASTANKS_NFT } from "../env.json";

const addressesToTopup: string[] = [];

const tanks: {
  privateKey: string;
  publicKey: string;
}[] = [];

describe("Balance", () => {
  it(`should get the addresses to topup`, async () => {
    await initBlockchain("devnet");
    const addresses: string[] = [];
    addresses.push(...GASTANKS.map((t) => t.publicKey));
    addresses.push(...TEST_ACCOUNTS.map((t) => t.publicKey));
    addresses.push(
      ...GASTANKS_NFT.map((t) =>
        PrivateKey.fromBase58(t).toPublicKey().toBase58()
      )
    );
    const length = addresses.length;
    let i = 0;
    for (const address of addresses) {
      if (addressesToTopup.includes(address)) {
        continue;
      }
      const balance = await accountBalanceMina(PublicKey.fromBase58(address));
      if (balance < 200) {
        if (balance !== 0) {
          try {
            const privateKey = PrivateKey.random();
            const publicKey = privateKey.toPublicKey();
            const response = await faucetDevnet({
              publicKey: publicKey.toBase58(),
              explorerUrl: Devnet.explorerAccountUrl ?? "",
              network: "devnet",
              faucetUrl: "https://faucet.minaprotocol.com/api/v1/faucet",
            });

            console.log(
              `tank ${publicKey.toBase58()}`,
              response?.result?.status
            );
            tanks.push({
              privateKey: privateKey.toBase58(),
              publicKey: publicKey.toBase58(),
            });
            addressesToTopup.push(address);
          } catch (e) {
            console.log(e);
            await sleep(120000);
          }
          await sleep(120000);
        } else console.log(`${address} has 0 balance`);
      }

      i++;
      process.stdout.write(
        `${i}/${length} (${addressesToTopup.length})        \r`
      );
      await sleep(10000);
    }
    console.log(`addresses to topup: ${addressesToTopup.length}/${length}`);
  });

  it(`should topup`, async () => {
    const txFee = await fee();
    for (let i = 0; i < tanks.length; i++) {
      try {
        const publicKey = PublicKey.fromBase58(tanks[i].publicKey);
        let balance = await accountBalance(publicKey);
        console.log(`${i}: ${publicKey.toBase58()}: ${balance}`);
        while (balance.toBigInt() < 100_000_000_000n) {
          await sleep(10000);
          balance = await accountBalance(publicKey);
        }
        console.log(`${i}: ${publicKey.toBase58()}: ${balance}`);
        const sender = publicKey;
        const receiver = PublicKey.fromBase58(addressesToTopup[i]);
        const deployer = PrivateKey.fromBase58(tanks[i].privateKey);
        const transaction = await Mina.transaction(
          { sender: publicKey, fee: txFee },
          async () => {
            const senderUpdate = AccountUpdate.createSigned(sender);
            senderUpdate.send({
              to: receiver,
              amount: balance.sub(txFee),
            });
          }
        );
        const txSent = await transaction.sign([deployer]).send();
        console.log(`Sent tx${i}: ${receiver.toBase58()}: ${txSent.hash}`);
        await sleep(30000);
      } catch (e) {
        console.log(e);
        await sleep(240000);
      }
    }
  });
});
