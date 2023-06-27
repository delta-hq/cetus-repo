CREATE TABLE "cetusPool" (
  "txDigest" varchar(100),
  "poolId" VARCHAR(250) PRIMARY KEY,
  "coinTypeA" INT REFERENCES "coinInfo" (id),
  "coinTypeB" INT REFERENCES "coinInfo" (id),
  "tickSpacing" INT,
  "timestampMs" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "cetusLiquidity" (
  "txDigest" varchar(100) PRIMARY KEY,
  "liquidityProviderAddress" varchar(100),
  "afterLiquidity" varchar(255),
  "amountA" varchar(255),
  "amountB" varchar(255),
  "convertedAmountA" float,
  "convertedAmountB" float,
  "amountAUsd" float,
  "amountBUsd" float,
  "liquidity" varchar(255),
  "pool" varchar(255) REFERENCES "cetusPool" ("poolId"),
  "position" varchar(255),
  "tickLowerBits" BIGINT,
  "tickUpperBits" BIGINT,
  "timestampMs" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "cetusSwap" (
  "txDigest" varchar(70) PRIMARY KEY,
  "afterSqrtPrice" FLOAT,
  "aToB" BOOLEAN,
  "beforeSqrtPrice" FLOAT,
  "feeAmount" VARCHAR(300),
  "poolId" VARCHAR(100) REFERENCES "cetusPool" ("poolId"),
  "refAmount" VARCHAR(30),
  "steps" INT,
  "volumeUsd" float,
  "coinIn" INT REFERENCES "coinInfo" (id),
  "coinOut" INT REFERENCES "coinInfo" (id),
  "amountIn" float,
  "amountOut" float,
  "amountInUsd" float,
  "amountOutUsd" float,
  "timestampMs" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
