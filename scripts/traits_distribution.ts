// scripts/traits_distribution.ts
// Compute empirical distributions for Evenness, Passages, and Crown
// using the same logic as HashCanon Generator (no DOM).

import { randomBytes } from "crypto";
import { popcount } from "../src/utils/bitMath";
import { countPassages, type HashBits } from "../src/utils/featureAnalysis";
import { symmetryRanks } from "../src/utils/symmetry";
// +++ add (no extra deps needed)
import { clearLine, cursorTo } from "readline";

/** CLI params: bits=160|256, N, evenDec (evenness decimals), rng=crypto|js */
const BITS = (parseInt(getArg("--bits", "256"), 10) === 160 ? 160 : 256) as HashBits;
const N = parseInt(getArg("--N", "8192"), 10);
const EVEN_DEC = parseInt(getArg("--evenDec", "2"), 10);
const RNG = getArg("--rng", "crypto") === "js" ? "js" : "crypto";
// +++ new: progress control (auto|off)
const PROGRESS = getArg("--progress", "auto"); // "auto" or "off"
// +++ new: update interval ms
const PROG_INTERVAL = parseInt(getArg("--progressInterval", "200"), 10) || 200;
// accept CLI params
const PCT_DEC = parseInt(getArg("--pctDec", "2"), 10); // number of decimals for percents


function getArg(flag: string, fallback: string): string {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

/** Generate random hex of requested bit-size. */
function randHex(bits: 160 | 256): string {
  const bytes = bits === 256 ? 32 : 20;
  if (RNG === "js") {
    const hexChars = "0123456789abcdef";
    let out = "0x";
    for (let i = 0; i < bytes * 2; i++) out += hexChars[(Math.random() * 16) | 0];
    return out;
  }
  return "0x" + randomBytes(bytes).toString("hex");
}

function evennessBucket(hex: string, bits: HashBits, decimals = 2): string {
  const ones = popcount(hex);
  const total = bits;
  const zeros = total - ones;
  const ratio = Math.min(ones, zeros) / Math.max(ones, zeros);
  return ratio.toFixed(decimals);
}

function crownKey(hex: string, bits: HashBits): string {
  const ranks = symmetryRanks(hex, bits);
  const entries = Object.entries(ranks)
    .map(([r, c]) => [Number(r), c] as [number, number])
    .filter(([, c]) => c > 0);
  if (!entries.length) return "—";
  entries.sort((a, b) => b[0] - a[0]);
  const [rank, count] = entries[0];
  return `${rank}:${count}`;
}

function pct(n: number, total: number): string {
    const p = (n / total) * 100;
    return p.toFixed(PCT_DEC) + " %";
}

function printHeader(title: string) {
  // ensure progress line ends before printing section
  endProgressLine();
  console.log();
  console.log(title);
}

function printKV(key: string, value: string) {
  console.log(`${key.padEnd(24, " ")}: ${value}`);
}

function crownSort(a: string, b: string): number {
  if (a === "—" && b === "—") return 0;
  if (a === "—") return 1;
  if (b === "—") return -1;
  const [ra, ca] = a.split(":").map(Number);
  const [rb, cb] = b.split(":").map(Number);
  if (ra !== rb) return ra - rb;
  return ca - cb;
}

// +++ progress utils (stderr-based)
const ERR = process.stderr;
const USE_PROGRESS = PROGRESS !== "off" && ERR.isTTY;
let progStart = 0;
let progLast = 0;
let lastLineLen = 0;

function fmtHMS(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "--:--";
  const s = Math.round(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
               : `${m}:${String(sec).padStart(2, "0")}`;
}

function renderProgress(done: number, total: number) {
  if (!USE_PROGRESS) return;
  const now = Date.now();
  if (now - progLast < PROG_INTERVAL && done < total) return;

  const elapsed = (now - progStart) / 1000;
  const rate = done > 0 ? done / elapsed : 0;
  const remain = rate > 0 ? (total - done) / rate : Infinity;

  const width = 24; // bar width
  const frac = Math.min(1, Math.max(0, done / total));
  const fill = Math.round(frac * width);
  const bar = "█".repeat(fill) + "░".repeat(width - fill);

  const line =
    ` [${bar}] ${pct(done, total).padStart(6)}  ` +
    `${Math.round(rate).toString().padStart(5)} it/s  ` +
    `ETA ${fmtHMS(remain)}`;

  // overwrite the same stderr line
  clearLine(ERR, 0);
  cursorTo(ERR, 0);
  ERR.write(line);
  lastLineLen = line.length;
  progLast = now;
}

function endProgressLine() {
  if (!USE_PROGRESS) return;
  clearLine(ERR, 0);
  cursorTo(ERR, 0);
  if (lastLineLen > 0) {
    ERR.write("\n");
    lastLineLen = 0;
  }
}

async function main() {
  const evenMap = new Map<string, number>();
  const passMap = new Map<number, number>();
  const crownMap = new Map<string, number>();

  progStart = Date.now();
  progLast = 0;

  for (let i = 0; i < N; i++) {
    const hex = randHex(BITS);

    const eKey = evennessBucket(hex, BITS, EVEN_DEC);
    evenMap.set(eKey, (evenMap.get(eKey) ?? 0) + 1);

    const pVal = countPassages(hex, BITS);
    passMap.set(pVal, (passMap.get(pVal) ?? 0) + 1);

    const cKey = crownKey(hex, BITS);
    crownMap.set(cKey, (crownMap.get(cKey) ?? 0) + 1);

    // +++ update progress
    renderProgress(i + 1, N);
  }

  // +++ finalize progress line before printing results
  endProgressLine();

  printHeader("Summary");
  printKV("Hashes analysed", `${N}`);
  printKV("Bits", `${BITS}`);
  printKV("RNG", RNG);
  printKV("Evenness decimals", `${EVEN_DEC}`);

  printHeader("Evenness distribution:");
  [...evenMap.entries()]
    .sort(([a], [b]) => parseFloat(a) - parseFloat(b))
    .forEach(([k, v]) => {
      console.log(`  ${k.padStart(4, " ")}: ${String(v).padStart(6, " ")} (${pct(v, N)})`);
    });

  printHeader("Passages distribution:");
  [...passMap.entries()]
    .sort(([a], [b]) => a - b)
    .forEach(([k, v]) => {
      console.log(`  ${String(k).padStart(2, " ")} : ${String(v).padStart(6, " ")} (${pct(v, N)})`);
    });

  printHeader("Crown distribution:");
  [...crownMap.entries()]
    .sort(([a], [b]) => crownSort(a, b))
    .forEach(([k, v]) => {
      console.log(`  ${k.padStart(4, " ")} : ${String(v).padStart(6, " ")} (${pct(v, N)})`);
    });
}

main().catch((e) => {
  endProgressLine(); // keep terminal tidy on errors
  console.error(e);
  process.exit(1);
});
