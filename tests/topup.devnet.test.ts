import { describe, expect, it } from "@jest/globals";
import {
  Devnet,
  sleep,
  initBlockchain,
  accountBalance,
  fee,
} from "zkcloudworker";
import { PrivateKey, PublicKey, Mina, AccountUpdate } from "o1js";
import { faucetDevnet } from "../src/faucet";

const keys: string[] = [
  "B62qjpZBVp8NDku1nQLMmxVGe4ucYdXQ1DCJYW4ikgCjyaFTUGsbb6w",
  "B62qo69VLUPMXEC6AFWRgjdTEGsA3xKvqeU5CgYm3jAbBJL7dTvaQkv",
  "B62qobAYQBkpC8wVnRzydrtCgWdkYTqsfXTcaLdGq1imtqtKgAHN29K",
  "B62qiq7iTTP7Z2KEpQ9eF9UVGLiEKAjBpz1yxyd2MwMrxVwpAMLta2h",
  "B62qo2bAnq2doLtKHmQGL4dnAwakxucefzG3oSUpnAdPBukcpbQfJtT",
  "B62qja1xkTqG13nCWZYGJjKft9BgfRKbSbM5UNPUQtfmnWsrKA5gzDB",
  "B62qmZzjLeVjtNW3dECeiV7rbLYC1qufQzxTunL7pKtPS6Yz1jJNUZ7",
  "B62qpadpnNB2rNwCgfQ8wd4DHHwE47KYfXFNzzgViVzWe4NUaaxdSU9",
  "B62qkUYWyEznicHrGAmPTjZNwkvjhehEAEDsj1T9cdKbEhWg9mQG5KQ",
  "B62qpzpKh4rfCJqhmDk9VnWTfyPib8AxznYhMzuEWkP6pMnUowrKN5L",
  "B62qpqd5Pi9RqvKkKRh2i5cGbSNbR85RBmYCT4xGM8f2ZEVh3ULHrby",
  "B62qo2bAnq2doLtKHmQGL4dnAwakxucefzG3oSUpnAdPBukcpbQfJtT",
  "B62qn26jg5P1F8iKVBZd8xPfkRQvx4Yu8PgRZXoeSHrGQcuBNeLRicu",
  "B62qky5caR6dHpjAhrwdcxVFjLTSWCP44Mb4KzA47yqFZZVr8UkaBj2",
  "B62qpbw5zAVQEJuwrSbCckPYwT6gg84Vup3CoVjSK4VHhtzcxdhf1wR",
  "B62qrSkcbMzhiKG9Vz8egyLC5SNLCERiPvpxTRaWZN5vxe4Dco3L2cd",
  "B62qoR2oiqQGS63z1NSbmxEkybYQaFMBgnFTX2EfoMEPVuQc9xSC35t",
  "B62qjcRG5P21V2fQzgJLecP1TVXPHcwQHmQSYf9LoWYGyKYe4KXeb4b",
  "B62qrf3s9UZE9LZ3U21u2n8L34zMqGVFmgEqKdQ3YEVNmPriWQDjc52",
  "B62qjiSaCm7J8xEiZAnn8WVnMxD8L3C9L5Ppys6rnFqxWapUGmKUYcT",
  "B62qpXEssXWC6peuhGZMyhtrSh9BaMCQXoqviEvxKtE8z93woVkyWi9",
  "B62qkWXWcgSnExrcF7iFyioao5WAx3Ayyz3bWMkgQrcAHqkB999eEay",
  "B62qmKggMTU6TyrEXdCGEakBbsc3EBeypXTWQmpqRA3y88xepXeQm3a",
  "B62qjFmTAzmLvPXRhUn8H83BoqtQxFtqHe8DkYBrj44TP6uKWWNfa1a",
  "B62qmoZqbXP3zRDFiVhczH6XXzHN2jhEq6dT9XqZ4trc1Y8oXyCAJgK",
  "B62qoQ7oMLTHHaW4g2DtRiKbAi41xGWRGhm59A9mof5pVZuUJhwLyUG",
  "B62qjrWFfTuosipqFV2wrWCPWHo2UHk3sdcJAsvNj61eowfrXBq4X8F",
  "B62qpiTxGZAc2j82g8DMW2oS4zou3fcDb8meENk9jmjhvrwHDJFbczv",
  "B62qqqcQrWD18jitNAiF9WnJf7bcrmUabXShYTubKktuGSLyidUhY4U",
];
const addressesToTopup: string[] = [];

const tanks: {
  privateKey: string;
  publicKey: string;
}[] = [];

describe("Balance", () => {
  it(`should get the funds`, async () => {
    await initBlockchain("devnet");
    for (let i = 0; i < keys.length; i++) {
      const publicKey = PublicKey.fromBase58(keys[i]);
      let balance = await accountBalance(publicKey);
      console.log(
        `${i}: ${publicKey.toBase58()}: ${balance.toBigInt() / 1_000_000_000n}`
      );
      if (balance.toBigInt() < 1_000_000_000_000n) {
        await sleep(5000);
        addressesToTopup.push(publicKey.toBase58());
      }
    }
    for (let i = 0; i < addressesToTopup.length; i++) {
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
          `${i}: ${privateKey.toBase58()} ${publicKey.toBase58()}`,
          response?.result?.status
        );
        tanks.push({
          privateKey: privateKey.toBase58(),
          publicKey: publicKey.toBase58(),
        });
      } catch (e) {
        console.log(e);
        await sleep(120000);
      }
      await sleep(30000);
    }
  });
  it(`should get the balances`, async () => {
    const txFee = await fee();
    for (let i = 0; i < tanks.length; i++) {
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
    }
  });
});
