// src/components/FeaturesSection.tsx
// Displays Evenness, Passages, Crown (dominant symmetry), full Symmetries, and the raw source hash.

import { useEffect, useState } from "react";
import { countPassages } from "../utils/featureAnalysis";
import { popcount } from "../utils/bitMath";
import { getRarityStars } from "../utils/rarity";
import type { HashBits } from "../utils/featureAnalysis";
import { findSymmetries, symmetryRanks, type Symmetry } from "../utils/symmetry";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface Props {
  hex: string;
  bits: HashBits;
  showSymmetries: boolean;
  setShowSymmetries: (value: boolean) => void;
}

// Crown rule: pick the highest rank present; display as "<rank>:<count>".
// Return "—" if there are no symmetries.
function pickCrown(ranks: Record<string, number>): string {
  const keys = Object.keys(ranks);
  if (!keys.length) return "—";
  const maxRank = keys.map(Number).reduce((a, b) => Math.max(a, b), -Infinity);
  const count = ranks[String(maxRank)] ?? 0;
  return `${maxRank}:${count}`;
}

function formatSymmetrySlices(symList: Symmetry[], bits: HashBits): string {
  if (!symList.length) return "—";

  const sectors = bits / 4; // 256 -> 64, 160 -> 40

  const sorted = [...symList].sort((a, b) => {
    // same order as "Ranks": from smaller rank/length to larger
    if (a.length !== b.length) return a.length - b.length;
    return a.start - b.start;
  });


  return sorted
    .map((s) => {
      const a = s.start + 1; // 1-based
      const end0 = (s.start + s.length - 1) % sectors; // 0-based, wrap-aware
      const b = end0 + 1; // 1-based
      return `${a}\u2013${b}: ${s.slice}`;
    })
    .join(" | ");
}

type Snapshot = {
  hex: string;
  bits: HashBits;
  passages: number;
  ratio: string;
  symCount: number;
  ranksText: string;
  crown: string;
  symSlicesText: string;
  passagesStars: string;
  evenStars: string;
  crownStars: string;
};

function computeSnapshot(hex: string, bits: HashBits): Snapshot {
  const passages = countPassages(hex, bits);

  const ones = popcount(hex);
  const total = bits;
  const zeros = total - ones;
  const ratio = (Math.min(ones, zeros) / Math.max(ones, zeros)).toFixed(2);

  const symList = findSymmetries(hex, bits);
  const symRanks = symmetryRanks(hex, bits);
  const crown = pickCrown(symRanks as unknown as Record<string, number>);

  const ranksText = Object.entries(symRanks)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([rank, count]) => `${rank}:${count}`)
    .join(", ");

  const symSlicesText = formatSymmetrySlices(symList, bits);

  const passagesStars = getRarityStars("Passages", passages, bits) ?? "★★★★★+";
  const evenStars = getRarityStars("Evenness", ratio, bits) ?? "★★★★★+";
  const crownStars = getRarityStars("Crown", crown, bits) ?? "★★★★★+";

  return {
    hex,
    bits,
    passages,
    ratio,
    symCount: symList.length,
    ranksText,
    crown,
    symSlicesText,
    passagesStars,
    evenStars,
    crownStars,
  };
}

export default function FeaturesSection({
  hex,
  bits,
  showSymmetries,
  setShowSymmetries,
}: Props) {
  const [snap, setSnap] = useState<Snapshot | null>(null);

  useEffect(() => {
    if (!hex) return;
    const expectedLen = 2 + bits / 4;
    if (hex.length !== expectedLen) return;
    setSnap(computeSnapshot(hex, bits));
  }, [hex, bits]);

  if (!snap) return null;

  return (
    <section className="mt-10">
      <h2 className="text-center text-2xl font-semibold tracking-tight mb-4">
        Features of Order
      </h2>

      <div className="mb-1">
        <strong>Evenness:</strong> {snap.ratio} | Rarity:{" "}
        <span className="text-2xl font-mono text-yellow-500">{snap.evenStars}</span>
      </div>

      <div className="mb-1">
        <strong>Passages:</strong> {snap.passages} | Rarity:{" "}
        <span className="text-2xl font-mono text-yellow-500">{snap.passagesStars}</span>
      </div>

      <div className="mb-3">
        <strong>Crown:</strong> {snap.crown} | Rarity:{" "}
        <span className="text-2xl font-mono text-yellow-500">{snap.crownStars}</span>
      </div>

      <div className="mb-3 space-y-2">
        <div className="flex items-center justify-between gap-4">
          <div>
            <strong>Symmetries:</strong> {snap.symCount} total | Ranks: {snap.ranksText}
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

        {showSymmetries && snap.symSlicesText !== "—" && (
          <div className="text-sm text-foreground/80 break-words">
            <strong>Slices:</strong> {snap.symSlicesText}
          </div>
        )}
      </div>

      <div>
        <strong>Source hash: </strong>
        <span className="break-words text-foreground">{snap.hex}</span>
      </div>
    </section>
  );
}
