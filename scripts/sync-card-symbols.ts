import { execSync } from "child_process";
import { cp, mkdir, readdir, stat } from "fs/promises";
import path from "path";

const DOMINIONIZER_REPO = "https://github.com/GagaMen/dominionizer.git";
const SYMBOLS_PATH = "src/assets/card_symbols";
const TMP_DIR = path.join(process.cwd(), ".tmp/dominionizer");
const OUT_DIR = path.join(process.cwd(), "public/card-symbols");

const NEEDED_PREFIXES = ["Coin", "Potion", "VP", "Debt"];

async function copySymbolsFrom(src: string) {
  await mkdir(OUT_DIR, { recursive: true });
  const files = await readdir(src);
  let count = 0;
  for (const file of files) {
    if (!file.endsWith(".png")) continue;
    if (!NEEDED_PREFIXES.some((prefix) => file.startsWith(prefix))) continue;
    await cp(path.join(src, file), path.join(OUT_DIR, file));
    count++;
  }
  console.log(`Synced ${count} card symbol files to public/card-symbols/`);
}

async function hasSymbolFiles(): Promise<boolean> {
  try {
    const files = await readdir(OUT_DIR);
    return files.some((f) => f.startsWith("Coin") && f.endsWith(".png"));
  } catch {
    return false;
  }
}

async function main() {
  if (await hasSymbolFiles()) {
    const files = await readdir(OUT_DIR);
    console.log(`Card symbols already present (${files.length} files), skipping sync.`);
    console.log("Run with FORCE_SYNC=1 to re-download.");
    if (!process.env.FORCE_SYNC) return;
  }

  console.log("Cloning Dominionizer card symbols (sparse checkout)…");
  await mkdir(path.dirname(TMP_DIR), { recursive: true });

  try {
    await stat(TMP_DIR);
    console.log("Using existing clone in .tmp/dominionizer");
    execSync(`git sparse-checkout add ${SYMBOLS_PATH}`, {
      cwd: TMP_DIR,
      stdio: "inherit",
    });
    execSync("git checkout", { cwd: TMP_DIR, stdio: "inherit" });
  } catch {
    execSync(
      `git clone --depth 1 --filter=blob:none --sparse ${DOMINIONIZER_REPO} "${TMP_DIR}"`,
      { stdio: "inherit" },
    );
    execSync(`git sparse-checkout add ${SYMBOLS_PATH}`, {
      cwd: TMP_DIR,
      stdio: "inherit",
    });
    execSync("git checkout", { cwd: TMP_DIR, stdio: "inherit" });
  }

  const src = path.join(TMP_DIR, SYMBOLS_PATH);
  await copySymbolsFrom(src);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
