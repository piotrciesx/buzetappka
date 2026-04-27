import type { CSSProperties, PointerEventHandler, ReactNode } from 'react'
import { BLUE, tileStyle } from './dashboardWidgetTileStyles'
import type { DashboardResizeEdges } from './dashboardWidgetTileTypes'

type DashboardWidgetFrameProps = {
  wrapperRef: (element: HTMLElement | null) => void
  wrapperStyle: CSSProperties
  cursor: string
  isDragging: boolean
  isResizeActive: boolean
  isDropBlocked: boolean
  hoveredResizeEdges: DashboardResizeEdges | null
  onPointerMove: PointerEventHandler<HTMLElement>
  onPointerLeave: PointerEventHandler<HTMLElement>
  onPointerDown: PointerEventHandler<HTMLElement>
  children: ReactNode
}

export default function DashboardWidgetFrame({
  wrapperRef,
  wrapperStyle,
  cursor,
  isDragging,
  isResizeActive,
  isDropBlocked,
  hoveredResizeEdges,
  onPointerMove,
  onPointerLeave,
  onPointerDown,
  children,
}: DashboardWidgetFrameProps) {
  return (
    <article ref={wrapperRef} style={wrapperStyle}>
      <div
        style={{
          ...tileStyle,
          cursor,
          borderColor:
            isDragging || isResizeActive
              ? BLUE
              : hoveredResizeEdges
                ? '#60a5fa'
                : tileStyle.borderColor,
          boxShadow:
            isDragging || isResizeActive
              ? '0 18px 36px rgba(37, 99, 235, 0.16)'
              : tileStyle.boxShadow,
          opacity: isDropBlocked ? 0.82 : 1,
        }}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerDown}
      >
        {children}
      </div>
    </article>
  )
}
