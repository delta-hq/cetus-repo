import {
  processAddLiquidityEvents,
  processRemoveLiquidityEvents,
} from "./src/indexing/process/cetus";

(async () => {
  await processAddLiquidityEvents();
  // await processRemoveLiquidityEvents();
})();
