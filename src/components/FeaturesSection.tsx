// src/components/FeaturesSection.tsx
// Displays Evenness, Passages, Crown (dominant symmetry), full Symmetries, and the raw source hash.

import { countPassages } from "../utils/featureAnalysis";
import { popcount }       from "../utils/bitMath";
import { getRarityStars } from "../utils/rarity";
import type { HashBits }  from "../utils/featureAnalysis";
import { findSymmetries, symmetryRanks } from "../utils/symmetry";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface Props {
  hex: string;
  bits: HashBits;
  showSymmetries: boolean;
  setShowSymmetries: (value: boolean) => void;
}

// --- helper: pick "Crown" from ranks map ------------------------------------
/// Crown rule: pick the highest rank present; display as "<rank>:<count>".
// Return "—" if there are no symmetries.
function pickCrown(ranks: Record<string, number>): string {
  const keys = Object.keys(ranks);
  if (!keys.length) return "—";
  const maxRank = keys.map(Number).reduce((a, b) => Math.max(a, b), -Infinity);
  const count = ranks[String(maxRank)] ?? 0;
  return `${maxRank}:${count}`;
}

export default function FeaturesSection({
  hex,
  bits,
  showSymmetries,
  setShowSymmetries,
}: Props) {
  if (!hex) return null;

  /* —— trait values —— */
  const passages = countPassages(hex, bits);

  const ones   = popcount(hex);
  const total  = bits;
  const zeros  = total - ones;
  const ratio  = (Math.min(ones, zeros) / Math.max(ones, zeros)).toFixed(2);

  // symmetry statistics
  const symList  = findSymmetries(hex, bits);
  const symRanks = symmetryRanks(hex, bits); // {rank: count}
  const crown    = pickCrown(symRanks);      // "<rank>:1" or "—"

  /* —— rarity lookup —— */
  const passagesStars = getRarityStars("Passages", passages, bits);
  const evenStars     = getRarityStars("Evenness", ratio, bits);
  const crownStars = getRarityStars("Crown", crown, bits);

  return (
    <section className="mt-10">
      <h2 className="text-center text-2xl font-semibold tracking-tight mb-4">
        Features of Order
      </h2>

      {/* Evenness */}
      <div className="mb-1">
        <strong>Evenness:</strong> {ratio} | Rarity:{" "}
        <span className="text-2xl font-mono text-yellow-500">{evenStars}</span>
      </div>

      {/* Passages */}
      <div className="mb-1">
        <strong>Passages:</strong> {passages} | Rarity:{" "}
        <span className="text-2xl font-mono text-yellow-500">{passagesStars}</span>
      </div>

      {/* Crown (dominant symmetry class) */}
      <div className="mb-3">
        <strong>Crown:</strong> {crown} | Rarity:{" "}
        <span className="text-2xl font-mono text-yellow-500">{crownStars}</span>
      </div>

      {/* Symmetries (details) */}
      <div className="mb-3 space-y-1">
        <div className="flex items-center justify-between gap-4">
          <div>
            <strong>Symmetries:</strong> {symList.length} total | Ranks:{" "}
            {Object.entries(symRanks)
              .sort((a, b) => Number(a[0]) - Number(b[0]))
              .map(([rank, count]) => `${rank}:${count}`)
              .join(", ")}
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="sym-toggle">Show</Label>
            <Switch
              id="sym-toggle"
              checked={showSymmetries}
              onCheckedChange={setShowSymmetries}
            />
          </div>
        </div>
      </div>

      {/* Raw hash */}
      <div>
        <strong>Source hash: </strong>
        <span className="break-words text-foreground">{hex}</span>
      </div>
    </section>
  );
}
