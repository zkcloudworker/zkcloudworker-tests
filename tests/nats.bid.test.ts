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

const bid: Bid = {
  id,
  price: Math.floor(Math.random() * 100),
  type: "offered",
};

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

async function watchOffers(kv: KV) {
  let history = true;
  const iter = await kv.watch({
    key: `offer`,
    initializedFn: () => {
      history = false;
    },
  });

  let bidTime = 0;
  let offer: Offer | null = null;

  for await (const e of iter) {
    offer = JSON.parse(e.string()) as Offer;
    // console.log(
    //   `${history ? "History" : "Updated"} ${e.key} @ ${e.revision} -> `,
    //   offer
    // );
    if (!history) {
      //console.log("offer", offer);
      bidTime = Date.now();
      await kv.put("bids." + offer.id, JSON.stringify(bid));

      break;
    }
  }
  history = true;
  if (!offer) {
    throw new Error("No offer found");
  }
  const iter2 = await kv.watch({
    key: `bids.${offer.id}`,
    initializedFn: () => {
      history = false;
    },
  });
  for await (const e of iter2) {
    const bid = JSON.parse(e.string()) as Bid;

    if (bid.id === id) {
      if (bid.type === "accepted") {
        const time = Date.now() - bidTime;
        console.log("accepted in", time, "ms");
        return;
      }
    } else {
      console.log("other bid", bid);
    }
  }
}
