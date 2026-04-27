import {
  KeyboardEvent,
  MouseEvent,
  RefObject,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  DescriptionSuggestion,
  DescriptionSuggestionSet,
  filterDescriptionSuggestions,
  getBaseDescriptionSuggestions,
  normalizeSuggestionText,
} from './suggestionUtils'

type UseDescriptionSuggestionsParams = {
  query: string
  setQuery: (value: string) => void
  categoryId: string | null | undefined
  isEnabled?: boolean
  descriptionSuggestions?: DescriptionSuggestionSet
  inputRef?: RefObject<HTMLInputElement | null>
  onDeleteSuggestion?: (
    categoryId: string | null | undefined,
    suggestion: DescriptionSuggestion
  ) => void
}

export function useDescriptionSuggestions({
  query,
  setQuery,
  categoryId,
  isEnabled = true,
  descriptionSuggestions,
  inputRef,
  onDeleteSuggestion,
}: UseDescriptionSuggestionsParams) {
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1)
  const [closedQuery, setClosedQuery] = useState<string | null>(null)
  const [suggestionToDelete, setSuggestionToDelete] = useState<DescriptionSuggestion | null>(null)
  const [deletePromptPosition, setDeletePromptPosition] = useState({ x: 0, y: 0 })
  const holdTimeoutRef = useRef<number | null>(null)

  const baseSuggestions = useMemo(() => {
    if (!descriptionSuggestions) {
      return []
    }

    return getBaseDescriptionSuggestions(descriptionSuggestions, categoryId)
  }, [categoryId, descriptionSuggestions])

  const filteredSuggestions = useMemo(() => {
    const normalizedQuery = normalizeSuggestionText(query)

    if (!isEnabled || !normalizedQuery || normalizedQuery.length < 2) {
      return []
    }

    if (closedQuery === normalizedQuery) {
      return []
    }

    return filterDescriptionSuggestions(baseSuggestions, query)
  }, [baseSuggestions, closedQuery, isEnabled, query])

  const boundedActiveSuggestionIndex =
    filteredSuggestions.length === 0
      ? -1
      : activeSuggestionIndex < 0
        ? -1
        : Math.min(activeSuggestionIndex, filteredSuggestions.length - 1)

  const focusInput = () => {
    window.setTimeout(() => {
      inputRef?.current?.focus()
    }, 0)
  }

  const applySuggestion = (suggestionText: string) => {
    setQuery(suggestionText)
    setClosedQuery(normalizeSuggestionText(suggestionText))
    setActiveSuggestionIndex(-1)
    focusInput()
  }

  const openDeletePrompt = (
    suggestion: DescriptionSuggestion,
    position: { x: number; y: number }
  ) => {
    setSuggestionToDelete(suggestion)
    setDeletePromptPosition(position)
    setActiveSuggestionIndex(-1)
  }

  const closeDeletePrompt = () => {
    setSuggestionToDelete(null)
  }

  const confirmDeleteSuggestion = () => {
    if (!suggestionToDelete) {
      return
    }

    onDeleteSuggestion?.(categoryId, suggestionToDelete)
    setSuggestionToDelete(null)
    focusInput()
  }

  const clearHoldTimeout = () => {
    if (holdTimeoutRef.current !== null) {
      window.clearTimeout(holdTimeoutRef.current)
      holdTimeoutRef.current = null
    }
  }

  const handleSuggestionContextMenu = (
    event: MouseEvent<HTMLButtonElement>,
    suggestion: DescriptionSuggestion
  ) => {
    event.preventDefault()
    openDeletePrompt(suggestion, {
      x: event.clientX,
      y: event.clientY,
    })
  }

  const handleSuggestionPointerDown = (
    suggestion: DescriptionSuggestion,
    event?: MouseEvent<HTMLButtonElement>
  ) => {
    clearHoldTimeout()

    holdTimeoutRef.current = window.setTimeout(() => {
      openDeletePrompt(suggestion, {
        x: event?.clientX || window.innerWidth / 2,
        y: event?.clientY || window.innerHeight / 2,
      })
      holdTimeoutRef.current = null
    }, 550)
  }

  const handleSuggestionPointerUp = () => {
    clearHoldTimeout()
  }

  const handleSuggestionPointerLeave = () => {
    clearHoldTimeout()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      if (filteredSuggestions.length === 0) {
        return false
      }

      event.preventDefault()

      setActiveSuggestionIndex((prev) =>
        prev < 0 ? 0 : Math.min(prev + 1, filteredSuggestions.length - 1)
      )

      return true
    }

    if (event.key === 'ArrowUp') {
      if (filteredSuggestions.length === 0) {
        return false
      }

      event.preventDefault()

      setActiveSuggestionIndex((prev) => (prev <= 0 ? 0 : prev - 1))

      return true
    }

    if (event.key === 'Escape') {
      if (suggestionToDelete) {
        event.preventDefault()
        closeDeletePrompt()
        return true
      }

      if (filteredSuggestions.length === 0) {
        return false
      }

      event.preventDefault()
      setClosedQuery(normalizeSuggestionText(query))
      setActiveSuggestionIndex(-1)
      return true
    }

    if (
      event.key === 'Enter' &&
      filteredSuggestions.length > 0 &&
      boundedActiveSuggestionIndex >= 0 &&
      boundedActiveSuggestionIndex < filteredSuggestions.length
    ) {
      event.preventDefault()
      applySuggestion(filteredSuggestions[boundedActiveSuggestionIndex].text)
      return true
    }

    return false
  }

  return {
    filteredSuggestions,
    activeSuggestionIndex: boundedActiveSuggestionIndex,
    setActiveSuggestionIndex,
    applySuggestion,
    suggestionToDelete,
    deletePromptPosition,
    closeDeletePrompt,
    confirmDeleteSuggestion,
    handleKeyDown,
    handleSuggestionContextMenu,
    handleSuggestionPointerDown,
    handleSuggestionPointerUp,
    handleSuggestionPointerLeave,
  }
}
