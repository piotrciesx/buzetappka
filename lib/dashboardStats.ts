import { Category, Transaction } from './budgetPageTypes'

export type DashboardStats = {
  income: number
  expense: number
  balance: number
  transactionCount: number
  incomeCount: number
  expenseCount: number
  biggestExpense: number
  biggestIncome: number
  averageExpense: number
  averageIncome: number
  daylessCount: number
  expenseShareOfIncome: number
}

export type TopCategory = {
  categoryId: string
  name: string
  total: number
}

export type DashboardMonthlyTrendPoint = {
  month: string
  label: string
  income: number
  expense: number
  balance: number
}

export type DashboardTrendStats = {
  months: DashboardMonthlyTrendPoint[]
  current: DashboardMonthlyTrendPoint
  previous: DashboardMonthlyTrendPoint | null
  expenseChange: DashboardChange
  incomeChange: DashboardChange
  balanceChange: DashboardChange
}

export type DashboardChange = {
  amount: number
  percent: number | null
}

export type DashboardDailyCashflowPoint = {
  day: number
  label: string
  income: number
  expense: number
  net: number
  cumulative: number
}

export type DashboardDailyCashflowStats = {
  points: DashboardDailyCashflowPoint[]
  finalBalance: number
  minPoint: DashboardDailyCashflowPoint | null
  maxPoint: DashboardDailyCashflowPoint | null
  daylessCount: number
}

export type DashboardMonthOverMonthMetric = {
  key: 'income' | 'expense' | 'balance'
  label: string
  current: number
  previous: number
  change: DashboardChange
}

export type DashboardMonthOverMonthStats = {
  currentMonth: string
  previousMonth: string
  metrics: DashboardMonthOverMonthMetric[]
}

export type DashboardCategoryTrend = {
  categoryId: string
  name: string
  total: number
  months: Array<{
    month: string
    label: string
    total: number
  }>
  change: DashboardChange
}

export type DashboardBudgetRiskLevel = 'none' | 'low' | 'medium' | 'high'

export type DashboardSpendingPaceStatus = 'calm' | 'watch' | 'fast'

export type DashboardForecastStats = {
  incomeToDate: number
  expenseToDate: number
  currentBalance: number
  forecastExpense: number
  forecastBalance: number
  elapsedDays: number
  daysInMonth: number
  monthProgressPercent: number
  spendingProgressPercent: number
  spendingPaceStatus: DashboardSpendingPaceStatus
  spendingPaceDifference: number
  budgetRiskLevel: DashboardBudgetRiskLevel
  budgetRiskLabel: string
  budgetRiskDifference: number
  budgetRiskDescription: string
  savingsRate: number
  savingsRateDescription: string
  daylessCount: number
}

export type DashboardFixedVariableStats = {
  fixed: number
  variable: number
  other: number
  total: number
  hasConfiguredGroups: boolean
}

export type DashboardCategoryMovement = {
  categoryId: string
  name: string
  previous: number
  current: number
  difference: number
  percent: number | null
  isNew: boolean
}

export type DashboardExpenseStabilityStats = {
  status: 'stable' | 'medium' | 'spiky'
  label: string
  averageDailyExpense: number
  biggestDay: { day: number; total: number } | null
  dailyExpenses: number[]
}

export type DashboardWeekdayPattern = {
  dayIndex: number
  label: string
  total: number
}

export type DashboardMoneyLeak = {
  categoryId: string
  name: string
  total: number
  count: number
  average: number
}

export type DashboardCategoryPatternStats = {
  fixedVariable: DashboardFixedVariableStats
  fastestGrowing: DashboardCategoryMovement | null
  fastestFalling: DashboardCategoryMovement | null
  expenseStability: DashboardExpenseStabilityStats
  weekdayPatterns: DashboardWeekdayPattern[]
  moneyLeaks: DashboardMoneyLeak[]
}

const isTransactionInMonth = (transaction: Transaction, selectedMonth: string) => {
  return transaction.date.startsWith(selectedMonth)
}

const isDaylessTransaction = (transaction: Transaction) => {
  return Boolean((transaction as Transaction & { day_is_null?: boolean }).day_is_null)
}

const getMonthLabel = (month: string) => {
  const [, monthNumber] = month.split('-')
  return monthNumber || month
}

