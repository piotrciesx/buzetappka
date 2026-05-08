import {
  getDashboardDefinition,
  getDashboardModulesForWidget,
} from './dashboardWidgetConfig'
import type {
  DashboardContainerType,
  DashboardModuleId,
  DashboardTileMode,
  DashboardWidgetLayoutItem,
} from './dashboardTypes'

export type DashboardModulePriority = 'high' | 'medium' | 'low'
export type DashboardModuleKind = 'metric' | 'chart' | 'list'
export type DashboardLayoutPreset = 'compact' | 'standard' | 'wide' | 'tall' | 'full'

type DashboardPresetConfig = {
  columns: number
  moduleLimit: number
  minModuleWidth: number
  minHeight: number
}

const CHART_MODULES = new Set<DashboardModuleId>([
  'calendar-heatmap',
  'daily-cashflow',
  'weekday-patterns',
  'trend-income',
  'trend-expense',
  'trend-balance',
  'trend-level1',
  'trend-level2',
  'trend-level3',
  'trend-payment',
  'trend-tags',
])

const LIST_MODULES = new Set<DashboardModuleId>([
  'recent-transactions',
  'recent-incomes',
  'recent-expenses',
  'top-categories',
  'top-income-categories',
  'top-expenses',
  'top-incomes',
  'problem-categories',
  'money-leaks',
])

const isGeneralTrendModule = (moduleId: DashboardModuleId) =>
  moduleId === 'trend-income' || moduleId === 'trend-expense' || moduleId === 'trend-balance'

const PRESET_CONFIG_BY_CONTAINER: Record<
  DashboardContainerType,
  Record<DashboardLayoutPreset, DashboardPresetConfig>
