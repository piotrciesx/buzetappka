import { useCallback } from 'react'
import { Category } from './budgetPageTypes'
import { FinalImportRow } from './importExportUtils'
import { supabase } from './supabaseClient'
import { setTransactionTags } from './tagUtils'

type UseBudgetPageActionsParams = {
  profileId: string
  selectedMonth: string
  guardMonthUnlocked: (monthText: string, actionLabel: string) => boolean
  categories: Category[]
  newSubcategoryName: string
  setOpenAddSubcategoryFor: (value: string | null) => void
  setNewSubcategoryName: (value: string) => void
  loadData: () => Promise<void>
}

export function useBudgetPageActions({
  profileId,
  selectedMonth,
  guardMonthUnlocked,
  categories,
  newSubcategoryName,
  setOpenAddSubcategoryFor,
  setNewSubcategoryName,
  loadData,
}: UseBudgetPageActionsParams) {
  const handleImportTransactions = useCallback(
    async (rows: FinalImportRow[]) => {
      if (!guardMonthUnlocked(selectedMonth, 'import CSV')) {
        throw new Error(`Import jest zablokowany, bo miesiąc ${selectedMonth} jest zamknięty.`)
      }

      if (rows.length === 0) {
        alert('Brak poprawnych wierszy do importu.')
        return
      }

      const rowsToInsert = rows.map((row) => ({
        profile_id: profileId,
        category_id: row.category_id,
        amount: row.amount,
        description: row.description || null,
        date: row.date,
        day_is_null: row.day_is_null,
        payment_source_id: row.payment_source_id || null,
        is_deleted: false,
      }))

      const { data: insertedRows, error } = await supabase
        .from('transactions')
        .insert(rowsToInsert)
        .select('id')

      if (error) {
        throw new Error(`Błąd importu: ${error.message}`)
      }

      for (let index = 0; index < (insertedRows || []).length; index += 1) {
        const insertedRow = insertedRows?.[index] as { id?: string } | undefined
        const importRow = rows[index]

        if (insertedRow?.id && importRow?.tag_names?.length) {
          await setTransactionTags(supabase, profileId, insertedRow.id, importRow.tag_names)
        }

        if (insertedRow?.id && importRow?.payment_splits?.length) {
          const { error: splitInsertError } = await supabase.from('transaction_payment_splits').insert(
            importRow.payment_splits.map((split) => ({
              transaction_id: insertedRow.id,
              payment_source_id: split.payment_source_id,
              amount: split.amount,
            }))
          )

          if (splitInsertError) {
            throw new Error(`Błąd importu splitu płatności: ${splitInsertError.message}`)
          }
        }
      }

      await loadData()
    },
    [guardMonthUnlocked, loadData, profileId, selectedMonth]
  )

  const handleAddSubcategory = useCallback(
    async (level2Id: string) => {
      const cleanName = newSubcategoryName.trim()

      if (!cleanName) {
        alert('Podaj nazwę')
        return
      }

      const nextSortOrder =
        categories
          .filter((category) => category.level === 3 && category.parent_id === level2Id)
          .reduce((maxValue, category) => {
            const currentValue = typeof category.sort_order === 'number' ? category.sort_order : 0
            return Math.max(maxValue, currentValue)
          }, 0) + 1

      const { error } = await supabase.from('categories').insert([
        {
          name: cleanName,
          parent_id: level2Id,
          level: 3,
          profile_id: profileId,
          sort_order: nextSortOrder,
          is_active: true,
        },
      ])

      if (error) {
        alert(`Błąd zapisu: ${error.message}`)
        return
      }

      alert('Podkategoria dodana')
      setOpenAddSubcategoryFor(null)
      setNewSubcategoryName('')
      await loadData()
    },
    [
      categories,
      loadData,
      newSubcategoryName,
      profileId,
      setNewSubcategoryName,
      setOpenAddSubcategoryFor,
    ]
  )

  return {
    handleImportTransactions,
    handleAddSubcategory,
  }
}
