import { RefObject, useCallback } from 'react'

type UseOpenSearchForTagParams = {
  searchPanelRef: RefObject<HTMLDivElement | null>
  setIsBankSearchOpen: (value: boolean) => void
  handleBankSearchFieldChange: (field: 'description' | 'tagIds', value: string | string[]) => void
}

export function useOpenSearchForTag({
  searchPanelRef,
  setIsBankSearchOpen,
  handleBankSearchFieldChange,
}: UseOpenSearchForTagParams) {
  const handleOpenSearchForTag = useCallback(
    (tagId: string) => {
      setIsBankSearchOpen(true)
      handleBankSearchFieldChange('description', '')
      handleBankSearchFieldChange('tagIds', [tagId])

      window.requestAnimationFrame(() => {
        window.setTimeout(() => {
          searchPanelRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
        }, 50)
      })
    },
    [handleBankSearchFieldChange, searchPanelRef, setIsBankSearchOpen]
  )

  return { handleOpenSearchForTag }
}