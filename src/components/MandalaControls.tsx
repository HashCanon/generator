// src/components/MandalaControls.tsx

import { generate } from '../utils/mandala';
import {
  Dispatch,
  RefObject,
  SetStateAction,
  useRef,
} from 'react';
import { Button } from "@/components/ui/button";

interface Props {
  svgRef: RefObject<HTMLDivElement>;
  hashBits: 256 | 160;
  setHashBits: Dispatch<SetStateAction<256 | 160>>;
  setCurrentHex: Dispatch<SetStateAction<string>>;
  statusRef: RefObject<HTMLDivElement>;
  hashInputRef: RefObject<HTMLInputElement>;
  textInputRef: RefObject<HTMLTextAreaElement>;
  onGenerate: () => void;
  showSymmetries: boolean;
}

export function MandalaControls({
  svgRef,
  hashBits,
  setHashBits,
  setCurrentHex,
  statusRef,
  hashInputRef,
  textInputRef,
  onGenerate,
  showSymmetries,
}: Props) {

  // create local fallback if parent did not supply one
  const localStatusRef = useRef<HTMLDivElement>(null);
  const effectiveStatusRef = statusRef ?? localStatusRef;

  const runGenerate = (bits: 256 | 160) =>
    generate({
      svgRef,
      bits,
      hashInputRef,
      textInputRef,
      statusRef: effectiveStatusRef,
      onHex: setCurrentHex,
      showSymmetries,
    });

  const handleBitsChange = (bits: 256 | 160) => {
    setHashBits(bits);
    runGenerate(bits);
  };

  // Trigger generate on Enter (textarea keeps newline on Shift+Enter)
  const handleHashKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onGenerate();
    }
  };

  const handleTextKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onGenerate();
    }
  };

  return (
    <section className="space-y-4 mt-0">
      <h2 className="text-center text-2xl font-semibold tracking-tight">
        Generate Mandala
      </h2>

      <input
        ref={hashInputRef}
        type="text"
        placeholder="Enter 0x... custom hash (64 hex chars)"
        onKeyDown={handleHashKeyDown}
        onChange={() => {
          if (hashInputRef.current?.value.trim()) {
            textInputRef.current!.value = "";
          }
        }}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />

      <textarea
        ref={textInputRef}
        placeholder="Or enter text to hash..."
        rows={3}
        onKeyDown={handleTextKeyDown}
        onChange={() => {
          if (textInputRef.current?.value.trim()) {
            hashInputRef.current!.value = "";
          }
        }}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />

      <div className="flex justify-center items-center gap-4 text-sm text-center">
        <span className="whitespace-nowrap">Hash type:</span>
        <label className="flex items-center gap-1">
          <input
            type="radio"
            name="hashBits"
            value="256"
            checked={hashBits === 256}
            onChange={() => handleBitsChange(256)}
          />
          256-bit
        </label>
        <label className="flex items-center gap-1">
          <input
            type="radio"
            name="hashBits"
            value="160"
            checked={hashBits === 160}
            onChange={() => handleBitsChange(160)}
          />
          160-bit
        </label>
      </div>

      <div
        ref={effectiveStatusRef}
        id="status"
        className="break-words text-center flex-wrap text-sm text-muted-foreground min-h-[1.25rem]"
      />

      <Button
        onClick={onGenerate}
        className="rounded-none w-full py-7 text-base font-semibold bg-green-600 hover:bg-green-700 text-white cursor-pointer"
      >
        Generate Mandala
      </Button>
    </section>
  );
}

export default MandalaControls;
