# HashCanon Generator
> **Invertible hash visualization** — a deterministic, bijective mapping between a 160/256-bit hash and a circular bit-matrix image (“mandala”) — and back.

[**▶︎ Launch the Generator**](https://hashcanon.github.io/generator/)

- Project docs: https://github.com/HashCanon/hashcanon.github.io  
- Contacts & resources: https://hashcanon.github.io/resources/

## What is this?
HashCanon turns a hash value into a precise circular diagram where **every pixel is a bit**. The mapping is **deterministic and invertible**: with the fixed layout, you can recover the original hash from the image.

## Try it (30 seconds)
1. Open the live page and click the big diagram to randomize.  
2. Paste your own value:  
   - a **256-bit hash** (`0x` + 64 hex chars), or  
   - a **160-bit value** (`0x` + 40 hex chars), or  
   - type any **text** — it will be hashed **locally** (SHA-256) and visualized.
3. Toggle **160/256** mode when needed.
4. See the **traits** below the image.

Tip: you can share a specific mandala via URL:
`/generator/?h=0x...&sym=1` (symmetries on) or `sym=0` (off).

## What the traits mean
- **Evenness** — how close the bit mix is to 50/50.
- **Passages** — how many zero-bit “corridors” reach the outer ring (sealed = 0).
- **Crown** — the strongest circular symmetry, shown as `rank:count` (e.g. `4:1`).
- **Symmetries / Ranks** — total symmetry segments found, plus a histogram by rank: `rank:count` (e.g. `2:5, 3:4`).
- **Symmetry slices (Show)** — list of repeating motifs as `start-end: hex`, with **1-based sector indices** and **wrap-around ranges** (e.g. `60-4`). 


**Rarity stars** reflect how uncommon a value is in random hashes (based on empirical frequencies). Technical details of how we compute these tables — in CONTRIBUTING.

## Notes
- Text → hash uses **SHA-256** in the browser’s WebCrypto.  
  The visualization itself is **agnostic** to the hash algorithm: you can paste any valid hex.
- The image is pure data, not “seeded art”: two different hashes **cannot** produce the same diagram.

## Community & License
- Contacts & resources: https://hashcanon.github.io/resources/
- Discussions: https://github.com/HashCanon/hashcanon.github.io/discussions  
- Code — MIT; Visuals & docs — CC BY-NC 4.0