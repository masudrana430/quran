import { runDetailedBatch } from "./build-detailed-aids-500";

runDetailedBatch({
  startKey: "19:52",
  nextVerseKey: "24:11",
  scope: "19:52–24:10",
  fileSuffix: "500-fifth",
  verifiedAt: "2026-10-08",
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
