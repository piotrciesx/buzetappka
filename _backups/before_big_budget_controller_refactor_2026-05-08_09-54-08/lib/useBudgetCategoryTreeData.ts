import { useMemo } from 'react'
import { Category } from './budgetPageTypes'
import { sortCategoriesForDisplay } from './budgetPageHelpers'
import { isCategoryVisibleInMonth } from './categoryUtils'

type UseBudgetCategoryTreeDataParams = {
  categories: Category[]
  selectedMonth: string
}

export function useBudgetCategoryTreeData({
  categories,
  selectedMonth,
}: UseBudgetCategoryTreeDataParams) {
  const visibleCategories = useMemo(() => {
    return categories.filter((category) => isCategoryVisibleInMonth(category, selectedMonth))
  }, [categories, selectedMonth])

  const level1 = useMemo(() => {
    return visibleCategories.filter((category) => category.level === 1)
  }, [visibleCategories])

  const expenseLevel1Id = useMemo(() => {
    return level1.find((category) => category.name.trim().toLowerCase() === 'wydatki')?.id || null
  }, [level1])

  const incomeLevel1Id = useMemo(() => {
    return level1.find((category) => category.name.trim().toLowerCase() === 'przychody')?.id || null
  }, [level1])

  const sortedLevel1 = useMemo(() => {
    return sortCategoriesForDisplay(level1)
  }, [level1])

  const level2 = useMemo(() => {
    return visibleCategories.filter((category) => category.level === 2)
  }, [visibleCategories])

  const level3 = useMemo(() => {
    return visibleCategories.filter((category) => category.level === 3)
  }, [visibleCategories])

  const level2ByParentId = useMemo(() => {
    const grouped = level2.reduce<Record<string, Category[]>>((acc, category) => {
      const parentId = category.parent_id

      if (!parentId) {
        return acc
      }

      if (!acc[parentId]) {
        acc[parentId] = []
      }

      acc[parentId].push(category)
      return acc
    }, {})

    return grouped
  }, [level2])

  const level3ByParentId = useMemo(() => {
    const grouped = level3.reduce<Record<string, Category[]>>((acc, category) => {
      const parentId = category.parent_id

      if (!parentId) {
        return acc
      }

      if (!acc[parentId]) {
        acc[parentId] = []
      }

      acc[parentId].push(category)
      return acc
    }, {})

    return grouped
  }, [level3])

  const hiddenCategoriesInSelectedMonth = useMemo(() => {
    return sortCategoriesForDisplay(
      categories.filter((category) => {
        if (category.level === 1) {
          return false
        }

        return !isCategoryVisibleInMonth(category, selectedMonth)
      })
    )
  }, [categories, selectedMonth])

  const categoriesById = useMemo(() => {
    return categories.reduce<Record<string, Category>>((acc, category) => {
      acc[category.id] = category
      return acc
    }, {})
  }, [categories])

  return {
    visibleCategories,
    level1,
    level2,
    level3,
    expenseLevel1Id,
    incomeLevel1Id,
    sortedLevel1,
    level2ByParentId,
    level3ByParentId,
    hiddenCategoriesInSelectedMonth,
    categoriesById,
  }
}