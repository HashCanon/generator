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
import AboutSection from './components/AboutSection';
import IncludesSection from './components/IncludesSection';
import { useResponsiveSvg } from './hooks/useResponsiveSvg';
import FeaturesSection from './components/FeaturesSection';
import { useAutoThemeClass } from './hooks/useAutoThemeClass'

function App() {
  const svgRef = useRef<HTMLDivElement>(null);
  const [hashBits, setHashBits] = useState<256 | 160>(256);
  const [currentHex, setCurrentHex] = useState('');
  const statusRef = useRef<HTMLDivElement>(null);
  const hashInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
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

  const [showSymmetries, setShowSymmetries] = useState(false);

  useAutoThemeClass()

  useResponsiveSvg(svgRef);

  useEffect(() => {
    generate({
      svgRef,
      bits: hashBits,
      statusRef,
      onHex: setCurrentHex,
      showSymmetries, 
    });
  }, []); 

  useEffect(() => {
    if (currentHex) {
      drawMandala(currentHex, hashBits, svgRef, showSymmetries);
    }
  }, [showSymmetries]);
  
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
        <IncludesSection />
        <AboutSection />
        <ContactBlock />
      </main>
    </>
  )  
}

export default App
