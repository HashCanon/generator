// src/App.tsx
import { useEffect, useRef, useState } from 'react';
import {
  generate,
  downloadSVG as saveSVG,
  downloadPNG as savePNG,
  drawMandala
} from './utils/mandala';
import { ContactBlock } from './components/ContactBlock';
import { MandalaControls } from './components/MandalaControls';
import InfoSection from './components/InfoSection';
import { useResponsiveSvg } from './hooks/useResponsiveSvg';
import FeaturesSection from './components/FeaturesSection';
import { useAutoThemeClass } from './hooks/useAutoThemeClass'

function parseDeepLinkHash(): { hex: string; bits: 256 | 160 } | null {
  // Accept both "?0x..." and "?h=0x..."
  const raw = window.location.search.replace(/^\?/, '');
  if (!raw) return null;

  const sp = new URLSearchParams(raw);
  const candidate = (sp.get('h') ?? raw).trim();

  const is160 = /^0x[0-9a-fA-F]{40}$/.test(candidate);
  const is256 = /^0x[0-9a-fA-F]{64}$/.test(candidate);
  if (!is160 && !is256) return null;

  return {
    hex: candidate.toLowerCase(),
    bits: (is160 ? 160 : 256) as 256 | 160,
  };
}

function App() {
  const svgRef = useRef<HTMLDivElement>(null);
  const [hashBits, setHashBits] = useState<256 | 160>(256);
  const [currentHex, setCurrentHex] = useState('');
  const statusRef = useRef<HTMLDivElement>(null);
  const hashInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  const [showSymmetries, setShowSymmetries] = useState(false);

  const handleGenerate = () => {
    generate({
      svgRef,
      bits: hashBits,
      hashInputRef,
      textInputRef,
      statusRef,
      onHex: setCurrentHex,
      showSymmetries,
    });
  };

  const handleDownloadSVG = () => {
    const name = (currentHex || 'hashcanon-mandala').replace(/^0x/, '');
    saveSVG(name);
  };

  const handleDownloadPNG = () => {
    const name = (currentHex || 'hashcanon-mandala').replace(/^0x/, '');
    savePNG(name);
  };

  useAutoThemeClass()
  useResponsiveSvg(svgRef);

  useEffect(() => {
    const dl = parseDeepLinkHash();

    if (dl) {
      // Keep UI state consistent with the deep link.
      setHashBits(dl.bits);
      setCurrentHex(dl.hex);

      // Best-effort populate the input field (if it exists).
      if (hashInputRef.current) {
        hashInputRef.current.value = dl.hex;
      }

      // Render immediately using existing low-level draw.
      drawMandala(dl.hex, dl.bits, svgRef, showSymmetries);

      // Optional: normalize URL to "?h=0x..."
      window.history.replaceState(null, '', `?h=${encodeURIComponent(dl.hex)}`);
      return;
    }

    // Default behavior when no deep link present.
    generate({
      svgRef,
      bits: hashBits,
      statusRef,
      onHex: setCurrentHex,
      showSymmetries,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentHex) {
      drawMandala(currentHex, hashBits, svgRef, showSymmetries);
    }
  }, [showSymmetries, currentHex, hashBits]);

  return (
    <>
      <div
        className="sticky top-0 z-10 w-full py-3 text-center text-3xl font-bold bg-background border-b border-gray-300"
      >
        HashCanon Generator
      </div>
      <div
        id="svg-container"
        ref={svgRef}
        onClick={handleGenerate}
        className="w-screen flex justify-center overflow-hidden mt-0 mb-4 cursor-pointer"
      >
      </div>

      <main className="mx-auto max-w-screen-md px-4 space-y-8">
        <div id="download-buttons" className="flex justify-center gap-4">
          <button onClick={handleDownloadSVG}
              className="text-sm border border-gray-300 px-3 py-1 rounded hover:border-gray-500 transition cursor-pointer">
            Download SVG
          </button>
          <button onClick={handleDownloadPNG}
              className="text-sm border border-gray-300 px-3 py-1 rounded hover:border-gray-500 transition cursor-pointer">
            Download PNG
          </button>
        </div>

        <FeaturesSection
          hex={currentHex}
          bits={hashBits}
          showSymmetries={showSymmetries}
          setShowSymmetries={setShowSymmetries}
        />
        <MandalaControls
          svgRef={svgRef}
          hashBits={hashBits}
          setHashBits={setHashBits}
          setCurrentHex={setCurrentHex}
          statusRef={statusRef}
          hashInputRef={hashInputRef}
          textInputRef={textInputRef}
          onGenerate={handleGenerate}
          showSymmetries={showSymmetries}
        />
        <InfoSection />
        <ContactBlock />
      </main>
    </>
  )
}

export default App
