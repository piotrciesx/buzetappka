import type { CSSProperties } from 'react'

type FinancialGoalsHeaderProps = {
  styles: Record<string, CSSProperties>
}

export default function FinancialGoalsHeader({ styles }: FinancialGoalsHeaderProps) {
  return (
    <>
      <div style={styles.sectionTitle}>Cele finansowe</div>
      <div style={styles.pageSubtitle}>
        Start celu ustawiamy na miesiąc utworzenia. Nadwyżka dodatnia jest rozdzielana według
        aktywnego trybu z konfiguracją dziedziczoną od wybranego miesiąca do przodu, bez zmiany
        historii wcześniejszych miesięcy.
      </div>
    </>
  )
}
