/*--------------------------------------------------------------------
  Bit-level helpers (no DOM / no side-effects)
----------------------------------------------------------------------*/

/**
 * popcount — number of one-bits in an arbitrary-length hex string.
 * Works for 256- and 160-bit hashes alike.
 *
 * @param hex  "0x…" or plain hex string
 * @return     integer 0…length × 4
 */
export function popcount(hex: string): number {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  let ones = 0;
  for (const ch of clean) {
    ones += pop4bit[parseInt(ch, 16)];
  }
  return ones;
}

/* lookup-table for 4-bit chunks */
const pop4bit = [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4] as const;
