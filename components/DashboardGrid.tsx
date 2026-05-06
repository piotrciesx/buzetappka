'use client'

import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react'
import {
  DndContext,
  DragMoveEvent,
  DragStartEvent,
} from '@dnd-kit/core'
import DashboardWidgetTile from './DashboardWidgetTile'
import { DASHBOARD_GRID_COLUMNS, SMALL_WIDGET_SIZE } from '../lib/dashboardWidgetConfig'
import { getDashboardLayoutHeight, projectDashboardWidgets } from '../lib/dashboardLayout'
import {
  DashboardModuleId,
  DashboardTileMode,
  DashboardWidgetLayoutItem,
} from '../lib/dashboardTypes'
import { DashboardStats, TopCategory } from '../lib/dashboardStats'
import { Category, Tag, Transaction } from '../lib/budgetPageTypes'
import { usePressHoldDndSensors } from '../lib/usePressHoldDndSensors'

const DASHBOARD_GRID_GAP = 12
const DASHBOARD_GRID_ROW_HEIGHT = 132
const MOBILE_WIDGET_HEIGHT = 300

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

const getViewportFallbackGridWidth = () => {
  if (typeof window === 'undefined') return 0

  return Math.max(280, Math.min(window.innerWidth - 36, 1100))
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

const getSnappedWidgetX = (x: number, width: number) => {
  if (width >= DASHBOARD_GRID_COLUMNS) return 0

  const step = Math.max(1, width)
  const snappedX = Math.round(x / step) * step

  return Math.max(0, Math.min(DASHBOARD_GRID_COLUMNS - width, snappedX))
}

const getSnappedWidgetY = (y: number, height: number) => {
  const step = Math.max(1, height)
  return Math.max(0, Math.round(y / step) * step)
}

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

type Props = {
  widgets: DashboardWidgetLayoutItem[]
  transactions: Transaction[]
  selectedMonth: string
  budgetStartDate: string
  excludedMonthsSet: Set<string>
  transactionTagsMap: Record<string, Tag[]>
  dashboardStats: DashboardStats
  topExpenseCategories: TopCategory[]
  latestTransactions: Transaction[]
  categoriesById: Record<string, Category>
  getSignedAmountForTransaction: (transaction: Transaction) => number
  onWidgetConfigChange: (
    id: string,
    update: {
      mode: DashboardTileMode
      enabledModules: DashboardModuleId[]
      moduleOrder: DashboardModuleId[]
    }
  ) => void
  onMoveWidget: (id: string, x: number, y: number) => void
  onToggleWidgetSize: (id: string) => void
  onRemoveWidget: (id: string) => void
  styles: Record<string, CSSProperties>
}

export default function DashboardGrid(props: Props) {
  const {
    widgets,
    transactions,
    selectedMonth,
    budgetStartDate,
    excludedMonthsSet,
    transactionTagsMap,
    dashboardStats,
    topExpenseCategories,
    latestTransactions,
    categoriesById,
    getSignedAmountForTransaction,
    onWidgetConfigChange,
    onMoveWidget,
    onToggleWidgetSize,
    onRemoveWidget,
    styles,
  } = props

  const gridRef = useRef<HTMLDivElement | null>(null)

  const [isMounted, setIsMounted] = useState(false)
  const [gridWidth, setGridWidth] = useState(0)
  const [fallbackGridWidth, setFallbackGridWidth] = useState(getViewportFallbackGridWidth)
  const [dragSession, setDragSession] = useState<DragSession | null>(null)
  const [openConfigWidgetId, setOpenConfigWidgetId] = useState<string | null>(null)

  const measuredGridWidth = gridWidth > 0 ? gridWidth : fallbackGridWidth
  const columnWidth = getColumnWidth(measuredGridWidth)

  const widgetsById = useMemo(() => {
    return new Map(widgets.map((widget) => [widget.id, widget]))
  }, [widgets])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const handlePointerDown = (event: globalThis.PointerEvent) => {
      const target = event.target as HTMLElement | null
      if (
        target?.closest('[data-dashboard-config-panel="true"]') ||
        target?.closest('[data-dashboard-config-control="true"]')
      ) {
        return
      }

      setOpenConfigWidgetId(null)
    }

    window.addEventListener('pointerdown', handlePointerDown)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [])

  const toggleWidgetConfig = (id: string) => {
    setOpenConfigWidgetId((currentId) => (currentId === id ? null : id))
  }

  useEffect(() => {
    if (!isMounted) return

    const updateFallbackWidth = () => {
      setFallbackGridWidth(getViewportFallbackGridWidth())
    }

    updateFallbackWidth()
    window.addEventListener('resize', updateFallbackWidth)

    return () => {
      window.removeEventListener('resize', updateFallbackWidth)
    }
  }, [isMounted])

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

  useEffect(() => {
    if (!isMounted || widgets.length === 0) return

    const animationFrameId = window.requestAnimationFrame(() => {
      const nextWidth = gridRef.current?.getBoundingClientRect().width ?? 0
      if (nextWidth <= 0) return

      setGridWidth((prev) => {
        if (Math.round(prev) === Math.round(nextWidth)) return prev
        return nextWidth
      })
    })

    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [isMounted, widgets.length])

  const sensors = usePressHoldDndSensors()
  const isMobileDashboard = measuredGridWidth > 0 && measuredGridWidth < 640

  const previewWidgets = useMemo(() => {
    if (!dragSession) return widgets

    const activeWidget = widgetsById.get(dragSession.id)
    if (!activeWidget) return widgets
    const activeSize = isMobileDashboard ? SMALL_WIDGET_SIZE : activeWidget

    return projectDashboardWidgets(widgets, {
      id: activeWidget.id,
      x: dragSession.targetX,
      y: dragSession.targetY,
      width: activeSize.width,
      height: activeSize.height,
    })
  }, [dragSession, isMobileDashboard, widgets, widgetsById])

  const previewWidgetsById = useMemo(() => {
    return new Map(previewWidgets.map((widget) => [widget.id, widget]))
  }, [previewWidgets])

  const activeDragWidget = dragSession ? widgetsById.get(dragSession.id) ?? null : null
  const activePreviewWidget = dragSession ? previewWidgetsById.get(dragSession.id) ?? null : null

  const layoutHeightRows = getDashboardLayoutHeight(previewWidgets)
  const baseMobileWidgetRects = useMemo(() => {
    let nextTop = 0

    return widgets.reduce<Record<string, WidgetPixelRect>>((acc, widget) => {
      acc[widget.id] = {
        left: 0,
        top: nextTop,
        width: measuredGridWidth,
        height: MOBILE_WIDGET_HEIGHT,
      }
      nextTop += MOBILE_WIDGET_HEIGHT + DASHBOARD_GRID_GAP

      return acc
    }, {})
  }, [measuredGridWidth, widgets])
  const previewMobileWidgetRects = useMemo(() => {
    let nextTop = 0

    return previewWidgets.reduce<Record<string, WidgetPixelRect>>((acc, widget) => {
      acc[widget.id] = {
        left: 0,
        top: nextTop,
        width: measuredGridWidth,
        height: MOBILE_WIDGET_HEIGHT,
      }
      nextTop += MOBILE_WIDGET_HEIGHT + DASHBOARD_GRID_GAP

      return acc
    }, {})
  }, [measuredGridWidth, previewWidgets])
  const mobileGridHeight = widgets.reduce((total, _widget, index) => {
    return total + MOBILE_WIDGET_HEIGHT + (index === widgets.length - 1 ? 0 : DASHBOARD_GRID_GAP)
  }, 0)
  const activeDragGhostRect =
    activePreviewWidget && columnWidth > 0
      ? isMobileDashboard
        ? previewMobileWidgetRects[activePreviewWidget.id]
        : getWidgetPixelRect(activePreviewWidget, columnWidth)
      : null
  const layoutHeightPixels = getGridHeightInPixels(layoutHeightRows)
  const gridHeight = isMobileDashboard
    ? Math.max(mobileGridHeight, DASHBOARD_GRID_ROW_HEIGHT)
    : Math.max(layoutHeightPixels, DASHBOARD_GRID_ROW_HEIGHT)

  const handleDragStart = (event: DragStartEvent) => {
    if (columnWidth <= 0) return

    const activeWidget = widgetsById.get(String(event.active.id))
    if (!activeWidget) return

    setDragSession({
      id: activeWidget.id,
      targetX: isMobileDashboard ? 0 : getSnappedWidgetX(activeWidget.x, activeWidget.width),
      targetY: getSnappedWidgetY(activeWidget.y, activeWidget.height),
    })
  }

  const handleDragMove = (event: DragMoveEvent) => {
    if (!columnWidth) return

    setDragSession((currentSession) => {
      if (!currentSession) return currentSession

      const activeWidget = widgetsById.get(currentSession.id)
      if (!activeWidget) return currentSession

      if (isMobileDashboard) {
        const activeRect = baseMobileWidgetRects[activeWidget.id]
        if (!activeRect) return currentSession

        const top = activeRect.top + event.delta.y
        const targetIndex = Math.max(
          0,
          Math.min(widgets.length - 1, Math.round(top / (MOBILE_WIDGET_HEIGHT + DASHBOARD_GRID_GAP)))
        )
        const nextTargetX = 0
        const nextTargetY = targetIndex * SMALL_WIDGET_SIZE.height

        if (currentSession.targetX === nextTargetX && currentSession.targetY === nextTargetY) {
          return currentSession
        }

        return {
          ...currentSession,
          targetX: nextTargetX,
          targetY: nextTargetY,
        }
      }

      const rect = getWidgetPixelRect(activeWidget, columnWidth)
      const left = rect.left + event.delta.x
      const top = rect.top + event.delta.y
      const rawTargetX = Math.round(left / (columnWidth + DASHBOARD_GRID_GAP))
      const rawTargetY = Math.round(top / (DASHBOARD_GRID_ROW_HEIGHT + DASHBOARD_GRID_GAP))
      const nextTargetX = Math.max(
        0,
        Math.min(DASHBOARD_GRID_COLUMNS - activeWidget.width, getSnappedWidgetX(rawTargetX, activeWidget.width))
      )
      const nextTargetY = getSnappedWidgetY(rawTargetY, activeWidget.height)

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

  if (!isMounted) {
    return <div style={gridOuterStyle} suppressHydrationWarning />
  }

  if (widgets.length === 0) {
    return (
      <div ref={gridRef} style={gridOuterStyle} suppressHydrationWarning>
        <div style={styles.emptyStateCard}>
          Dashboard jest pusty. Dodaj pierwszy kafel, a potem wybierz statystykę na samym kaflu.
        </div>
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

          {widgets.map((widget) => {
            const previewWidget = previewWidgetsById.get(widget.id) ?? widget
            const isActiveDragWidget = dragSession?.id === widget.id
            const displayWidget = isMobileDashboard
              ? { ...previewWidget, ...SMALL_WIDGET_SIZE, x: 0 }
              : previewWidget
            const rect = isMobileDashboard
              ? isActiveDragWidget
                ? baseMobileWidgetRects[widget.id] ?? previewMobileWidgetRects[widget.id]
                : previewMobileWidgetRects[widget.id] ?? baseMobileWidgetRects[widget.id]
              : getWidgetPixelRect(isActiveDragWidget ? widget : previewWidget, columnWidth)
            if (!rect) return null

            return (
              <DashboardWidgetTile
                key={widget.id}
                widget={displayWidget}
                rect={rect}
                transactions={transactions}
                selectedMonth={selectedMonth}
                budgetStartDate={budgetStartDate}
                excludedMonthsSet={excludedMonthsSet}
                transactionTagsMap={transactionTagsMap}
                dashboardStats={dashboardStats}
                topExpenseCategories={topExpenseCategories}
                latestTransactions={latestTransactions}
                categoriesById={categoriesById}
                getSignedAmountForTransaction={getSignedAmountForTransaction}
                isDragging={isActiveDragWidget}
                isDropBlocked={false}
                isInteractionLocked={false}
                isConfigOpen={openConfigWidgetId === widget.id}
                isMobileDashboard={isMobileDashboard}
                onToggleConfig={toggleWidgetConfig}
                onWidgetConfigChange={onWidgetConfigChange}
                onToggleSize={onToggleWidgetSize}
                onRemove={onRemoveWidget}
                styles={styles}
              />
            )
          })}
        </div>
      </div>
    </DndContext>
  )
}
