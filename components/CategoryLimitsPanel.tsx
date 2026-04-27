'use client'

import { CSSProperties, useMemo, useState } from 'react'
import { Category, CategoryMonthlyLimit } from '../lib/budgetPageTypes'

type Props = {
  selectedMonth: string
  categories: Category[]
  limits: CategoryMonthlyLimit[]
  categoryTotalsById: Record<string, number>
  onSaveLimit: (categoryId: string, limitAmount: number) => Promise<void>
  styles: Record<string, CSSProperties>
}

export default function CategoryLimitsPanel({
  selectedMonth,
  categories,
  limits,
  categoryTotalsById,
  onSaveLimit,
  styles,
}: Props) {
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [limitAmount, setLimitAmount] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const finalCategories = useMemo(() => {
    const categoryIdsWithChildren = new Set(categories.map((category) => category.parent_id).filter(Boolean))
    return categories
      .filter((category) => !categoryIdsWithChildren.has(category.id))
      .sort((left, right) => left.name.localeCompare(right.name, 'pl'))
  }, [categories])

  const limitsByCategoryId = useMemo(() => {
    return limits.reduce<Record<string, CategoryMonthlyLimit>>((acc, item) => {
      acc[item.category_id] = item
      return acc
    }, {})
  }, [limits])

  return (
    <section style={styles.topPanel}>
      <div style={styles.sectionTitle}>Limity miesięczne kategorii</div>
      <div style={styles.pageSubtitle}>
        Ustawiasz limit dla miesiąca {selectedMonth}. Ostrzeżenie pojawia się przy 80%, a przekroczenie
        przy 100%, ale wpisy nadal można dodawać.
      </div>

      <div style={{ ...styles.formRow, alignItems: 'flex-start' }}>
        <select
          style={styles.input}
          value={selectedCategoryId}
          onChange={(event) => setSelectedCategoryId(event.target.value)}
        >
          <option value="">Wybierz kategorię końcową</option>
          {finalCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <input
          style={styles.smallInput}
          inputMode="decimal"
          placeholder="limit"
          value={limitAmount}
          onChange={(event) => setLimitAmount(event.target.value.replace(',', '.'))}
        />

        <button
          type="button"
          style={styles.primaryButton}
          disabled={isSaving || !selectedCategoryId || !limitAmount}
          onClick={async () => {
            setIsSaving(true)

            try {
              await onSaveLimit(selectedCategoryId, Number(limitAmount))
              setSelectedCategoryId('')
              setLimitAmount('')
            } finally {
              setIsSaving(false)
            }
          }}
        >
          {isSaving ? 'Zapisywanie...' : 'Zapisz limit'}
        </button>
      </div>

      <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
        {limits.length === 0 ? (
          <div style={styles.emptyStateCard}>Brak ustawionych limitów dla tego miesiąca.</div>
        ) : (
          limits.map((limit) => {
            const category = categories.find((item) => item.id === limit.category_id)
            const total = Math.abs(categoryTotalsById[limit.category_id] || 0)
            const percentage = limit.limit_amount > 0 ? (total / limit.limit_amount) * 100 : 0
            const status =
              percentage >= 100 ? 'przekroczenie' : percentage >= 80 ? 'ostrzeżenie' : 'w normie'

            return (
              <div key={limit.id} style={styles.infoBox}>
                <b>{category?.name || 'Kategoria'}</b> • limit {limit.limit_amount.toFixed(2)} zł •
                wykorzystanie {total.toFixed(2)} zł ({percentage.toFixed(1)}%) • {status}
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
