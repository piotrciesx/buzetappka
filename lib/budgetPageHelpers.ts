import { Category, SortDirection, SortMode } from './budgetPageTypes'
import { getUniqueCategoryLabel } from './categoryUtils'

export const getCategorySortOrderValue = (category: Category) => {
  if (typeof category.sort_order === 'number') {
    return category.sort_order
  }

  return Number.MAX_SAFE_INTEGER
}

export const getCategoryDefaultOrderValue = (category: Category) => {
  if (typeof category.default_order === 'number') {
    return category.default_order
  }

  return getCategorySortOrderValue(category)
}

export const compareCategoriesForDisplay = (a: Category, b: Category) => {
  if (a.level !== b.level) {
    return a.level - b.level
  }

  const sortOrderDifference = getCategorySortOrderValue(a) - getCategorySortOrderValue(b)

  if (sortOrderDifference !== 0) {
    return sortOrderDifference
  }

  return a.name.localeCompare(b.name)
}

export const compareCategoriesForDefaultDisplay = (a: Category, b: Category) => {
  if (a.level !== b.level) {
    return a.level - b.level
  }

  const defaultOrderDifference = getCategoryDefaultOrderValue(a) - getCategoryDefaultOrderValue(b)

  if (defaultOrderDifference !== 0) {
    return defaultOrderDifference
  }

  return a.name.localeCompare(b.name)
}

export const sortCategoriesForDisplay = (items: Category[]) => {
  return [...items].sort(compareCategoriesForDisplay)
}

export const sortCategoriesForDefaultDisplay = (items: Category[]) => {
  return [...items].sort(compareCategoriesForDefaultDisplay)
}

export const sortCategoriesByName = (items: Category[]) => {
  return [...items].sort((a, b) => a.name.localeCompare(b.name))
}

export const normalizeAmountInput = (value: string) => {
  return value.replace(',', '.').trim()
}

export const getCategoryPathLabel = (
  categoryId: string,
  categoriesById: Record<string, Category>
) => {
  return getUniqueCategoryLabel(categoryId, categoriesById)
}

export const isSortModeValue = (value: string): value is SortMode => {
  return value === 'default' || value === 'manual' || value === 'sum' || value === 'frequency'
}

export const isSortDirectionValue = (value: string): value is SortDirection => {
  return value === 'asc' || value === 'desc'
}
