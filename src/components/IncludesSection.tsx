// src/components/IncludesSection.tsx

export default function IncludesSection() {
  return (
    <main className="space-y-4 mt-10">
      <h2 className="text-center text-2xl font-semibold tracking-tight">
        This Page Includes
      </h2>
      <div className="space-y-4 text-base leading-relaxed">
        <p>
          <strong>Mandala SVG</strong> — a visual representation
          generated from any 256- or 160-bit hash. Each bit of the hash determines a black or
          white segment within a 64- or 40-sector radial mandala. The result is a unique geometric
          fingerprint—an image born from entropy.
        </p>
        <p>
          <strong>Generate Mandala</strong> — an interactive interface
          that lets you create mandalas from custom hexadecimal hashes or arbitrary text input
          (which is hashed using SHA-256). Useful for both exploring patterns and testing specific values.
        </p>
        <p>
          <strong>Features of Order</strong> — automatic analysis of the
          hash structure: checks if the number of 0s and 1s is perfectly balanced, counts “passages”
          (continuous paths from center to edge formed by zeros), and detects rare “sealed”
          configurations where no such path exists.
        </p>
      </div>
    </main>
  )
}
