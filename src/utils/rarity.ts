// src/utils/rarity.ts
// Rarity helpers for Evenness (range), Passages (table), and Crown (empirical).
// 256- and 160-bit aware.

export type HashBits = 256 | 160;

/* ───────── Evenness buckets (ratio 0.00–1.00) ───────── */
// Empirically tuned bins (kept stable vs. previous release).
export function starsEvenness256(r: number): string {
  if (r < 0 || r > 1) return '★★★★★+';
  if (r >= 0.99) return '★★☆☆☆';   // exact 1.00 (and hypothetical 0.99) is less common
  if (r >= 0.93) return '☆☆☆☆☆';   // modal right wing 0.93–0.98
  if (r >= 0.89) return '★☆☆☆☆';
  if (r >= 0.83) return '★★☆☆☆';
  if (r >= 0.78) return '★★★☆☆';
  if (r >= 0.72) return '★★★★☆';
  if (r >= 0.68) return '★★★★★';
  return '★★★★★+';
}

export function starsEvenness160(r: number): string {
  if (r < 0 || r > 1)  return '★★★★★+';
  if (r >= 0.99)       return '★★☆☆☆';
  if (r >= 0.95)       return '☆☆☆☆☆';
  if (r >= 0.90)       return '★☆☆☆☆';
  if (r >= 0.85)       return '★★☆☆☆';
  if (r >= 0.80)       return '★★★☆☆';
  if (r >= 0.75)       return '★★★★☆';
  if (r >= 0.70)       return '★★★★★';
  return '★★★★★+';
}

// Handy aliases
export const stars256 = starsEvenness256;
export const stars160 = starsEvenness160;

/* ───────── Passages rarity tables ───────── */

// 256-bit (unchanged; matches 50k sample shape)
const passages256 = {
  default: '★★★★★+',
  '0':  '★★★★★',
  '1':  '★★★★☆',
  '2':  '★★★☆☆',
  '3':  '★★☆☆☆',
  '4':  '★☆☆☆☆',
  '5':  '☆☆☆☆☆',  // mode
  '6':  '★☆☆☆☆',
  '7':  '★★☆☆☆',
  '8':  '★★★☆☆',
  '9':  '★★★★☆',
  '10': '★★★★★',
  '11': '★★★★★',
} as const;

// 160-bit (updated to 50k sample: mode at 3; 2 and 4 very common; long right tail)
const passages160 = {
  default: '★★★★★+',
  '0':  '★★★★☆', // ~0.75 %
  '1':  '★★☆☆☆', // ~7.65 %
  '2':  '★☆☆☆☆',  // ~24.23 %
  '3':  '☆☆☆☆☆',  // ~34.32 % (mode)
  '4':  '★☆☆☆☆',  // ~23.26 %
  '5':  '★★☆☆☆', // ~8.18 %
  '6':  '★★★★☆', // ~1.47 %
  '7':  '★★★★★', // ~0.13 %
  '8':  '★★★★★', // ~0.00–0.01 %
} as const;

/* ───────── Crown rarity (empirical bins) ─────────
   Fresh frequencies from 50k-js RNG runs (per "<rank>:<count>").
   Values are fractions of the collection.
*/

// 256-bit (50k sample)
const crownFreq256: Record<string, number> = {
  '2:1': 0.00084,  '2:2': 0.00184, '2:3': 0.00320, '2:4': 0.00258,
  '2:5': 0.00214,  '2:6': 0.00140, '2:7': 0.00060, '2:8': 0.00014,
  '2:9': 0.00014,  '2:10': 0.00004,

  '3:1': 0.04944, '3:2': 0.09764, '3:3': 0.12696, '3:4': 0.12238,
  '3:5': 0.09138, '3:6': 0.05516, '3:7': 0.02806, '3:8': 0.01280,
  '3:9': 0.00488, '3:10': 0.00164, '3:11': 0.00052, '3:12': 0.00010,
  '3:13': 0.00004,

  '4:1': 0.14348, '4:2': 0.01568, '4:3': 0.00138, '4:4': 0.00002,

  '5:1': 0.18222, '5:2': 0.02046, '5:3': 0.00162, '5:4': 0.00012,

  '6:1': 0.01420, '6:2': 0.00016,
  '7:1': 0.01434, '7:2': 0.00002,
  '8:1': 0.00120, '9:1': 0.00086,
  '10:1': 0.00004, '11:1': 0.00004, '13:1': 0.00002,

  '—': 0.00022,
} as const;

// 160-bit (50k sample)
const crownFreq160: Record<string, number> = {
  '2:1': 0.01356, '2:2': 0.01820, '2:3': 0.01564, '2:4': 0.00808,
  '2:5': 0.00352, '2:6': 0.00094, '2:7': 0.00018, '2:8': 0.00002,

  '3:1': 0.15942, '3:2': 0.19666, '3:3': 0.15892, '3:4': 0.09080,
  '3:5': 0.04116, '3:6': 0.01486, '3:7': 0.00404, '3:8': 0.00114,
  '3:9': 0.00020,

  '4:1': 0.10628, '4:2': 0.00770, '4:3': 0.00028,

  '5:1': 0.12406, '5:2': 0.00912, '5:3': 0.00044,

  '6:1': 0.00910, '6:2': 0.00010,
  '7:1': 0.00992, '7:2': 0.00014,
  '8:1': 0.00054, '9:1': 0.00046,
  '10:1': 0.00002, '11:1': 0.00002,

  '—': 0.00448,
} as const;

/** Map frequency to stars (non-linear empirical bins; consistent across 160/256). */
function starsCrownByP(p: number | undefined): string {
  if (p === undefined) return '★★★★★+';        // unseen/out-of-sample
  if (p >= 0.12)   return '☆☆☆☆☆';             // modal classes
  if (p >= 0.05)   return '★☆☆☆☆';             // common
  if (p >= 0.018)  return '★★☆☆☆';            // uncommon
  if (p >= 0.005)  return '★★★☆☆';            // rare
  if (p >= 0.0012) return '★★★★☆';            // very rare
  return '★★★★★';                               // ultra-rare
}

function starsCrown(bits: HashBits, key: string): string {
  const p = (bits === 256 ? crownFreq256 : crownFreq160)[key];
  return starsCrownByP(p);
}

/* ───────── API ───────── */
/** Returns stars for a given trait value; uses ★★★★★+ for out-of-range. */
export function getRarityStars(
  trait: string,
  value: string | number | boolean,
  bits: HashBits,
): string | null {
  if (trait === 'Evenness') {
    const r = typeof value === 'number' ? value : parseFloat(String(value));
    if (isNaN(r)) return '★★★★★+';
    return bits === 256 ? stars256(r) : stars160(r);
  }

  if (trait === 'Passages') {
    const table = bits === 256 ? passages256 : passages160;
    const str = String(value);
    return table[str] ?? table.default;
  }

  if (trait === 'Crown') {
    // value is "<rank>:<count>" or "—"
    return starsCrown(bits, String(value));
  }

  return null; // unknown trait
}
