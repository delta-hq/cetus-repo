import { getClient } from "../db";
import { USD_STABLE_MAP } from "../../constants";

const BASE_URL = "https://pro-api.coingecko.com/api/v3";
const coingecko = "api-key";
const WITH_KEY = `x_cg_pro_api_key=${coingecko}`;

export const getCoinGeckoTokenBySymbol = async (
  symbol: string
): Promise<any> => {
  const client = await getClient();

  if (symbol.toLowerCase() === "sui") {
    const suiQuery = `SELECT * FROM "coinGeckoTokens" WHERE id = 'sui'`;
    const result = await client.query(suiQuery);

    return result.rows[0];
  }

  const query = `
        SELECT *
        FROM "coinGeckoTokens"
        WHERE LOWER(symbol) = LOWER($1);
      `;

  const values = [symbol];

  try {
    const result = await client.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("Error retrieving CoinGecko token:", error);
    throw error;
  }
};

const insertCoinGeckoToken = async (tokenData: any) => {
  const client = await getClient();

  try {
    const { id, symbol, name, platforms } = tokenData;

    const insertQuery = `
          INSERT INTO "coinGeckoTokens" (id, symbol, name, platforms)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (id) DO NOTHING
        `;
    const values = [id, symbol, name, platforms];

    await client.query(insertQuery, values);
  } catch (error) {
    console.error("Error inserting CoinGecko token:", error);
  }
};

export const getPriceAtDateFromDb = async (
  coinGeckoTokenId: string,
  date: Date
): Promise<number | null> => {
  const client = await getClient();

  try {
    const query = `
        SELECT price
        FROM "coinGeckoPriceAtDate"
        WHERE "coinGeckoTokenId" = $1
          AND date = $2
      `;
    const values = [coinGeckoTokenId, date];

    const result = await client.query(query, values);

    const price = result.rows[0]?.price;

    return result.rows[0]?.price ? result.rows[0].price : null;
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  }
};

// Function to insert data into coinGeckoPriceAtDate table
export async function insertCoinGeckoPrice(
  price: number,
  date: Date,
  coinGeckoTokenId: string
): Promise<void> {
  const query = `
      INSERT INTO "coinGeckoPriceAtDate" (price, date, "coinGeckoTokenId")
      VALUES ($1, $2, $3)
    `;
  const values = [price, date, coinGeckoTokenId];

  try {
    const client = await getClient();
    await client.query(query, values);
  } catch (error) {
    console.error(
      "Error inserting data into coinGeckoPriceAtDate table:",
      error
    );
  }
}

interface Cache {
  [key: string]: boolean;
}

const cache: Cache = {};

export const getPriceAtDate = async (
  symbol: string,
  timestampMs: string | undefined
): Promise<number | undefined> => {
  // if it's a stable, just return 1
  if (USD_STABLE_MAP[symbol.toLowerCase()]) return 1;
  if (timestampMs === undefined) return undefined;
  const coinGeckoToken = await getCoinGeckoTokenBySymbol(symbol);

  const date = new Date(parseInt(timestampMs));

  if (coinGeckoToken?.id === undefined) return undefined;
  //   https://api.coingecko.com/api/v3/coins/ethereum/history?date=30-12-2022

  const day = date.getDate().toString();
  const month = (date.getMonth() + 1).toString();
  const year = date.getFullYear().toString();
  const formattedDate = `${day}-${month}-${year}`;

  const priceAtDate = await getPriceAtDateFromDb(coinGeckoToken.id, date);

  if (priceAtDate) return priceAtDate;

  // sui isn't in coin price history, not idea why
  if (coinGeckoToken.id.toLowerCase() === "sui") {
    console.log("making coingecko query");
    const URL = `${BASE_URL}/coins/sui?${WITH_KEY}`;
    const response = await fetch(URL).then((res) => res.json());

    // @ts-ignore
    const priceUsd = response.market_data.current_price.usd;

    await insertCoinGeckoPrice(priceUsd, date, coinGeckoToken.id);

    return priceUsd;
  }

  if (cache[coinGeckoToken.id]) return undefined;
  cache[coinGeckoToken.id] = true;
  console.log("making coingecko query");

  const URL = `${BASE_URL}/coins/${coinGeckoToken.id}/history?date=${formattedDate}&localization=false&${WITH_KEY}`;
  const response = await fetch(URL).then((res) => res.json());

  // @ts-ignore
  if (!response?.market_data?.current_price?.usd) return undefined;

  // @ts-ignore
  const usdValue = response.market_data.current_price.usd;

  await insertCoinGeckoPrice(usdValue, date, coinGeckoToken.id);

  return usdValue;
};
