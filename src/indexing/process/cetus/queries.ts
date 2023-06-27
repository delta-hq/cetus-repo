import { ParsedCetusLiquidity, ParsedPool, ParsedSwapEvent } from "../../types";
import { getPriceAtDate } from "../../services/coingecko";
import { getClient } from "../../services/db";
import { coinLookup, coinLookupById } from "../../services/sui";
import { convertAmount } from "../../utils";
import {
  calculateSwapVolUSD,
  getLiquidityExists,
  getPool,
  getPoolExists,
  getSwapExists,
} from "./utils";

// txDigest: string,
// timestampMs: string,
// parsedSwapEvent: ParsedSwapEvent

export const insertSwapEvent = async (result: any) => {
  const txDigest = result.id.txDigest;
  const timestampMs = result.timestampMs ?? "0";
  const parsedSwapEvent = result.parsedJson as ParsedSwapEvent;

  const swapExists = await getSwapExists(txDigest);

  if (swapExists) return;

  const {
    after_sqrt_price,
    before_sqrt_price,
    fee_amount,
    pool: poolId,
    atob: aToB,
    ref_amount,
    steps,
    amount_in,
    amount_out,
  } = parsedSwapEvent;
  const client = await getClient();

  const pool = await getPool(parsedSwapEvent.pool);

  if (!pool) {
    console.log(parsedSwapEvent);
    throw new Error("Does not exist, need to account for this");
  }

  const coinA = await coinLookupById(pool.coinTypeA);
  const coinB = await coinLookupById(pool.coinTypeB);

  const [coinIn, coinOut] = aToB ? [coinA, coinB] : [coinB, coinA];

  if (coinA && coinB) {
    const amountIn = convertAmount(amount_in, coinIn.decimals);
    const amountOut = convertAmount(amount_out, coinOut.decimals);
    const coinInPrice = (await getPriceAtDate(coinIn.symbol, timestampMs)) ?? 0;
    const coinOutPrice =
      (await getPriceAtDate(coinOut.symbol, timestampMs)) ?? 0;

    const volume = await calculateSwapVolUSD(
      amountIn,
      amountOut,
      coinA,
      coinB,
      aToB,
      timestampMs
    );

    const values = [
      txDigest,
      convertAmount(after_sqrt_price, 18),
      aToB,
      convertAmount(before_sqrt_price, 18),
      fee_amount,
      poolId,
      ref_amount,
      steps,
      volume,
      coinIn.id,
      coinOut.id,
      amountIn,
      amountOut,
      amountIn * coinInPrice,
      amountOut * coinOutPrice,
      new Date(parseInt(timestampMs)),
    ];

    const query = `
          INSERT INTO "cetusSwap" (
            "txDigest",
            "afterSqrtPrice",
            "aToB",
            "beforeSqrtPrice",
            "feeAmount",
            "poolId",
            "refAmount",
            "steps",
            "volumeUsd",
            "coinIn",
            "coinOut",
            "amountIn",
            "amountOut",
            "amountInUsd",
            "amountOutUsd",
            "timestampMs"
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
          )
          RETURNING *;
        `;

    try {
      return await client.query(query, values);
    } catch (err) {
      console.log(txDigest);
      console.log(parsedSwapEvent);
      throw err;
    }
  }

  return Promise.resolve();
};

export const insertLiquidityEvent = async (result: any) => {
  const txDigest = result.id.txDigest;
  const timestampMs = result.timestampMs ?? "0";
  const liquidityProviderAddress = result.sender;
  const liquidity = result.parsedJson as ParsedCetusLiquidity;

  try {
    const poolId = liquidity.pool;

    // const liquidityExists = await getLiquidityExists(txDigest);
    // if (liquidityExists) {
    //   return Promise.resolve();
    // }

    const pool = await getPool(poolId);
    if (!pool) {
      console.log(liquidity);
      throw new Error("Does not exist, need to account for this");
    }

    const coinA = await coinLookupById(pool.coinTypeA);
    const coinB = await coinLookupById(pool.coinTypeB);

    const convertedAmountA = convertAmount(liquidity.amount_a, coinA.decimals);
    const convertedAmountB = convertAmount(liquidity.amount_b, coinB.decimals);

    const tokenPriceA = (await getPriceAtDate(coinA.symbol, timestampMs)) ?? 0;
    const tokenPriceB = (await getPriceAtDate(coinB.symbol, timestampMs)) ?? 0;

    const amountAUsd = convertedAmountA * tokenPriceA;
    const amountBUsd = convertedAmountB * tokenPriceB;

    const client = await getClient();
    const query = `
                INSERT INTO "cetusLiquidity" ("txDigest", "liquidityProviderAddress", "afterLiquidity", "amountA", "amountB", "convertedAmountA", "convertedAmountB", "amountAUsd", "amountBUsd", "liquidity", "pool", "position", "tickLowerBits", "tickUpperBits", "timestampMs")
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
              `;

    const values = [
      txDigest,
      liquidityProviderAddress,
      liquidity.after_liquidity,
      liquidity.amount_a,
      liquidity.amount_b,
      convertedAmountA,
      convertedAmountB,
      amountAUsd,
      amountBUsd,
      liquidity.liquidity,
      liquidity.pool,
      liquidity.position,
      liquidity.tick_lower.bits,
      liquidity.tick_upper.bits,
      new Date(parseInt(timestampMs)),
    ];

    console.log(values);

    throw new Error("end here");
    // const insert = await client.query(query, values);

    return Promise.resolve();
  } catch (err) {
    console.log(liquidity);
    console.log("failed to insert liquidity event");
    throw err;
  }
};

export const insertPool = async (result: any) => {
  const txDigest = result.id.txDigest;
  const timestampMs = result.timestampMs ?? "0";
  const pool = result.parsedJson as ParsedPool;

  try {
    const exists = await getPoolExists(pool.pool_id);
    if (exists) return Promise.resolve();

    try {
      const coinA = await coinLookup(`0x${pool.coin_type_a}`);
      const coinB = await coinLookup(`0x${pool.coin_type_b}`);
      const client = await getClient();
      const query = `
          INSERT INTO "cetusPool" ("txDigest", "timestampMs", "poolId", "coinTypeA", "coinTypeB", "tickSpacing")
          VALUES ($1, $2, $3, $4, $5, $6)
        `;
      const values = [
        txDigest,
        new Date(parseInt(timestampMs)),
        pool.pool_id,
        // @ts-ignore
        coinA.id,
        // @ts-ignore
        coinB.id,
        pool.tick_spacing,
      ];

      return client.query(query, values);
    } catch (err) {
      console.log("coin lookup failed");
      throw err;
    }
  } catch (err) {
    console.log("failed to insert pool");
    console.log(err);
  }
};
