// src/components/AboutSection.tsx

export default function AboutSection() {
  return (
    <main className="space-y-4 mt-10">
      <h2 className="text-center text-2xl font-semibold tracking-tight">
        About HashCanon Project
      </h2>

      <div className="space-y-4 text-base leading-relaxed">
        <p>
          <strong>HashCanon</strong> is a philosophical and aesthetic
          experiment at the intersection of generative art, cryptography, and East Asian symbolism.
          The name fuses “hash” (a unique digital fingerprint) with the Chinese character{" "}
          <strong>經</strong> <em>jīng</em> — “canonic text”. In other
          words, this is a “Canon of the Hash”: a deterministic structure where entropy gives rise to order.
        </p>

        <p>
          A full 256-bit hash is rendered as a{" "}
          <strong>mandala of 64 radial sectors and 4 concentric layers</strong>
          : one hex digit per sector, one bit per layer. For shorter 160-bit inputs (such as Ethereum addresses),
          the system draws 40 sectors using the same logic and visual grammar.
        </p>

        <p>
          This numerical-to-visual transformation raises a set of reflective questions:
          Can randomness produce symbolic form? Are cryptographic structures modern ideograms?
          Where is the boundary between entropy and canon? The system draws from the{" "}
          <strong>64 hexagrams of the I&nbsp;Ching</strong> and Daoist
          cosmology (Wújí → Tàijí) to connect contemporary data to a long tradition of contemplating pattern and change.
        </p>
      </div>
    </main>
  )
}
