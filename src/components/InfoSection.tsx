// src/components/InfoSection.tsx
export default function InfoSection() {
  return (
    <section className="space-y-6 mt-10">
      <h2 className="text-center text-2xl font-semibold tracking-tight">
        What is this?
      </h2>
      <div className="space-y-4 text-base leading-relaxed">
        <p>
          <strong>HashCanon</strong> visualizes a hash as a circular bit-matrix (“mandala”).
          A <strong>256-bit</strong> hash becomes <strong>64 radial sectors × 4 rings</strong>
          (one hex digit per sector, one bit per ring). A <strong>160-bit</strong> value
          (e.g., an Ethereum address) maps to <strong>40 sectors × 4 rings</strong> using the same scheme.
          The image is fully deterministic: the same hash always produces the same diagram.
        </p>

        <p>
          This page lets you <strong>enter a hex hash</strong> (used as-is) or paste
          <strong> any text</strong> which is locally hashed with <strong>SHA-256</strong>,
          and then mapped to a 160/256-bit mandala. You can also click the mandala to generate a random example.
        </p>

        <h3 className="text-xl font-semibold mt-6">How to use</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Choose <strong>160</strong> or <strong>256</strong> bits in the controls.
          </li>
          <li>
            Either paste a <strong>hex hash</strong> (e.g., <code>0x…</code>) or enter <strong>free text</strong>.
            For text, we compute <strong>SHA-256</strong> in the browser and use the required tail
            (160 or 256 bits) as the input.
          </li>
          <li>
            Toggle <strong>Symmetries</strong> to overlay: grey segments = all palindromic arcs,
            red segments = maximal ones, and red radial lines = their boundaries.
          </li>
          <li>
            Use <strong>Download SVG / PNG</strong> to save the image.
          </li>
        </ul>

        <h3 className="text-xl font-semibold mt-6">What’s computed</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Balance</strong>: whether zeros and ones are perfectly 50/50.
          </li>
          <li>
            <strong>Passages</strong>: how many zero-corridors connect center to the edge (sealed = 0).
          </li>
          <li>
            <strong>Symmetries</strong> (“circular palindromes” across all four rings):
            total count, maximal ranks, and the visual overlay.
          </li>
        </ul>

        <h3 className="text-xl font-semibold mt-6">Notes</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Text → SHA-256</strong> is only for convenience; if you already have a hash,
            paste it directly — the visualization is independent of how the hash was obtained.
          </li>
          <li>
            160-bit mode is ideal for values like <strong>Ethereum addresses</strong>.
            Their published “block hash”s may not show leading zeros even in PoW eras — that’s an artifact of the chain’s hashing rules, not of this renderer.
          </li>
          <li>
            Source code for this generator:
            <a
              href="https://github.com/HashCanon/generator"
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 underline hover:text-blue-600 ml-1"
            >
              github.com/HashCanon/generator
            </a>.
          </li>
        </ul>
      </div>
    </section>
  );
}