> = {
  'month-finance': {
    compact: { columns: 1, moduleLimit: 1, minModuleWidth: 150, minHeight: 2 },
    standard: { columns: 1, moduleLimit: 1, minModuleWidth: 150, minHeight: 2 },
    wide: { columns: 1, moduleLimit: 1, minModuleWidth: 150, minHeight: 2 },
    tall: { columns: 1, moduleLimit: 1, minModuleWidth: 150, minHeight: 3 },
    full: { columns: 1, moduleLimit: 1, minModuleWidth: 150, minHeight: 3 },
  },
  'month-rhythm': {
    compact: { columns: 1, moduleLimit: 2, minModuleWidth: 190, minHeight: 2 },
    standard: { columns: 2, moduleLimit: 2, minModuleWidth: 190, minHeight: 3 },
    wide: { columns: 2, moduleLimit: 2, minModuleWidth: 190, minHeight: 3 },
    tall: { columns: 2, moduleLimit: 2, minModuleWidth: 190, minHeight: 3 },
    full: { columns: 2, moduleLimit: 2, minModuleWidth: 190, minHeight: 3 },
  },
  'day-activity': {
    compact: { columns: 1, moduleLimit: 1, minModuleWidth: 150, minHeight: 2 },
    standard: { columns: 1, moduleLimit: 1, minModuleWidth: 150, minHeight: 2 },
    wide: { columns: 1, moduleLimit: 1, minModuleWidth: 150, minHeight: 2 },
    tall: { columns: 1, moduleLimit: 1, minModuleWidth: 150, minHeight: 2 },
    full: { columns: 1, moduleLimit: 1, minModuleWidth: 150, minHeight: 2 },
  },
  'daily-averages': {
    compact: { columns: 1, moduleLimit: 1, minModuleWidth: 150, minHeight: 2 },
    standard: { columns: 1, moduleLimit: 1, minModuleWidth: 150, minHeight: 2 },
    wide: { columns: 1, moduleLimit: 1, minModuleWidth: 150, minHeight: 2 },
    tall: { columns: 1, moduleLimit: 1, minModuleWidth: 150, minHeight: 2 },
    full: { columns: 1, moduleLimit: 1, minModuleWidth: 150, minHeight: 2 },
  },
  'day-extremes': {
    compact: { columns: 1, moduleLimit: 1, minModuleWidth: 150, minHeight: 2 },
    standard: { columns: 1, moduleLimit: 1, minModuleWidth: 150, minHeight: 2 },
    wide: { columns: 1, moduleLimit: 1, minModuleWidth: 150, minHeight: 2 },
    tall: { columns: 1, moduleLimit: 1, minModuleWidth: 150, minHeight: 2 },
    full: { columns: 1, moduleLimit: 1, minModuleWidth: 150, minHeight: 2 },
  },
  'trends-comparison': {
    compact: { columns: 1, moduleLimit: 1, minModuleWidth: 220, minHeight: 2 },
    standard: { columns: 1, moduleLimit: 2, minModuleWidth: 230, minHeight: 3 },
    wide: { columns: 2, moduleLimit: 2, minModuleWidth: 220, minHeight: 2 },
    tall: { columns: 1, moduleLimit: 4, minModuleWidth: 230, minHeight: 4 },
    full: { columns: 2, moduleLimit: 4, minModuleWidth: 220, minHeight: 4 },
  },
  'income-expense-trend': {
    compact: { columns: 1, moduleLimit: 1, minModuleWidth: 220, minHeight: 2 },
    standard: { columns: 1, moduleLimit: 1, minModuleWidth: 230, minHeight: 3 },
    wide: { columns: 1, moduleLimit: 1, minModuleWidth: 220, minHeight: 3 },
    tall: { columns: 1, moduleLimit: 1, minModuleWidth: 230, minHeight: 3 },
    full: { columns: 1, moduleLimit: 1, minModuleWidth: 220, minHeight: 3 },
  },
  'weekly-trend': {
    compact: { columns: 1, moduleLimit: 1, minModuleWidth: 220, minHeight: 2 },
    standard: { columns: 1, moduleLimit: 1, minModuleWidth: 230, minHeight: 3 },
    wide: { columns: 1, moduleLimit: 1, minModuleWidth: 220, minHeight: 3 },
    tall: { columns: 1, moduleLimit: 1, minModuleWidth: 230, minHeight: 3 },
    full: { columns: 1, moduleLimit: 1, minModuleWidth: 220, minHeight: 3 },
  },
  'expense-category-trend': {
    compact: { columns: 1, moduleLimit: 1, minModuleWidth: 220, minHeight: 2 },
    standard: { columns: 1, moduleLimit: 1, minModuleWidth: 230, minHeight: 3 },
    wide: { columns: 1, moduleLimit: 1, minModuleWidth: 220, minHeight: 3 },
    tall: { columns: 1, moduleLimit: 1, minModuleWidth: 230, minHeight: 3 },
    full: { columns: 1, moduleLimit: 1, minModuleWidth: 220, minHeight: 3 },
  },
  'income-category-trend': {
    compact: { columns: 1, moduleLimit: 1, minModuleWidth: 220, minHeight: 2 },
    standard: { columns: 1, moduleLimit: 1, minModuleWidth: 230, minHeight: 3 },
    wide: { columns: 1, moduleLimit: 1, minModuleWidth: 220, minHeight: 3 },
    tall: { columns: 1, moduleLimit: 1, minModuleWidth: 230, minHeight: 3 },
    full: { columns: 1, moduleLimit: 1, minModuleWidth: 220, minHeight: 3 },
  },
  'budget-control': {
    compact: { columns: 1, moduleLimit: 2, minModuleWidth: 160, minHeight: 2 },
    standard: { columns: 1, moduleLimit: 3, minModuleWidth: 160, minHeight: 2 },
    wide: { columns: 1, moduleLimit: 3, minModuleWidth: 160, minHeight: 2 },
    tall: { columns: 1, moduleLimit: 3, minModuleWidth: 160, minHeight: 2 },
    full: { columns: 1, moduleLimit: 3, minModuleWidth: 160, minHeight: 2 },
  },
  'lists-rankings': {
    compact: { columns: 1, moduleLimit: 1, minModuleWidth: 210, minHeight: 2 },
    standard: { columns: 1, moduleLimit: 1, minModuleWidth: 210, minHeight: 3 },
    wide: { columns: 1, moduleLimit: 1, minModuleWidth: 220, minHeight: 3 },
    tall: { columns: 1, moduleLimit: 1, minModuleWidth: 210, minHeight: 3 },
    full: { columns: 1, moduleLimit: 1, minModuleWidth: 210, minHeight: 3 },
  },
  'recent-events': {
    compact: { columns: 1, moduleLimit: 1, minModuleWidth: 210, minHeight: 2 },
    standard: { columns: 1, moduleLimit: 1, minModuleWidth: 210, minHeight: 3 },
    wide: { columns: 1, moduleLimit: 1, minModuleWidth: 220, minHeight: 3 },
    tall: { columns: 1, moduleLimit: 1, minModuleWidth: 210, minHeight: 3 },
    full: { columns: 1, moduleLimit: 1, minModuleWidth: 210, minHeight: 3 },
  },
  'recent-income-expense': {
    compact: { columns: 1, moduleLimit: 1, minModuleWidth: 210, minHeight: 2 },
    standard: { columns: 2, moduleLimit: 2, minModuleWidth: 210, minHeight: 3 },
    wide: { columns: 2, moduleLimit: 2, minModuleWidth: 220, minHeight: 3 },
    tall: { columns: 2, moduleLimit: 2, minModuleWidth: 210, minHeight: 3 },
    full: { columns: 2, moduleLimit: 2, minModuleWidth: 210, minHeight: 3 },
  },
  'category-rankings': {
    compact: { columns: 1, moduleLimit: 1, minModuleWidth: 210, minHeight: 2 },
    standard: { columns: 2, moduleLimit: 2, minModuleWidth: 210, minHeight: 3 },
    wide: { columns: 2, moduleLimit: 2, minModuleWidth: 220, minHeight: 3 },
    tall: { columns: 2, moduleLimit: 2, minModuleWidth: 210, minHeight: 3 },
    full: { columns: 2, moduleLimit: 2, minModuleWidth: 210, minHeight: 3 },
  },
  'top-items': {
    compact: { columns: 1, moduleLimit: 1, minModuleWidth: 210, minHeight: 2 },
    standard: { columns: 2, moduleLimit: 2, minModuleWidth: 210, minHeight: 3 },
    wide: { columns: 2, moduleLimit: 2, minModuleWidth: 220, minHeight: 3 },
    tall: { columns: 2, moduleLimit: 2, minModuleWidth: 210, minHeight: 3 },
    full: { columns: 2, moduleLimit: 2, minModuleWidth: 210, minHeight: 3 },
  },
  'stability-leaks': {
    compact: { columns: 1, moduleLimit: 1, minModuleWidth: 180, minHeight: 2 },
    standard: { columns: 1, moduleLimit: 1, minModuleWidth: 180, minHeight: 3 },
    wide: { columns: 1, moduleLimit: 1, minModuleWidth: 180, minHeight: 3 },
    tall: { columns: 1, moduleLimit: 1, minModuleWidth: 180, minHeight: 3 },
    full: { columns: 1, moduleLimit: 1, minModuleWidth: 180, minHeight: 3 },
  },
}

