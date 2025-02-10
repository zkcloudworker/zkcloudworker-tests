import { describe, expect, it } from "@jest/globals";
import { connect, KV } from "nats";
import { sleep, makeString } from "zkcloudworker";

const endpoint = "https://cloud.zkcloudworker.com:4222";
const id = makeString(10);

interface Bid {
  id: string;
  price: number;
  type: "offered" | "accepted";
}

interface Offer {
  id: string;
  price: number;
  quantity: number;
  status: "open" | "closed";
  data: string;
}

describe("nats", () => {
  it(`should publish offer and watch bids`, async () => {
    const nc = await connect({ servers: endpoint });
    const js = nc.jetstream();
    const kv = await js.views.kv("auction");
    console.log("bid id", id);
    await watchOffers(kv);
    await nc.drain();
  });
});

async function watchBids(kv: KV, offer: Offer, bidTime: number) {
  let history = true;
  if (!offer) {
    throw new Error("No offer found");
  }
  const iter2 = await kv.watch({
    key: `bids.${offer.id}.>`,
    initializedFn: () => {
      history = false;
    },
  });
  for await (const e of iter2) {
    const bid = JSON.parse(e.string()) as Bid;

    if (bid.type === "accepted") {
      if (bid.id === id) {
        const time = Date.now() - bidTime;
        console.log("accepted in", time, "ms");
        iter2.stop();
        return;
      } else {
        const time = Date.now() - bidTime;
        console.log("bid NOT accepted in", time, "ms");
        iter2.stop();
        return;
      }
    } else {
      console.log("other bid", bid);
    }
  }
}

async function watchOffers(kv: KV) {
  let history = true;
  const iter = await kv.watch({
    key: `offer`,
    initializedFn: () => {
      history = false;
    },
  });

  let bidTime = 0;

  for await (const e of iter) {
    const offer = JSON.parse(e.string()) as Offer;
    console.log(
      `${history ? "History" : "Updated"} ${e.key} @ ${e.revision} -> `,
      offer
    );
    if (!history) {
      console.log("offer", offer);
      bidTime = Date.now();
      const bid: Bid = {
        id,
        price: Math.floor(Math.random() * 100),
        type: "offered",
      };
      await kv.put("bids." + offer.id + "." + id, JSON.stringify(bid));
      console.log("my bid", bid);
      await watchBids(kv, offer, bidTime);
    }
  }
}
