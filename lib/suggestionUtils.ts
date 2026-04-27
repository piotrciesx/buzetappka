export type DescriptionSuggestion = {
  text: string
  count: number
}

export type DescriptionSuggestionSet = {
  global: DescriptionSuggestion[]
  byCategory: Record<string, DescriptionSuggestion[]>
}

export type HiddenDescriptionSuggestionSet = {
  global: string[]
  byCategory: Record<string, string[]>
}

type SuggestionAccumulator = {
  count: number
  text: string
}

export const normalizeSuggestionText = (value: string) => value.trim().toLocaleLowerCase('pl-PL')

const pickBetterDisplayText = (currentText: string, nextText: string) => {
  if (!currentText) {
    return nextText
  }

  if (!nextText) {
    return currentText
  }

  if (nextText.length > currentText.length) {
    return nextText
  }

  return currentText
}

export const buildDescriptionSuggestions = (
  transactions: { description: string | null; category_id: string }[]
): DescriptionSuggestionSet => {
  const globalMap: Record<string, SuggestionAccumulator> = {}
  const byCategoryMap: Record<string, Record<string, SuggestionAccumulator>> = {}

  transactions.forEach((transaction) => {
    const rawDescription = transaction.description?.trim()

    if (!rawDescription) {
      return
    }

    const normalizedDescription = normalizeSuggestionText(rawDescription)

    if (!globalMap[normalizedDescription]) {
      globalMap[normalizedDescription] = {
        count: 0,
        text: rawDescription,
      }
    } else {
      globalMap[normalizedDescription].text = pickBetterDisplayText(
        globalMap[normalizedDescription].text,
        rawDescription
      )
    }

    globalMap[normalizedDescription].count += 1

    if (!byCategoryMap[transaction.category_id]) {
      byCategoryMap[transaction.category_id] = {}
    }

    if (!byCategoryMap[transaction.category_id][normalizedDescription]) {
      byCategoryMap[transaction.category_id][normalizedDescription] = {
        count: 0,
        text: rawDescription,
      }
    } else {
      byCategoryMap[transaction.category_id][normalizedDescription].text = pickBetterDisplayText(
        byCategoryMap[transaction.category_id][normalizedDescription].text,
        rawDescription
      )
    }

    byCategoryMap[transaction.category_id][normalizedDescription].count += 1
  })

  const sortMap = (map: Record<string, SuggestionAccumulator>) =>
    Object.values(map)
      .map(({ text, count }) => ({ text, count }))
      .sort((left, right) => {
        if (right.count !== left.count) {
          return right.count - left.count
        }

        return left.text.localeCompare(right.text, 'pl', { sensitivity: 'base' })
      })

  return {
    global: sortMap(globalMap),
    byCategory: Object.fromEntries(
      Object.entries(byCategoryMap).map(([categoryId, map]) => [categoryId, sortMap(map)])
    ),
  }
}

export const getBaseDescriptionSuggestions = (
  descriptionSuggestions: DescriptionSuggestionSet,
  categoryId: string | null | undefined
) => {
  const categorySuggestions = categoryId ? descriptionSuggestions.byCategory[categoryId] || [] : []

  if (categoryId) {
    return categorySuggestions
  }

  return descriptionSuggestions.global
}

const addHiddenSuggestionText = (items: string[], suggestionText: string) => {
  const normalizedSuggestionText = normalizeSuggestionText(suggestionText)

  if (!normalizedSuggestionText) {
    return items
  }

  if (items.includes(normalizedSuggestionText)) {
    return items
  }

  return [...items, normalizedSuggestionText]
}

const removeHiddenSuggestionText = (items: string[], suggestionText: string) => {
  const normalizedSuggestionText = normalizeSuggestionText(suggestionText)

  if (!normalizedSuggestionText) {
    return items
  }

  return items.filter((item) => item !== normalizedSuggestionText)
}

const hasCategorySpecificSuggestions = (
  descriptionSuggestions: DescriptionSuggestionSet,
  categoryId: string | null | undefined
) => {
  if (!categoryId) {
    return false
  }

  return (descriptionSuggestions.byCategory[categoryId] || []).length > 0
}