const GROUPED_BY_MODULE: Partial<Record<DashboardModuleId, DashboardModuleId[]>> = {
  balance: ['income', 'expense', 'expense-share', 'financial-efficiency', 'transaction-count'],
  'days-with-entries': ['days-without-entries'],
  'average-daily-income': ['average-daily-expense'],
  'most-expensive-day': [],
}

const GROUP_ANCHORS = new Set(Object.keys(GROUPED_BY_MODULE) as DashboardModuleId[])

const HIGH_PRIORITY_MODULES = new Set<DashboardModuleId>([
  'balance',
  'income',
  'expense',
  'calendar-heatmap',
  'daily-cashflow',
  'trend-income',
  'trend-expense',
  'trend-balance',
  'month-forecast',
  'spending-pace',
  'budget-risk',
  'recent-transactions',
])

const LOW_PRIORITY_MODULES = new Set<DashboardModuleId>([
  'largest-expense',
  'largest-income',
  'days-without-entries',
  'average-daily-income',
  'average-daily-expense',
  'most-expensive-day',
  'weekday-patterns',
  'trend-tags',
  'expense-stability',
  'money-leaks',
  'problem-categories',
])

export const getDashboardModulePriority = (
  moduleId: DashboardModuleId
): DashboardModulePriority => {
  if (HIGH_PRIORITY_MODULES.has(moduleId)) return 'high'
  if (LOW_PRIORITY_MODULES.has(moduleId)) return 'low'
  return 'medium'
}

export const getDashboardModuleKind = (moduleId: DashboardModuleId): DashboardModuleKind => {
  if (CHART_MODULES.has(moduleId)) return 'chart'
  if (LIST_MODULES.has(moduleId)) return 'list'
  return 'metric'
}

export const getDashboardModuleGridSpan = (
  containerType: DashboardContainerType,
  moduleId: DashboardModuleId,
  width: number,
  height: number
) => {
  if (moduleId === 'calendar-heatmap') {
    return width >= 4 && height >= 3 ? { columns: 1, rows: 1 } : { columns: 1, rows: 1 }
  }

  if (moduleId === 'daily-cashflow' && width >= 4) {
    return { columns: 1, rows: 1 }
  }

  if (moduleId === 'recent-transactions' && width >= 2) {
    return { columns: 1, rows: 1 }
  }

  return { columns: 1, rows: 1 }
}

