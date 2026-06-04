import { useState, type CSSProperties, type HTMLAttributes, type PointerEvent, type ReactNode } from 'react'
import { uiZIndex, uiTypographyTokens } from '../../lib/uiFoundation'
import { BLUE, tileStyle } from './dashboardWidgetTileStyles'
import { DashboardWidgetShell } from './dashboardWidgetPrimitives'

type ResizeEdge = 'left' | 'right'

type DashboardWidgetFrameProps = {
  wrapperRef: (element: HTMLElement | null) => void
  wrapperStyle: CSSProperties
  isDragging: boolean
  isDropBlocked: boolean
  dragAttributes?: HTMLAttributes<HTMLDivElement>
  dragListeners?: HTMLAttributes<HTMLDivElement>
  onResizePointerDown?: (edge: ResizeEdge, event: PointerEvent<HTMLDivElement>) => void
  children: ReactNode
}

const resizeEdgeStyle = (side: ResizeEdge): CSSProperties => ({
  position: 'absolute',
  top: 0,
  bottom: 0,
  [side]: 0,
  width: 10,
  zIndex: uiZIndex.widgetControl,
  cursor: 'col-resize',
  touchAction: 'none',
  background: 'transparent',
})

export default function DashboardWidgetFrame({
  wrapperRef,
  wrapperStyle,
  isDragging,
  isDropBlocked,
  dragAttributes,
  dragListeners,
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
      <DashboardWidgetShell
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
            ? '0 18px 36px var(--ui-shadow-medium-color)'
            : isHovered
              ? 'var(--ui-shadow-medium)'
              : tileStyle.boxShadow,
          transform: undefined,
          opacity: isDropBlocked ? 0.82 : 1,
          touchAction: dragListeners ? 'pan-y' : tileStyle.touchAction,
        }}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        {...dragAttributes}
        {...dragListeners}
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
      </DashboardWidgetShell>
    </article>
  )
}
