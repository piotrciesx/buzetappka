'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  DASHBOARD_GRID_COLUMNS,
  DASHBOARD_WIDGET_DEFINITIONS,
  LARGE_WIDGET_SIZE,
  SMALL_WIDGET_SIZE,
  createDashboardWidgetConfig,
  ensureDashboardWidgetAllowedSize,
  getDashboardDefinition,
  resolveDashboardContainerType,
} from './dashboardWidgetConfig'
import {
  normalizeDashboardWidgetSize,
  packDashboardWidgets,
  projectDashboardWidgets,
  sortDashboardWidgetsByPosition,
} from './dashboardLayout'
import {
  DashboardContainerType,
  DashboardModuleId,
  DashboardTileMode,
  DashboardWidgetLayoutItem,
  DashboardWidgetSize,
} from './dashboardTypes'

const DASHBOARD_LAYOUT_STORAGE_VERSION = 7

type StoredDashboardLayout = {
  version: number
  widgets: DashboardWidgetLayoutItem[]
}

type DashboardWidgetConfigUpdate = {
  mode: DashboardTileMode
  enabledModules: DashboardModuleId[]
  moduleOrder: DashboardModuleId[]
}

const createDashboardWidgetId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `dashboard-widget-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const getDashboardModeSize = (size: DashboardWidgetSize): DashboardWidgetSize => {
  if (size.width >= LARGE_WIDGET_SIZE.width) {
    return LARGE_WIDGET_SIZE
  }

  return SMALL_WIDGET_SIZE
}

const getOppositeDashboardModeSize = (size: DashboardWidgetSize): DashboardWidgetSize => {
  if (size.width >= LARGE_WIDGET_SIZE.width) {
    return SMALL_WIDGET_SIZE
  }

  return LARGE_WIDGET_SIZE
}

const createDefaultDashboardWidgets = () =>
  packDashboardWidgets(
    DASHBOARD_WIDGET_DEFINITIONS.map((definition) => ({
      ...createDashboardWidgetConfig(createDashboardWidgetId(), definition.type),
      ...getDashboardModeSize(definition.defaultSize),
    }))
  )

const sanitizeStoredWidgets = (value: unknown): DashboardWidgetLayoutItem[] => {
  if (!value || typeof value !== 'object') return []

  const candidate = value as Partial<StoredDashboardLayout>

  if (!Array.isArray(candidate.widgets)) return []

  return candidate.widgets
    .filter((widget) => {
      return (
        !!widget &&
        typeof widget.id === 'string' &&
        typeof widget.x === 'number' &&
        typeof widget.y === 'number' &&
        typeof widget.width === 'number' &&
        typeof widget.height === 'number'
      )
    })
    .map((widget) => {
      const rawWidget = widget as Partial<DashboardWidgetLayoutItem> & { type?: unknown }
      const containerType = resolveDashboardContainerType(rawWidget.containerType ?? rawWidget.type)
      const definition = getDashboardDefinition(containerType)
      const enabledModules = Array.isArray(rawWidget.enabledModules)
        ? rawWidget.enabledModules.filter((moduleId): moduleId is DashboardModuleId =>
            definition.moduleOrder.includes(moduleId as DashboardModuleId)
          )
        : definition.defaultModules
      const moduleOrder = Array.isArray(rawWidget.moduleOrder)
        ? rawWidget.moduleOrder.filter((moduleId): moduleId is DashboardModuleId =>
            definition.moduleOrder.includes(moduleId as DashboardModuleId)
          )
        : definition.moduleOrder

      const normalizedSize = normalizeDashboardWidgetSize({
        width: rawWidget.width ?? definition.defaultSize.width,
        height: rawWidget.height ?? definition.defaultSize.height,
      })

      const allowedSize = ensureDashboardWidgetAllowedSize(definition, normalizedSize)

      return {
        ...createDashboardWidgetConfig(rawWidget.id ?? createDashboardWidgetId(), containerType),
        mode: rawWidget.mode === 'custom' ? 'custom' : 'auto',
        enabledModules: enabledModules.length > 0 ? enabledModules : definition.defaultModules,
        moduleOrder: moduleOrder.length > 0 ? moduleOrder : definition.moduleOrder,
        x: Math.max(
          0,
          Math.min(DASHBOARD_GRID_COLUMNS - allowedSize.width, Math.round(rawWidget.x ?? 0) || 0)
        ),
        y: Math.max(0, Math.round(rawWidget.y ?? 0) || 0),
        width: allowedSize.width,
        height: allowedSize.height,
      }
    })
}

const readDashboardLayout = (storageKey: string) => {
  if (typeof window === 'undefined') return []

  try {
    const rawValue = window.localStorage.getItem(storageKey)
    if (!rawValue) return createDefaultDashboardWidgets()

    const parsedValue = JSON.parse(rawValue) as Partial<StoredDashboardLayout>
    const sanitizedWidgets = sanitizeStoredWidgets(parsedValue)

    if (sanitizedWidgets.length === 0 && parsedValue.version !== DASHBOARD_LAYOUT_STORAGE_VERSION) {
      return createDefaultDashboardWidgets()
    }

    return packDashboardWidgets(sanitizedWidgets)
  } catch {
    return createDefaultDashboardWidgets()
  }
}

const writeDashboardLayout = (storageKey: string, widgets: DashboardWidgetLayoutItem[]) => {
  if (typeof window === 'undefined') return

  const safeWidgets = packDashboardWidgets(widgets).map((widget) => {
    const definition = getDashboardDefinition(widget.containerType)
    const normalizedSize = normalizeDashboardWidgetSize(widget)
    const safeSize = ensureDashboardWidgetAllowedSize(definition, normalizedSize)

    return {
      ...widget,
      ...safeSize,
      x: Math.max(0, Math.min(DASHBOARD_GRID_COLUMNS - safeSize.width, Math.round(widget.x) || 0)),
      y: Math.max(0, Math.round(widget.y) || 0),
    }
  })

  const payload: StoredDashboardLayout = {
    version: DASHBOARD_LAYOUT_STORAGE_VERSION,
    widgets: safeWidgets,
  }

  window.localStorage.setItem(storageKey, JSON.stringify(payload))
}

type UseDashboardLayoutOptions = {
  profileId: string
}

export const useDashboardLayout = ({ profileId }: UseDashboardLayoutOptions) => {
  const storageKey = `budget-dashboard-layout-${profileId}`
  const [widgets, setWidgets] = useState<DashboardWidgetLayoutItem[]>(() =>
    readDashboardLayout(storageKey)
  )

  const setWidgetsAndStore = useCallback(
    (resolveWidgets: (prev: DashboardWidgetLayoutItem[]) => DashboardWidgetLayoutItem[]) => {
      setWidgets((prev) => {
        const nextWidgets = resolveWidgets(prev)
        writeDashboardLayout(storageKey, nextWidgets)
        return nextWidgets
      })
    },
    [storageKey]
  )

  useEffect(() => {
    writeDashboardLayout(storageKey, widgets)
  }, [storageKey, widgets])

  const orderedWidgets = useMemo(() => sortDashboardWidgetsByPosition(widgets), [widgets])

  const addWidget = (containerType: DashboardContainerType = 'month-finance') => {
    const definition = getDashboardDefinition(containerType)
    const defaultSize = getDashboardModeSize(definition.defaultSize)

    setWidgetsAndStore((prev) =>
      packDashboardWidgets([
        ...sortDashboardWidgetsByPosition(prev),
        {
          ...createDashboardWidgetConfig(createDashboardWidgetId(), definition.type),
          ...defaultSize,
          x: 0,
          y: 0,
        },
      ])
    )
  }

  const updateWidgetType = (id: string, containerType: DashboardContainerType) => {
    const definition = getDashboardDefinition(containerType)

    setWidgetsAndStore((prev) =>
      packDashboardWidgets(
        sortDashboardWidgetsByPosition(prev).map((widget) =>
          widget.id === id
            ? {
                ...createDashboardWidgetConfig(widget.id, definition.type),
                ...getDashboardModeSize(widget),
                x: widget.x,
                y: widget.y,
              }
            : widget
        )
      )
    )
  }

  const updateWidgetConfig = (id: string, update: DashboardWidgetConfigUpdate) => {
    setWidgetsAndStore((prev) =>
      sortDashboardWidgetsByPosition(prev).map((widget) =>
        widget.id === id
          ? {
              ...widget,
              mode: update.mode,
              enabledModules: update.enabledModules,
              moduleOrder: update.moduleOrder,
            }
          : widget
      )
    )
  }

  const toggleWidgetSize = (id: string) => {
    setWidgetsAndStore((prev) => {
      const activeWidget = prev.find((widget) => widget.id === id)

      if (!activeWidget) return prev

      const nextSize = getOppositeDashboardModeSize(activeWidget)
      const nextX =
        nextSize.width >= DASHBOARD_GRID_COLUMNS
          ? 0
          : Math.max(
              0,
              Math.min(DASHBOARD_GRID_COLUMNS - nextSize.width, Math.round(activeWidget.x) || 0)
            )

      return projectDashboardWidgets(sortDashboardWidgetsByPosition(prev), {
        id,
        x: nextX,
        y: activeWidget.y,
        width: nextSize.width,
        height: nextSize.height,
      })
    })
  }

  const removeWidget = (id: string) => {
    setWidgetsAndStore((prev) =>
      packDashboardWidgets(sortDashboardWidgetsByPosition(prev).filter((item) => item.id !== id))
    )
  }

  const moveWidget = (id: string, x: number, y: number) => {
    setWidgetsAndStore((prev) => {
      const activeWidget = prev.find((widget) => widget.id === id)

      if (!activeWidget) return prev

      const size = normalizeDashboardWidgetSize(activeWidget)

      return projectDashboardWidgets(sortDashboardWidgetsByPosition(prev), {
        id,
        x: Math.min(Math.max(0, x), DASHBOARD_GRID_COLUMNS - size.width),
        y,
        width: size.width,
        height: size.height,
      })
    })
  }

  return {
    widgets: orderedWidgets,
    addWidget,
    updateWidgetType,
    updateWidgetConfig,
    toggleWidgetSize,
    removeWidget,
    moveWidget,
  }
}
