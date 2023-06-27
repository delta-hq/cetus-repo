import { Client } from "pg";
import { DataSource } from "typeorm";
import { CoinInfo, EventStates } from "./models";
require("dotenv").config();

const password = process.env.DB_USER;
const user = process.env.DB_USER;
const host = process.env.DB_HOST;
const database = "postgres";

console.log(password);
console.log(user);
console.log(host);

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