export const getDashboardModuleLayout = (
  containerType: DashboardContainerType,
  moduleId: DashboardModuleId,
  width: number,
  height: number
) => {
  const kind = getDashboardModuleKind(moduleId)
  const isWide = width >= 4
  const isTall = height >= 3

  if (kind === 'chart') {
    return {
      kind,
      minWidth: isWide ? 220 : 180,
      minHeight: isTall ? 150 : 120,
      columnSpan: 1,
    }
  }

  if (kind === 'list') {
    return {
      kind,
      minWidth: isWide ? 220 : 180,
      minHeight: isTall ? 150 : 120,
      columnSpan: 1,
    }
  }

  return {
    kind,
    minWidth: 140,
    minHeight: 76,
    columnSpan: 1,
  }
}

export const getDashboardLayoutPreset = (
  width: number,
  height: number
): DashboardLayoutPreset => {
  if (width >= 4 && height >= 3) return 'full'
  if (width >= 4) return 'wide'
  if (height >= 3) return 'tall'
  if (width >= 2 && height >= 2) return 'standard'
  return 'compact'
}

export const getDashboardTileCapacity = (
  width: number,
  height: number,
  containerType: DashboardContainerType
) => {
  const preset = getDashboardLayoutPreset(width, height)
  const presetConfig = PRESET_CONFIG_BY_CONTAINER[containerType][preset]
  const columns = Math.max(1, Math.min(width >= 4 ? 2 : 1, presetConfig.columns))
  const compact = width <= 2
  const listLimit = Math.max(2, Math.min(height >= 3 ? 6 : 4, height + (width >= 4 ? 2 : 1)))
  const chartHeight = compact ? 130 : height >= 3 ? 190 : 160

  return {
    preset,
    columns,
    compact,
    minModuleWidth: presetConfig.minModuleWidth,
    listLimit,
    barLimit: Math.max(2, Math.min(4, listLimit)),
    chartHeight,
    gap: width >= 4 ? 14 : 12,
    maxModules: presetConfig.moduleLimit,
    allowScroll: false,
  }
}

const getOrderedGroupedModulesForWidget = (widget: DashboardWidgetLayoutItem) => {
  const orderedModules = getDashboardModulesForWidget(widget)
  const modules: DashboardModuleId[] = []
  let hasPlacedGeneralTrend = false

  for (const moduleId of orderedModules) {
    if (widget.containerType === 'trends-comparison' && isGeneralTrendModule(moduleId)) {
      if (hasPlacedGeneralTrend) continue
      hasPlacedGeneralTrend = true
    }

    modules.push(moduleId)
  }

  return groupDashboardModules(modules.length > 0 ? modules : orderedModules.slice(0, 1))
}

export const getDashboardWidgetAdaptiveSizeLimits = (widget: DashboardWidgetLayoutItem) => {
  const definition = getDashboardDefinition(widget.containerType)

  return {
    minWidth: definition.minWidth,
    maxWidth: definition.maxWidth,
    minHeight: definition.minHeight,
    maxHeight: definition.maxHeight,
  }
}

const compareModulesByPriority = (left: DashboardModuleId, right: DashboardModuleId) => {
  const rank: Record<DashboardModulePriority, number> = {
    high: 0,
    medium: 1,
    low: 2,
  }

  return rank[getDashboardModulePriority(left)] - rank[getDashboardModulePriority(right)]
}

const groupDashboardModules = (modules: DashboardModuleId[]) => {
  const consumed = new Set<DashboardModuleId>()
  const grouped: DashboardModuleId[] = []

  for (const moduleId of modules) {
    if (consumed.has(moduleId)) continue

    grouped.push(moduleId)

    if (GROUP_ANCHORS.has(moduleId)) {
      for (const groupedModuleId of GROUPED_BY_MODULE[moduleId] ?? []) {
        consumed.add(groupedModuleId)
      }
    }
  }

  return grouped
}

export const getVisibleModulesForTile = ({
  widget,
  mode,
  enabledModules,
  moduleOrder,
}: {
  widget: DashboardWidgetLayoutItem
  mode?: DashboardTileMode
  enabledModules?: DashboardModuleId[]
  moduleOrder?: DashboardModuleId[]
}) => {
  const sourceWidget = {
    ...widget,
    mode: mode ?? widget.mode,
    enabledModules: enabledModules ?? widget.enabledModules,
    moduleOrder: moduleOrder ?? widget.moduleOrder,
  }
  const capacity = getDashboardTileCapacity(widget.width, widget.height, widget.containerType)
  const groupedModules = getOrderedGroupedModulesForWidget(sourceWidget)
  const modulesByLayout =
    groupedModules.length > capacity.maxModules
      ? [...groupedModules]
          .sort(compareModulesByPriority)
          .slice(0, capacity.maxModules)
          .sort((left, right) => groupedModules.indexOf(left) - groupedModules.indexOf(right))
      : groupedModules

  return {
    ...capacity,
    modules: modulesByLayout,
  }
}