const shiftMonth = (month: string, offset: number) => {
  const [year, monthNumber] = month.split('-').map(Number)
  const date = new Date(year, monthNumber - 1 + offset, 1)

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

const getMonthRange = (selectedMonth: string, count: number) => {
  return Array.from({ length: count }, (_, index) => shiftMonth(selectedMonth, index - count + 1))
}

const getDaysInMonth = (month: string) => {
  const [year, monthNumber] = month.split('-').map(Number)
  if (!year || !monthNumber) return 31

  return new Date(year, monthNumber, 0).getDate()
}

const getElapsedDaysForForecast = (selectedMonth: string) => {
  const [year, monthNumber] = selectedMonth.split('-').map(Number)
  const daysInMonth = getDaysInMonth(selectedMonth)
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  if (!year || !monthNumber || selectedMonth !== currentMonth) {
    return daysInMonth
  }

  return Math.max(1, Math.min(daysInMonth, now.getDate()))
}

const getTransactionDay = (transaction: Transaction) => {
  if (isDaylessTransaction(transaction)) return null

  const day = Number(transaction.date.slice(8, 10))
  return Number.isFinite(day) && day > 0 ? day : null
}

const getWeekdayIndex = (date: string) => {
  const parsedDate = new Date(`${date}T00:00:00`)
  const day = parsedDate.getDay()

  return day === 0 ? 6 : day - 1
}

const getCategoryDescendantIds = (categoryId: string, categoriesById: Record<string, Category>) => {
  const result = new Set<string>([categoryId])
  let changed = true

  while (changed) {
    changed = false

    for (const category of Object.values(categoriesById)) {
      if (category.parent_id && result.has(category.parent_id) && !result.has(category.id)) {
        result.add(category.id)
        changed = true
      }
    }
  }

  return result
}

const createEmptyMonthPoint = (month: string): DashboardMonthlyTrendPoint => ({
  month,
  label: getMonthLabel(month),
  income: 0,
  expense: 0,
  balance: 0,
})

const getChange = (current: number, previous: number): DashboardChange => ({
  amount: current - previous,
  percent: previous !== 0 ? ((current - previous) / Math.abs(previous)) * 100 : null,
})

const getMonthlyTrendPoints = (
  transactions: Transaction[],
  categoriesById: Record<string, Category>,
  selectedMonth: string,
  getSignedAmountForTransaction: (t: Transaction) => number
) => {
  const months = getMonthRange(selectedMonth, 6)
  const monthSet = new Set(months)
  const pointsByMonth = Object.fromEntries(
    months.map((month) => [month, createEmptyMonthPoint(month)])
  ) as Record<string, DashboardMonthlyTrendPoint>

  for (const transaction of transactions) {
    const month = transaction.date.slice(0, 7)
    if (!monthSet.has(month) || !categoriesById[transaction.category_id]) continue

    const amount = getSignedAmountForTransaction(transaction)
    const point = pointsByMonth[month]

    if (amount > 0) {
      point.income += amount
    } else if (amount < 0) {
      point.expense += Math.abs(amount)
    }
  }

  return months.map((month) => {
    const point = pointsByMonth[month]
    return {
      ...point,
      balance: point.income - point.expense,
    }
  })
}

export function getDashboardStats(
  transactions: Transaction[],
  categoriesById: Record<string, Category>,
  selectedMonth: string,
  getSignedAmountForTransaction: (t: Transaction) => number
): DashboardStats {
  let income = 0
  let expense = 0
  let incomeCount = 0
  let expenseCount = 0
  let biggestExpense = 0
  let biggestIncome = 0
  let daylessCount = 0

  const filtered = transactions.filter((transaction) =>
    isTransactionInMonth(transaction, selectedMonth)
  )

  for (const transaction of filtered) {
    const categoryExists = Boolean(categoriesById[transaction.category_id])
    const amount = getSignedAmountForTransaction(transaction)

    if (!categoryExists) {
      continue
    }

    if (isDaylessTransaction(transaction)) {
      daylessCount += 1
    }

    if (amount > 0) {
      income += amount
      incomeCount += 1

      if (amount > biggestIncome) {
        biggestIncome = amount
      }
    }

    if (amount < 0) {
      const absoluteAmount = Math.abs(amount)

      expense += absoluteAmount
      expenseCount += 1

      if (absoluteAmount > biggestExpense) {
        biggestExpense = absoluteAmount
      }
    }
  }

  return {
    income,
    expense,
    balance: income - expense,
    transactionCount: filtered.length,
    incomeCount,
    expenseCount,
    biggestExpense,
    biggestIncome,
    averageExpense: expenseCount > 0 ? expense / expenseCount : 0,
    averageIncome: incomeCount > 0 ? income / incomeCount : 0,
    daylessCount,
    expenseShareOfIncome: income > 0 ? (expense / income) * 100 : 0,
  }
}

export function getTopExpenseCategories(
  transactions: Transaction[],
  categoriesById: Record<string, Category>,
  selectedMonth: string,
  getSignedAmountForTransaction: (t: Transaction) => number
): TopCategory[] {
  const map: Record<string, number> = {}

  const filtered = transactions.filter((transaction) =>
    isTransactionInMonth(transaction, selectedMonth)
  )

  for (const transaction of filtered) {
    const amount = getSignedAmountForTransaction(transaction)

    if (amount >= 0) {
      continue
    }

    const categoryId = transaction.category_id

    if (!categoriesById[categoryId]) {
      continue
    }

    if (!map[categoryId]) {
      map[categoryId] = 0
    }

    map[categoryId] += Math.abs(amount)
  }

  return Object.entries(map)
    .map(([categoryId, total]) => ({
      categoryId,
      name: categoriesById[categoryId]?.name || 'Nieznana',
      total,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
}

export function getLatestTransactions(
  transactions: Transaction[],
  selectedMonth: string,
  limit = 5
): Transaction[] {
  return transactions
    .filter((transaction) => isTransactionInMonth(transaction, selectedMonth))
    .sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date)
      if (dateCompare !== 0) return dateCompare

      return (b.created_at ?? '').localeCompare(a.created_at ?? '')
    })
    .slice(0, limit)
}

export function getDashboardTrendStats(
  transactions: Transaction[],
  categoriesById: Record<string, Category>,
  selectedMonth: string,
  getSignedAmountForTransaction: (t: Transaction) => number
): DashboardTrendStats {
  const months = getMonthlyTrendPoints(
    transactions,
    categoriesById,
    selectedMonth,
    getSignedAmountForTransaction
  )
  const current = months[months.length - 1] ?? createEmptyMonthPoint(selectedMonth)
  const previous = months[months.length - 2] ?? null

  return {
    months,
    current,
    previous,
    expenseChange: getChange(current.expense, previous?.expense ?? 0),
    incomeChange: getChange(current.income, previous?.income ?? 0),
    balanceChange: getChange(current.balance, previous?.balance ?? 0),
  }
}

export function getDashboardDailyCashflowStats(
  transactions: Transaction[],
  categoriesById: Record<string, Category>,
  selectedMonth: string,
  getSignedAmountForTransaction: (t: Transaction) => number
): DashboardDailyCashflowStats {
  const daysInMonth = getDaysInMonth(selectedMonth)
  const points = Array.from({ length: daysInMonth }, (_, index) => ({
    day: index + 1,
    label: String(index + 1),
    income: 0,
    expense: 0,
    net: 0,
    cumulative: 0,
  }))
  let daylessCount = 0

  for (const transaction of transactions) {
    if (!isTransactionInMonth(transaction, selectedMonth)) continue
    if (!categoriesById[transaction.category_id]) continue

    const day = getTransactionDay(transaction)
    if (!day) {
      daylessCount += 1
      continue
    }

    const point = points[day - 1]
    if (!point) continue

    const amount = getSignedAmountForTransaction(transaction)

    if (amount > 0) {
      point.income += amount
    } else if (amount < 0) {
      point.expense += Math.abs(amount)
    }

    point.net += amount
  }

  let cumulative = 0

  for (const point of points) {
    cumulative += point.net
    point.cumulative = cumulative
  }

  const minPoint = points.reduce<DashboardDailyCashflowPoint | null>((winner, point) => {
    if (!winner || point.cumulative < winner.cumulative) return point
    return winner
  }, null)
  const maxPoint = points.reduce<DashboardDailyCashflowPoint | null>((winner, point) => {
    if (!winner || point.cumulative > winner.cumulative) return point
    return winner
  }, null)

  return {
    points,
    finalBalance: points[points.length - 1]?.cumulative ?? 0,
    minPoint,
    maxPoint,
    daylessCount,
  }
}

export function getDashboardMonthOverMonthStats(
  transactions: Transaction[],
  categoriesById: Record<string, Category>,
  selectedMonth: string,
  getSignedAmountForTransaction: (t: Transaction) => number
): DashboardMonthOverMonthStats {
  const trend = getDashboardTrendStats(
    transactions,
    categoriesById,
    selectedMonth,
    getSignedAmountForTransaction
  )
  const current = trend.current
  const previous = trend.previous ?? createEmptyMonthPoint(shiftMonth(selectedMonth, -1))

  return {
    currentMonth: current.month,
    previousMonth: previous.month,
    metrics: [
      {
        key: 'income',
        label: 'Przychody',
        current: current.income,
        previous: previous.income,
        change: getChange(current.income, previous.income),
      },
      {
        key: 'expense',
        label: 'Wydatki',
        current: current.expense,
        previous: previous.expense,
        change: getChange(current.expense, previous.expense),
      },
      {
        key: 'balance',
        label: 'Bilans',
        current: current.balance,
        previous: previous.balance,
        change: getChange(current.balance, previous.balance),
      },
    ],
  }
}

export function getDashboardCategoryTrends(
  transactions: Transaction[],
  categoriesById: Record<string, Category>,
  selectedMonth: string,
  getSignedAmountForTransaction: (t: Transaction) => number
): DashboardCategoryTrend[] {
  const months = getMonthRange(selectedMonth, 6)
  const monthSet = new Set(months)
  const categoryMap: Record<string, DashboardCategoryTrend> = {}

  for (const transaction of transactions) {
    const month = transaction.date.slice(0, 7)
    const category = categoriesById[transaction.category_id]
    if (!monthSet.has(month) || !category) continue

    const amount = getSignedAmountForTransaction(transaction)
    if (amount >= 0) continue

    if (!categoryMap[category.id]) {
      categoryMap[category.id] = {
        categoryId: category.id,
        name: category.name,
        total: 0,
        months: months.map((item) => ({
          month: item,
          label: getMonthLabel(item),
          total: 0,
        })),
        change: { amount: 0, percent: null },
      }
    }

    const trend = categoryMap[category.id]
    const monthPoint = trend.months.find((item) => item.month === month)
    const absoluteAmount = Math.abs(amount)

    trend.total += absoluteAmount

    if (monthPoint) {
      monthPoint.total += absoluteAmount
    }
  }

  return Object.values(categoryMap)
    .map((category) => {
      const current = category.months[category.months.length - 1]?.total ?? 0
      const previous = category.months[category.months.length - 2]?.total ?? 0

      return {
        ...category,
        change: getChange(current, previous),
      }
    })
    .sort((left, right) => right.total - left.total)
}

export function getDashboardForecastStats(
  transactions: Transaction[],
  categoriesById: Record<string, Category>,
  selectedMonth: string,
  getSignedAmountForTransaction: (t: Transaction) => number
): DashboardForecastStats {
  const daysInMonth = getDaysInMonth(selectedMonth)
  const elapsedDays = getElapsedDaysForForecast(selectedMonth)
  let incomeToDate = 0
  let expenseToDate = 0
  let daylessCount = 0

  for (const transaction of transactions) {
    if (!isTransactionInMonth(transaction, selectedMonth)) continue
    if (!categoriesById[transaction.category_id]) continue

    const amount = getSignedAmountForTransaction(transaction)

    if (isDaylessTransaction(transaction)) {
      daylessCount += 1
    }

    if (amount > 0) {
      incomeToDate += amount
    } else if (amount < 0) {
      expenseToDate += Math.abs(amount)
    }
  }

  const safeElapsedDays = Math.max(1, Math.min(elapsedDays, daysInMonth))
  const forecastExpense = (expenseToDate / safeElapsedDays) * daysInMonth
  const currentBalance = incomeToDate - expenseToDate
  const forecastBalance = incomeToDate - forecastExpense
  const monthProgressPercent = (safeElapsedDays / daysInMonth) * 100
  const spendingProgressPercent =
    incomeToDate > 0
      ? (expenseToDate / incomeToDate) * 100
      : forecastExpense > 0
        ? (expenseToDate / forecastExpense) * 100
        : 0
  const spendingPaceDifference = spendingProgressPercent - monthProgressPercent
  const spendingPaceStatus: DashboardSpendingPaceStatus =
    spendingPaceDifference > 20 ? 'fast' : spendingPaceDifference > 6 ? 'watch' : 'calm'
  const budgetRiskLevel: DashboardBudgetRiskLevel =
    incomeToDate <= 0
      ? 'none'
      : forecastExpense > incomeToDate
        ? 'high'
        : forecastExpense > incomeToDate * 0.9
          ? 'medium'
          : 'low'
  const budgetRiskLabel =
    budgetRiskLevel === 'none'
      ? 'Brak danych o przychodach'
      : budgetRiskLevel === 'high'
        ? 'Wysokie'
        : budgetRiskLevel === 'medium'
          ? 'Średnie'
          : 'Niskie'
  const budgetRiskDifference = incomeToDate - forecastExpense
  const budgetRiskDescription =
    budgetRiskLevel === 'none'
      ? 'Dodaj przychody, żeby ocenić ryzyko przekroczenia.'
      : budgetRiskLevel === 'high'
        ? 'Prognozowane wydatki przekraczają przychody.'
        : budgetRiskLevel === 'medium'
          ? 'Prognozowane wydatki są blisko poziomu przychodów.'
          : 'Prognoza mieści się wyraźnie poniżej przychodów.'
  const savingsRate = incomeToDate > 0 ? (currentBalance / incomeToDate) * 100 : 0

  return {
    incomeToDate,
    expenseToDate,
    currentBalance,
    forecastExpense,
    forecastBalance,
    elapsedDays: safeElapsedDays,
    daysInMonth,
    monthProgressPercent,
    spendingProgressPercent,
    spendingPaceStatus,
    spendingPaceDifference,
    budgetRiskLevel,
    budgetRiskLabel,
    budgetRiskDifference,
    budgetRiskDescription,
    savingsRate,
    savingsRateDescription: incomeToDate > 0 ? 'Bilans względem przychodów' : 'Brak przychodów',
    daylessCount,
  }
}

export function getDashboardCategoryPatternStats(
  transactions: Transaction[],
  categoriesById: Record<string, Category>,
  selectedMonth: string,
  getSignedAmountForTransaction: (t: Transaction) => number
): DashboardCategoryPatternStats {
  const previousMonth = shiftMonth(selectedMonth, -1)
  const daysInMonth = getDaysInMonth(selectedMonth)
  const dailyExpenses = Array.from({ length: daysInMonth }, () => 0)
  const weekdayLabels = ['pon', 'wt', 'śr', 'czw', 'pt', 'sob', 'niedz.']
  const weekdayPatterns = weekdayLabels.map((label, dayIndex) => ({
    dayIndex,
    label,
    total: 0,
  }))
  const level2Categories = Object.values(categoriesById).filter((category) => category.level === 2)
  const fixedLevel2 = level2Categories.filter((category) => {
    const normalizedName = category.name.toLowerCase()
    return normalizedName.includes('stałe') || normalizedName.includes('stale')
  })
  const variableLevel2 = level2Categories.filter((category) =>
    category.name.toLowerCase().includes('zmienne')
  )
  const fixedIds = new Set<string>()
  const variableIds = new Set<string>()

  for (const category of fixedLevel2) {
    getCategoryDescendantIds(category.id, categoriesById).forEach((id) => fixedIds.add(id))
  }

  for (const category of variableLevel2) {
    getCategoryDescendantIds(category.id, categoriesById).forEach((id) => variableIds.add(id))
  }

  const currentCategoryTotals: Record<string, DashboardCategoryMovement> = {}
  const previousCategoryTotals: Record<string, number> = {}
  const leakMap: Record<string, DashboardMoneyLeak> = {}
  const fixedVariable: DashboardFixedVariableStats = {
    fixed: 0,
    variable: 0,
    other: 0,
    total: 0,
    hasConfiguredGroups: fixedIds.size > 0 || variableIds.size > 0,
  }

  for (const transaction of transactions) {
    const month = transaction.date.slice(0, 7)
    if (month !== selectedMonth && month !== previousMonth) continue

    const category = categoriesById[transaction.category_id]
    if (!category) continue

    const amount = getSignedAmountForTransaction(transaction)
    if (amount >= 0) continue

    const expense = Math.abs(amount)

    if (month === previousMonth) {
      previousCategoryTotals[category.id] = (previousCategoryTotals[category.id] ?? 0) + expense
      continue
    }

    if (!currentCategoryTotals[category.id]) {
      currentCategoryTotals[category.id] = {
        categoryId: category.id,
        name: category.name,
        previous: 0,
        current: 0,
        difference: 0,
        percent: null,
        isNew: false,
      }
    }

    currentCategoryTotals[category.id].current += expense
    fixedVariable.total += expense

    if (fixedIds.has(category.id)) {
      fixedVariable.fixed += expense
    } else if (variableIds.has(category.id)) {
      fixedVariable.variable += expense
    } else {
      fixedVariable.other += expense
    }

    const day = getTransactionDay(transaction)

    if (day && dailyExpenses[day - 1] !== undefined) {
      dailyExpenses[day - 1] += expense
      weekdayPatterns[getWeekdayIndex(transaction.date)].total += expense
    }

    if (!leakMap[category.id]) {
      leakMap[category.id] = {
        categoryId: category.id,
        name: category.name,
        total: 0,
        count: 0,
        average: 0,
      }
    }

    leakMap[category.id].total += expense
    leakMap[category.id].count += 1
  }

  const categoryIds = new Set([
    ...Object.keys(currentCategoryTotals),
    ...Object.keys(previousCategoryTotals),
  ])
  const movements = [...categoryIds].map((categoryId) => {
    const category = categoriesById[categoryId]
    const current = currentCategoryTotals[categoryId]?.current ?? 0
    const previous = previousCategoryTotals[categoryId] ?? 0
    const difference = current - previous

    return {
      categoryId,
      name: category?.name ?? 'Nieznana',
      previous,
      current,
      difference,
      percent: previous > 0 ? (difference / previous) * 100 : null,
      isNew: previous === 0 && current > 0,
    }
  })
  const fastestGrowing =
    movements
      .filter((movement) => movement.difference > 0)
      .sort((left, right) => right.difference - left.difference)[0] ?? null
  const fastestFalling =
    movements
      .filter((movement) => movement.difference < 0)
      .sort((left, right) => left.difference - right.difference)[0] ?? null
  const averageDailyExpense =
    dailyExpenses.reduce((sum, value) => sum + value, 0) / Math.max(1, dailyExpenses.length)
  const averageDeviation =
    dailyExpenses.reduce((sum, value) => sum + Math.abs(value - averageDailyExpense), 0) /
    Math.max(1, dailyExpenses.length)
  const variationRatio = averageDailyExpense > 0 ? averageDeviation / averageDailyExpense : 0
  const stabilityStatus =
    variationRatio > 1 ? 'spiky' : variationRatio > 0.55 ? 'medium' : 'stable'
  const biggestDayTotal = Math.max(...dailyExpenses, 0)
  const biggestDayIndex = dailyExpenses.findIndex((value) => value === biggestDayTotal)
  const totalExpense = fixedVariable.total
  const leakNoticeableThreshold = Math.max(50, totalExpense * 0.03)
  const leakSmallAverageThreshold = Math.max(40, totalExpense * 0.08)
  const moneyLeaks = Object.values(leakMap)
    .map((leak) => ({
      ...leak,
      average: leak.count > 0 ? leak.total / leak.count : 0,
    }))
    .filter(
      (leak) =>
        leak.count >= 3 &&
        leak.total >= leakNoticeableThreshold &&
        leak.average <= leakSmallAverageThreshold
    )
    .sort((left, right) => right.total - left.total)
    .slice(0, 3)

  return {
    fixedVariable,
    fastestGrowing,
    fastestFalling,
    expenseStability: {
      status: stabilityStatus,
      label:
        stabilityStatus === 'spiky'
          ? 'Skokowo'
          : stabilityStatus === 'medium'
            ? 'Średnio'
            : 'Stabilnie',
      averageDailyExpense,
      biggestDay:
        biggestDayIndex >= 0 && biggestDayTotal > 0
          ? {
              day: biggestDayIndex + 1,
              total: biggestDayTotal,
            }
          : null,
      dailyExpenses,
    },
    weekdayPatterns: weekdayPatterns.sort((left, right) => right.total - left.total),
    moneyLeaks,
  }
}
