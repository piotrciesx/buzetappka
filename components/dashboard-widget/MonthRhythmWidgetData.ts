import type { Category, Transaction } from '../../lib/budgetPageTypes'
import { getDaysInMonth, isDateBeforeBudgetStart, isFutureDate } from '../../lib/dateUtils'
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

const rgbToCss = ([r, g, b]: [number, number, number]) => `rgb(${r}, ${g}, ${b})`

const hslToRgb = (
  hue: number,
  saturationPercent: number,
  lightnessPercent: number
): [number, number, number] => {
  const saturation = clamp(saturationPercent, 0, 100) / 100
  const lightness = clamp(lightnessPercent, 0, 100) / 100
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
  const hueSection = (((hue % 360) + 360) % 360) / 60
  const secondComponent = chroma * (1 - Math.abs((hueSection % 2) - 1))
  const match = lightness - chroma / 2

  let redPrime = 0
  let greenPrime = 0
  let bluePrime = 0

  if (hueSection >= 0 && hueSection < 1) {
    redPrime = chroma
    greenPrime = secondComponent
  } else if (hueSection < 2) {
    redPrime = secondComponent
    greenPrime = chroma
  } else if (hueSection < 3) {
    greenPrime = chroma
    bluePrime = secondComponent
  } else if (hueSection < 4) {
    greenPrime = secondComponent
    bluePrime = chroma
  } else if (hueSection < 5) {
    redPrime = secondComponent
    bluePrime = chroma
  } else {
    redPrime = chroma
    bluePrime = secondComponent
  }

  return [
    Math.round((redPrime + match) * 255),
    Math.round((greenPrime + match) * 255),
    Math.round((bluePrime + match) * 255),
  ]
}

const getLuminance = ([r, g, b]: [number, number, number]) => {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

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
    const neutralRgb = hslToRgb(42, 92, 56)

    return {
      background: rgbToCss(neutralRgb),
      textColor: '#111827',
      borderColor: rgbToCss(hslToRgb(34, 92, 36)),
    }
  }

  const isPositive = value > 0
  const intensity = getHeatmapIntensity(
    Math.abs(value),
    isPositive ? positiveReference : negativeReference
  )
  const hue = isPositive ? 145 : 8
  const saturation = 88 + intensity * 8
  const lightness = 62 - intensity * 24
  const borderLightness = Math.max(lightness - 18, 20)
  const backgroundRgb = hslToRgb(hue, saturation, lightness)
  const borderRgb = hslToRgb(hue, Math.min(100, saturation + 4), borderLightness)
  const luminance = getLuminance(backgroundRgb)

  return {
    background: rgbToCss(backgroundRgb),
    textColor: luminance < 162 ? '#ffffff' : '#111827',
    borderColor: rgbToCss(borderRgb),
  }
}

const getDayFromDate = (date: string) => {
  const day = Number(date.slice(8, 10))
  return Number.isFinite(day) && day > 0 ? day : 1
}

const isTransactionInMonth = (transaction: Transaction, month: string) => {
  return transaction.date?.startsWith(month)
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

    const day = days[getDayFromDate(transaction.date) - 1]
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
