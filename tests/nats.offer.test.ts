import { describe, expect, it } from "@jest/globals";
import { connect, KV } from "nats";
import { sleep, makeString } from "zkcloudworker";

const endpoint = "https://cloud.zkcloudworker.com:4222";
const id = makeString(10);

interface Offer {
  id: string;
  price: number;
  quantity: number;
  status: "open" | "closed";
  data: string;
}

const offer: Offer = {
  id,
  price: 100,
  quantity: 100,
  status: "open",
  data: makeString(10),
};

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
    const now = Date.now();
    await kv.put("offer", JSON.stringify(offer));
    const bestBid = await watchBids(kv, id);
    console.log("time", Date.now() - now, "ms");
    const acceptedBid = { ...bestBid, type: "accepted" };
    await kv.put("bids." + id, JSON.stringify(acceptedBid));

    console.log("best bid", bestBid);
    await nc.drain();
  });
});

async function watchBids(kv: KV, id: string): Promise<Bid | null> {
  let history = true;
  const iter = await kv.watch({
    key: `bids.${id}`,
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
    if (bids.length >= 1) {
      const bestBid = bids.sort((a, b) => b.price - a.price)[0];
      return bestBid;
    }
  }
  return null;
}
