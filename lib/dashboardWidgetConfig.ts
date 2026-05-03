import {
  DashboardContainerType,
  DashboardModuleId,
  DashboardWidgetDefinition,
  DashboardWidgetLayoutItem,
  DashboardWidgetSize,
} from './dashboardTypes'

export const DASHBOARD_GRID_COLUMNS = 4
export const DASHBOARD_GRID_MAX_ROWS = 12

export const SMALL_WIDGET_SIZE = { width: 2, height: 3 }
export const LARGE_WIDGET_SIZE = { width: 4, height: 3 }

export const DASHBOARD_FIXED_WIDGET_SIZE = LARGE_WIDGET_SIZE

const makeAllowedSizes = (): DashboardWidgetSize[] => [SMALL_WIDGET_SIZE, LARGE_WIDGET_SIZE]

const getAllowedSizesForDefinition = (
  definition: DashboardWidgetDefinition
): DashboardWidgetSize[] => {
  return definition.allowedSizes && definition.allowedSizes.length > 0
    ? definition.allowedSizes
    : [definition.defaultSize]
}

const isSameDashboardWidgetSize = (left: DashboardWidgetSize, right: DashboardWidgetSize) =>
  Math.round(left.width) === Math.round(right.width) &&
  Math.round(left.height) === Math.round(right.height)

const createWidgetDefinition = (
  definition: Omit<
    DashboardWidgetDefinition,
    'allowedSizes' | 'minWidth' | 'maxWidth' | 'minHeight' | 'maxHeight'
  >
): DashboardWidgetDefinition => {
  return {
    ...definition,
    allowedSizes: makeAllowedSizes(),
    minWidth: SMALL_WIDGET_SIZE.width,
    maxWidth: LARGE_WIDGET_SIZE.width,
    minHeight: SMALL_WIDGET_SIZE.height,
    maxHeight: LARGE_WIDGET_SIZE.height,
  }
}

export const isDashboardWidgetSizeAllowed = (
  definition: DashboardWidgetDefinition,
  size: DashboardWidgetSize
) =>
  getAllowedSizesForDefinition(definition).some((allowedSize) =>
    isSameDashboardWidgetSize(allowedSize, size)
  )

export const getWidgetLayoutVariant = (
  size: DashboardWidgetSize
): 'compact' | 'medium' | 'wide' | 'tall' | 'large' => {
  if (size.width >= 4) {
    return 'large'
  }

  return 'medium'
}

export const DASHBOARD_MODULE_LABELS: Record<DashboardModuleId, string> = {
  balance: 'Bilans',
  income: 'Przychody',
  expense: 'Wydatki',
  'transaction-count': 'Liczba wpisów',
  'largest-expense': 'Największy wydatek',
  'largest-income': 'Największy przychód',
  'expense-share': 'Udział wydatków',
  'financial-efficiency': 'Efektywność finansowa',
  'calendar-heatmap': 'Kalendarz',
  'daily-cashflow': 'Cashflow dzienny',
  'days-with-entries': 'Dni z wpisami',
  'days-without-entries': 'Dni bez wpisów',
  'average-daily-income': 'Średni przychód dzienny',
  'average-daily-expense': 'Średni wydatek dzienny',
  'most-expensive-day': 'Najdroższy dzień',
  'weekday-patterns': 'Wzorce dni tygodnia',
  'trend-income': 'Przychody',
  'trend-expense': 'Wydatki',
  'trend-balance': 'Bilans',
  'trend-level1': 'Kategorie główne',
  'trend-level2': 'Kategorie główne',
  'trend-level3': 'Podkategorie szczegółowe',
  'trend-payment': 'Formy płatności',
  'trend-tags': 'Tagi',
  'month-forecast': 'Prognoza miesiąca',
  'spending-pace': 'Tempo wydatków',
  'budget-risk': 'Ryzyko przekroczenia',
  'fixed-vs-variable': 'Stałe vs zmienne',
  'expense-stability': 'Stabilność wydatków',
  'money-leaks': 'Wycieki pieniędzy',
  'recent-transactions': 'Ostatnie zdarzenia',
  'recent-incomes': 'Ostatnie przychody',
  'recent-expenses': 'Ostatnie wydatki',
  'top-categories': 'Top kategorie wydatków',
  'top-income-categories': 'Top kategorie przychodów',
  'top-expenses': 'Największe wydatki',
  'top-incomes': 'Największe przychody',
  'problem-categories': 'Kategorie problematyczne',
}

