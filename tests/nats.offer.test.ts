import { describe, expect, it } from "@jest/globals";
import { connect, KV } from "nats";
import { sleep, makeString } from "zkcloudworker";

const endpoint = "https://cloud.zkcloudworker.com:4222";
const id = makeString(10);
const NUMBER_OF_ITERATIONS = 100;
interface Offer {
  id: string;
  price: number;
  quantity: number;
  status: "open" | "closed";
  data: string;
}

interface Bid {
  id: string;
  price: number;
  type: "offered" | "accepted";
}

describe("nats", () => {
  it(`should publish offer and watch bids`, async () => {
    const nc = await connect({ servers: endpoint });
    const js = nc.jetstream();
    const kv = await js.views.kv("auction");
    console.log("offer id", id);
    const times: number[] = [];
    for (let i = 0; i < NUMBER_OF_ITERATIONS; i++) {
      const offerId = makeString(10);
      const offer: Offer = {
        id: offerId,
        price: 100,
        quantity: 100,
        status: "open",
        data: makeString(10),
      };
      const now = Date.now();
      await kv.put("offer", JSON.stringify(offer));
      const bestBid = await watchBids(kv, offerId);
      const time = Date.now() - now;
      console.log("time", time, "ms");
      times.push(time);
      const acceptedBid = { ...bestBid, type: "accepted" };
      await kv.put(
        "bids." + offerId + "." + bestBid?.id,
        JSON.stringify(acceptedBid)
      );

      console.log("best bid", bestBid);
    }
    await nc.drain();
    console.log(
      "times",
      times.sort((a, b) => a - b)
    );
    console.log("average", times.reduce((a, b) => a + b, 0) / times.length);
    console.log("min", Math.min(...times));
    console.log("max", Math.max(...times));
  });
});

async function watchBids(kv: KV, id: string): Promise<Bid | null> {
  let history = true;
  const iter = await kv.watch({
    key: `bids.${id}.>`,
    initializedFn: () => {
      history = false;
    },
  });

  const bids: Bid[] = [];
  for await (const e of iter) {
    const bid = JSON.parse(e.string()) as Bid;
    // console.log(
    //   `${history ? "History" : "Updated"} ${e.key} @ ${e.revision} -> `,
    //   bid
    // );
    bids.push(bid);
    if (bids.length >= 3 || bids.some((b) => b.price < 40)) {
      const bestBid = bids.sort((a, b) => a.price - b.price)[0];
      console.log(
        "best bid:",
        bestBid.price,
        "of",
        bids.map((b) => b.price)
      );
      return bestBid;
    }
  }
  return null;
}
