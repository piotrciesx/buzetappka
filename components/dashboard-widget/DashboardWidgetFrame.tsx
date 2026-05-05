import { useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react'
import { BLUE, tileStyle } from './dashboardWidgetTileStyles'

type ResizeEdge = 'left' | 'right'

type DashboardWidgetFrameProps = {
  wrapperRef: (element: HTMLElement | null) => void
  wrapperStyle: CSSProperties
  isDragging: boolean
  isDropBlocked: boolean
  onResizePointerDown?: (edge: ResizeEdge, event: PointerEvent<HTMLDivElement>) => void
  children: ReactNode
}

const resizeEdgeStyle = (side: ResizeEdge): CSSProperties => ({
  position: 'absolute',
  top: 0,
  bottom: 0,
  [side]: 0,
  width: 10,
  zIndex: 4,
  cursor: 'col-resize',
  touchAction: 'none',
  background: 'transparent',
})

export default function DashboardWidgetFrame({
  wrapperRef,
  wrapperStyle,
  isDragging,
  isDropBlocked,
  onResizePointerDown,
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
              ? 'inset 0 1px 0 rgba(255,255,255,0.94), 0 10px 24px rgba(15, 23, 42, 0.09)'
              : tileStyle.boxShadow,
          transform: undefined,
          opacity: isDropBlocked ? 0.82 : 1,
        }}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
      >
        {onResizePointerDown && (
          <>
            <div
              data-dashboard-ignore-drag="true"
              aria-hidden="true"
              style={resizeEdgeStyle('left')}
              onPointerDown={(event) => onResizePointerDown('left', event)}
            />
            <div
              data-dashboard-ignore-drag="true"
              aria-hidden="true"
              style={resizeEdgeStyle('right')}
              onPointerDown={(event) => onResizePointerDown('right', event)}
            />
          </>
        )}
        {children}
      </div>
    </article>
  )
}
