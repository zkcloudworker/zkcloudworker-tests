import { describe, expect, it } from "@jest/globals";
import { connect } from "nats";
import { sleep } from "zkcloudworker";

const endpoint = "https://cloud.zkcloudworker.com:4222";

describe("nats", () => {
  it(`should watch multiple jobs status`, async () => {
    const tx = "o1wga0tnViVSV3nxEPimLUd0PCiQGzjhAgjkgJoMgNNCB";
    await watchTxStatus(endpoint, tx).catch(console.error);
  });
});

async function watchTxStatus(endpoint: string, tx: string) {
  const nc = await connect({ servers: endpoint });
  const js = nc.jetstream();
  const kv = await js.views.kv("profiles");

  // Function to watch the status of a single job
  async function watchJobStatus(jobId: string) {
    let historyJob = true;
    const iterJob = await kv.watch({
      key: `zkcloudworker.rolluptx.${tx}`,
      initializedFn: () => {
        historyJob = false;
      },
    });

    for await (const e of iterJob) {
      const jobStatus = JSON.parse(e.string());
      console.log(
        `${historyJob ? "History" : "Updated"} ${e.key} @ ${e.revision} -> `,
        jobStatus
      );
    }
  }

  // Function to watch multiple job statuses concurrently

  // Watch all jobs concurrently
  await watchJobStatus(tx);

  await nc.drain();
}
