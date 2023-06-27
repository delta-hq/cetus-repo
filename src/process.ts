import { JsonRpcProvider, mainnetConnection } from "@mysten/sui.js";
// connect to Devnet
const provider = new JsonRpcProvider(mainnetConnection);
// get tokens from the DevNet faucet server

const run = async () => {
  const res = await provider.getTransactionBlock({
    digest: "123SLuDy75ew2XjVeKmc7UdrWFPsg3auoWWJ8GpRhmTW",
    options: {
      showBalanceChanges: true,
      showEffects: true,
    },
  });

  console.log(res);
};

run();
