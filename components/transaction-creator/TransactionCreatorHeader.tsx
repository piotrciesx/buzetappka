import { CSSProperties } from 'react'
import { Category } from './transactionCreatorTypes'
import { getCategoryPathLabel } from './transactionCreatorUtils'
import CategoryIcon from '../CategoryIcon'
import { HeroHeader, IconAction } from '../ui/FoundationPrimitives'

type Props = {
  selectedMonth: string
  suggestedCategoryId: string | null
  lockedLevel1Id: string | null
  categoriesById: Record<string, Category>
  styles: Record<string, CSSProperties>
  onClose: () => void
}

export default function TransactionCreatorHeader({
  selectedMonth,
  suggestedCategoryId,
  lockedLevel1Id,
  categoriesById,
  onClose,
}: Props) {
  return (
    <>
      <HeroHeader
        variant="creator"
        density="comfort"
        tone="brand-primary"
        icon={<CategoryIcon iconKey="pen" />}
        title="Nowy wpis"
        description={`Miesiąc zapisu: ${selectedMonth}`}
        closeAction={
          <IconAction ariaLabel="Zamknij kreator wpisu" onClick={onClose} density="comfort">
            <CategoryIcon iconKey="close" />
          </IconAction>
        }
      />

      {suggestedCategoryId && (
        <div data-ui-empty-block="true" data-transaction-header-note="true">
          <strong>Sugestia kategorii</strong>
          <span>{getCategoryPathLabel(suggestedCategoryId, categoriesById)}</span>
        </div>
      )}
    </>
  )
}
