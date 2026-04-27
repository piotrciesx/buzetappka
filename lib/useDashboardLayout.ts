'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  DASHBOARD_GRID_COLUMNS,
  DASHBOARD_GRID_MAX_ROWS,
  DASHBOARD_WIDGET_DEFINITIONS,
} from './dashboardWidgetConfig'
import {
  packDashboardWidgets,
  projectDashboardWidgets,
  sortDashboardWidgetsByPosition,
} from './dashboardLayout'
import { DashboardWidgetLayoutItem, DashboardWidgetType } from './dashboardTypes'

const DASHBOARD_LAYOUT_STORAGE_VERSION = 2

type StoredDashboardLayout = {
  version: number
  widgets: DashboardWidgetLayoutItem[]
}

type DashboardLayoutUpdate = {
  x: number
  y: number
  width: number
  height: number
}

const createDashboardWidgetId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `dashboard-widget-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const isDashboardWidgetType = (value: unknown): value is DashboardWidgetType => {
  return DASHBOARD_WIDGET_DEFINITIONS.some((definition) => definition.type === value)
}

const sanitizeStoredWidgets = (value: unknown): DashboardWidgetLayoutItem[] => {
  if (!value || typeof value !== 'object') return []

  const candidate = value as Partial<StoredDashboardLayout>

  if (!Array.isArray(candidate.widgets)) return []

  return candidate.widgets
    .filter((widget): widget is DashboardWidgetLayoutItem => {
      return (
        !!widget &&
        typeof widget.id === 'string' &&
        isDashboardWidgetType(widget.type) &&
        typeof widget.x === 'number' &&
        typeof widget.y === 'number' &&
        typeof widget.width === 'number' &&
        typeof widget.height === 'number'
      )
    })
    .map((widget) => ({
      ...widget,
      x: Math.max(0, Math.round(widget.x) || 0),
      y: Math.max(0, Math.round(widget.y) || 0),
      width: Math.max(1, Math.min(DASHBOARD_GRID_COLUMNS, Math.round(widget.width) || 1)),
      height: Math.max(1, Math.min(DASHBOARD_GRID_MAX_ROWS, Math.round(widget.height) || 1)),
    }))
}

const readDashboardLayout = (storageKey: string) => {
  if (typeof window === 'undefined') return []

  try {
    const rawValue = window.localStorage.getItem(storageKey)
    if (!rawValue) return []

    return packDashboardWidgets(sanitizeStoredWidgets(JSON.parse(rawValue)))
  } catch {
    return []
  }
}

type UseDashboardLayoutOptions = {
  profileId: string
}

export const useDashboardLayout = ({ profileId }: UseDashboardLayoutOptions) => {
  const storageKey = `budget-dashboard-layout-${profileId}`
  const [widgets, setWidgets] = useState<DashboardWidgetLayoutItem[]>(() =>
    readDashboardLayout(storageKey)
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    const payload: StoredDashboardLayout = {
      version: DASHBOARD_LAYOUT_STORAGE_VERSION,
      widgets,
    }

    window.localStorage.setItem(storageKey, JSON.stringify(payload))
  }, [storageKey, widgets])

  const orderedWidgets = useMemo(() => sortDashboardWidgetsByPosition(widgets), [widgets])

  const addWidget = () => {
    const definition = DASHBOARD_WIDGET_DEFINITIONS.find(
      (item) => item.type === 'monthly-balance'
    )

    if (!definition) return

    setWidgets((prev) =>
      packDashboardWidgets([
        ...sortDashboardWidgetsByPosition(prev),
        {
          id: createDashboardWidgetId(),
          type: definition.type,
          x: 0,
          y: 0,
          width: definition.defaultSize.width,
          height: definition.defaultSize.height,
        },
      ])
    )
  }

  const updateWidgetType = (id: string, type: DashboardWidgetType) => {
    const definition = DASHBOARD_WIDGET_DEFINITIONS.find((item) => item.type === type)

    if (!definition) return

    setWidgets((prev) =>
      packDashboardWidgets(
        sortDashboardWidgetsByPosition(prev).map((widget) =>
          widget.id === id
            ? {
                ...widget,
                type,
              }
            : widget
        )
      )
    )
  }

  const removeWidget = (id: string) => {
    setWidgets((prev) =>
      packDashboardWidgets(sortDashboardWidgetsByPosition(prev).filter((item) => item.id !== id))
    )
  }

  const moveWidget = (id: string, x: number, y: number) => {
    setWidgets((prev) => {
      const activeWidget = prev.find((widget) => widget.id === id)

      if (!activeWidget) return prev

      return projectDashboardWidgets(sortDashboardWidgetsByPosition(prev), {
        id,
        x,
        y,
        width: activeWidget.width,
        height: activeWidget.height,
      })
    })
  }

  const resizeWidget = (id: string, nextLayout: DashboardLayoutUpdate) => {
    setWidgets((prev) =>
      projectDashboardWidgets(sortDashboardWidgetsByPosition(prev), { id, ...nextLayout })
    )
  }

  return {
    widgets: orderedWidgets,
    addWidget,
    updateWidgetType,
    removeWidget,
    resizeWidget,
    moveWidget,
  }
}
