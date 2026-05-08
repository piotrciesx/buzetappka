import { useCallback, useState } from 'react'
import { toggleLevel1Calendar as toggleLevel1CalendarHelper } from './calendarPageHelpers'

type UseBudgetTreeUiStateParams = {
  initialOpenLevel1Id: string | null
}

export function useBudgetTreeUiState({ initialOpenLevel1Id }: UseBudgetTreeUiStateParams) {
  void initialOpenLevel1Id

  const [openLevel1Ids, setOpenLevel1Ids] = useState<string[]>([])
  const [openLevel1CalendarIds, setOpenLevel1CalendarIds] = useState<string[]>([])
  const [openLevel2Ids, setOpenLevel2Ids] = useState<string[]>([])
  const [openLevel3Ids, setOpenLevel3Ids] = useState<string[]>([])

  const resetTreeOpenState = useCallback((nextOpenLevel1Id: string | null) => {
    void nextOpenLevel1Id

    setOpenLevel1Ids([])
    setOpenLevel2Ids([])
    setOpenLevel3Ids([])
  }, [])

  const toggleLevel1 = useCallback((id: string) => {
    setOpenLevel1Ids((prev) => {
      const isClosing = prev.includes(id)

      if (isClosing) {
        setOpenLevel2Ids([])
        setOpenLevel3Ids([])
        return []
      }

      setOpenLevel2Ids([])
      setOpenLevel3Ids([])
      return [id]
    })
  }, [])

  const toggleLevel2 = useCallback((id: string) => {
    setOpenLevel2Ids((prev) => {
      const isClosing = prev.includes(id)

      setOpenLevel3Ids([])

      if (isClosing) {
        return []
      }

      return [id]
    })
  }, [])

  const toggleLevel3 = useCallback((id: string) => {
    setOpenLevel3Ids((prev) => {
      if (prev.includes(id)) {
        return []
      }

      return [id]
    })
  }, [])

  const toggleLevel1Calendar = useCallback((level1Id: string) => {
    setOpenLevel1CalendarIds((prev) => toggleLevel1CalendarHelper(prev, level1Id))
  }, [])

  return {
    openLevel1Ids,
    openLevel1CalendarIds,
    openLevel2Ids,
    openLevel3Ids,
    setOpenLevel1Ids,
    setOpenLevel1CalendarIds,
    setOpenLevel2Ids,
    setOpenLevel3Ids,
    resetTreeOpenState,
    toggleLevel1,
    toggleLevel2,
    toggleLevel3,
    toggleLevel1Calendar,
  }
}
