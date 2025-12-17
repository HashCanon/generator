// src/utils/mandala.ts 
// Helpers to find radial symmetry patterns in the mandala grid.

import type { RefObject } from 'react';
import { findSymmetries } from './symmetry';

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface Symmetry {
  start:  number; // index of the first sector (0-based)
  length: number; // rank of the figure
  slice:  string; // the actual hexadecimal subsequence
}

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

interface GenerateOptions {
  svgRef: RefObject<HTMLDivElement>;
  bits: 256 | 160;
  showSymmetries?: boolean;
  hashInputRef?: RefObject<HTMLInputElement>;
  textInputRef?: RefObject<HTMLTextAreaElement>;
  statusRef?: RefObject<HTMLDivElement>;
  onHex?: (hex: string) => void;
}

export function generate({
  svgRef,
  bits,
  hashInputRef,
  textInputRef,
  statusRef,
  onHex,
  showSymmetries,
}: GenerateOptions) {
  const hex = resolveInput(bits, hashInputRef, textInputRef, statusRef, svgRef, showSymmetries, onHex);
  if (!hex) return;
  drawMandala(hex, bits, svgRef, showSymmetries ?? true);
  onHex?.(hex);
}

function resolveInput(
  bits: 256 | 160,
  hashRef?: RefObject<HTMLInputElement>,
  textRef?: RefObject<HTMLTextAreaElement>,
  statusRef?: RefObject<HTMLDivElement>,
  svgRef?: RefObject<HTMLDivElement>,
  showSymmetries = true,
  onHex?: (hex: string) => void
): string | null {
  const expectedLength = bits / 4;
  const rawHash = hashRef?.current?.value.trim() || '';
  const rawText = textRef?.current?.value.trim() || '';
  const isValidHash = /^0x[0-9a-fA-F]+$/.test(rawHash) && rawHash.length === 2 + expectedLength;
  const useText = !!rawText;

  let hex = '';
  const setStatus = (text: string, color = 'black') => {
    if (statusRef?.current) {
      statusRef.current.textContent = text;
      statusRef.current.style.color = color;
    }
  };

  if (useText) {
    if (hashRef?.current) hashRef.current.value = '';
    const buffer = new TextEncoder().encode(rawText);
    crypto.subtle.digest('SHA-256', buffer).then(hashBuffer => {
      const hexFull = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      hex = '0x' + hexFull.slice(-expectedLength);
      setStatus(`Text input → SHA-256 → ${hex}`, 'green');
      drawMandala(hex, bits, svgRef!, showSymmetries);
      onHex?.(hex);
    });
    return null;
  } else if (isValidHash) {
    if (textRef?.current) textRef.current.value = '';
    hex = rawHash;
    setStatus(`Using input hash: ${hex}`, 'green');
  } else {
    hex = generateRandomHash(bits);
    setStatus(`No valid input → using random: ${hex}`, 'red');
  }
  return hex;
}

function generateRandomHash(bits: 256 | 160): string {
  const hex = '0123456789abcdef';
  const length = bits / 4;
  let result = '0x';
  for (let i = 0; i < length; i++) result += hex[Math.floor(Math.random() * 16)];
  return result;
}

