// src/hooks/useResponsiveSvg.ts
import { useEffect } from 'react'

export function useResponsiveSvg(svgContainerRef: React.RefObject<HTMLDivElement>) {
  useEffect(() => {
    if (!svgContainerRef.current) return

    const container = svgContainerRef.current
    let resizeTimer: number | null = null

    const adjust = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const availableHeight = vh - 120
      const targetSize = Math.min(vw, availableHeight, 800)
      container.style.width = `${targetSize}px`
      container.style.height = `${targetSize}px`
    }

    const onResize = () => {
      if (resizeTimer !== null) return
      resizeTimer = window.setTimeout(() => {
        adjust()
        resizeTimer = null
      }, 100)
    }

    adjust()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [svgContainerRef])
}
