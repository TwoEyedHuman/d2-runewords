import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { join, dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "../public/runewords.json");

const VALID_RUNES = new Set([
  "El", "Eld", "Tir", "Nef", "Eth", "Ith", "Tal", "Ral", "Ort", "Thul",
  "Amn", "Sol", "Shael", "Dol", "Hel", "Io", "Lum", "Ko", "Fal", "Lem",
  "Pul", "Um", "Mal", "Ist", "Gul", "Vex", "Ohm", "Lo", "Sur", "Ber",
  "Jah", "Cham", "Zod",
]);

const REQUIRED_FIELDS = ["name", "runes", "types", "sockets", "requiredLevel", "description", "stats"];

let errors = 0;

function fail(name, msg) {
  console.error(`  [FAIL] ${name}: ${msg}`);
  errors++;
}

let data;
try {
  data = JSON.parse(readFileSync(DATA_PATH, "utf8"));
} catch (e) {
  console.error(`Cannot parse ${DATA_PATH}: ${e.message}`);
  process.exit(1);
}

if (!Array.isArray(data)) {
  console.error("Root must be an array");
  process.exit(1);
}

console.log(`Validating ${data.length} runewords...\n`);

const names = new Set();

for (const entry of data) {
  const name = typeof entry.name === "string" ? entry.name : "(unknown)";

  if (names.has(name)) {
    fail(name, "duplicate name");
  }
  names.add(name);

  for (const field of REQUIRED_FIELDS) {
    if (!(field in entry)) {
      fail(name, `missing required field "${field}"`);
    }
  }

  if (typeof entry.name !== "string" || entry.name.trim() === "") {
    fail(name, "name must be a non-empty string");
  }

  if (!Array.isArray(entry.runes) || entry.runes.length === 0) {
    fail(name, "runes must be a non-empty array");
  } else {
    for (const rune of entry.runes) {
      if (!VALID_RUNES.has(rune)) {
        fail(name, `unknown rune "${rune}"`);
      }
    }

    if (typeof entry.sockets === "number" && entry.runes.length !== entry.sockets) {
      fail(name, `sockets (${entry.sockets}) does not match runes.length (${entry.runes.length})`);
    }
  }

  if (!Array.isArray(entry.types) || entry.types.length === 0) {
    fail(name, "types must be a non-empty array");
  } else {
    for (const t of entry.types) {
      if (typeof t !== "string" || t.trim() === "") {
        fail(name, `types contains invalid entry: ${JSON.stringify(t)}`);
      }
    }
  }

  if (typeof entry.sockets !== "number" || !Number.isInteger(entry.sockets) || entry.sockets < 1) {
    fail(name, "sockets must be a positive integer");
  }

  if (typeof entry.requiredLevel !== "number" || !Number.isInteger(entry.requiredLevel) || entry.requiredLevel < 1) {
    fail(name, "requiredLevel must be a positive integer");
  }

  if (typeof entry.description !== "string" || entry.description.trim() === "") {
    fail(name, "description must be a non-empty string");
  }

  if (!Array.isArray(entry.stats) || entry.stats.length === 0) {
    fail(name, "stats must be a non-empty array");
  } else {
    for (const stat of entry.stats) {
      if (typeof stat !== "string" || stat.trim() === "") {
        fail(name, `stats contains invalid entry: ${JSON.stringify(stat)}`);
      }
    }
  }
}

if (errors === 0) {
  console.log(`✓ All ${data.length} runewords valid.`);
  process.exit(0);
} else {
  console.error(`\n✗ ${errors} error(s) found.`);
  process.exit(1);
}
