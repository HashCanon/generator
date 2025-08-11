// src/utils/rarity.ts
// Rarity helpers for Passages (table-based) and Evenness (range-based).

export type HashBits = 256 | 160;

/* ───────── Evenness buckets (ratio 0.00–1.00) ─────────*/
// Evenness (0.00 – 1.00) → stars, continuous buckets
export function starsEvenness256(r: number): string {
  // defensive guard – mathematically unreachable but keeps noise out
  if (r < 0 || r > 1) return '★★★★★+';

  if (r >= 0.99) return '★★☆☆☆';   // 1.00 and hypothetical 0.99
  if (r >= 0.93) return '☆☆☆☆☆';   // modal right wing 0.93–0.98
  if (r >= 0.89) return '★☆☆☆☆';   // 0.89–0.92
  if (r >= 0.83) return '★★☆☆☆';   // 0.83–0.88
  if (r >= 0.78) return '★★★☆☆';   // 0.78–0.82
  if (r >= 0.72) return '★★★★☆';   // 0.72–0.77
  if (r >= 0.68) return '★★★★★';   // 0.68–0.71 (rare)
  return '★★★★★+';                 // < 0.68 (ultra-rare)
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

/* Re-use same mapping for 160-bit hashes until real stats collected */
export const stars256 = starsEvenness256; 
export const stars160 = starsEvenness160; 

/* ───────── Passages rarity tables ───────── */

/* ——— Passages rarity (256-bit) ——— */
const passages256 = {
  default: '★★★★★+',
  '0':  '★★★★★',
  '1':  '★★★★☆',
  '2':  '★★★☆☆',
  '3':  '★★☆☆☆',
  '4':  '★☆☆☆☆',
  '5':  '☆☆☆☆☆',  // most common
  '6':  '★☆☆☆☆',
  '7':  '★★☆☆☆',
  '8':  '★★★☆☆',
  '9':  '★★★★☆',
  '10': '★★★★★',
  '11': '★★★★★',  // explicit ultra-rare
} as const;

/* ——— Passages rarity (160-bit) ———
   thresholds shifted −1 (more passages on average) */
const passages160 = {
  default: '★★★★★+',
  '0':  '★★★★☆',
  '1':  '★★★☆☆',
  '2':  '★★☆☆☆',
  '3':  '★☆☆☆☆',
  '4':  '☆☆☆☆☆',  // mode
  '5':  '★☆☆☆☆',
  '6':  '★★☆☆☆',
  '7':  '★★★☆☆',
  '8':  '★★★★☆',
  '9':  '★★★★★',
} as const;

/* ───────── Crown rarity (256-bit) — empirical frequencies ─────────
   Values are fractions of the collection for each "<rank>:<count>" crown,
   aggregated from a 6×8192 sample. */
   const crownFreq256: Record<string, number> = {
    '2:1': 0.000956, '2:2': 0.001811, '2:3': 0.002747, '2:4': 0.002665,
    '2:5': 0.001404, '2:6': 0.001200, '2:7': 0.000549, '2:8': 0.000244,
    '2:9': 0.000081, '2:10': 0.000020,
  
    '3:1': 0.051290, '3:2': 0.095276, '3:3': 0.125977, '3:4': 0.122884,
    '3:5': 0.091451, '3:6': 0.055257, '3:7': 0.028361, '3:8': 0.013143,
    '3:9': 0.004313, '3:10': 0.001526, '3:11': 0.000509, '3:12': 0.000203,
    '3:13': 0.000020,
  
    '4:1': 0.145203, '4:2': 0.016866, '4:3': 0.000997, '4:4': 0.000041,
  
    '5:1': 0.182678, '5:2': 0.020345, '5:3': 0.001831, '5:4': 0.000163,
  
    '6:1': 0.013529, '6:2': 0.000081,
    '7:1': 0.013936, '7:2': 0.000041,
    '8:1': 0.001099, '9:1': 0.000997,
    '10:1': 0.000081, '11:1': 0.000020, '13:1': 0.000020,
  
    '—': 0.000183, // no symmetry detected
  } as const;
  
  /** Map frequency to stars (non-linear, empirically chosen bins).
   *  ≥12%  → ☆☆☆☆☆ (modal classes)
   *   5–12% → ★☆☆☆☆ (common)
   * 1.8–5% → ★★☆☆☆ (uncommon valley)
   * 0.5–1.8% → ★★★☆☆ (rare ridge-to-tail)
   * 0.12–0.5% → ★★★★☆ (very rare)
   *  <0.12% → ★★★★★ (ultra-rare)
   */
  function starsCrown256(crown: string): string {
    const p = crownFreq256[crown];
    if (p === undefined) return '★★★★★+'; // unknown/out-of-sample
    if (p >= 0.12)  return '☆☆☆☆☆';
    if (p >= 0.05)  return '★☆☆☆☆';
    if (p >= 0.018) return '★★☆☆☆';
    if (p >= 0.005) return '★★★☆☆';
    if (p >= 0.0012) return '★★★★☆';
    return '★★★★★';
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
    // Crown value must be like "5:1", "3:4", or "—"
    const k = String(value);
    // Until we have 160-bit stats, reuse 256-bit empirical mapping.
    return starsCrown256(k);
  }

  return null; // unknown trait
}