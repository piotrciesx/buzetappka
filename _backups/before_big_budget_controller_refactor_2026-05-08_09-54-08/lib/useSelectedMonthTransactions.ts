import { useMemo } from 'react'
import { getTransactionsForCalendarMonth } from './calendarPageHelpers'
import { Transaction } from './budgetPageTypes'

type UseSelectedMonthTransactionsParams = {
  transactions: Transaction[]
  selectedMonth: string
}

export function useSelectedMonthTransactions({
  transactions,
  selectedMonth,
}: UseSelectedMonthTransactionsParams) {
  return useMemo(() => {
    return getTransactionsForCalendarMonth(transactions, selectedMonth)
  }, [selectedMonth, transactions])
}