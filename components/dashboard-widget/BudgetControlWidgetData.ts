import type { Transaction } from '../../lib/budgetPageTypes'
import { BLUE, GREEN, RED } from './dashboardWidgetTileStyles'
import { formatPercent } from './dashboardWidgetTileUtils'

const WARNING = '#ca8a04'

export type BudgetStatus = {
  label: string
  description: string
  color: string
  tone: string
}

export type BudgetMetrics = {
  income: number
  expense: number
  balance: number
  expenseToIncomePercent: number
  timePercent: number
  paceDifference: number
  status: BudgetStatus
}
 
function getDayFromDate(date: string) {
  const day = Number(date.slice(8, 10))

  return Number.isFinite(day) ? day : 0
}

function getDaysInCalendarMonth(month: string) {
  const year = Number(month.slice(0, 4))
  const monthIndex = Number(month.slice(5, 7))

  if (!Number.isFinite(year) || !Number.isFinite(monthIndex)) {
    return 0
  }

  return new Date(year, monthIndex, 0).getDate()
}

function getCurrentMonthText() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')

  return `${year}-${month}`
}

export function formatSignedPercent(value: number) {
  if (value > 0) {
    return `+${formatPercent(value)}`
  }

  return formatPercent(value)
}

function getStatus({
  income,
  expense,
  expenseToIncomePercent,
  paceDifference,
}: {
  income: number
  expense: number
  expenseToIncomePercent: number
  paceDifference: number
}): BudgetStatus {
  if (income <= 0 && expense > 0) {
    return {
      label: 'Brak planu',
      description: 'Są wydatki, ale nie ma przychodów do porównania.',
      color: WARNING,
      tone: 'do uzupełnienia',
    }
  }

  if (income > 0 && expense > income) {
    return {
      label: 'Przekroczenie',
      description: 'Wydatki są już wyższe niż przychody w tym miesiącu.',
      color: RED,
      tone: 'pilne',
    }
  }

  if (expenseToIncomePercent >= 90 || paceDifference > 18) {
    return {
      label: 'Ryzyko',
      description: 'Wydatki idą szybciej niż tempo miesiąca.',
      color: WARNING,
      tone: 'uważaj',
    }
  }

  if (paceDifference > 8) {
    return {
      label: 'Pod kontrolą',
      description: 'Tempo wydatków jest lekko podwyższone.',
      color: BLUE,
      tone: 'obserwuj',
    }
  }

  return {
    label: 'Spokojnie',
    description: 'Wydatki są zgodne z tempem miesiąca albo wolniejsze.',
    color: GREEN,
    tone: 'bezpiecznie',
  }
}

export function getPaceNote(metrics: BudgetMetrics) {
  if (metrics.income <= 0 && metrics.expense > 0) {
    return 'Brakuje przychodów do porównania z wydatkami.'
  }

  if (metrics.balance < 0) {
    return 'Wydatki przekroczyły przychody.'
  }

  if (metrics.paceDifference > 0) {
    return 'Wydatki idą szybciej niż upływ miesiąca.'
  }

  return 'Wydatki są wolniejsze niż upływ miesiąca.'
}

export function getComparisonNote(metrics: BudgetMetrics) {
  if (metrics.income <= 0 && metrics.expense > 0) {
    return 'Dodaj przychody, żeby porównanie było pełne.'
  }

  if (metrics.balance < 0) {
    return 'Budżet wymaga reakcji.'
  }

  if (metrics.paceDifference > 8) {
    return 'Budżet warto obserwować.'
  }

  return 'Budżet jest pod kontrolą.'
}

export function buildMetrics({
  transactions,
  selectedMonth,
  existingDays,
  getSignedAmountForTransaction,
}: {
  transactions: Transaction[]
  selectedMonth: string
  existingDays: number
  getSignedAmountForTransaction: (transaction: Transaction) => number
}): BudgetMetrics {
  const daysInMonth = getDaysInCalendarMonth(selectedMonth)
  const safeExistingDays = Math.max(0, Math.min(existingDays, daysInMonth || existingDays))

  const monthEntries = transactions.filter((transaction) => {
    if (transaction.is_deleted || !transaction.date.startsWith(selectedMonth)) {
      return false
    }

    const day = getDayFromDate(transaction.date)

    return day >= 1 && day <= safeExistingDays
  })

  const totals = monthEntries.reduce(
    (acc, transaction) => {
      const amount = getSignedAmountForTransaction(transaction)

      if (amount >= 0) {
        acc.income += amount
      } else {
        acc.expense += Math.abs(amount)
      }

      return acc
    },
    {
      income: 0,
      expense: 0,
    }
  )

  const expenseToIncomePercent =
    totals.income > 0 ? (totals.expense / totals.income) * 100 : totals.expense > 0 ? 100 : 0

  const currentMonth = getCurrentMonthText()
  const timePercent =
    selectedMonth > currentMonth
      ? 0
      : daysInMonth > 0
        ? (safeExistingDays / daysInMonth) * 100
        : 0

  const paceDifference = expenseToIncomePercent - timePercent

  return {
    income: totals.income,
    expense: totals.expense,
    balance: totals.income - totals.expense,
    expenseToIncomePercent,
    timePercent,
    paceDifference,
    status: getStatus({
      income: totals.income,
      expense: totals.expense,
      expenseToIncomePercent,
      paceDifference,
    }),
  }
}
