import { BLOCKBERRY_API } from "../env.json";

/*
{
  data: [
    {
      tokenId: 'xBxjFpJkbWpbGua7Lf36S1NLhffFoEChyP3pz6SYKnx7dFCTwg',
      tokenSymbol: 'PUNK5',
      balance: 1181.49,
      nonce: 0,
      tokenType: 'CUSTOM_TOKEN',
      tokenName: 'Punk',
      tokenImage: 'https://strapi-dev.scand.app/uploads/Punkpoll_Logo_3f85b2e29d_2e251a1e65.jpg',
      isVerified: true,
      isBridged: false,
      coingeckoCoinId: null,
      coinmarketCoinId: null
    }
  ],
  size: 20,
  totalPages: 1,
  pageable: {
    sort: { sorted: true, empty: false, unsorted: false },
    pageNumber: 0,
    pageSize: 20,
    offset: 0,
    paged: true,
    unpaged: false
  },
  last: true,
  totalElements: 1,
  number: 0,
  sort: { sorted: true, empty: false, unsorted: false },
  first: true,
  numberOfElements: 1,
  empty: false
}
*/
export interface BlockberryTokenData {
  tokenId: string;
  tokenSymbol: string;
  balance: number;
  nonce: number;
  tokenType: string;
  tokenName: string;
  tokenImage: string;
  isVerified: boolean;
  isBridged: boolean;
  coingeckoCoinId: string | null;
  coinmarketCoinId: string | null;
}

export interface BlockberryTokens {
  data: BlockberryTokenData[];
  size: number;
  totalPages: number;
  pageable: {
    sort: { sorted: boolean; empty: boolean; unsorted: boolean };
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  number: number;
  sort: { sorted: boolean; empty: boolean; unsorted: boolean };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export async function getAllTokensByAddress(params: {
  account: string;
  chain: string;
}): Promise<BlockberryTokenData[]> {
  const { account, chain } = params;
  let allTokens: BlockberryTokenData[] = [];
  let page = 0;
  let size = 50;
  let totalPages = 1;

  while (page < totalPages) {
    const result = await getTokensByAddress({ account, page, size, chain });
    if (result) {
      allTokens.push(...(result.data ?? []));
      totalPages = result.totalPages;
      page++;
    } else {
      return allTokens;
    }
  }

  return allTokens;
}

export async function getTokensByAddress(params: {
  account: string;
  page?: number;
  size?: number;
  chain: string;
}): Promise<BlockberryTokens | undefined> {
  const { account, page = 0, size = 50, chain } = params;
  if (BLOCKBERRY_API === undefined) {
    throw new Error("BLOCKBERRY_API is undefined");
  }
  if (chain === undefined) throw new Error("NEXT_PUBLIC_CHAIN is undefined");
  if (chain !== "devnet" && chain !== "mainnet")
    throw new Error("NEXT_PUBLIC_CHAIN must be devnet or mainnet");
  if (size < 1 || size > 50) throw new Error("size must be between 1 and 50");
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-api-key": BLOCKBERRY_API,
    },
  };
  try {
    const response = await fetch(
      `https://api.blockberry.one/mina-${chain}/v1/tokens/accounts/${account}?page=${page}&size=${size}&orderBy=DESC&sortBy=BALANCE`,
      options
    );
    if (!response.ok) {
      console.error("response:", response);
      return undefined;
    }
    const result = await response.json();
    return result as unknown as BlockberryTokens;
  } catch (err) {
    console.error(err);
    return undefined;
  }
}
