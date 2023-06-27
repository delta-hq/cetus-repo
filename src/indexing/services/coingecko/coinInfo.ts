import { QueryResult } from "pg";
import { getClient } from "../../services/db";
import { CoinInfo, CoinInfoDB } from "../../types";

// Function to find or create a coinInfo row
export const findOrCreateCoinInfo = async (
  coinInfoData: CoinInfo
): Promise<CoinInfoDB> => {
  const client = await getClient();
  try {
    // Start a transaction

    await client.query("BEGIN");

    // Find the coinInfo by address
    const findQuery = 'SELECT * FROM "coinInfo" WHERE address = $1';
    const findResult: QueryResult<CoinInfoDB> = await client.query(findQuery, [
      coinInfoData.address,
    ]);

    let coinInfo: CoinInfoDB;

    if (findResult.rowCount > 0) {
      // CoinInfo exists, return the found row
      coinInfo = findResult.rows[0];
    } else {
      // CoinInfo doesn't exist, create a new row
      const createQuery =
        'INSERT INTO "coinInfo" (address, decimals, name, symbol, description, "iconUrl", verified) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
      const createResult: QueryResult<CoinInfoDB> = await client.query(
        createQuery,
        [
          coinInfoData.address,
          coinInfoData.decimals,
          coinInfoData.name,
          coinInfoData.symbol,
          coinInfoData.description,
          coinInfoData.iconUrl,
          coinInfoData.verified,
        ]
      );

      coinInfo = createResult.rows[0];
    }

    // Commit the transaction
    await client.query("COMMIT");

    return coinInfo;
  } catch (error) {
    console.log(error);
    // Rollback the transaction if an error occurs

    throw error;
  }
};
