import type { Transaction } from '../../lib/budgetPageTypes'
import { GREEN, MUTED, NEUTRAL, RED } from './dashboardWidgetTileStyles'

export const formatMoney = (value: number) => `${value.toFixed(2)} zł`

export const formatPercent = (value: number) => `${value.toFixed(1)}%`

export const formatChange = (percent: number | null) => (percent === null ? 'brak bazy' : formatPercent(percent))

export const getColorForMoney = (value: number) => {
  if (value > 0) return GREEN
  if (value < 0) return RED
  return NEUTRAL
}

export const getExpenseChangeColor = (value: number) => {
  if (value > 0) return RED
  if (value < 0) return GREEN
  return MUTED
}

export const getPaceLabel = (status: 'calm' | 'watch' | 'fast') => {
  if (status === 'fast') return 'Za szybko'
  if (status === 'watch') return 'Uważaj'
  return 'Spokojnie'
}

export const getPaceColor = (status: 'calm' | 'watch' | 'fast') => {
  if (status === 'fast') return RED
  if (status === 'watch') return '#b45309'
  return GREEN
}

export const getRiskColor = (level: 'none' | 'low' | 'medium' | 'high') => {
  if (level === 'high') return RED
  if (level === 'medium') return '#b45309'
  if (level === 'low') return GREEN
  return MUTED
}

export const clampPercent = (value: number) => {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(100, value))
}

export const getTransactionTime = (transaction: Transaction) => transaction.created_at ?? ''

export const compareTransactionsByDate = (left: Transaction, right: Transaction) => {
  const dateCompare = right.date.localeCompare(left.date)
  if (dateCompare !== 0) return dateCompare

  return getTransactionTime(right).localeCompare(getTransactionTime(left))
}

export const isTransactionInMonth = (transaction: Transaction, selectedMonth: string) => {
  return transaction.date.startsWith(selectedMonth)
}

export const getDayFromDate = (date: string) => {
  const day = Number(date.slice(8, 10))
  return Number.isFinite(day) ? day : 0
}

export const getDaysInMonth = (selectedMonth: string) => {
  const [year, month] = selectedMonth.split('-').map(Number)
  if (!year || !month) return 31

  return new Date(year, month, 0).getDate()
}
