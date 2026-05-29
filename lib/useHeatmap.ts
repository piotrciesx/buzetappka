import { Dispatch, SetStateAction, useCallback } from 'react'
import { Category, Transaction } from './budgetPageTypes'
import {
  getRootLevel1IdForCategory as getRootLevel1IdForCategoryFromDomain,
  getSignedAmountByRootType,
} from './transactionDomain'

export type HeatmapMode = 'normal' | 'balance'
export type CalendarHeatmapVariant = 'balance' | 'income' | 'expense'

const DEFAULT_HEATMAP_MODE: HeatmapMode = 'balance'

type UseHeatmapParams = {
  categoriesById: Record<string, Category>
  incomeLevel1Id: string | null
  expenseLevel1Id: string | null
  heatmapMode: HeatmapMode
  setHeatmapMode: Dispatch<SetStateAction<HeatmapMode>>
  heatmapInverted: boolean
  setHeatmapInverted: Dispatch<SetStateAction<boolean>>
}

export function useHeatmap({
  categoriesById,
  incomeLevel1Id,
  expenseLevel1Id,
  heatmapMode,
  setHeatmapMode,
  heatmapInverted,
  setHeatmapInverted,
}: UseHeatmapParams) {
  const handleResetHeatmapSettings = useCallback(() => {
    setHeatmapMode(DEFAULT_HEATMAP_MODE)
    setHeatmapInverted(false)
  }, [setHeatmapInverted, setHeatmapMode])

  const getRootLevel1IdForCategory = useCallback(
    (categoryId: string) => {
      return getRootLevel1IdForCategoryFromDomain(categoryId, categoriesById)
    },
    [categoriesById]
  )

  const getSignedAmountForTransaction = useCallback(
    (transaction: Transaction) => {
      return getSignedAmountByRootType(transaction, {
        categoriesById,
        incomeLevel1Id,
        expenseLevel1Id,
      })
    },
    [categoriesById, expenseLevel1Id, incomeLevel1Id]
  )

  const getCalendarHeatmapVariantForLevel1Id = useCallback(
    (level1Id: string | null): CalendarHeatmapVariant => {
      if (!level1Id) {
        return 'balance'
      }

      if (level1Id === incomeLevel1Id) {
        return 'income'
      }

      if (level1Id === expenseLevel1Id) {
        return 'expense'
      }

      return 'balance'
    },
    [expenseLevel1Id, incomeLevel1Id]
  )

  return {
    heatmapMode,
    setHeatmapMode,
    heatmapInverted,
    setHeatmapInverted,
    handleResetHeatmapSettings,
    getRootLevel1IdForCategory,
    getSignedAmountForTransaction,
    getCalendarHeatmapVariantForLevel1Id,
  }
}
