import { CSSProperties } from 'react'
import { serialToggleStyle } from './transactionCreatorModalStyles'

type Props = {
  selectedLevel1Id: string | null
  effectiveCategoryId: string | null
  isSerialModeEnabled: boolean
  setIsSerialModeEnabled: (value: boolean) => void
  isQuickDayModeEnabled: boolean
  setIsQuickDayModeEnabled: (value: boolean) => void
  transactionDate: string
  setQuickDayDate: (value: string) => void
  styles: Record<string, CSSProperties>
}

export default function TransactionCreatorModeToggles({
  selectedLevel1Id,
  effectiveCategoryId,
  isSerialModeEnabled,
  setIsSerialModeEnabled,
  isQuickDayModeEnabled,
  setIsQuickDayModeEnabled,
  transactionDate,
  setQuickDayDate,
  styles,
}: Props) {
  return (
    <>
      <label style={serialToggleStyle} data-transaction-entry-toggle="true">
        <input
          type="checkbox"
          checked={isSerialModeEnabled}
          onChange={(event) => setIsSerialModeEnabled(event.target.checked)}
        />
        dodawaj seryjnie
      </label>

      <label style={serialToggleStyle} data-transaction-entry-toggle="true">
        <input
          type="checkbox"
          checked={isQuickDayModeEnabled}
          onChange={(event) => {
            setIsQuickDayModeEnabled(event.target.checked)
            if (event.target.checked) {
              setQuickDayDate(transactionDate)
            }
          }}
        />
        tryb szybkiego dnia
      </label>

      {(!selectedLevel1Id || !effectiveCategoryId) && (
        <div style={styles.emptyText} data-transaction-save-hint="true">
          Aby zapisać wpis, wybierz typ oraz najniższą dostępną kategorię.
        </div>
      )}
    </>
  )
}
