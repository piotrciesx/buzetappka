'use client'

import { useCallback } from 'react'
import type { Category } from '../../lib/budgetPageTypes'

type UseTransactionCategorySelectionInput = {
  categoriesById: Record<string, Category>
  setSelectedTransactionTypeId: (value: string | null) => void
  setSelectedLevel2Id: (value: string | null) => void
  setSelectedTransactionCategoryId: (value: string | null) => void
}

export function useTransactionCategorySelection({
  categoriesById,
  setSelectedTransactionTypeId,
  setSelectedLevel2Id,
  setSelectedTransactionCategoryId,
}: UseTransactionCategorySelectionInput) {
  return useCallback(
    (categoryId: string) => {
      const selectedCategory = categoriesById[categoryId]

      if (!selectedCategory) {
        return
      }

      if (selectedCategory.level === 1) {
        setSelectedTransactionTypeId(selectedCategory.id)
        setSelectedLevel2Id(null)
        setSelectedTransactionCategoryId(selectedCategory.id)
        return
      }

      if (selectedCategory.level === 2 && selectedCategory.parent_id) {
        const selectedLevel1 = categoriesById[selectedCategory.parent_id]

        if (!selectedLevel1 || selectedLevel1.level !== 1) {
          return
        }

        setSelectedTransactionTypeId(selectedLevel1.id)
        setSelectedLevel2Id(selectedCategory.id)
        setSelectedTransactionCategoryId(selectedCategory.id)
        return
      }

      if (selectedCategory.level !== 3 || !selectedCategory.parent_id) {
        return
      }

      const selectedLevel2 = categoriesById[selectedCategory.parent_id]

      if (!selectedLevel2 || selectedLevel2.level !== 2 || !selectedLevel2.parent_id) {
        return
      }

      const selectedLevel1 = categoriesById[selectedLevel2.parent_id]

      if (!selectedLevel1 || selectedLevel1.level !== 1) {
        return
      }

      setSelectedTransactionTypeId(selectedLevel1.id)
      setSelectedLevel2Id(selectedLevel2.id)
      setSelectedTransactionCategoryId(selectedCategory.id)
    },
    [
      categoriesById,
      setSelectedLevel2Id,
      setSelectedTransactionCategoryId,
      setSelectedTransactionTypeId,
    ]
  )
}
