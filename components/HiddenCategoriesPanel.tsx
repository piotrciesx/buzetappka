import { CSSProperties } from 'react'
import { Category } from '../lib/budgetPageTypes'

type Props = {
  categories: Category[]
  categoriesById: Record<string, Category>
  showHiddenCategories: boolean
  getHiddenCategoryLabel: (category: Category, categoriesById: Record<string, Category>) => string
  handleRestoreCategory: (categoryId: string, mode: 'now' | 'next') => Promise<void>
  styles: Record<string, CSSProperties>
}

export default function HiddenCategoriesPanel(props: Props) {
  const {
    categories,
    categoriesById,
    showHiddenCategories,
    getHiddenCategoryLabel,
    handleRestoreCategory,
    styles,
  } = props

  if (!showHiddenCategories) {
    return null
  }

  if (categories.length === 0) {
    return (
      <div style={styles.topPanel}>
        <div style={styles.sectionTitle}>Ukryte kategorie w tym miesiącu</div>
        <div style={styles.emptyStateCard}>
          Brak ukrytych kategorii w wybranym miesiącu
        </div>
      </div>
    )
  }

  return (
    <div style={styles.topPanel}>
      <div style={styles.sectionTitle}>Ukryte kategorie w tym miesiącu</div>

      <div style={styles.transactionsBox}>
        {categories.map((category) => (
          <div key={category.id} style={styles.transactionRow}>
            <div style={styles.transactionLeft}>
              <div style={styles.amountText}>{getHiddenCategoryLabel(category, categoriesById)}</div>

              <div style={styles.dateText}>
                ukryta od: {category.active_to ? category.active_to.slice(0, 7) : '-'}
              </div>

              <div style={styles.dateText}>
                wróci od:{' '}
                {category.reactivate_from ? category.reactivate_from.slice(0, 7) : 'nie ustawiono'}
              </div>
            </div>

            <div style={styles.actions}>
              <button
                style={styles.secondaryButton}
                onClick={async () => {
                  await handleRestoreCategory(category.id, 'now')
                }}
              >
                przywróć teraz
              </button>

              <button
                style={styles.secondaryButton}
                onClick={async () => {
                  await handleRestoreCategory(category.id, 'next')
                }}
              >
                przywróć od następnego
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
