# Contributing

Thanks for helping improve HashCanon Generator.

## Local development

```bash
npm install
npm run dev
# open http://localhost:5175/generator/
```

## Deep links
Generator supports `?h=0x...` and optional `&sym=0|1` to control symmetry overlays.


## Repository structure (key parts)

* `src/` — UI & feature logic (mandala rendering, traits).
* `src/utils/bitMath.ts` — bit helpers (popcount, etc.).
* `src/utils/featureAnalysis.ts` — Passages, Evenness.
* `src/utils/symmetry.ts` — symmetry detection, ranks, and Crown.
* `src/utils/rarity.ts` — **empirical rarity tables** used by the UI.
* `scripts/traits_distribution.ts` — one-shot script to recompute distributions.

## Hashing policy (text → hash)

- When the user types **text** in the Generator UI, we hash it **locally** with **SHA-256** via WebCrypto and take the needed tail (256-bit or 160-bit mode).
- When the user pastes a **hex value** (`0x…`), we use it **as is**.
- The **visualization is algorithm-agnostic**: it renders any valid hex; hashing is only for the UX “text → diagram”.

*Roadmap:* optional engines (e.g. Keccak-256) may be added for text hashing in the future. The image mapping will remain unchanged.

## Rarity pipeline (reproducible)

Rarity stars are **empirical**. We sample random hashes, compute traits, and aggregate frequencies; the UI maps frequency → stars.

### Versioning & reproducibility

- Record **sample size** and **date** in comments near the rarity tables in `src/utils/rarity.ts`.
- Prefer `--rng crypto` for unbiased sampling (default). `--rng js` is for quick smoke tests only.
- Keep bins stable across releases unless you intentionally re-baseline the distribution.

### 1) Run distributions

Generate independent samples for **256-bit** and **160-bit** (tune `--N` as needed):

```bash
# 256-bit sample (example: 50k)
npx ts-node scripts/traits_distribution.ts --bits 256 --N 50000 > out/traits_256.txt

# 160-bit sample (example: 50k)
npx ts-node scripts/traits_distribution.ts --bits 160 --N 50000 > out/traits_160.txt
```
Flags:

* `--rng crypto|js` (default `crypto`)
* `--evenDec 2` — rounding for Evenness bucket
* `--pctDec 2` — percent decimals
* `--progress auto|off` and `--progressInterval 200` — TTY progress

Output prints three sections with counts and percentages:

* **Evenness distribution**
* **Passages distribution**
* **Crown distribution** (`"<rank>:<count>"`, `—` if none)

> Internally this uses the same logic as the app: `popcount`, `countPassages`, `symmetryRanks`.

### 2) Update `src/utils/rarity.ts`

* **Passages:** copy the histogram into `passages256` / `passages160`.
* **Crown:** copy the `"<rank>:<count>" → frequency` map into `crownFreq256` / `crownFreq160`.
* Keep previous bins stable unless intentionally re-baselining. Note **sample size** and **date** in a comment.

### 3) Verify locally

```bash
npm run dev
# open the app, toggle 256/160 and inspect trait panels & stars
```

## Code style

* TypeScript strict; avoid `any` unless isolated.
* Comments: concise, technical, **English only**.
* UI: theme drives colors; don’t hardcode chart palettes.

## Trait logic parity

`src/utils/featureAnalysis.ts` and `src/utils/symmetry.ts` implement the same logic the CLI uses when building distributions. Rarity stars in the UI read frequencies from `src/utils/rarity.ts` which you refresh from CLI outputs.

`findSymmetries(...)` returns motifs with start sector, length, and the hex substring; the UI can display all slices as `start-end: motif` using **1-based sectors** and **wrap-aware ranges** (e.g. `63-2`).

## Community, Support & License

* Discussions: [https://github.com/HashCanon/hashcanon.github.io/discussions](https://github.com/HashCanon/hashcanon.github.io/discussions)
* Contacts & resources: [https://hashcanon.github.io/resources/](https://hashcanon.github.io/resources/)
* Code — MIT; Visuals & docs — CC BY-NC 4.0
