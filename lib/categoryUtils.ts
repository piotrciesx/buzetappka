import { getMonthNumber, getNextMonthText } from './dateUtils'

type Category = {
  id: string
  name: string
  parent_id: string | null
  level: number
  sort_order?: number | null
  active_to?: string | null
  reactivate_from?: string | null
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
  if (category.level === 2) {
    return `${category.name} (poziom 2)`
  }

  if (category.level === 3) {
    const parent = category.parent_id ? categoriesById[category.parent_id] : null

    if (parent) {
      return `${category.name} → ${parent.name} (poziom 3)`
    }

    return `${category.name} (poziom 3)`
  }

  return category.name
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
