import { CSSProperties } from 'react'

type Props = {
  selectedLevel1Id: string | null
  effectiveCategoryId: string | null
  isSerialModeEnabled: boolean
  setIsSerialModeEnabled: (value: boolean) => void
  styles: Record<string, CSSProperties>
}

export default function TransactionCreatorModeToggles({
  selectedLevel1Id,
  effectiveCategoryId,
  styles,
}: Props) {
  if (selectedLevel1Id && effectiveCategoryId) {
    return null
  }

  return (
    <div style={styles.emptyText} data-transaction-save-hint="true">
      Aby zapisać wpis, wybierz najniższą dostępną kategorię.
    </div>
  )
}
