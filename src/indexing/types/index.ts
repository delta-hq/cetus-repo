export interface CoinInfo {
  decimals: number;
  name: string;
  symbol: string;
  description: string;
  iconUrl: string | null;
  address: string | null;
  // sui has a list of legitimate coins (https://docs.sui.io/learn/sui-bridging) I cross check with.
  //If it fails, doesn't mean it's not legit necessarily tho
  verified: boolean;
}

export interface CoinInfoDB extends CoinInfo {
  id: number;
}

export interface Input {
  type: string;
  valueType: string;
  value: number;
}

interface SuiCoin {
  decimals: number;
  name: string;
  symbol: string;
  description: string;
  iconUrl: string | null;
  address: string | null;
  // sui has a list of legitimate coins (https://docs.sui.io/learn/sui-bridging) I cross check with.
  //If it fails, doesn't mean it's not legit necessarily tho
  verified: boolean;
}

export interface SuiCoinCoinMap {
  [key: string]: CoinInfoDB;
}

export interface Options {
  showInput?: boolean | undefined;
  showEffects?: boolean | undefined;
  showEvents?: boolean | undefined;
  showObjectChanges?: boolean | undefined;
  showBalanceChanges?: boolean | undefined;
}

export * from "./cetus";

export interface Result {
  id: {
    txDigest: string;
    eventSeq: string;
  };
  packageId: string;
  transactionModule: string;
  sender: string;
  type: string;
  parsedJson?: Record<string, any> | undefined;
  bcs?: string | undefined;
  timestampMs?: string | undefined;
}
