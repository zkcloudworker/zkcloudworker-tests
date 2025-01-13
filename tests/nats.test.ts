import { describe, expect, it } from "@jest/globals";
import { connect } from "nats";
import { sleep } from "zkcloudworker";

const endpoint = "https://cloud.zkcloudworker.com:4222";

describe("nats", () => {
  it.skip(`should use nats`, async () => {
    const nc = await connect({ servers: endpoint });
    const jsm = await nc.jetstreamManager();
    // list all the streams, the `next()` function
    // retrieves a paged result.
    const streams = await jsm.streams.list().next();
    streams.forEach((si) => {
      console.log(si);
    });
    // add a stream - jetstream can capture nats core messages
    const stream = "zkcw";
    const subj = `zkcw.*`;
    await jsm.streams.add({ name: stream, subjects: [subj] });
    nc.publish(`zkcw.a`, "a1");
    nc.publish(`zkcw.b`, "b1");
    console.log("published");
    await sleep(1000);
    const name = await jsm.streams.find("zkcw.a");
    console.log("name", name);
    const si = await jsm.streams.info(name);
    console.log("si", si);
    const sm = await jsm.streams.getMessage(stream, { seq: 5 });
    console.log({ message: (sm as any).smr.message });
    nc.drain();
    nc.close();
  });
  it(`should use kv`, async () => {
    const nc = await connect({ servers: endpoint });
    const js = nc.jetstream();
    const kv = await js.views.kv("profiles");
    await kv.put("sue.color", "blue");
    let entry = await kv.get("sue.color");
    console.log("sue.color", { str: entry?.string() });
    await kv.put("sue.color", "green");
    entry = await kv.get("sue.color");
    console.log("sue.color", { str: entry?.string() });
    const status = await kv.status();
    console.log("KV stream name", status.streamInfo.config.name);

    await nc.drain();
  });
  it.skip(`should get job status`, async () => {
    const nc = await connect({ servers: endpoint });
    const js = nc.jetstream();
    const kv = await js.views.kv("profiles");

    let revision = 0;
    while (true) {
      const entry = await kv.get(
        "zkcloudworker.job.zkCWZRGuAakatqUZlzuhNDxgKVHNoxeSLVzeAHZQVcExHpw0"
      );
      if (entry) {
        const job = JSON.parse(entry.string());
        if (revision !== entry.revision)
          console.log("job.status", { revision: entry.revision, job });
        revision = entry.revision;
        if (entry.string() == "done") {
          break;
        }
      }
      await sleep(1000);
    }
    await nc.drain();
  });
  it.skip(`should watch job status`, async () => {
    const nc = await connect({ servers: endpoint });
    const js = nc.jetstream();
    const kv = await js.views.kv("profiles");

    let jobStatus = "";
    let history = true;
    const iter = await kv.watch({
      key: "zkcloudworker.job.staketab.nameservice",
      //key: "zkcloudworker.job.DFST.worker-example",
      initializedFn: () => {
        history = false;
      },
    });

    for await (const e of iter) {
      const job = JSON.parse(e.string());
      console.log(
        `${history ? "History" : "Updated"} ${e.key} @ ${e.revision} -> `,
        JSON.parse(e.string())
      );
      let historyJob = true;
      const iterJob = await kv.watch({
        key: `zkcloudworker.jobStatus.${job.jobId}`,
        initializedFn: () => {
          history = false;
        },
      });
      for await (const e of iterJob) {
        const jobStatus = JSON.parse(e.string());
        console.log(
          `${historyJob ? "History" : "Updated"} ${e.key} @ ${e.revision} -> `,
          jobStatus
        );
        if (jobStatus.status === "finished" || jobStatus.status === "failed")
          break;
      }
    }

    await nc.drain();
  });

  it.skip(`should watch multiple jobs status`, async () => {
    const jobKeys = [
      "zkcloudworker.job.staketab.nameservice",
      "zkcloudworker.job.DFST.worker-example",
      // Add more job keys as needed
    ];

    await watchJobStatuses(endpoint, jobKeys).catch(console.error);
  });
});

async function watchJobStatuses(endpoint: string, jobKeys: string[]) {
  const nc = await connect({ servers: endpoint });
  const js = nc.jetstream();
  const kv = await js.views.kv("profiles");

  // Function to watch the status of a single job
  async function watchJobStatus(jobId: string) {
    let historyJob = true;
    const iterJob = await kv.watch({
      key: `zkcloudworker.jobStatus.${jobId}`,
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
      if (jobStatus.status === "finished" || jobStatus.status === "failed") {
        break;
      }
    }
  }

  // Function to watch multiple job statuses concurrently
  async function watchMultipleJobs(key: string) {
    let history = true;
    const iter = await kv.watch({
      key,
      initializedFn: () => {
        history = false;
      },
    });

    for await (const e of iter) {
      const job = JSON.parse(e.string());
      console.log(
        `${history ? "History" : "Updated"} ${e.key} @ ${e.revision} -> `,
        job
      );

      // Start watching the jobStatus of the current job
      watchJobStatus(job.jobId);
    }
  }

  // Watch all jobs concurrently
  await Promise.all(jobKeys.map((key) => watchMultipleJobs(key)));

  await nc.drain();
}
