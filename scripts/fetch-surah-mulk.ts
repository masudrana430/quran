// Prevent the original importer from erasing existing notes.
console.error(
  "Destructive importer retired. Use npm run import:batch -- --limit=300. Original notes remain in src/data/surah-mulk.json.",
);
process.exitCode = 1;
