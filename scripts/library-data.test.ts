import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readLibraryData, writeLibraryData } from "./library-data";

const library = readLibraryData();
test("Surah shard migration and repeat writes preserve exact source objects and detailed-aid fingerprints", async () => {
  const dir = await mkdtemp(join(tmpdir(), "quran-library-"));
  try {
    const original = { surahs: library.surahs.slice(0, 2) };
    await writeFile(join(dir, "quran-library.json"), JSON.stringify(original));
    assert.deepEqual(readLibraryData(dir), original);
    await writeLibraryData(original, dir);
    assert.deepEqual(readLibraryData(dir), original);
    await writeLibraryData(original, dir);
    assert.deepEqual(readLibraryData(dir), original);
    const manifest = JSON.parse(await readFile(join(dir, "quran-library.json"), "utf8"));
    assert.equal(manifest.format, "surah-shards-v1");
    const generatedModule = await readFile(join(dir, "quran-library.ts"), "utf8");
    assert.match(generatedModule, /quran-surahs\/001\.json/);
    assert.match(generatedModule, /quran-surahs\/002\.json/);
    assert.equal(manifest.shards.length, 2);
    manifest.shards[0].file = "../outside.json";
    await writeFile(join(dir, "quran-library.json"), JSON.stringify(manifest));
    assert.throws(() => readLibraryData(dir), /Invalid Quran library shard/);
    manifest.shards[0].file = "quran-surahs/001.json";
    await writeFile(join(dir, "quran-library.json"), JSON.stringify(manifest));
    await writeFile(join(dir, manifest.shards[0].file), JSON.stringify(original.surahs[1]));
    assert.throws(() => readLibraryData(dir), /shard mismatch/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
