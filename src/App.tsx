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

function parseDeepLinkHash(): { hex: string; bits: 256 | 160; showSymmetries?: boolean } | null {
  // Accept both "?0x..." and "?h=0x..."
  const raw = window.location.search.replace(/^\?/, '');
  if (!raw) return null;

  const sp = new URLSearchParams(raw);
  const candidate = (sp.get('h') ?? raw).trim();

  const is160 = /^0x[0-9a-fA-F]{40}$/.test(candidate);
  const is256 = /^0x[0-9a-fA-F]{64}$/.test(candidate);
  if (!is160 && !is256) return null;

  // sym=1|0|true|false|on|off|yes|no (optional)
  const symRaw = sp.get('sym');
  let show: boolean | undefined = undefined;
  if (symRaw !== null) {
    const v = symRaw.trim().toLowerCase();
    if (v === '1' || v === 'true' || v === 'yes' || v === 'on') show = true;
    if (v === '0' || v === 'false' || v === 'no' || v === 'off') show = false;
  }

  return {
    hex: candidate.toLowerCase(),
    bits: (is160 ? 160 : 256) as 256 | 160,
    showSymmetries: show,
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

      // Apply symmetries flag from URL if present.
      // This also syncs the toggle UI state.
      if (dl.showSymmetries !== undefined) {
        setShowSymmetries(dl.showSymmetries);
      }

      // Best-effort populate the input field (if it exists).
      if (hashInputRef.current) {
        hashInputRef.current.value = dl.hex;
      }

      // Render immediately using existing low-level draw.
      const sym = dl.showSymmetries ?? showSymmetries;
      drawMandala(dl.hex, dl.bits, svgRef, sym);

      // Optional: normalize URL to "?h=0x..." (preserve sym if specified).
      const symPart =
        dl.showSymmetries === undefined ? '' : `&sym=${dl.showSymmetries ? '1' : '0'}`;
      window.history.replaceState(null, '', `?h=${encodeURIComponent(dl.hex)}${symPart}`);
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

  useEffect(() => {
  // Rewrite the whole query string from scratch based on the current state.
  if (!currentHex) return;

  const sym = showSymmetries ? '1' : '0';
  window.history.replaceState(
    null,
    '',
    `?h=${encodeURIComponent(currentHex)}&sym=${sym}`
  );
}, [currentHex, showSymmetries]);

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
