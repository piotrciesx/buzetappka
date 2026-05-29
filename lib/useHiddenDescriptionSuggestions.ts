import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  DescriptionSuggestion,
  filterHiddenDescriptionSuggestions,
  HiddenDescriptionSuggestionSet,
  hideDescriptionSuggestion,
  restoreHiddenDescriptionSuggestion,
} from './suggestionUtils'
import { getProfileStorageKey, readProfileStorageValue } from './profileStorage'

type UseHiddenDescriptionSuggestionsParams = {
  userId: string
  profileId: string
  baseDescriptionSuggestions: {
    global: DescriptionSuggestion[]
    byCategory: Record<string, DescriptionSuggestion[]>
  }
}

const emptyHiddenDescriptionSuggestions = (): HiddenDescriptionSuggestionSet => ({
  global: [],
  byCategory: {},
})

const normalizeHiddenDescriptionSuggestions = (rawValue: string | null) => {
  if (!rawValue) {
    return emptyHiddenDescriptionSuggestions()
  }

  try {
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
    return emptyHiddenDescriptionSuggestions()
  }
}

export function useHiddenDescriptionSuggestions({
  userId,
  profileId,
  baseDescriptionSuggestions,
}: UseHiddenDescriptionSuggestionsParams) {
  const legacyHiddenSuggestionsStorageKey = `budget-hidden-description-suggestions-${profileId}`
  const hiddenSuggestionsStorageKey = getProfileStorageKey({
    userId,
    profileId,
    featureKey: 'hidden-description-suggestions',
  })

  const readHiddenDescriptionSuggestions = useCallback(() => {
    if (typeof window === 'undefined') {
      return emptyHiddenDescriptionSuggestions()
    }

    return normalizeHiddenDescriptionSuggestions(
      readProfileStorageValue({
        storageKey: hiddenSuggestionsStorageKey,
        legacyStorageKeys: [legacyHiddenSuggestionsStorageKey],
      })
    )
  }, [hiddenSuggestionsStorageKey, legacyHiddenSuggestionsStorageKey])

  const [hiddenDescriptionSuggestionsState, setHiddenDescriptionSuggestionsState] = useState(() => ({
    storageKey: hiddenSuggestionsStorageKey,
    value: readHiddenDescriptionSuggestions(),
  }))
  const hiddenDescriptionSuggestions = hiddenDescriptionSuggestionsState.value

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setHiddenDescriptionSuggestionsState({
        storageKey: hiddenSuggestionsStorageKey,
        value: readHiddenDescriptionSuggestions(),
      })
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [hiddenSuggestionsStorageKey, readHiddenDescriptionSuggestions])

  const descriptionSuggestions = useMemo(
    () =>
      filterHiddenDescriptionSuggestions(baseDescriptionSuggestions, hiddenDescriptionSuggestions),
    [baseDescriptionSuggestions, hiddenDescriptionSuggestions]
  )

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      hiddenDescriptionSuggestionsState.storageKey !== hiddenSuggestionsStorageKey
    ) {
      return
    }

    window.localStorage.setItem(
      hiddenSuggestionsStorageKey,
      JSON.stringify(hiddenDescriptionSuggestions)
    )
  }, [
    hiddenDescriptionSuggestions,
    hiddenDescriptionSuggestionsState.storageKey,
    hiddenSuggestionsStorageKey,
  ])

  const handleDeleteDescriptionSuggestion = useCallback(
    (categoryId: string | null | undefined, suggestion: { text: string }) => {
      setHiddenDescriptionSuggestionsState((prev) => ({
        ...prev,
        value: hideDescriptionSuggestion(
          prev.value,
          baseDescriptionSuggestions,
          suggestion.text,
          categoryId
        ),
      }))
    },
    [baseDescriptionSuggestions]
  )

  const restoreDescriptionSuggestion = useCallback(
    (descriptionText: string, categoryId: string | null | undefined) => {
      if (!descriptionText.trim()) {
        return
      }

      setHiddenDescriptionSuggestionsState((prev) => ({
        ...prev,
        value: restoreHiddenDescriptionSuggestion(prev.value, descriptionText, categoryId),
      }))
    },
    []
  )

  return {
    descriptionSuggestions,
    handleDeleteDescriptionSuggestion,
    restoreDescriptionSuggestion,
  }
}
