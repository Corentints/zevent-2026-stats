import { useLayoutEffect, useRef, useState } from 'react'

interface MarqueeTextProps {
  text: string
  className?: string
}

/**
 * Texte tronqué par défaut ; si le contenu déborde de son conteneur, un survol
 * du parent (classe `group`) le fait défiler pour le lire en entier.
 */
export function MarqueeText({ text, className }: MarqueeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [overflowPx, setOverflowPx] = useState(0)

  useLayoutEffect(() => {
    const container = containerRef.current
    const textEl = textRef.current
    if (!container || !textEl) return

    const measure = () => {
      setOverflowPx(Math.max(0, textEl.scrollWidth - container.clientWidth))
    }
    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(container)
    return () => observer.disconnect()
  }, [text])

  return (
    <div ref={containerRef} className={className} style={{ overflow: 'hidden' }} title={text}>
      <span
        ref={textRef}
        data-marquee={overflowPx > 0 || undefined}
        className="inline-block whitespace-nowrap"
        style={
          overflowPx > 0
            ? ({
                '--marquee-distance': `-${overflowPx}px`,
                '--marquee-duration': `${overflowPx / 18 / 0.6}s`,
              } as React.CSSProperties)
            : undefined
        }
      >
        {text}
      </span>
    </div>
  )
}
