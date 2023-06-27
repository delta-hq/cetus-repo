import { Client } from "pg";
import { DataSource } from "typeorm";
import { CoinInfo, EventStates } from "./models";

// not actual creds
const password = "09ZQcndxZvfb4q8ctWFU";
const user = "cetus_user";
const host = "db.bgyjpkfmfejopdxeewwp.supabase.co";
const database = "postgres";

let client: Client | undefined;

export const getClient = async (): Promise<Client> => {
  if (client !== undefined) return client;

  console.log("creating new client");

  client = new Client({
    host,
    user,
    database,
    password,
  });

  await client.connect();

  return client;
};

let typeOrmClient: DataSource | undefined;

export const getTypeOrmClient = async (): Promise<DataSource> => {
  if (typeOrmClient !== undefined) return typeOrmClient;

  console.log("creating new typeorm client");

  const AppDataSource = new DataSource({
    type: "postgres",
    host,
    port: 5432,
    username: user,
    password,
    database,
    entities: [CoinInfo, EventStates],
    synchronize: true,
  });

  typeOrmClient = await AppDataSource.initialize();

  return typeOrmClient;
};
