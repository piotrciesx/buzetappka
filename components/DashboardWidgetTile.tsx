'use client'

import { ButtonHTMLAttributes, CSSProperties, PointerEvent, useMemo, useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
  DASHBOARD_WIDGET_DEFINITION_BY_TYPE,
  DASHBOARD_WIDGET_DEFINITIONS,
} from '../lib/dashboardWidgetConfig'
import DashboardWidgetControls from './dashboard-widget/DashboardWidgetControls'
import DashboardWidgetFrame from './dashboard-widget/DashboardWidgetFrame'
import DashboardWidgetHeader from './dashboard-widget/DashboardWidgetHeader'
import DashboardWidgetContent from './dashboard-widget/DashboardWidgetContent'

import type {
  DashboardResizeEdges,
  DashboardWidgetTileProps,
} from './dashboard-widget/dashboardWidgetTileTypes'
import { RESIZE_HIT_AREA } from './dashboard-widget/dashboardWidgetTileStyles'

export type { DashboardResizeEdges } from './dashboard-widget/dashboardWidgetTileTypes'

const areResizeEdgesEqual = (
  left: DashboardResizeEdges | null,
  right: DashboardResizeEdges | null
) => {
  if (left === right) return true
  if (!left || !right) return false

  return (
    left.left === right.left &&
    left.right === right.right &&
    left.top === right.top &&
    left.bottom === right.bottom
  )
}

const getResizeEdgesFromPointer = (
  rect: DOMRect,
  clientX: number,
  clientY: number
): DashboardResizeEdges | null => {
  const nearLeft = clientX - rect.left <= RESIZE_HIT_AREA
  const nearRight = rect.right - clientX <= RESIZE_HIT_AREA
  const nearTop = clientY - rect.top <= RESIZE_HIT_AREA
  const nearBottom = rect.bottom - clientY <= RESIZE_HIT_AREA

  if (!nearLeft && !nearRight && !nearTop && !nearBottom) return null

  return {
    left: nearLeft,
    right: nearRight,
    top: nearTop,
    bottom: nearBottom,
  }
}

const getCursorForResizeEdges = (edges: DashboardResizeEdges | null) => {
  if (!edges) return 'default'
  if ((edges.left && edges.top) || (edges.right && edges.bottom)) return 'nwse-resize'
  if ((edges.right && edges.top) || (edges.left && edges.bottom)) return 'nesw-resize'
  if (edges.left || edges.right) return 'ew-resize'
  return 'ns-resize'
}

export default function DashboardWidgetTile({
  widget,
  rect,
  transactions,
  selectedMonth,
  dashboardStats,
  topExpenseCategories,
  latestTransactions,
  categoriesById,
  getSignedAmountForTransaction,
  onWidgetTypeChange,
  isDragging,
  isDropBlocked,
  isInteractionLocked,
  isResizeActive,
  onRemove,
  onResizeStart,
  styles,
}: DashboardWidgetTileProps) {
  const [hoveredResizeEdges, setHoveredResizeEdges] = useState<DashboardResizeEdges | null>(null)
  const definition = DASHBOARD_WIDGET_DEFINITION_BY_TYPE[widget.type]

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: widget.id,
    disabled: isInteractionLocked,
  })

  const wrapperStyle = useMemo<CSSProperties>(() => {
    const dragTransform = isDragging ? transform : null

    return {
      position: 'absolute',
      left: 0,
      top: 0,
      width: rect.width,
      height: rect.height,
      transform: CSS.Translate.toString({
        x: rect.left + (dragTransform?.x ?? 0),
        y: rect.top + (dragTransform?.y ?? 0),
        scaleX: 1,
        scaleY: 1,
      }),
      transition:
        isDragging || isResizeActive
          ? 'none'
          : 'transform 180ms ease, width 180ms ease, height 180ms ease',
      zIndex: isDragging || isResizeActive ? 6 : 2,
      pointerEvents: 'auto',
    }
  }, [isDragging, isResizeActive, rect.height, rect.left, rect.top, rect.width, transform])

  const updateHoveredResizeEdges = (nextEdges: DashboardResizeEdges | null) => {
    setHoveredResizeEdges((prev) => {
      if (areResizeEdgesEqual(prev, nextEdges)) return prev
      return nextEdges
    })
  }

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (isDragging || isResizeActive) return

    const nextEdges = getResizeEdgesFromPointer(
      event.currentTarget.getBoundingClientRect(),
      event.clientX,
      event.clientY
    )

    updateHoveredResizeEdges(nextEdges)
  }

  const handlePointerLeave = () => {
    if (!isResizeActive) updateHoveredResizeEdges(null)
  }

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (isDragging || isResizeActive) return

    const target = event.target as HTMLElement
    if (target.closest('[data-dashboard-ignore-resize="true"]')) return

    const resizeEdges = getResizeEdgesFromPointer(
      event.currentTarget.getBoundingClientRect(),
      event.clientX,
      event.clientY
    )

    if (!resizeEdges) return

    event.preventDefault()
    event.stopPropagation()
    updateHoveredResizeEdges(resizeEdges)
    onResizeStart(widget.id, resizeEdges, { clientX: event.clientX, clientY: event.clientY })
  }

  const cursor = getCursorForResizeEdges(hoveredResizeEdges)
  const safeDefinition =
    definition ??
    DASHBOARD_WIDGET_DEFINITIONS.find((item) => item.type === 'monthly-balance') ??
    DASHBOARD_WIDGET_DEFINITIONS[0]
  const dragHandleProps = {
    ...attributes,
    ...listeners,
  } as ButtonHTMLAttributes<HTMLButtonElement>

  return (
    <DashboardWidgetFrame
      wrapperRef={setNodeRef}
      wrapperStyle={wrapperStyle}
      cursor={cursor}
      isDragging={isDragging}
      isResizeActive={isResizeActive}
      isDropBlocked={isDropBlocked}
      hoveredResizeEdges={hoveredResizeEdges}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
    >
      <DashboardWidgetHeader
        widget={widget}
        safeDefinition={safeDefinition}
        hasKnownDefinition={Boolean(definition)}
        dragHandleProps={dragHandleProps}
        onWidgetTypeChange={onWidgetTypeChange}
      />

      <DashboardWidgetContent
        widget={widget}
        transactions={transactions}
        selectedMonth={selectedMonth}
        dashboardStats={dashboardStats}
        topExpenseCategories={topExpenseCategories}
        latestTransactions={latestTransactions}
        categoriesById={categoriesById}
        getSignedAmountForTransaction={getSignedAmountForTransaction}
      />

      <DashboardWidgetControls
        widgetId={widget.id}
        widgetWidth={widget.width}
        styles={styles}
        onRemove={onRemove}
      />
    </DashboardWidgetFrame>
  )
}
