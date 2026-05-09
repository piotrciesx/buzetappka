import type { CSSProperties } from 'react'

const descriptionStyle: CSSProperties = {
  margin: 0,
  color: '#64748b',
  fontSize: 12,
  lineHeight: 1.4,
}

type FinancialGoalsHeaderProps = {
  styles: Record<string, CSSProperties>
}

export default function FinancialGoalsHeader(_props: FinancialGoalsHeaderProps) {
  return (
    <div style={descriptionStyle}>
        Start celu ustawiamy na miesiąc utworzenia. Nadwyżka dodatnia jest rozdzielana według
        aktywnego trybu z konfiguracją dziedziczoną od wybranego miesiąca do przodu, bez zmiany
        historii wcześniejszych miesięcy.
    </div>
  )
}
