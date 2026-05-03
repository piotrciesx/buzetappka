import { useState, type CSSProperties, type ReactNode } from 'react'
import { BLUE, tileStyle } from './dashboardWidgetTileStyles'

type DashboardWidgetFrameProps = {
  wrapperRef: (element: HTMLElement | null) => void
  wrapperStyle: CSSProperties
  isDragging: boolean
  isDropBlocked: boolean
  children: ReactNode
}

export default function DashboardWidgetFrame({
  wrapperRef,
  wrapperStyle,
  isDragging,
  isDropBlocked,
  children,
}: DashboardWidgetFrameProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <article
      ref={wrapperRef}
      style={{
        ...wrapperStyle,
        minWidth: 0,
        minHeight: 0,
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          ...tileStyle,
          width: '100%',
          height: '100%',
          minWidth: 0,
          minHeight: 0,
          overflow: 'hidden',
          boxSizing: 'border-box',
          display: 'grid',
          gridTemplateRows: 'auto minmax(0, 1fr)',
          cursor: 'default',
          borderColor: isDragging ? BLUE : tileStyle.borderColor,
          boxShadow: isDragging
            ? '0 18px 36px rgba(37, 99, 235, 0.16)'
            : isHovered
              ? 'inset 1px 1px 0 rgba(255,255,255,0.94), inset -1px -1px 0 rgba(148,163,184,0.10), 0 28px 64px rgba(15, 23, 42, 0.18)'
              : tileStyle.boxShadow,
          transform: undefined,
          opacity: isDropBlocked ? 0.82 : 1,
        }}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
      >
        {children}
      </div>
    </article>
  )
}