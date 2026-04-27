import { DashboardWidgetDefinition } from './dashboardTypes'

export const DASHBOARD_GRID_COLUMNS = 4
export const DASHBOARD_GRID_MAX_ROWS = 12

export const DASHBOARD_WIDGET_DEFINITIONS: DashboardWidgetDefinition[] = [
  {
    type: 'monthly-balance',
    title: 'Bilans miesiąca',
    description: 'Finanse miesiąca: bilans, przychody i wydatki.',
    defaultSize: { width: 1, height: 1 },
  },
  {
    type: 'calendar-heatmap',
    title: 'Kalendarz',
    description: 'Heatmapa dziennego bilansu w wybranym miesiącu.',
    defaultSize: { width: 2, height: 2 },
  },
  {
    type: 'top-categories',
    title: 'Kategorie',
    description: 'Największe kategorie wydatków w miesiącu.',
    defaultSize: { width: 2, height: 2 },
  },
  {
    type: 'recent-transactions',
    title: 'Ostatnie transakcje',
    description: 'Najnowsze transakcje posortowane po dacie wpisu.',
    defaultSize: { width: 2, height: 2 },
  },
  {
    type: 'monthly-overview',
    title: 'Przegląd miesiąca',
    description: 'Podsumowanie aktywności i najważniejszych sygnałów miesiąca.',
    defaultSize: { width: 2, height: 2 },
  },
  {
    type: 'expense-trend',
    title: 'Trend wydatków',
    description: 'Wydatki z ostatnich 6 miesięcy.',
    defaultSize: { width: 2, height: 2 },
  },
  {
    type: 'income-trend',
    title: 'Trend przychodów',
    description: 'Przychody z ostatnich 6 miesięcy.',
    defaultSize: { width: 2, height: 2 },
  },
  {
    type: 'balance-trend',
    title: 'Trend bilansu',
    description: 'Bilans miesięczny z ostatnich 6 miesięcy.',
    defaultSize: { width: 2, height: 2 },
  },
  {
    type: 'cashflow-daily',
    title: 'Cashflow dzienny',
    description: 'Narastający bilans dzień po dniu.',
    defaultSize: { width: 2, height: 2 },
  },
  {
    type: 'month-over-month',
    title: 'Miesiąc do miesiąca',
    description: 'Porównanie aktualnego i poprzedniego miesiąca.',
    defaultSize: { width: 2, height: 2 },
  },
  {
    type: 'category-trends',
    title: 'Trendy kategorii',
    description: 'Trend miesięczny wybranych kategorii wydatkowych.',
    defaultSize: { width: 3, height: 2 },
  },
  {
    type: 'month-forecast',
    title: 'Prognoza miesiąca',
    description: 'Prognoza wydatków i bilansu na koniec miesiąca.',
    defaultSize: { width: 2, height: 2 },
  },
  {
    type: 'spending-pace',
    title: 'Tempo wydatków',
    description: 'Porównanie tempa wydatków z upływem miesiąca.',
    defaultSize: { width: 2, height: 2 },
  },
  {
    type: 'budget-risk',
    title: 'Ryzyko przekroczenia',
    description: 'Robocze ryzyko, że wydatki przekroczą przychody.',
    defaultSize: { width: 2, height: 2 },
  },
  {
    type: 'savings-rate',
    title: 'Efektywność finansowa',
    description: 'Procent oszczędności względem przychodów.',
    defaultSize: { width: 2, height: 2 },
  },
  {
    type: 'fixed-vs-variable',
    title: 'Stałe vs zmienne',
    description: 'Podział wydatków na stałe, zmienne i pozostałe.',
    defaultSize: { width: 2, height: 2 },
  },
  {
    type: 'fastest-growing-category',
    title: 'Najbardziej rosnąca',
    description: 'Kategoria z największym wzrostem wydatków m/m.',
    defaultSize: { width: 2, height: 2 },
  },
  {
    type: 'fastest-falling-category',
    title: 'Najbardziej spadająca',
    description: 'Kategoria z największym spadkiem wydatków m/m.',
    defaultSize: { width: 2, height: 2 },
  },
  {
    type: 'expense-stability',
    title: 'Stabilność wydatków',
    description: 'Ocena, czy wydatki dzienne są równe czy skokowe.',
    defaultSize: { width: 2, height: 2 },
  },
  {
    type: 'weekday-patterns',
    title: 'Wzorce dni tygodnia',
    description: 'Dni tygodnia z największymi wydatkami.',
    defaultSize: { width: 2, height: 2 },
  },
  {
    type: 'money-leaks',
    title: 'Wycieki pieniędzy',
    description: 'Kategorie z wieloma małymi wydatkami.',
    defaultSize: { width: 2, height: 2 },
  },
]

export const DASHBOARD_WIDGET_DEFINITION_BY_TYPE = Object.fromEntries(
  DASHBOARD_WIDGET_DEFINITIONS.map((definition) => [definition.type, definition])
) as Record<DashboardWidgetDefinition['type'], DashboardWidgetDefinition>
