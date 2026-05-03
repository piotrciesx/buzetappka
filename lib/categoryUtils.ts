import { getMonthNumber, getNextMonthText } from './dateUtils'

export type CategoryLabelCategory = {
  id: string
  name: string
  parent_id: string | null
  level: number
  sort_order?: number | null
  active_to?: string | null
  reactivate_from?: string | null
}

type Category = CategoryLabelCategory

const getCategoryPathParts = (
  categoryId: string,
  categoriesById: Record<string, CategoryLabelCategory>
) => {
  const parts: string[] = []
  const visitedIds = new Set<string>()
  let current: CategoryLabelCategory | undefined = categoriesById[categoryId]

  while (current && !visitedIds.has(current.id)) {
    visitedIds.add(current.id)
    parts.unshift(current.name || 'Bez nazwy')
    current = current.parent_id ? categoriesById[current.parent_id] : undefined
  }

  return parts
}

const getCategoryPathSuffix = (parts: string[], length: number) => {
  return parts.slice(Math.max(0, parts.length - length)).join(' / ')
}

export const getUniqueCategoryLabel = (
  categoryId: string,
  categoriesById: Record<string, CategoryLabelCategory>,
  scopeCategoryIds?: Iterable<string>
) => {
  const category = categoriesById[categoryId]

  if (!category) {
    return ''
  }

  const scopedIds = scopeCategoryIds ? [...scopeCategoryIds] : Object.keys(categoriesById)
  const comparableIds = scopedIds.includes(categoryId) ? scopedIds : [...scopedIds, categoryId]
  const scopedPaths = comparableIds
    .filter((id) => Boolean(categoriesById[id]))
    .map((id) => ({
      id,
      parts: getCategoryPathParts(id, categoriesById),
    }))
  const targetParts = getCategoryPathParts(categoryId, categoriesById)

  for (let length = 1; length <= targetParts.length; length += 1) {
    const label = getCategoryPathSuffix(targetParts, length)
    const matchingIds = scopedPaths
      .filter((item) => getCategoryPathSuffix(item.parts, length) === label)
      .map((item) => item.id)

    if (matchingIds.length === 1 && matchingIds[0] === categoryId) {
      return label
    }
  }

  return targetParts.join(' / ')
}

export const isCategoryVisibleInMonth = (category: Category, selectedMonth: string) => {
  if (!category.active_to) {
    return true
  }

  const selectedMonthNumber = getMonthNumber(selectedMonth)
  const hiddenFromMonthNumber = getMonthNumber(category.active_to.slice(0, 7))

  if (selectedMonthNumber < hiddenFromMonthNumber) {
    return true
  }

  if (!category.reactivate_from) {
    return false
  }

  const returnMonthNumber = getMonthNumber(category.reactivate_from.slice(0, 7))

  return selectedMonthNumber >= returnMonthNumber
}

export const isCategoryClosingAfterSelectedMonth = (
  category: Category,
  selectedMonth: string
) => {
  if (!category.active_to) {
    return false
  }

  const hiddenFromMonth = category.active_to.slice(0, 7)
  const nextMonth = getNextMonthText(selectedMonth)

  if (hiddenFromMonth !== nextMonth) {
    return false
  }

  if (!category.reactivate_from) {
    return true
  }

  const returnMonth = category.reactivate_from.slice(0, 7)
  return getMonthNumber(returnMonth) > getMonthNumber(nextMonth)
}

export const getHiddenCategoryLabel = (
  category: Category,
  categoriesById: Record<string, Category>
) => {
  return getUniqueCategoryLabel(category.id, categoriesById)
}

export const getCategoryIdsCoveredByHide = (
  categories: Category[],
  categoryId: string
) => {
  const category = categories.find((item) => item.id === categoryId)

  if (!category) {
    return []
  }

  if (category.level === 2) {
    const childIds = categories
      .filter((item) => item.parent_id === categoryId)
      .map((item) => item.id)

    return [categoryId, ...childIds]
  }

  return [categoryId]
}
