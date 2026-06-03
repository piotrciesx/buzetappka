import type { Category, Transaction } from '../../lib/budgetPageTypes'
import { getDaysInMonth, isDateBeforeBudgetStart, isFutureDate } from '../../lib/dateUtils'
import { getTransactionDay, getTransactionMonth } from '../../lib/transactionDomain'
import { BLUE, GREEN, RED } from './dashboardWidgetTileStyles'

export type DayPoint = {
  day: number
  date: string
  income: number
  expense: number
  net: number
  cumulative: number
  count: number
  isFuture: boolean
  isBeforeBudgetStart: boolean
}

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const getSortedNumbers = (values: number[]) => [...values].sort((left, right) => left - right)

const getQuantile = (sortedValues: number[], quantile: number) => {
  if (sortedValues.length === 0) return 0
  if (sortedValues.length === 1) return sortedValues[0]

  const clampedQuantile = clamp(quantile, 0, 1)
  const index = (sortedValues.length - 1) * clampedQuantile
  const lowerIndex = Math.floor(index)
  const upperIndex = Math.ceil(index)

  if (lowerIndex === upperIndex) return sortedValues[lowerIndex]

  const interpolationFactor = index - lowerIndex

  return (
    sortedValues[lowerIndex] +
    (sortedValues[upperIndex] - sortedValues[lowerIndex]) * interpolationFactor
  )
}

export const getReferenceValue = (values: number[]) => {
  if (values.length === 0) return 0

  const sortedValues = getSortedNumbers(values)
  const p60 = getQuantile(sortedValues, 0.6)
  const p85 = getQuantile(sortedValues, 0.85)
  const maxValue = sortedValues[sortedValues.length - 1]

  return Math.max(p85, p60 * 1.35, maxValue * 0.18, 1)
}

const getHeatmapIntensity = (absoluteValue: number, referenceValue: number) => {
  if (absoluteValue <= 0 || referenceValue <= 0) return 0

  const ratio = absoluteValue / referenceValue
  const compressed = Math.log1p(ratio * 6.5) / Math.log1p(7.5)
  const softened = Math.pow(clamp(compressed, 0, 1), 0.82)

  return clamp(softened, 0, 1)
}

export const getBalanceHeatmapVisual = (
  value: number,
  negativeReference: number,
  positiveReference: number
) => {
  if (value === 0) {
    return {
      background: 'var(--ui-heatmap-low)',
      textColor: 'var(--ui-text-primary)',
      borderColor: 'var(--ui-heatmap-border)',
    }
  }

  const isPositive = value > 0
  const intensity = getHeatmapIntensity(
    Math.abs(value),
    isPositive ? positiveReference : negativeReference
  )
  const isStrong = intensity >= 0.62
  const isMedium = intensity >= 0.34
  const background = isPositive
    ? isStrong
      ? 'var(--ui-chart-positive)'
      : 'var(--ui-chart-positive-soft)'
    : isStrong
      ? 'var(--ui-chart-negative)'
      : 'var(--ui-chart-negative-soft)'

  return {
    background,
    textColor: isStrong ? 'var(--ui-heatmap-text-inverse)' : 'var(--ui-heatmap-text)',
    borderColor: isMedium
      ? isPositive
        ? 'var(--ui-chart-positive)'
        : 'var(--ui-chart-negative)'
      : 'var(--ui-heatmap-border)',
  }
}

const isTransactionInMonth = (transaction: Transaction, month: string) => {
  return getTransactionMonth(transaction) === month
}

export const getColorForRhythm = (value: number) => {
  if (value > 0) return GREEN
  if (value < 0) return RED
  return BLUE
}

export const buildMonthRhythmDays = ({
  transactions,
  selectedMonth,
  budgetStartDate,
  categoriesById,
  getSignedAmountForTransaction,
}: {
  transactions: Transaction[]
  selectedMonth: string
  budgetStartDate: string
  categoriesById: Record<string, Category>
  getSignedAmountForTransaction: (transaction: Transaction) => number
}) => {
  const daysInMonth = getDaysInMonth(selectedMonth)
  const days: DayPoint[] = Array.from({ length: daysInMonth }, (_, index) => {
    const date = `${selectedMonth}-${String(index + 1).padStart(2, '0')}`

    return {
      day: index + 1,
      date,
      income: 0,
      expense: 0,
      net: 0,
      cumulative: 0,
      count: 0,
      isFuture: isFutureDate(date),
      isBeforeBudgetStart: isDateBeforeBudgetStart(date, budgetStartDate),
    }
  })

  for (const transaction of transactions) {
    if (!isTransactionInMonth(transaction, selectedMonth)) continue
    if (isDateBeforeBudgetStart(transaction.date, budgetStartDate)) continue
    if (isFutureDate(transaction.date)) continue
    if (!categoriesById[transaction.category_id]) continue

    const transactionDay = getTransactionDay(transaction)
    if (transactionDay === null) continue

    const day = days[transactionDay - 1]
    if (!day) continue

    const amount = getSignedAmountForTransaction(transaction)
    day.count += 1
    if (amount > 0) day.income += amount
    if (amount < 0) day.expense += Math.abs(amount)
    day.net += amount
  }

  let cumulative = 0

  return days.map((day) => {
    cumulative += day.net
    return { ...day, cumulative }
  })
}
