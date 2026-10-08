import { runDetailedBatch } from "./build-detailed-aids-500";

runDetailedBatch({
  startKey: "24:11",
  nextVerseKey: "27:143",
  scope: "24:11–27:142",
  fileSuffix: "500-sixth",
  verifiedAt: "2026-10-09",
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
