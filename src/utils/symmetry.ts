// Helpers to find radial symmetry patterns in the mandala grid.
// Comments must stay in English.

import type { HashBits } from './featureAnalysis';

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface Symmetry {
  start:  number; // index of the first sector (0-based, circular)
  length: number; // rank of the figure
  slice:  string; // hexadecimal subsequence (wrap-aware)
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

/** Return a list of *maximal* circular palindromes (no nested ones). */
export function findSymmetries(hex: string, bits: HashBits): Symmetry[] {
  const sectors = bits === 256 ? 64 : 40;
  const clean   = hex.startsWith('0x') ? hex.slice(2) : hex;
  const grid    = hexToGrid(clean, bits);              // 4 × {64|40}

  const all: Symmetry[] = [];

  // brute-force every circular interval of length ≥ 2
  for (let start = 0; start < sectors; start++) {
    for (let len = 2; len <= sectors; len++) {
      if (isCircularPalindrome(grid, start, len, sectors)) {
        all.push({
          start,
          length: len,
          slice:  circularSlice(clean, start, len),
        });
      }
    }
  }
  return uniqMaxSymmetries(all, sectors);
}

/** Group by rank, e.g. {2: 4, 3: 1}. */
export function symmetryRanks(hex: string, bits: HashBits): Record<number, number> {
  const out: Record<number, number> = {};
  for (const s of findSymmetries(hex, bits))
    out[s.length] = (out[s.length] || 0) + 1;
  return out;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Check if ⟨start, …, start+len−1⟩ is a circular palindrome in all 4 rings. */
function isCircularPalindrome(
  grid: number[][],
  start: number,
  len: number,
  sectors: number,
): boolean {
  const half = len >> 1;
  for (let ring = 0; ring < 4; ring++) {
    const row = grid[ring];
    for (let k = 0; k < half; k++) {
      if (row[(start + k) % sectors] !== row[(start + len - 1 - k) % sectors]) {
        return false;
      }
    }
  }
  return true;
}

/** Circular substring that preserves text across the wrap. */
function circularSlice(str: string, start: number, len: number): string {
  const L = str.length;
  const end = (start + len) % L;
  return start + len <= L
    ? str.slice(start, start + len)
    : str.slice(start) + str.slice(0, end);
}

/** Hex → binary grid: 4 rings × {64|40} sectors. */
function hexToGrid(clean: string, bits: HashBits): number[][] {
  const bin = clean
    .split('')
    .flatMap(h =>
      parseInt(h, 16)
        .toString(2)
        .padStart(4, '0')
        .split('')
        .map(Number),
    );

  const sectors = bits === 256 ? 64 : 40;
  const grid = Array.from({ length: 4 }, () => Array(sectors).fill(0));

  for (let s = 0; s < sectors; s++)
    for (let r = 0; r < 4; r++)
      grid[r][s] = bin[s * 4 + r];

  return grid;
}

/* ------------------------------------------------------------------ */
/*  Max-only filter (circular-aware)                                  */
/* ------------------------------------------------------------------ */

function covers(
  aStart: number, aLen: number,
  bStart: number, bLen: number,
  sectors: number,
): boolean {
  // b ⊆ a   ⇔  every sector of b lies within a's span
  for (let k = 0; k < bLen; k++) {
    const pos = (bStart + k) % sectors;
    const rel = (pos - aStart + sectors) % sectors;
    if (rel >= aLen) return false; // fell outside a
  }
  return true;
}

function uniqMaxSymmetries(sym: Symmetry[], sectors: number): Symmetry[] {
  const keep: Symmetry[] = [];
  [...sym].sort((a, b) => b.length - a.length).forEach(cand => {
    const nested = keep.some(s => covers(s.start, s.length, cand.start, cand.length, sectors));
    if (!nested) keep.push(cand);
  });
  return keep.sort((a, b) => a.start - b.start);
}
