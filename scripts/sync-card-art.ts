import { execSync } from "child_process";
import { cp, mkdir, readdir, stat } from "fs/promises";
import path from "path";

const DOMINIONIZER_REPO = "https://github.com/GagaMen/dominionizer.git";
const ART_PATH = "src/assets/card_art";
const TMP_DIR = path.join(process.cwd(), ".tmp/dominionizer");
const OUT_DIR = path.join(process.cwd(), "public/card-art");

async function hasArtFiles(): Promise<boolean> {
  try {
    const files = await readdir(OUT_DIR);
    return files.some((f) => f.endsWith(".jpg") || f.endsWith(".jpeg"));
  } catch {
    return false;
  }
}

async function copyArtFrom(src: string) {
  await mkdir(OUT_DIR, { recursive: true });
  const files = await readdir(src);
  let count = 0;
  for (const file of files) {
    if (!/\.jpe?g$/i.test(file)) continue;
    await cp(path.join(src, file), path.join(OUT_DIR, file));
    count++;
  }
  console.log(`Synced ${count} card art files to public/card-art/`);
}

async function main() {
  if (await hasArtFiles()) {
    const files = await readdir(OUT_DIR);
    console.log(`Card art already present (${files.length} files), skipping sync.`);
    console.log("Run with FORCE_SYNC=1 to re-download.");
    if (!process.env.FORCE_SYNC) return;
  }

  console.log("Cloning Dominionizer card art (sparse checkout)…");
  await mkdir(path.dirname(TMP_DIR), { recursive: true });

  try {
    await stat(TMP_DIR);
    console.log("Using existing clone in .tmp/dominionizer");
  } catch {
    execSync(
      `git clone --depth 1 --filter=blob:none --sparse ${DOMINIONIZER_REPO} "${TMP_DIR}"`,
      { stdio: "inherit" },
    );
    execSync(`git sparse-checkout set ${ART_PATH}`, {
      cwd: TMP_DIR,
      stdio: "inherit",
    });
    execSync("git checkout", { cwd: TMP_DIR, stdio: "inherit" });
  }

  const src = path.join(TMP_DIR, ART_PATH);
  await copyArtFrom(src);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