const filterSuggestionsByHiddenTexts = (
  suggestions: DescriptionSuggestion[],
  hiddenTexts: string[]
) => {
  if (hiddenTexts.length === 0) {
    return suggestions
  }

  const hiddenSet = new Set(hiddenTexts)

  return suggestions.filter((suggestion) => !hiddenSet.has(normalizeSuggestionText(suggestion.text)))
}

export const hideDescriptionSuggestion = (
  hiddenSuggestions: HiddenDescriptionSuggestionSet,
  descriptionSuggestions: DescriptionSuggestionSet,
  suggestionText: string,
  categoryId: string | null | undefined
): HiddenDescriptionSuggestionSet => {
  if (hasCategorySpecificSuggestions(descriptionSuggestions, categoryId) && categoryId) {
    return {
      global: hiddenSuggestions.global,
      byCategory: {
        ...hiddenSuggestions.byCategory,
        [categoryId]: addHiddenSuggestionText(
          hiddenSuggestions.byCategory[categoryId] || [],
          suggestionText
        ),
      },
    }
  }

  return {
    global: addHiddenSuggestionText(hiddenSuggestions.global, suggestionText),
    byCategory: hiddenSuggestions.byCategory,
  }
}

export const restoreHiddenDescriptionSuggestion = (
  hiddenSuggestions: HiddenDescriptionSuggestionSet,
  suggestionText: string,
  categoryId: string | null | undefined
): HiddenDescriptionSuggestionSet => {
  const nextByCategory = categoryId
    ? {
        ...hiddenSuggestions.byCategory,
        [categoryId]: removeHiddenSuggestionText(
          hiddenSuggestions.byCategory[categoryId] || [],
          suggestionText
        ),
      }
    : hiddenSuggestions.byCategory

  return {
    global: removeHiddenSuggestionText(hiddenSuggestions.global, suggestionText),
    byCategory: nextByCategory,
  }
}

export const filterHiddenDescriptionSuggestions = (
  descriptionSuggestions: DescriptionSuggestionSet,
  hiddenSuggestions: HiddenDescriptionSuggestionSet
): DescriptionSuggestionSet => {
  return {
    global: filterSuggestionsByHiddenTexts(descriptionSuggestions.global, hiddenSuggestions.global),
    byCategory: Object.fromEntries(
      Object.entries(descriptionSuggestions.byCategory).map(([categoryId, suggestions]) => [
        categoryId,
        filterSuggestionsByHiddenTexts(suggestions, hiddenSuggestions.byCategory[categoryId] || []),
      ])
    ),
  }
}

export const removeDescriptionSuggestion = (
  descriptionSuggestions: DescriptionSuggestionSet,
  suggestionText: string,
  categoryId: string | null | undefined
): DescriptionSuggestionSet => {
  const normalizedSuggestionText = normalizeSuggestionText(suggestionText)

  return {
    global: descriptionSuggestions.global.filter(
      (suggestion) => normalizeSuggestionText(suggestion.text) !== normalizedSuggestionText
    ),
    byCategory: Object.fromEntries(
      Object.entries(descriptionSuggestions.byCategory).map(([currentCategoryId, suggestions]) => {
        if (!categoryId || currentCategoryId === categoryId) {
          return [
            currentCategoryId,
            suggestions.filter(
              (suggestion) => normalizeSuggestionText(suggestion.text) !== normalizedSuggestionText
            ),
          ]
        }

        return [currentCategoryId, suggestions]
      })
    ),
  }
}

export const filterDescriptionSuggestions = (
  suggestions: DescriptionSuggestion[],
  query: string,
  limit = 5
) => {
  const normalizedQuery = normalizeSuggestionText(query)

  if (normalizedQuery.length < 2) {
    return []
  }

  return suggestions
    .filter((suggestion) => normalizeSuggestionText(suggestion.text).startsWith(normalizedQuery))
    .slice(0, limit)
}
