import { getClient } from "../services/db";
import { getPriceAtDate } from "../services/coingecko";
import { UNISWAP_V3_DECIMALS } from "../constants";
import { CoinInfoDB } from "../types";
import { ethers } from "ethers";

export const convertAmount = (amount: string, decimals: number): number => {
  const final = ethers.formatUnits(amount, decimals);

  return parseFloat(final);
};

export const getSwapExists = async (txDigest: string): Promise<boolean> => {
  try {
    const client = await getClient();
    const query = `
            SELECT EXISTS (
                SELECT 1
                FROM "cetusSwap"
                WHERE "txDigest" = $1
            )
        `;
    const values = [txDigest];
    const result = await client.query(query, values);
    return result.rows[0].exists;
  } catch (err) {
    console.log("failed in: getSwapExists");
    console.log(txDigest);
    throw err;
  }
};

export const getLiquidityExists = async (
  txDigest: string
): Promise<boolean> => {
  try {
    const client = await getClient();
    const query = `
            SELECT EXISTS (
              SELECT 1
              FROM "cetusLiquidity"
              WHERE "txDigest" = $1
            )
          `;
    const values = [txDigest];

    const exists = await client.query(query, values);

    return exists.rows[0].exists;
  } catch (err) {
    console.log("failed in: getLiquidityExists");
    console.log(txDigest);
    throw err;
  }
};

interface PoolExistsCache {
  [key: string]: boolean;
}

const poolExists: PoolExistsCache = {};

export const getPoolExists = async (poolId: string): Promise<boolean> => {
  try {
    if (poolExists[poolId]) return Promise.resolve(poolExists[poolId]);

    const client = await getClient();
    const query = `
            SELECT EXISTS (
              SELECT *
              FROM "cetusPool"
              WHERE "poolId" = $1
            )
          `;
    const values = [poolId];
    const exists = await client.query(query, values);

    poolExists[poolId] = exists.rows[0].exists;

    return exists.rows[0].exists;
  } catch (err) {
    console.log("failed in: getPoolExists");
    console.log(poolId);
    console.log(err);
    throw err;
  }
};

interface PoolCache {
  [key: string]: any;
}

const poolCache: PoolCache = {};

export const getPool = async (poolId: string): Promise<any> => {
  try {
    if (poolCache[poolId]) return Promise.resolve(poolCache[poolId]);

    const client = await getClient();
    const query = `
                SELECT *
                FROM "cetusPool"
                WHERE "poolId" = $1
            `;
    const values = [poolId];
    const result = await client.query(query, values);

    const coinQuery = `select * from "coinInfo" where "id" = $1`;
    const poolInfo = result.rows[0];

    if (poolInfo) {
      const coinAInfo = await client.query(coinQuery, [poolInfo.coinTypeA]);
      const coinBInfo = await client.query(coinQuery, [poolInfo.coinTypeB]);
      poolInfo.coinAInfo = coinAInfo.rows[0];
      poolInfo.coinBInfo = coinBInfo.rows[0];
      poolCache[poolId] = poolInfo;
    }

    return poolCache[poolId];
  } catch (err) {
    console.log("failed in: getPoolExists");
    console.log(poolId);
    console.log(err);
    throw err;
  }
};

export const convertToUniswapAmount = (amount: string): number =>
  parseFloat(amount) / Math.pow(10, UNISWAP_V3_DECIMALS);

export const calculateSwapVolUSD = async (
  amountIn: number,
  amountOut: number,
  coinIn: CoinInfoDB,
  coinOut: CoinInfoDB,
  aToB: boolean,
  timestampMs: string
) => {
  const priceA = await getPriceAtDate(coinIn.symbol, timestampMs);
  const priceB = await getPriceAtDate(coinOut.symbol, timestampMs);
  let total = 0;

  if (priceA) {
    total += (aToB ? amountIn : amountOut) * priceA;
  }

  if (priceB) {
    total += (aToB ? amountOut : amountIn) * priceB;
  }

  return total;
};

export const convertToNegative = (amount: string): string => {
  if (amount.trim() === "0") return amount;
  return "-" + amount;
};
