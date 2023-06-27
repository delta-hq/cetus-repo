export * from "./wormhole";

export const UNISWAP_V3_DECIMALS = 18;

interface StableMap {
  [key: string]: boolean;
}

export const USD_STABLE_MAP: StableMap = {
  usdc: true,
  usdt: true,
  dai: true,
  busd: true,
  tusd: true,
};
