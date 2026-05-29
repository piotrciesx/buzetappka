'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { getProfileStorageKey, readProfileStorageValue } from '../../lib/profileStorage'

type PinnedShortcutCategory = {
  id: string
  label: string
}

type UsePinnedCategoriesInput = {
  userId: string
  profileId: string
  addableTransactionCategoryIds: Set<string>
  transactionCategoryPathLabels: Record<string, string>
  getRootLevel1IdForCategory?: (categoryId: string) => string | null
}

const getPinnedCategoriesStorageKey = (profileId: string) =>
  `budget-app-pinned-categories-${profileId}`

const getScopedPinnedCategoriesStorageKey = (userId: string, profileId: string) =>
  getProfileStorageKey({
    userId,
    profileId,
    featureKey: 'pinned-categories',
  })

const readPinnedCategoryIds = (userId: string, profileId: string) => {
  if (!userId || !profileId || typeof window === 'undefined') {
    return []
  }

  const storedValue = readProfileStorageValue({
    storageKey: getScopedPinnedCategoriesStorageKey(userId, profileId),
    legacyStorageKeys: [getPinnedCategoriesStorageKey(profileId)],
  })

  if (!storedValue) {
    return []
  }

  try {
    const parsedValue = JSON.parse(storedValue)
    return Array.isArray(parsedValue) ? parsedValue.filter(Boolean) : []
  } catch {
    return []
  }
}

export function usePinnedCategories({
  userId,
  profileId,
  addableTransactionCategoryIds,
  transactionCategoryPathLabels,
  getRootLevel1IdForCategory,
}: UsePinnedCategoriesInput) {
  const storageKey = getScopedPinnedCategoriesStorageKey(userId, profileId)
  const [pinnedState, setPinnedState] = useState(() => {
    return {
      storageKey,
      ids: readPinnedCategoryIds(userId, profileId),
    }
  })
  const pinnedCategoryIds = pinnedState.ids

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPinnedState({
        storageKey,
        ids: readPinnedCategoryIds(userId, profileId),
      })
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [profileId, storageKey, userId])

  useEffect(() => {
    if (
      !userId ||
      !profileId ||
      typeof window === 'undefined' ||
      pinnedState.storageKey !== storageKey
    ) {
      return
    }

    window.localStorage.setItem(storageKey, JSON.stringify(pinnedCategoryIds))
  }, [pinnedCategoryIds, pinnedState.storageKey, profileId, storageKey, userId])

  const togglePinnedCategory = useCallback((categoryId: string) => {
    setPinnedState((prev) => ({
      ...prev,
      ids: prev.ids.includes(categoryId)
        ? prev.ids.filter((item) => item !== categoryId)
        : [categoryId, ...prev.ids].slice(0, 12),
    }))
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
