import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  DescriptionSuggestion,
  filterHiddenDescriptionSuggestions,
  HiddenDescriptionSuggestionSet,
  hideDescriptionSuggestion,
  restoreHiddenDescriptionSuggestion,
} from './suggestionUtils'

type UseHiddenDescriptionSuggestionsParams = {
  profileId: string
  baseDescriptionSuggestions: {
    global: DescriptionSuggestion[]
    byCategory: Record<string, DescriptionSuggestion[]>
  }
}

export function useHiddenDescriptionSuggestions({
  profileId,
  baseDescriptionSuggestions,
}: UseHiddenDescriptionSuggestionsParams) {
  const hiddenSuggestionsStorageKey = `budget-hidden-description-suggestions-${profileId}`

  const [hiddenDescriptionSuggestions, setHiddenDescriptionSuggestions] =
    useState<HiddenDescriptionSuggestionSet>(() => {
      if (typeof window === 'undefined') {
        return {
          global: [],
          byCategory: {},
        }
      }

      try {
        const rawValue = window.localStorage.getItem(hiddenSuggestionsStorageKey)

        if (!rawValue) {
          return {
            global: [],
            byCategory: {},
          }
        }

        const parsedValue = JSON.parse(rawValue) as HiddenDescriptionSuggestionSet

        return {
          global: Array.isArray(parsedValue.global)
            ? parsedValue.global.filter((item): item is string => typeof item === 'string')
            : [],
          byCategory:
            parsedValue.byCategory && typeof parsedValue.byCategory === 'object'
              ? Object.fromEntries(
                  Object.entries(parsedValue.byCategory).map(([categoryId, values]) => [
                    categoryId,
                    Array.isArray(values)
                      ? values.filter((item): item is string => typeof item === 'string')
                      : [],
                  ])
                )
              : {},
        }
      } catch {
        return {
          global: [],
          byCategory: {},
        }
      }
    })

  const descriptionSuggestions = useMemo(
    () =>
      filterHiddenDescriptionSuggestions(baseDescriptionSuggestions, hiddenDescriptionSuggestions),
    [baseDescriptionSuggestions, hiddenDescriptionSuggestions]
  )

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(
      hiddenSuggestionsStorageKey,
      JSON.stringify(hiddenDescriptionSuggestions)
    )
  }, [hiddenDescriptionSuggestions, hiddenSuggestionsStorageKey])

  const handleDeleteDescriptionSuggestion = useCallback(
    (categoryId: string | null | undefined, suggestion: { text: string }) => {
      setHiddenDescriptionSuggestions((prev) =>
        hideDescriptionSuggestion(prev, baseDescriptionSuggestions, suggestion.text, categoryId)
      )
    },
    [baseDescriptionSuggestions]
  )

  const restoreDescriptionSuggestion = useCallback(
    (descriptionText: string, categoryId: string | null | undefined) => {
      if (!descriptionText.trim()) {
        return
      }

      setHiddenDescriptionSuggestions((prev) =>
        restoreHiddenDescriptionSuggestion(prev, descriptionText, categoryId)
      )
    },
    []
  )

  return {
    descriptionSuggestions,
    handleDeleteDescriptionSuggestion,
    restoreDescriptionSuggestion,
  }
}