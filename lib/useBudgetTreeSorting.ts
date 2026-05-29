import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from './supabaseClient'
import {
  LEVEL2_SORT_DIRECTION_STORAGE_KEY,
  LEVEL2_SORT_MODE_STORAGE_KEY,
  LEVEL3_SORT_DIRECTION_STORAGE_KEY,
  LEVEL3_SORT_MODE_STORAGE_KEY,
} from './budgetPageConstants'
import {
  compareCategoriesForDisplay,
  isSortDirectionValue,
  isSortModeValue,
  sortCategoriesByName,
  sortCategoriesForDefaultDisplay,
  sortCategoriesForDisplay,
} from './budgetPageHelpers'
import { Category, SortDirection, SortMode } from './budgetPageTypes'
import { getProfileStorageKey, readProfileStorageValue } from './profileStorage'

type UseBudgetTreeSortingParams = {
  profileId: string
  userId: string
  categories: Category[]
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>
  openLevel1Ids: string[]
  openLevel2Ids: string[]
  setOpenLevel1Ids: React.Dispatch<React.SetStateAction<string[]>>
  setOpenLevel2Ids: React.Dispatch<React.SetStateAction<string[]>>
  setOpenLevel3Ids: React.Dispatch<React.SetStateAction<string[]>>
  level1: Category[]
  level2: Category[]
  level2ByParentId: Record<string, Category[]>
  level3ByParentId: Record<string, Category[]>
  getSumForCategoryForSelectedMonth: (categoryId: string) => number
  getSumForLevel2ForSelectedMonth: (level2Id: string) => number
  getCountForLevel2ForSelectedMonth: (level2Id: string) => number
  getCategoryCountForSelectedMonth: (categoryId: string) => number
}

type UseBudgetTreeSortingResult = {
  level2SortMode: SortMode
  setLevel2SortMode: React.Dispatch<React.SetStateAction<SortMode>>
  level2SortDirection: SortDirection
  setLevel2SortDirection: React.Dispatch<React.SetStateAction<SortDirection>>
  level3SortMode: SortMode
  setLevel3SortMode: React.Dispatch<React.SetStateAction<SortMode>>
  level3SortDirection: SortDirection
  setLevel3SortDirection: React.Dispatch<React.SetStateAction<SortDirection>>
  isReorderingLevel1: boolean
  reorderingLevel1Id: string | null
  reorderingLevel2Id: string | null
  getSortedLevel2Children: (level1Id: string) => Category[]
  getSortedLevel3Children: (level2Id: string) => Category[]
  sortedLevel2ByParentIdForModal: Record<string, Category[]>
  sortedLevel3ByParentIdForModal: Record<string, Category[]>
  handleReorderLevel1: (activeId: string, overId: string) => Promise<void>
  handleReorderLevel2: (level1Id: string, activeId: string, overId: string) => Promise<void>
  handleReorderLevel3: (level2Id: string, activeId: string, overId: string) => Promise<void>
  handleLevel1DragStart: () => void
  handleLevel3DragStart: (activeId: string) => void
}

