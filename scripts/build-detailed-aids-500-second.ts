import { runDetailedBatch } from "./build-detailed-aids-500";

runDetailedBatch({
  startKey: "6:13",
  nextVerseKey: "9:67",
  scope: "6:13–9:66",
  fileSuffix: "500-second",
  verifiedAt: "2026-10-07",
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