export const DASHBOARD_WIDGET_DEFINITIONS: DashboardWidgetDefinition[] = [
  createWidgetDefinition({
    type: 'month-finance',
    title: 'Finanse miesiąca',
    description: 'Bilans, przychody, wydatki i donut miesiąca.',
    defaultSize: SMALL_WIDGET_SIZE,
    defaultModules: ['balance'],
    moduleOrder: ['balance'],
  }),
  createWidgetDefinition({
    type: 'month-rhythm',
    title: 'Rytm miesiąca',
    description: 'Mini kalendarz, cashflow i stabilność miesiąca.',
    defaultSize: LARGE_WIDGET_SIZE,
    defaultModules: ['calendar-heatmap', 'daily-cashflow'],
    moduleOrder: ['calendar-heatmap', 'daily-cashflow'],
  }),
  createWidgetDefinition({
    type: 'day-activity',
    title: 'Aktywność dni',
    description: 'Dni z wpisami, dni bez wpisów i procent aktywności.',
    defaultSize: SMALL_WIDGET_SIZE,
    defaultModules: ['days-with-entries'],
    moduleOrder: ['days-with-entries', 'days-without-entries'],
  }),
  createWidgetDefinition({
    type: 'daily-averages',
    title: 'Średnie dzienne',
    description: 'Średni przychód, wydatek i różnica dzienna.',
    defaultSize: SMALL_WIDGET_SIZE,
    defaultModules: ['average-daily-income'],
    moduleOrder: ['average-daily-income', 'average-daily-expense'],
  }),
  createWidgetDefinition({
    type: 'weekly-trend',
    title: 'Trend tygodni',
    description: 'Porównanie tygodni: przychody, wydatki, bilans i liczba wpisów.',
    defaultSize: SMALL_WIDGET_SIZE,
    defaultModules: ['trend-income', 'trend-expense', 'trend-balance'],
    moduleOrder: ['trend-income', 'trend-expense', 'trend-balance'],
  }),
  createWidgetDefinition({
    type: 'day-extremes',
    title: 'Dni z największym ruchem',
    description: 'Największy wydatek i przychód dnia.',
    defaultSize: SMALL_WIDGET_SIZE,
    defaultModules: ['most-expensive-day'],
    moduleOrder: ['most-expensive-day'],
  }),
  createWidgetDefinition({
    type: 'income-expense-trend',
    title: 'Trend przychodów i wydatków',
    description: 'Wykres przychodów, wydatków i bilansu.',
    defaultSize: LARGE_WIDGET_SIZE,
    defaultModules: ['trend-income', 'trend-expense', 'trend-balance'],
    moduleOrder: ['trend-income', 'trend-expense', 'trend-balance'],
  }),
  createWidgetDefinition({
    type: 'expense-category-trend',
    title: 'Trend wydatków',
    description: 'Kategorie i podkategorie wydatkowe.',
    defaultSize: LARGE_WIDGET_SIZE,
    defaultModules: ['trend-level2'],
    moduleOrder: ['trend-level2', 'trend-level3'],
  }),
  createWidgetDefinition({
    type: 'income-category-trend',
    title: 'Trend przychodów',
    description: 'Kategorie i podkategorie przychodowe.',
    defaultSize: LARGE_WIDGET_SIZE,
    defaultModules: ['trend-level2'],
    moduleOrder: ['trend-level2', 'trend-level3'],
  }),
  createWidgetDefinition({
    type: 'recent-events',
    title: 'Ostatnie zdarzenia',
    description: 'Najnowsze wpisy z datą, kategorią i kwotą.',
    defaultSize: SMALL_WIDGET_SIZE,
    defaultModules: ['recent-transactions'],
    moduleOrder: ['recent-transactions'],
  }),
  createWidgetDefinition({
    type: 'recent-income-expense',
    title: 'Ostatnie przychody i wydatki',
    description: 'Dwie listy ostatnich wpływów i wydatków.',
    defaultSize: LARGE_WIDGET_SIZE,
    defaultModules: ['recent-incomes', 'recent-expenses'],
    moduleOrder: ['recent-incomes', 'recent-expenses'],
  }),
  createWidgetDefinition({
    type: 'category-rankings',
    title: 'Rankingi kategorii',
    description: 'Top kategorie wydatków i przychodów.',
    defaultSize: SMALL_WIDGET_SIZE,
    defaultModules: ['top-categories', 'top-income-categories'],
    moduleOrder: ['top-categories', 'top-income-categories'],
  }),
  createWidgetDefinition({
    type: 'top-items',
    title: 'Największe pozycje',
    description: 'Największe wydatki i przychody.',
    defaultSize: SMALL_WIDGET_SIZE,
    defaultModules: ['top-expenses', 'top-incomes'],
    moduleOrder: ['top-expenses', 'top-incomes'],
  }),
  createWidgetDefinition({
    type: 'budget-control',
    title: 'Kontrola budżetu',
    description: 'Prognoza, tempo i ryzyko przekroczenia.',
    defaultSize: SMALL_WIDGET_SIZE,
    defaultModules: ['month-forecast', 'spending-pace', 'budget-risk'],
    moduleOrder: ['month-forecast', 'spending-pace', 'budget-risk'],
  }),
  createWidgetDefinition({
    type: 'expense-structure',
    title: 'Struktura finansów',
    description: 'Przychody i wydatki w osobnych sekcjach.',
    defaultSize: SMALL_WIDGET_SIZE,
    defaultModules: ['fixed-vs-variable'],
    moduleOrder: ['fixed-vs-variable'],
  }),
  createWidgetDefinition({
    type: 'stability-leaks',
    title: 'Stabilność i wycieki',
    description: 'Stabilność wydatków i wycieki pieniędzy.',
    defaultSize: SMALL_WIDGET_SIZE,
    defaultModules: ['expense-stability', 'money-leaks', 'problem-categories'],
    moduleOrder: ['expense-stability', 'money-leaks', 'problem-categories'],
  }),
]

