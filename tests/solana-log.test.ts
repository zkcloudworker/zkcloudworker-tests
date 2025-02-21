import { describe, expect, it } from "@jest/globals";
import { Connection, PublicKey } from "@solana/web3.js";

describe("Solana Log", () => {
  it(`should check random keys`, async () => {
    // Create a connection to the cluster (e.g., Devnet or Mainnet)
    const connection = new Connection(
      "https://api.mainnet-beta.solana.com",
      "confirmed"
    );

    // Replace with your program's public key
    const programId = new PublicKey(
      "EouyxBN9iZWtYc3N9juRYiqmyXEFQPo6jpZaVmGb7rLY"
    );

    // Subscribe to logs emitted by your program
    connection.onLogs(programId, (logInfo, ctx) => {
      const logs = logInfo.logs.filter((log) => log.includes("Dex"));
      if (logs.length > 0) {
        console.log("Dex:", logs);
      }
    });
  });
});

/*
[11:51:43 AM] Dex: [ 'Program log: Dex::RaydiumSwap amount_in: 141188416035, offset: 0' ]
[11:51:46 AM] Dex: [
  'Program log: Dex::RaydiumSwap amount_in: 9410619020, offset: 0',
  'Program log: Dex::RaydiumSwap amount_in: 252981645, offset: 19'
]
[11:51:53 AM] Dex: [
  'Program log: Transfering collateral from buyer to curve account: 766883, Helio fee: 3068, Dex fee: 4600'
]
[11:51:55 AM] Dex: [ 'Program log: Dex::RaydiumSwap amount_in: 49575000, offset: 0' ]
[11:52:00 AM] Dex: [
  'Program log: Dex::Phoenix amount_in: 39660000, offset: 0',
  'Program log: Dex::RaydiumSwap amount_in: 230000000, offset: 9'
]

*/
