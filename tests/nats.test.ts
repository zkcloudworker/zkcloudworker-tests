import { describe, expect, it } from "@jest/globals";
import { connect } from "nats";
import { sleep } from "zkcloudworker";

const endpoint = "http://cloud.zkcloudworker.com:4222";

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
    //await jsm.streams.add({ name: stream, subjects: [subj] });
    //nc.publish(`zkcw.a`, "a1");
    //nc.publish(`zkcw.b`, "b1");
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
  it.skip(`should use kv`, async () => {
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

    let jobStatus = "";
    while (true) {
      const entry = await kv.get("zkcloudworker.jobStatus");
      if (entry) {
        const job = JSON.parse(entry.string());
        if (job.status !== jobStatus) console.log("job.status", { job });
        jobStatus = job.status;
        if (entry.string() == "done") {
          break;
        }
      }
      await sleep(1000);
    }
    await nc.drain();
  });
  it(`should watch job status`, async () => {
    const nc = await connect({ servers: endpoint });
    const js = nc.jetstream();
    const kv = await js.views.kv("profiles");

    let jobStatus = "";
    let history = true;
    const iter = await kv.watch({
      key: "zkcloudworker.jobStatus",
      initializedFn: () => {
        history = false;
      },
    });

    for await (const e of iter) {
      //Values marked with History are existing values -
      // the watcher by default shows the last value for all the keys in the KV

      console.log(
        `${history ? "History" : "Updated"} ${e.key} @ ${e.revision} -> `,
        JSON.parse(e.string())
      );
    }

    await nc.drain();
  });
});