export function drawMandala(
  hex: string,
  bits: 256 | 160,
  svgRef: RefObject<HTMLDivElement>,
  showSymmetries = true
) {
  const canvasSize = 1024;
  const cx = canvasSize / 2;
  const cy = canvasSize / 2;
  const rings = 4;
  const sectors = bits / 4;
  const angleStep = (2 * Math.PI) / sectors;
  const radiusStep = 80;
  const baseRadius = 160;
  const bitsArray = hexToBitArray(hex);

  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;

  const metadata = `<metadata><!-- omitted for brevity --></metadata>`;
  const signature = `<text x="${canvasSize - 10}" y="${canvasSize - 10}" font-size="18" fill="white" text-anchor="end" font-family="monospace" opacity="0.5">HashCanon.github.io</text>`;
  const bgRect = `<rect x="0" y="0" width="${canvasSize}" height="${canvasSize}" fill="black"/>`;

  const paths: string[] = [];
  const sectorOverlays: string[] = [];
  const lineOverlays: string[] = [];

  for (let i = 0; i < sectors; i++) {
    const bin = bitsArray.slice(i * 4, (i + 1) * 4).reverse();
    for (let j = 0; j < rings; j++) {
      const path = generateSectorPath(cx, cy, i, j, angleStep, radiusStep, baseRadius);
      const fill = bin[j] === 1 ? 'white' : 'black';
      paths.push(`<path d="${path}" fill="${fill}" stroke="black" stroke-width="1" />`);
    }
  }

  if (showSymmetries) {
    const syms = findSymmetries(hex, bits);

    let maxLen = 0;
    const maxSectors = new Set<number>();
    const highlightedSectors = new Set<number>();

    syms.forEach(sym => {
      maxLen = Math.max(maxLen, sym.length);
    });

    syms.forEach(sym => {
      for (let i = 0; i < sym.length; i++) {
        const index = (sym.start + i) % sectors;
        highlightedSectors.add(index);
        if (sym.length === maxLen) maxSectors.add(index);
      }

      const a1 = sym.start * angleStep - Math.PI / 2;
      const a2 = (sym.start + sym.length) * angleStep - Math.PI / 2;

      [a1, a2].forEach(angle => {
        const inner = polarToCartesian(cx, cy, baseRadius, angle);
        const outer = polarToCartesian(cx, cy, baseRadius + radiusStep * rings, angle);
        lineOverlays.push(`<line x1="${inner.x}" y1="${inner.y}" x2="${outer.x}" y2="${outer.y}" stroke="red" stroke-width="2" />`);
      });
    });

    for (let i = 0; i < sectors; i++) {
      if (!highlightedSectors.has(i)) continue;
      const fill = maxSectors.has(i) ? 'red' : 'black';
      const opac = '0.32';
      for (let j = 0; j < rings; j++) {
        const path = generateSectorPath(cx, cy, i, j, angleStep, radiusStep, baseRadius);
        sectorOverlays.push(`<path d="${path}" fill="${fill}" opacity="${opac}" />`);
      }
    }
  }

  const lineLength = bits === 160 ? 10 : 16;
  const square = hex.slice(2).match(new RegExp(`.{1,${lineLength}}`, 'g')) || [];
  const textElements = square.map((line, i) =>
    `<text x="${cx}" y="${cy - 47 + i * 36}" font-size="22" fill="white" text-anchor="middle" font-family="monospace">${line}</text>`
  );

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvasSize} ${canvasSize}" preserveAspectRatio="xMidYMid meet">
    ${metadata}
    ${[bgRect, ...paths, ...sectorOverlays, ...lineOverlays, ...textElements, signature].join('\n')}
  </svg>`;

  svgRef.current!.innerHTML = svg;
}

function hexToBitArray(hex: string): number[] {
  return hex
    .slice(2)
    .split('')
    .flatMap(h => parseInt(h, 16).toString(2).padStart(4, '0').split('').map(Number));
}

function generateSectorPath(
  cx: number,
  cy: number,
  i: number,
  j: number,
  angleStep: number,
  radiusStep: number,
  baseRadius: number,
): string {
  const angleStart = i * angleStep - Math.PI / 2;
  const angleEnd = angleStart + angleStep;
  const rInner = (3 - j) * radiusStep + baseRadius;
  const rOuter = rInner + radiusStep;

  const a0 = polarToCartesian(cx, cy, rInner, angleStart);
  const a1 = polarToCartesian(cx, cy, rInner, angleEnd);
  const b1 = polarToCartesian(cx, cy, rOuter, angleEnd);
  const b0 = polarToCartesian(cx, cy, rOuter, angleStart);

  return [
    `M ${a0.x} ${a0.y}`,
    `A ${rInner} ${rInner} 0 0 1 ${a1.x} ${a1.y}`,
    `L ${b1.x} ${b1.y}`,
    `A ${rOuter} ${rOuter} 0 0 0 ${b0.x} ${b0.y}`,
    'Z',
  ].join(' ');
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

/* ─────────── Download helpers ─────────── */
export function downloadSVG(filename = 'hashjing-mandala') {
  const svg = document.querySelector('#svg-container svg');
  if (!svg) return;

  const source = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadPNG(filename = 'hashjing-mandala') {
  const svgElement = document.querySelector('#svg-container svg') as SVGSVGElement;
  if (!svgElement) return;

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const canvasSize = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  const ctx = canvas.getContext('2d')!;

  const img = new Image();
  img.onload = () => {
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    ctx.drawImage(img, 0, 0, canvasSize, canvasSize);
    URL.revokeObjectURL(url);

    const a = document.createElement('a');
    a.download = `${filename}.png`;
    a.href = canvas.toDataURL('image/png');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  img.crossOrigin = 'anonymous';
  img.src = url;
}
