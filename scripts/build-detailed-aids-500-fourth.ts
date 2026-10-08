import { runDetailedBatch } from "./build-detailed-aids-500";

runDetailedBatch({
  startKey: "14:52",
  nextVerseKey: "19:52",
  scope: "14:52–19:51",
  fileSuffix: "500-fourth",
  verifiedAt: "2026-10-08",
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
