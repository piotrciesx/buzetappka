import type { CSSProperties } from 'react'

type FinancialGoalsHeaderProps = {
  styles: Record<string, CSSProperties>
}

export default function FinancialGoalsHeader({ styles }: FinancialGoalsHeaderProps) {
  return (
    <>
      <div style={styles.sectionTitle}>Cele finansowe</div>
      <div style={styles.pageSubtitle}>
        Start celu ustawiamy na miesiÄ…c utworzenia. NadwyĹĽka dodatnia jest rozdzielana wedĹ‚ug
        aktywnego trybu z konfiguracjÄ… dziedziczonÄ… od wybranego miesiÄ…ca do przodu, bez zmiany
        historii wczeĹ›niejszych miesiÄ™cy.
      </div>
    </>
  )
}