export function useBudgetTreeSorting(
  params: UseBudgetTreeSortingParams
): UseBudgetTreeSortingResult {
  const {
    categories,
    profileId,
    userId,
    setCategories,
    openLevel1Ids,
    openLevel2Ids,
    setOpenLevel1Ids,
    setOpenLevel2Ids,
    setOpenLevel3Ids,
    level1,
    level2,
    level2ByParentId,
    level3ByParentId,
    getSumForCategoryForSelectedMonth,
    getSumForLevel2ForSelectedMonth,
    getCountForLevel2ForSelectedMonth,
    getCategoryCountForSelectedMonth,
  } = params

  const [level2SortMode, setLevel2SortMode] = useState<SortMode>('default')
  const [level2SortDirection, setLevel2SortDirection] = useState<SortDirection>('desc')
  const [level3SortMode, setLevel3SortMode] = useState<SortMode>('default')
  const [level3SortDirection, setLevel3SortDirection] = useState<SortDirection>('desc')
  const [hasHydratedSortPreferences, setHasHydratedSortPreferences] = useState(false)
  const hydratedSortStorageScopeRef = useRef('')
  const [isReorderingLevel1, setIsReorderingLevel1] = useState(false)
  const [reorderingLevel1Id, setReorderingLevel1Id] = useState<string | null>(null)
  const [reorderingLevel2Id, setReorderingLevel2Id] = useState<string | null>(null)
  const getScopedSortStorageKey = useCallback(
    (featureKey: string) =>
      getProfileStorageKey({
        userId,
        profileId,
        featureKey,
      }),
    [profileId, userId]
  )
  const sortStorageScope = `${userId}:${profileId}`

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const timeoutId = window.setTimeout(() => {
      const storedLevel2SortMode = readProfileStorageValue({
        storageKey: getScopedSortStorageKey('sort-level2-mode'),
        legacyStorageKeys: [LEVEL2_SORT_MODE_STORAGE_KEY],
      })
      const storedLevel2SortDirection = readProfileStorageValue({
        storageKey: getScopedSortStorageKey('sort-level2-direction'),
        legacyStorageKeys: [LEVEL2_SORT_DIRECTION_STORAGE_KEY],
      })
      const storedLevel3SortMode = readProfileStorageValue({
        storageKey: getScopedSortStorageKey('sort-level3-mode'),
        legacyStorageKeys: [LEVEL3_SORT_MODE_STORAGE_KEY],
      })
      const storedLevel3SortDirection = readProfileStorageValue({
        storageKey: getScopedSortStorageKey('sort-level3-direction'),
        legacyStorageKeys: [LEVEL3_SORT_DIRECTION_STORAGE_KEY],
      })

      if (storedLevel2SortMode && isSortModeValue(storedLevel2SortMode)) {
        setLevel2SortMode(storedLevel2SortMode)
      }

      if (storedLevel2SortDirection && isSortDirectionValue(storedLevel2SortDirection)) {
        setLevel2SortDirection(storedLevel2SortDirection)
      }

      if (storedLevel3SortMode && isSortModeValue(storedLevel3SortMode)) {
        setLevel3SortMode(storedLevel3SortMode)
      }

      if (storedLevel3SortDirection && isSortDirectionValue(storedLevel3SortDirection)) {
        setLevel3SortDirection(storedLevel3SortDirection)
      }

      hydratedSortStorageScopeRef.current = sortStorageScope
      setHasHydratedSortPreferences(true)
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [getScopedSortStorageKey, sortStorageScope])

  useEffect(() => {
    if (
      !hasHydratedSortPreferences ||
      hydratedSortStorageScopeRef.current !== sortStorageScope ||
      typeof window === 'undefined'
    ) {
      return
    }

    window.localStorage.setItem(getScopedSortStorageKey('sort-level2-mode'), level2SortMode)
    window.localStorage.setItem(
      getScopedSortStorageKey('sort-level2-direction'),
      level2SortDirection
    )
    window.localStorage.setItem(getScopedSortStorageKey('sort-level3-mode'), level3SortMode)
    window.localStorage.setItem(
      getScopedSortStorageKey('sort-level3-direction'),
      level3SortDirection
    )
  }, [
    getScopedSortStorageKey,
    hasHydratedSortPreferences,
    sortStorageScope,
    level2SortMode,
    level2SortDirection,
    level3SortMode,
    level3SortDirection,
  ])

  const sortCategoriesForMode = useCallback(
    (
      items: Category[],
      mode: SortMode,
      direction: SortDirection,
      getMetricValue: (categoryId: string) => number
    ) => {
      if (mode === 'default') {
        return sortCategoriesForDefaultDisplay(items)
      }

      if (mode === 'manual') {
        return sortCategoriesForDisplay(items)
      }

      if (mode === 'sum' || mode === 'frequency') {
        return [...items].sort((a, b) => {
          const difference =
            direction === 'asc'
              ? getMetricValue(a.id) - getMetricValue(b.id)
              : getMetricValue(b.id) - getMetricValue(a.id)

          if (difference !== 0) {
            return difference
          }

          return a.name.localeCompare(b.name)
        })
      }

      return sortCategoriesByName(items)
    },
    []
  )

  const getSortedLevel2Children = useCallback(
    (level1Id: string) => {
      const children = level2ByParentId[level1Id] || []

      if (level2SortMode === 'sum') {
        return sortCategoriesForMode(
          children,
          level2SortMode,
          level2SortDirection,
          getSumForLevel2ForSelectedMonth
        )
      }

      if (level2SortMode === 'frequency') {
        return sortCategoriesForMode(
          children,
          level2SortMode,
          level2SortDirection,
          getCountForLevel2ForSelectedMonth
        )
      }

      return sortCategoriesForMode(children, level2SortMode, level2SortDirection, () => 0)
    },
    [
      level2ByParentId,
      level2SortMode,
      level2SortDirection,
      sortCategoriesForMode,
      getSumForLevel2ForSelectedMonth,
      getCountForLevel2ForSelectedMonth,
    ]
  )

  const getSortedLevel3Children = useCallback(
    (level2Id: string) => {
      const children = level3ByParentId[level2Id] || []

      if (level3SortMode === 'sum') {
        return sortCategoriesForMode(
          children,
          level3SortMode,
          level3SortDirection,
          getSumForCategoryForSelectedMonth
        )
      }

      if (level3SortMode === 'frequency') {
        return sortCategoriesForMode(
          children,
          level3SortMode,
          level3SortDirection,
          getCategoryCountForSelectedMonth
        )
      }

      return sortCategoriesForMode(children, level3SortMode, level3SortDirection, () => 0)
    },
    [
      level3ByParentId,
      level3SortMode,
      level3SortDirection,
      sortCategoriesForMode,
      getSumForCategoryForSelectedMonth,
      getCategoryCountForSelectedMonth,
    ]
  )

  const handleReorderLevel3 = useCallback(
    async (level2Id: string, activeId: string, overId: string) => {
      if (activeId === overId || reorderingLevel2Id === level2Id) {
        return
      }

      setLevel3SortMode('manual')

      const siblingCategories = sortCategoriesForDisplay(
        categories.filter((category) => category.level === 3 && category.parent_id === level2Id)
      )

      const oldIndex = siblingCategories.findIndex((category) => category.id === activeId)
      const newIndex = siblingCategories.findIndex((category) => category.id === overId)

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        return
      }

      const reorderedSiblings = siblingCategories.slice().sort(compareCategoriesForDisplay)
      const movedCategory = reorderedSiblings.splice(oldIndex, 1)[0]

      if (!movedCategory) {
        return
      }

      reorderedSiblings.splice(newIndex, 0, movedCategory)

      const updatedSiblings = reorderedSiblings.map((category, index) => ({
        ...category,
        sort_order: index + 1,
      }))

      const updatedById = updatedSiblings.reduce<Record<string, Category>>((acc, category) => {
        acc[category.id] = category
        return acc
      }, {})

      const previousCategories = categories
      const nextCategories = sortCategoriesForDisplay(
        categories.map((category) => updatedById[category.id] || category)
      )

      setCategories(nextCategories)
      setReorderingLevel2Id(level2Id)

      const results = await Promise.all(
        updatedSiblings.map((category) =>
          supabase
            .from('categories')
            .update({ sort_order: category.sort_order })
            .eq('id', category.id)
            .eq('profile_id', profileId)
        )
      )

      const failedUpdate = results.find((result) => result.error)

      if (failedUpdate?.error) {
        setCategories(previousCategories)
        alert(`Błąd zapisu kolejności: ${failedUpdate.error.message}`)
        setReorderingLevel2Id(null)
        return
      }

      setReorderingLevel2Id(null)
    },
    [categories, profileId, reorderingLevel2Id, setCategories]
  )

  const handleReorderLevel2 = useCallback(
    async (level1Id: string, activeId: string, overId: string) => {
      if (activeId === overId || reorderingLevel1Id === level1Id) {
        return
      }

      setLevel2SortMode('manual')

      const siblingCategories = sortCategoriesForDisplay(
        categories.filter((category) => category.level === 2 && category.parent_id === level1Id)
      )

      const oldIndex = siblingCategories.findIndex((category) => category.id === activeId)
      const newIndex = siblingCategories.findIndex((category) => category.id === overId)

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        return
      }

      const reorderedSiblings = siblingCategories.slice().sort(compareCategoriesForDisplay)
      const movedCategory = reorderedSiblings.splice(oldIndex, 1)[0]

      if (!movedCategory) {
        return
      }

      reorderedSiblings.splice(newIndex, 0, movedCategory)

      const updatedSiblings = reorderedSiblings.map((category, index) => ({
        ...category,
        sort_order: index + 1,
      }))

      const updatedById = updatedSiblings.reduce<Record<string, Category>>((acc, category) => {
        acc[category.id] = category
        return acc
      }, {})

      const previousCategories = categories
      const nextCategories = sortCategoriesForDisplay(
        categories.map((category) => updatedById[category.id] || category)
      )

      setCategories(nextCategories)
      setReorderingLevel1Id(level1Id)

      const results = await Promise.all(
        updatedSiblings.map((category) =>
          supabase
            .from('categories')
            .update({ sort_order: category.sort_order })
            .eq('id', category.id)
            .eq('profile_id', profileId)
        )
      )

      const failedUpdate = results.find((result) => result.error)

      if (failedUpdate?.error) {
        setCategories(previousCategories)
        alert(`Błąd zapisu kolejności: ${failedUpdate.error.message}`)
        setReorderingLevel1Id(null)
        return
      }

      setReorderingLevel1Id(null)
    },
    [categories, profileId, reorderingLevel1Id, setCategories]
  )

  const handleReorderLevel1 = useCallback(
    async (activeId: string, overId: string) => {
      if (activeId === overId || isReorderingLevel1) {
        return
      }

      const siblingCategories = sortCategoriesForDisplay(
        categories.filter((category) => category.level === 1)
      )

      const oldIndex = siblingCategories.findIndex((category) => category.id === activeId)
      const newIndex = siblingCategories.findIndex((category) => category.id === overId)

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        return
      }

      const reorderedSiblings = siblingCategories.slice().sort(compareCategoriesForDisplay)
      const movedCategory = reorderedSiblings.splice(oldIndex, 1)[0]

      if (!movedCategory) {
        return
      }

      reorderedSiblings.splice(newIndex, 0, movedCategory)

      const updatedSiblings = reorderedSiblings.map((category, index) => ({
        ...category,
        sort_order: index + 1,
      }))

      const updatedById = updatedSiblings.reduce<Record<string, Category>>((acc, category) => {
        acc[category.id] = category
        return acc
      }, {})

      const previousCategories = categories
      const nextCategories = sortCategoriesForDisplay(
        categories.map((category) => updatedById[category.id] || category)
      )

      setCategories(nextCategories)
      setIsReorderingLevel1(true)

      const results = await Promise.all(
        updatedSiblings.map((category) =>
          supabase
            .from('categories')
            .update({ sort_order: category.sort_order })
            .eq('id', category.id)
            .eq('profile_id', profileId)
        )
      )

      const failedUpdate = results.find((result) => result.error)

      if (failedUpdate?.error) {
        setCategories(previousCategories)
        alert(`Błąd zapisu kolejności: ${failedUpdate.error.message}`)
        setIsReorderingLevel1(false)
        return
      }

      setIsReorderingLevel1(false)
    },
    [categories, isReorderingLevel1, profileId, setCategories]
  )

  const handleLevel3DragStart = useCallback(
    (activeId: string) => {
      const activeCategory = categories.find(
        (category) => category.id === activeId && category.level === 3
      )

      const parentLevel2 = activeCategory?.parent_id
        ? categories.find(
            (category) => category.id === activeCategory.parent_id && category.level === 2
          )
        : null

      const parentLevel1 = parentLevel2?.parent_id
        ? categories.find(
            (category) => category.id === parentLevel2.parent_id && category.level === 1
          )
        : null

      setOpenLevel3Ids([])
      setOpenLevel2Ids(parentLevel2 ? [parentLevel2.id] : [])
      setOpenLevel1Ids(parentLevel1 ? [parentLevel1.id] : [])
    },
    [categories, setOpenLevel1Ids, setOpenLevel2Ids, setOpenLevel3Ids]
  )

  const handleLevel1DragStart = useCallback(() => {
    setOpenLevel2Ids([])
    setOpenLevel3Ids([])
  }, [setOpenLevel2Ids, setOpenLevel3Ids])

  const sortedLevel2ByParentIdForModal = useMemo(() => {
    return level1.reduce<Record<string, Category[]>>((acc, category) => {
      acc[category.id] = getSortedLevel2Children(category.id)
      return acc
    }, {})
  }, [level1, getSortedLevel2Children])

  const sortedLevel3ByParentIdForModal = useMemo(() => {
    return level2.reduce<Record<string, Category[]>>((acc, category) => {
      acc[category.id] = getSortedLevel3Children(category.id)
      return acc
    }, {})
  }, [level2, getSortedLevel3Children])

  return {
    level2SortMode,
    setLevel2SortMode,
    level2SortDirection,
    setLevel2SortDirection,
    level3SortMode,
    setLevel3SortMode,
    level3SortDirection,
    setLevel3SortDirection,
    isReorderingLevel1,
    reorderingLevel1Id,
    reorderingLevel2Id,
    getSortedLevel2Children,
    getSortedLevel3Children,
    sortedLevel2ByParentIdForModal,
    sortedLevel3ByParentIdForModal,
    handleReorderLevel1,
    handleReorderLevel2,
    handleReorderLevel3,
    handleLevel1DragStart,
    handleLevel3DragStart,
  }
}
