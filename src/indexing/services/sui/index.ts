import { SuiKit } from "@scallop-dao/sui-kit";

import { CoinInfoDB, SuiCoinCoinMap, Input, Options } from "../../types";
import { SUI_OFFICIAL_COINS } from "../../constants";
import { findOrCreateCoinInfo } from "../coingecko/coinInfo";
import { getClient } from "../db";
import { findAndUpdateEventState, getEventState } from "../eventState";

// @ts-ignore
globalThis.fetch = fetch; // suikit uses fetch from node version 18. Sometimes lambdas don't have node 18 and this fixes it

// return the suikit
export const getSuiKit = () => {
  return new SuiKit({
    networkType: "mainnet",
    fullnodeUrl: "https://fullnode.mainnet.sui.io",
  });
};

export const getTransactionBlock = async (
  txDigest: string,
  options: Options
) => {
  const suiKit = getSuiKit();

  // this gets the difference coin transfers from the request
  return suiKit.rpcProvider.provider.getTransactionBlock({
    digest: txDigest,
    options,
  });
};

const suiCoinMap: SuiCoinCoinMap = {};

export const coinLookup = async (address: string) => {
  if (suiCoinMap[address] !== undefined) return suiCoinMap[address];
  const suiAddress = address.split("::")[0];

  const suiKit = getSuiKit();

  const coinInfo = await suiKit.rpcProvider.provider.getCoinMetadata({
    coinType: address,
  });

  if (coinInfo == null) return null;

  const verified = SUI_OFFICIAL_COINS[suiAddress] !== undefined;
  const final = { ...coinInfo, verified };

  const findOrCreateFinal = { ...final, address: final.id };

  // @ts-ignore
  if (findOrCreateFinal.id) delete findOrCreateFinal.id;

  const coinInfodb = await findOrCreateCoinInfo(findOrCreateFinal);
  suiCoinMap[address] = coinInfodb;

  return suiCoinMap[address];
};

interface CoinMapDB {
  [key: string]: CoinInfoDB;
}

const coinMapIdCache: CoinMapDB = {};

export const coinLookupById = async (id: string): Promise<CoinInfoDB> => {
  if (coinMapIdCache[id] !== undefined) return coinMapIdCache[id];
  const client = await getClient();
  const result = await client.query(
    `select * from "coinInfo" where id = '${id}'`
  );

  coinMapIdCache[id] = await result.rows[0];

  return coinMapIdCache[id];
};

// get the chain id from the digest
export const getChainId = (digest: any): number | undefined => {
  const inputs: Array<Input> = digest.transaction?.data.transaction.inputs;
  let count = 0;
  let chainId;

  for (const { type, valueType, value } of inputs) {
    if (type === "pure" && valueType === "u16" && value !== undefined) {
      count++;
      chainId = value;
    }
  }

  if (count > 1) {
    console.log("oH SHIT");
  }

  return chainId;
};

// verify is publish_message is an attesting transaction and can be ignored
export const getIsAttesting = (digest: any): boolean => {
  for (const transaction of digest.transaction?.data.transaction.transactions) {
    if (transaction?.MoveCall?.module === "attest_token") return true;
  }

  return false;
};

// generic processor function
export const processor = async (
  event: string,
  process: Function,
  limit: number = 50,
  devMode: boolean = false
) => {
  const suiKit = getSuiKit();
  let cursor = {};
  let hasNext = true;

  while (hasNext) {
    // if (JSON.stringify(cursor) === "{}" && devMode === false) {
    //   const eventState = await getEventState(event);

    //   if (eventState) {
    //     cursor = {
    //       cursor: {
    //         txDigest: eventState.nextCursorTxDigest,
    //         eventSeq: eventState.nextCursorEventSeq,
    //       },
    //     };
    //   }
    // }

    const results = await suiKit.rpcProvider.provider.queryEvents({
      query: {
        MoveEventType: event,
      },
      ...cursor,
      limit,
      order: "ascending",
    });

    if (results.data.length === 0 && devMode === true) {
      console.log("no results returned");
      console.log(event);
    }

    for (const result of results.data) {
      await process(result);
    }

    // if (
    //   results.nextCursor?.txDigest !== undefined &&
    //   results.nextCursor.eventSeq !== undefined &&
    //   devMode === false
    // ) {
    //   await findAndUpdateEventState(
    //     event,
    //     results.nextCursor.txDigest,
    //     results.nextCursor.eventSeq
    //   );

    //   cursor = {
    //     cursor: {
    //       txDigest: results.nextCursor.txDigest,
    //       eventSeq: results.nextCursor.eventSeq,
    //     },
    //   };
    // }

    hasNext = devMode ? false : results.hasNextPage;
  }
};