export const DASHBOARD_WIDGET_DEFINITION_BY_TYPE = Object.fromEntries(
  DASHBOARD_WIDGET_DEFINITIONS.map((definition) => [definition.type, definition])
) as Record<DashboardContainerType, DashboardWidgetDefinition>

const LEGACY_TYPE_MAP: Record<string, DashboardContainerType> = {
  'monthly-balance': 'month-finance',
  'income-total': 'month-finance',
  'expense-total': 'month-finance',
  'transaction-count': 'day-activity',
  'largest-expense': 'top-items',
  'largest-income': 'top-items',
  'calendar-heatmap': 'month-rhythm',
  'cashflow-daily': 'month-rhythm',
  'monthly-overview': 'month-rhythm',
  'weekday-patterns': 'stability-leaks',
  'expense-trend': 'income-expense-trend',
  'income-trend': 'income-expense-trend',
  'balance-trend': 'income-expense-trend',
  'weekly-trend': 'weekly-trend',
  'category-trend': 'expense-category-trend',
  'category-trends': 'expense-category-trend',
  'month-over-month': 'income-expense-trend',
  'month-forecast': 'budget-control',
  'spending-pace': 'budget-control',
  'budget-risk': 'budget-control',
  'savings-rate': 'budget-control',
  'fixed-vs-variable': 'expense-structure',
  'expense-stability': 'stability-leaks',
  'money-leaks': 'stability-leaks',
  'recent-transactions': 'recent-events',
  'top-categories': 'category-rankings',
  'month-rhythm': 'month-rhythm',
  'trends-comparison': 'income-expense-trend',
  'lists-rankings': 'recent-events',
}

export const getDashboardDefinition = (containerType: DashboardContainerType) =>
  DASHBOARD_WIDGET_DEFINITION_BY_TYPE[containerType] ?? DASHBOARD_WIDGET_DEFINITIONS[0]

