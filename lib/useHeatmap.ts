import { useCallback, useEffect, useState } from 'react'
import { Category, Transaction } from './budgetPageTypes'
import { getAmountNumber } from './transactionUtils'

export type HeatmapMode = 'normal' | 'balance'
export type CalendarHeatmapVariant = 'balance' | 'income' | 'expense'

const HEATMAP_STORAGE_KEY = 'budget-app-heatmap-settings-v2'
const DEFAULT_HEATMAP_MODE: HeatmapMode = 'balance'

type UseHeatmapParams = {
  categoriesById: Record<string, Category>
  incomeLevel1Id: string | null
  expenseLevel1Id: string | null
}

export function useHeatmap({
  categoriesById,
  incomeLevel1Id,
  expenseLevel1Id,
}: UseHeatmapParams) {
  const [heatmapMode, setHeatmapMode] = useState<HeatmapMode>(DEFAULT_HEATMAP_MODE)
  const [heatmapInverted, setHeatmapInverted] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      const raw = window.localStorage.getItem(HEATMAP_STORAGE_KEY)

      if (!raw) {
        return
      }

      const parsed = JSON.parse(raw) as {
        mode?: HeatmapMode
        inverted?: boolean
      }

      if (parsed.mode === 'normal' || parsed.mode === 'balance') {
        setHeatmapMode(parsed.mode)
      }

      if (typeof parsed.inverted === 'boolean') {
        setHeatmapInverted(parsed.inverted)
      }
    } catch {
      // nic
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(
      HEATMAP_STORAGE_KEY,
      JSON.stringify({
        mode: heatmapMode,
        inverted: heatmapInverted,
      })
    )
  }, [heatmapInverted, heatmapMode])

  const handleResetHeatmapSettings = useCallback(() => {
    setHeatmapMode(DEFAULT_HEATMAP_MODE)
    setHeatmapInverted(false)
  }, [])

  const getRootLevel1IdForCategory = useCallback(
    (categoryId: string) => {
      let currentCategory = categoriesById[categoryId]

      while (currentCategory?.parent_id) {
        currentCategory = categoriesById[currentCategory.parent_id]
      }

      if (!currentCategory || currentCategory.level !== 1) {
        return null
      }

      return currentCategory.id
    },
    [categoriesById]
  )

  const getSignedAmountForTransaction = useCallback(
    (transaction: Transaction) => {
      const amount = getAmountNumber(transaction.amount)
      const rootLevel1Id = getRootLevel1IdForCategory(transaction.category_id)

      if (!rootLevel1Id) {
        return 0
      }

      const rootCategory = categoriesById[rootLevel1Id]

      if (!rootCategory) {
        return 0
      }

      const normalizedName = rootCategory.name.trim().toLowerCase()

      if (normalizedName === 'przychody') {
        return amount
      }

      if (normalizedName === 'wydatki') {
        return amount * -1
      }

      return 0
    },
    [categoriesById, getRootLevel1IdForCategory]
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