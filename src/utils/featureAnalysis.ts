// src/utils/featureAnalysis.ts
// Pure helpers – no DOM side-effects ----------------------------------------

export type HashBits = 256 | 160;

/**
 * Return true iff the hash contains exactly 50 % one-bits.
 * Works for both 256- and 160-bit values.
 */
export function isBalanced(hex: string): boolean {
  const bin   = BigInt(hex).toString(2).padStart((hex.length - 2) * 4, '0');
  const zeros = [...bin].filter(b => b === '0').length;
  return zeros * 2 === bin.length;
}

/**
 * Count “passages” – continuous 0-bit corridors that reach the outer ring.
 * Grid: 4 concentric rings × 64 sectors (40 for 160-bit hashes).
 */
export function countPassages(hex: string, bits: HashBits): number {
  const grid    = hexToGrid(hex, bits);
  const rings   = 4;
  const sectors = grid[0].length;
  const visited = Array.from({ length: rings }, () => Array(sectors).fill(false));

  let passages = 0;
  for (let s = 0; s < sectors; s++) {
    if (grid[0][s] || visited[0][s]) continue;          // wall or already explored

    const q: [number, number][] = [[0, s]];             // BFS queue (ring, sector)
    const local: [number, number][] = [];               // cells in this component
    let reachedEdge = false;

    while (q.length) {
      const [r, c] = q.shift()!;
      if (visited[r][c] || grid[r][c]) continue;        // skip walls & repeats
      visited[r][c] = true;
      local.push([r, c]);
      if (r === rings - 1) reachedEdge = true;          // reached outer ring

      const nei = [
        [r + 1, c], [r - 1, c],
        [r, (c + 1) % sectors], [r, (c - 1 + sectors) % sectors],
      ];
      nei.forEach(([nr, nc]) => {
        if (nr >= 0 && nr < rings && !visited[nr][nc] && !grid[nr][nc])
          q.push([nr, nc]);
      });
    }

    if (reachedEdge) passages++;
  }
  return passages;
}

/* ------------------------------------------------------------------------- */
/* Helpers                                                                   */
/* ------------------------------------------------------------------------- */

/** Convert hex hash to 4 × {64|40} binary grid for flood-fill. */
function hexToGrid(hex: string, bits: HashBits): number[][] {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bin   = clean.split('')
                     .flatMap(h =>
                       parseInt(h, 16)
                         .toString(2)
                         .padStart(4, '0')
                         .split('')
                         .map(Number),
                     );

  const sectors = bits === 256 ? 64 : 40;
  const grid    = Array.from({ length: 4 }, () => Array(sectors).fill(0));

  for (let s = 0; s < sectors; s++)
    for (let r = 0; r < 4; r++)
      grid[r][s] = bin[s * 4 + r];

  return grid;
}