export const getNearestAllowedDashboardWidgetSize = (
  definition: DashboardWidgetDefinition,
  size: DashboardWidgetSize,
  limits?: Partial<{
    minWidth: number
    maxWidth: number
    minHeight: number
    maxHeight: number
  }>
): DashboardWidgetSize => {
  const allowedSizes = getAllowedSizesForDefinition(definition)
  const normalizedWidth = Math.round(size.width)
  const normalizedHeight = Math.round(size.height)

  const minWidth = limits?.minWidth ?? definition.minWidth
  const maxWidth = limits?.maxWidth ?? definition.maxWidth
  const minHeight = limits?.minHeight ?? definition.minHeight
  const maxHeight = limits?.maxHeight ?? definition.maxHeight

  const allowedWithinLimits = allowedSizes.filter(
    (allowedSize) =>
      allowedSize.width >= minWidth &&
      allowedSize.width <= maxWidth &&
      allowedSize.height >= minHeight &&
      allowedSize.height <= maxHeight
  )

  const candidates = allowedWithinLimits.length > 0 ? allowedWithinLimits : allowedSizes

  return candidates.reduce((bestSize, candidateSize) => {
    const bestDistance =
      Math.abs(bestSize.width - normalizedWidth) + Math.abs(bestSize.height - normalizedHeight)
    const candidateDistance =
      Math.abs(candidateSize.width - normalizedWidth) +
      Math.abs(candidateSize.height - normalizedHeight)

    return candidateDistance < bestDistance ? candidateSize : bestSize
  }, candidates[0])
}

export const ensureDashboardWidgetAllowedSize = (
  definition: DashboardWidgetDefinition,
  size: DashboardWidgetSize,
  limits?: Partial<{
    minWidth: number
    maxWidth: number
    minHeight: number
    maxHeight: number
  }>
) => {
  if (isDashboardWidgetSizeAllowed(definition, size)) {
    return {
      width: Math.round(size.width),
      height: Math.round(size.height),
    }
  }

  return getNearestAllowedDashboardWidgetSize(definition, size, limits)
}

export const resolveDashboardContainerType = (value: unknown): DashboardContainerType => {
  if (typeof value === 'string' && value in DASHBOARD_WIDGET_DEFINITION_BY_TYPE) {
    return value as DashboardContainerType
  }

  if (typeof value === 'string' && LEGACY_TYPE_MAP[value]) {
    return LEGACY_TYPE_MAP[value]
  }

  return 'month-finance'
}

export const clampDashboardWidgetToDefinition = (
  widget: DashboardWidgetLayoutItem
): DashboardWidgetLayoutItem => {
  const definition = getDashboardDefinition(widget.containerType)
  const { width, height } = ensureDashboardWidgetAllowedSize(definition, widget)

  return {
    ...widget,
    type: definition.type,
    containerType: definition.type,
    width,
    height,
    minWidth: definition.minWidth,
    maxWidth: definition.maxWidth,
    minHeight: definition.minHeight,
    maxHeight: definition.maxHeight,
    enabledModules: widget.enabledModules.length > 0 ? widget.enabledModules : definition.defaultModules,
    moduleOrder: widget.moduleOrder.length > 0 ? widget.moduleOrder : definition.moduleOrder,
  }
}

export const getDashboardModulesForWidget = (widget: DashboardWidgetLayoutItem) => {
  const definition = getDashboardDefinition(widget.containerType)
  const configuredOrder = widget.moduleOrder.filter((moduleId) =>
    definition.moduleOrder.includes(moduleId)
  )
  const configuredEnabled = widget.enabledModules.filter((moduleId) =>
    definition.moduleOrder.includes(moduleId)
  )

  const sourceModules =
    widget.mode === 'custom' && configuredEnabled.length > 0
      ? configuredEnabled
      : definition.defaultModules
  const sourceOrder = configuredOrder.length > 0 ? configuredOrder : definition.moduleOrder
  const orderedModules = [
    ...sourceOrder.filter((moduleId) => sourceModules.includes(moduleId)),
    ...sourceModules.filter((moduleId) => !sourceOrder.includes(moduleId)),
  ]

  return orderedModules.length > 0 ? orderedModules : definition.defaultModules
}

export const createDashboardWidgetConfig = (
  id: string,
  containerType: DashboardContainerType
): DashboardWidgetLayoutItem => {
  const definition = getDashboardDefinition(containerType)

  return {
    id,
    type: definition.type,
    containerType: definition.type,
    mode: 'auto',
    enabledModules: definition.defaultModules,
    moduleOrder: definition.moduleOrder,
    x: 0,
    y: 0,
    width: definition.defaultSize.width,
    height: definition.defaultSize.height,
    minWidth: definition.minWidth,
    maxWidth: definition.maxWidth,
    minHeight: definition.minHeight,
    maxHeight: definition.maxHeight,
  }
}