import { runDetailedBatch } from "./build-detailed-aids-500";

runDetailedBatch({
  startKey: "9:67",
  nextVerseKey: "14:52",
  scope: "9:67–14:51",
  fileSuffix: "500-third",
  verifiedAt: "2026-10-07",
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
