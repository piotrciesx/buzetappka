'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

type PinnedShortcutCategory = {
  id: string
  label: string
}

type UsePinnedCategoriesInput = {
  profileId: string
  addableTransactionCategoryIds: Set<string>
  transactionCategoryPathLabels: Record<string, string>
  getRootLevel1IdForCategory?: (categoryId: string) => string | null
}

const getPinnedCategoriesStorageKey = (profileId: string) =>
  `budget-app-pinned-categories-${profileId}`

export function usePinnedCategories({
  profileId,
  addableTransactionCategoryIds,
  transactionCategoryPathLabels,
  getRootLevel1IdForCategory,
}: UsePinnedCategoriesInput) {
  const [pinnedCategoryIds, setPinnedCategoryIds] = useState<string[]>(() => {
    if (!profileId || typeof window === 'undefined') {
      return []
    }

    const storedValue = window.localStorage.getItem(getPinnedCategoriesStorageKey(profileId))
    if (!storedValue) {
      return []
    }

    try {
      const parsedValue = JSON.parse(storedValue)
      return Array.isArray(parsedValue) ? parsedValue.filter(Boolean) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    if (!profileId || typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(
      getPinnedCategoriesStorageKey(profileId),
      JSON.stringify(pinnedCategoryIds)
    )
  }, [pinnedCategoryIds, profileId])

  const togglePinnedCategory = useCallback((categoryId: string) => {
    setPinnedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((item) => item !== categoryId)
        : [categoryId, ...prev].slice(0, 12)
    )
  }, [])

  const pinnedTransactionShortcutCategoriesByType = useMemo(() => {
    const safeGetRootLevel1IdForCategory =
      typeof getRootLevel1IdForCategory === 'function'
        ? getRootLevel1IdForCategory
        : () => null
    const hasAddableCategory =
      addableTransactionCategoryIds instanceof Set
        ? (categoryId: string) => addableTransactionCategoryIds.has(categoryId)
        : () => false

    return pinnedCategoryIds.reduce<Record<string, PinnedShortcutCategory[]>>(
      (acc, categoryId) => {
        if (!hasAddableCategory(categoryId)) {
          return acc
        }

        const rootId = safeGetRootLevel1IdForCategory(categoryId)
        const label = transactionCategoryPathLabels[categoryId]

        if (!rootId || !label) {
          return acc
        }

        acc[rootId] = [...(acc[rootId] || []), { id: categoryId, label }]
        return acc
      },
      {}
    )
  }, [
    addableTransactionCategoryIds,
    getRootLevel1IdForCategory,
    pinnedCategoryIds,
    transactionCategoryPathLabels,
  ])

  return {
    pinnedCategoryIds,
    pinnedTransactionShortcutCategoriesByType,
    togglePinnedCategory,
  }
}
