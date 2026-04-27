'use client'

import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react'
import {
  DndContext,
  DragMoveEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import DashboardWidgetTile, { DashboardResizeEdges } from './DashboardWidgetTile'
import { DASHBOARD_GRID_COLUMNS, DASHBOARD_GRID_MAX_ROWS } from '../lib/dashboardWidgetConfig'
import {
  getDashboardLayoutHeight,
  projectDashboardWidgets,
} from '../lib/dashboardLayout'
import { DashboardWidgetLayoutItem, DashboardWidgetType } from '../lib/dashboardTypes'
import { DashboardStats, TopCategory } from '../lib/dashboardStats'
import { Category, Transaction } from '../lib/budgetPageTypes'

const DASHBOARD_GRID_GAP = 12
const DASHBOARD_GRID_ROW_HEIGHT = 132

type WidgetPixelRect = {
  left: number
  top: number
  width: number
  height: number
}

type DragSession = {
  id: string
  targetX: number
  targetY: number
}

type ResizeSession = {
  id: string
  edges: DashboardResizeEdges
  startClientX: number
  startClientY: number
  startLayout: DashboardWidgetLayoutItem
  startRect: WidgetPixelRect
  previewRect: WidgetPixelRect
}

const gridOuterStyle: CSSProperties = {
  position: 'relative',
  width: '100%',
}

const gridCanvasStyle: CSSProperties = {
  position: 'relative',
  width: '100%',
  minHeight: DASHBOARD_GRID_ROW_HEIGHT,
}

const ghostStyle: CSSProperties = {
  position: 'absolute',
  borderRadius: 16,
  border: '1px dashed #60a5fa',
  background: 'rgba(96, 165, 250, 0.12)',
  boxShadow: 'inset 0 0 0 1px rgba(96, 165, 250, 0.16)',
  transition: 'transform 180ms ease, width 180ms ease, height 180ms ease',
  pointerEvents: 'none',
  zIndex: 1,
}

const getColumnWidth = (gridWidth: number) => {
  if (gridWidth <= 0) return 0
  return (gridWidth - DASHBOARD_GRID_GAP * (DASHBOARD_GRID_COLUMNS - 1)) / DASHBOARD_GRID_COLUMNS
}

const getPixelsForColumnSpan = (span: number, columnWidth: number) => {
  if (span <= 0) return 0
  return columnWidth * span + DASHBOARD_GRID_GAP * (span - 1)
}

const getPixelsForRowSpan = (span: number) => {
  if (span <= 0) return 0
  return DASHBOARD_GRID_ROW_HEIGHT * span + DASHBOARD_GRID_GAP * (span - 1)
}

const getGridHeightInPixels = (rows: number) => {
  if (rows <= 0) return 0
  return DASHBOARD_GRID_ROW_HEIGHT * rows + DASHBOARD_GRID_GAP * (rows - 1)
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const getWidgetPixelRect = (
  widget: DashboardWidgetLayoutItem,
  columnWidth: number
): WidgetPixelRect => {
  return {
    left: widget.x * (columnWidth + DASHBOARD_GRID_GAP),
    top: widget.y * (DASHBOARD_GRID_ROW_HEIGHT + DASHBOARD_GRID_GAP),
    width: getPixelsForColumnSpan(widget.width, columnWidth),
    height: getPixelsForRowSpan(widget.height),
  }
}

const getNearestSpanFromPixels = (
  pixels: number,
  maxSpan: number,
  getPixelsForSpan: (span: number) => number
) => {
  let winner = 1
  let minDistance = Number.POSITIVE_INFINITY

  for (let span = 1; span <= maxSpan; span += 1) {
    const distance = Math.abs(getPixelsForSpan(span) - pixels)

    if (distance < minDistance) {
      minDistance = distance
      winner = span
    }
  }

  return winner
}

type Props = {
  widgets: DashboardWidgetLayoutItem[]
  transactions: Transaction[]
  selectedMonth: string
  dashboardStats: DashboardStats
  topExpenseCategories: TopCategory[]
  latestTransactions: Transaction[]
  categoriesById: Record<string, Category>
  getSignedAmountForTransaction: (transaction: Transaction) => number
  onWidgetTypeChange: (id: string, type: DashboardWidgetType) => void
  onMoveWidget: (id: string, x: number, y: number) => void
  onRemoveWidget: (id: string) => void
  onResizeWidget: (
    id: string,
    nextLayout: { x: number; y: number; width: number; height: number }
  ) => void
  styles: Record<string, CSSProperties>
}

export default function DashboardGrid(props: Props) {
  const {
    widgets,
    transactions,
    selectedMonth,
    dashboardStats,
    topExpenseCategories,
    latestTransactions,
    categoriesById,
    getSignedAmountForTransaction,
    onWidgetTypeChange,
    onMoveWidget,
    onRemoveWidget,
    onResizeWidget,
    styles,
  } = props

  const gridRef = useRef<HTMLDivElement | null>(null)
  const resizeSessionRef = useRef<ResizeSession | null>(null)

  const [isMounted, setIsMounted] = useState(false)
  const [gridWidth, setGridWidth] = useState(0)
  const [dragSession, setDragSession] = useState<DragSession | null>(null)
  const [resizeSession, setResizeSession] = useState<ResizeSession | null>(null)

  const columnWidth = getColumnWidth(gridWidth)

  const widgetsById = useMemo(() => {
    return new Map(widgets.map((widget) => [widget.id, widget]))
  }, [widgets])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    resizeSessionRef.current = resizeSession
  }, [resizeSession])

  useEffect(() => {
    if (!isMounted) return

    const element = gridRef.current
    if (!element || typeof ResizeObserver === 'undefined') return

    const updateWidth = (nextWidth: number) => {
      setGridWidth((prev) => {
        if (Math.round(prev) === Math.round(nextWidth)) return prev
        return nextWidth
      })
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const nextWidth = entries[0]?.contentRect.width ?? 0
      updateWidth(nextWidth)
    })

    resizeObserver.observe(element)
    updateWidth(element.getBoundingClientRect().width)

    return () => {
      resizeObserver.disconnect()
    }
  }, [isMounted])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    })
  )

  const previewWidgets = useMemo(() => {
    if (!dragSession) return widgets

    const activeWidget = widgetsById.get(dragSession.id)
    if (!activeWidget) return widgets

    return projectDashboardWidgets(widgets, {
      id: activeWidget.id,
      x: dragSession.targetX,
      y: dragSession.targetY,
      width: activeWidget.width,
      height: activeWidget.height,
    })
  }, [dragSession, widgets, widgetsById])

  const previewWidgetsById = useMemo(() => {
    return new Map(previewWidgets.map((widget) => [widget.id, widget]))
  }, [previewWidgets])

  const activeDragWidget = dragSession ? widgetsById.get(dragSession.id) ?? null : null
  const activePreviewWidget = dragSession ? previewWidgetsById.get(dragSession.id) ?? null : null
  const activeDragGhostRect =
    activePreviewWidget && columnWidth > 0
      ? getWidgetPixelRect(activePreviewWidget, columnWidth)
      : null

  const layoutHeightRows = getDashboardLayoutHeight(previewWidgets)
  const layoutHeightPixels = getGridHeightInPixels(layoutHeightRows)
  const resizeHeightPixels = resizeSession
    ? resizeSession.previewRect.top + resizeSession.previewRect.height
    : 0
  const gridHeight = Math.max(layoutHeightPixels, resizeHeightPixels, DASHBOARD_GRID_ROW_HEIGHT)

  const handleDragStart = (event: DragStartEvent) => {
    if (resizeSessionRef.current || columnWidth <= 0) return

    const activeWidget = widgetsById.get(String(event.active.id))
    if (!activeWidget) return

    setDragSession({
      id: activeWidget.id,
      targetX: activeWidget.x,
      targetY: activeWidget.y,
    })
  }

  const handleDragMove = (event: DragMoveEvent) => {
    if (!columnWidth) return

    setDragSession((currentSession) => {
      if (!currentSession) return currentSession

      const activeWidget = widgetsById.get(currentSession.id)
      if (!activeWidget) return currentSession

      const rect = getWidgetPixelRect(activeWidget, columnWidth)
      const left = rect.left + event.delta.x
      const top = rect.top + event.delta.y
      const nextTargetX = clamp(
        Math.round(left / (columnWidth + DASHBOARD_GRID_GAP)),
        0,
        DASHBOARD_GRID_COLUMNS - activeWidget.width
      )
      const nextTargetY = Math.max(
        0,
        Math.round(top / (DASHBOARD_GRID_ROW_HEIGHT + DASHBOARD_GRID_GAP))
      )

      if (currentSession.targetX === nextTargetX && currentSession.targetY === nextTargetY) {
        return currentSession
      }

      return {
        ...currentSession,
        targetX: nextTargetX,
        targetY: nextTargetY,
      }
    })
  }

  const stopDragging = () => {
    setDragSession(null)
  }

  const handleDragEnd = () => {
    if (!dragSession) return

    const activeWidget = widgetsById.get(dragSession.id)

    if (
      activeWidget &&
      (activeWidget.x !== dragSession.targetX || activeWidget.y !== dragSession.targetY)
    ) {
      onMoveWidget(dragSession.id, dragSession.targetX, dragSession.targetY)
    }

    stopDragging()
  }

  const handleResizeStart = (
    id: string,
    edges: DashboardResizeEdges,
    event: { clientX: number; clientY: number }
  ) => {
    if (columnWidth <= 0) return

    const widget = widgetsById.get(id)
    if (!widget) return

    const nextSession = {
      id,
      edges,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startLayout: widget,
      startRect: getWidgetPixelRect(widget, columnWidth),
      previewRect: getWidgetPixelRect(widget, columnWidth),
    }

    resizeSessionRef.current = nextSession
    setResizeSession(nextSession)
  }

  useEffect(() => {
    if (!resizeSession || columnWidth <= 0) return

    const sessionAtStart = resizeSession
    const maxRightWidth = getPixelsForColumnSpan(
      DASHBOARD_GRID_COLUMNS - sessionAtStart.startLayout.x,
      columnWidth
    )
    const maxLeftWidth = getPixelsForColumnSpan(
      Math.min(
        DASHBOARD_GRID_COLUMNS,
        sessionAtStart.startLayout.x + sessionAtStart.startLayout.width
      ),
      columnWidth
    )
    const maxBottomHeight = getPixelsForRowSpan(DASHBOARD_GRID_MAX_ROWS)
    const maxTopHeight = getPixelsForRowSpan(
      Math.min(
        DASHBOARD_GRID_MAX_ROWS,
        sessionAtStart.startLayout.y + sessionAtStart.startLayout.height
      )
    )

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      const currentSession = resizeSessionRef.current
      if (!currentSession) return

      const deltaX = event.clientX - currentSession.startClientX
      const deltaY = event.clientY - currentSession.startClientY
      const nextRect = { ...currentSession.startRect }

      if (currentSession.edges.right) {
        nextRect.width = clamp(
          currentSession.startRect.width + deltaX,
          getPixelsForColumnSpan(1, columnWidth),
          maxRightWidth
        )
      }

      if (currentSession.edges.left) {
        nextRect.width = clamp(
          currentSession.startRect.width - deltaX,
          getPixelsForColumnSpan(1, columnWidth),
          maxLeftWidth
        )
        nextRect.left =
          currentSession.startRect.left + (currentSession.startRect.width - nextRect.width)
      }

      if (currentSession.edges.bottom) {
        nextRect.height = clamp(
          currentSession.startRect.height + deltaY,
          getPixelsForRowSpan(1),
          maxBottomHeight
        )
      }

      if (currentSession.edges.top) {
        nextRect.height = clamp(
          currentSession.startRect.height - deltaY,
          getPixelsForRowSpan(1),
          maxTopHeight
        )
        nextRect.top =
          currentSession.startRect.top + (currentSession.startRect.height - nextRect.height)
      }

      setResizeSession((prev) => {
        if (!prev) return null

        if (
          prev.previewRect.left === nextRect.left &&
          prev.previewRect.top === nextRect.top &&
          prev.previewRect.width === nextRect.width &&
          prev.previewRect.height === nextRect.height
        ) {
          return prev
        }

        const updatedSession = {
          ...prev,
          previewRect: nextRect,
        }

        resizeSessionRef.current = updatedSession
        return updatedSession
      })
    }

    const handlePointerUp = () => {
      const currentSession = resizeSessionRef.current
      if (!currentSession) return

      const rightEdge = currentSession.startLayout.x + currentSession.startLayout.width
      const bottomEdge = currentSession.startLayout.y + currentSession.startLayout.height
      const maxWidthForSnap = currentSession.edges.left
        ? rightEdge
        : DASHBOARD_GRID_COLUMNS - currentSession.startLayout.x
      const maxHeightForSnap = currentSession.edges.top
        ? Math.min(DASHBOARD_GRID_MAX_ROWS, bottomEdge)
        : DASHBOARD_GRID_MAX_ROWS
      const nextWidth = getNearestSpanFromPixels(
        currentSession.previewRect.width,
        maxWidthForSnap,
        (span) => getPixelsForColumnSpan(span, columnWidth)
      )
      const nextHeight = getNearestSpanFromPixels(
        currentSession.previewRect.height,
        maxHeightForSnap,
        (span) => getPixelsForRowSpan(span)
      )
      const nextX = currentSession.edges.left ? rightEdge - nextWidth : currentSession.startLayout.x
      const nextY = currentSession.edges.top ? bottomEdge - nextHeight : currentSession.startLayout.y

      if (
        nextX !== currentSession.startLayout.x ||
        nextY !== currentSession.startLayout.y ||
        nextWidth !== currentSession.startLayout.width ||
        nextHeight !== currentSession.startLayout.height
      ) {
        onResizeWidget(currentSession.id, {
          x: nextX,
          y: nextY,
          width: nextWidth,
          height: nextHeight,
        })
      }

      resizeSessionRef.current = null
      setResizeSession(null)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp, { once: true })
    window.addEventListener('pointercancel', handlePointerUp, { once: true })

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [columnWidth, onResizeWidget, resizeSession])

  if (!isMounted) {
    return <div style={gridOuterStyle} suppressHydrationWarning />
  }

  if (widgets.length === 0) {
    return (
      <div style={styles.emptyStateCard}>
        Dashboard jest pusty. Dodaj pierwszy kafel, a potem wybierz statystykę na samym kaflu.
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={stopDragging}
    >
      <div ref={gridRef} style={gridOuterStyle} suppressHydrationWarning>
        <div style={{ ...gridCanvasStyle, height: gridHeight }}>
          {dragSession && activeDragGhostRect && activeDragWidget && (
            <div
              aria-hidden="true"
              style={{
                ...ghostStyle,
                width: activeDragGhostRect.width,
                height: activeDragGhostRect.height,
                transform: `translate(${activeDragGhostRect.left}px, ${activeDragGhostRect.top}px)`,
              }}
            />
          )}

          {columnWidth > 0 &&
            widgets.map((widget) => {
              const previewWidget = previewWidgetsById.get(widget.id) ?? widget
              const isActiveDragWidget = dragSession?.id === widget.id
              const isActiveResizeWidget = resizeSession?.id === widget.id
              const rect =
                isActiveResizeWidget && resizeSession
                  ? resizeSession.previewRect
                  : getWidgetPixelRect(isActiveDragWidget ? widget : previewWidget, columnWidth)

              return (
                <DashboardWidgetTile
                  key={widget.id}
                  widget={
                    isActiveResizeWidget && resizeSession
                      ? {
                          ...widget,
                          x: resizeSession.startLayout.x,
                          y: resizeSession.startLayout.y,
                          width: widget.width,
                          height: widget.height,
                        }
                      : previewWidget
                  }
                  rect={rect}
                  transactions={transactions}
                  selectedMonth={selectedMonth}
                  dashboardStats={dashboardStats}
                  topExpenseCategories={topExpenseCategories}
                  latestTransactions={latestTransactions}
                  categoriesById={categoriesById}
                  getSignedAmountForTransaction={getSignedAmountForTransaction}
                  isDragging={isActiveDragWidget}
                  isDropBlocked={false}
                  isInteractionLocked={resizeSession !== null}
                  isResizeActive={isActiveResizeWidget}
                  onWidgetTypeChange={onWidgetTypeChange}
                  onRemove={onRemoveWidget}
                  onResizeStart={handleResizeStart}
                  styles={styles}
                />
              )
            })}
        </div>
      </div>
    </DndContext>
  )
}
