import { useCallback } from 'react'
import { Category, Transaction } from './budgetPageTypes'
import { FinalImportRow } from './importExportUtils'
import { supabase } from './supabaseClient'
import { setTransactionTags } from './tagUtils'

type UseBudgetPageActionsParams = {
  profileId: string
  selectedMonth: string
  guardMonthUnlocked: (monthText: string, actionLabel: string) => boolean
  categories: Category[]
  transactions: Transaction[]
  isPaymentSourcesEnabled: boolean
  newSubcategoryName: string
  setOpenAddSubcategoryFor: (value: string | null) => void
  setNewSubcategoryName: (value: string) => void
  loadData: () => Promise<void>
}

const normalizeName = (value: string) => value.trim().toLocaleLowerCase('pl')

const getCategoryKindLabel = (level: number) => (level === 3 ? 'podkategoria' : 'kategoria')

export function useBudgetPageActions({
  profileId,
  selectedMonth,
  guardMonthUnlocked,
  categories,
  transactions,
  isPaymentSourcesEnabled,
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
        payment_source_id: isPaymentSourcesEnabled ? row.payment_source_id || null : null,
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

        if (isPaymentSourcesEnabled && insertedRow?.id && importRow?.payment_splits?.length) {
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
    [guardMonthUnlocked, isPaymentSourcesEnabled, loadData, profileId, selectedMonth]
  )

  const handleAddSubcategory = useCallback(
    async (parentId: string) => {
      const cleanName = newSubcategoryName.trim()
      const parent = categories.find((category) => category.id === parentId)

      if (!cleanName) {
        alert('Podaj nazwę.')
        return
      }

      if (!parent || (parent.level !== 1 && parent.level !== 2)) {
        alert('Nową kategorię można dodać tylko pod kategorię główną albo kategorię.')
        return
      }

      const nextLevel = parent.level + 1
      const hasDuplicate = categories.some(
        (category) =>
          category.parent_id === parentId && normalizeName(category.name) === normalizeName(cleanName)
      )

      if (hasDuplicate) {
        alert('Kategoria o takiej nazwie już istnieje w tym miejscu.')
        return
      }

      const nextSortOrder =
        categories
          .filter((category) => category.level === nextLevel && category.parent_id === parentId)
          .reduce((maxValue, category) => {
            const currentValue = typeof category.sort_order === 'number' ? category.sort_order : 0
            return Math.max(maxValue, currentValue)
          }, 0) + 1

      const { error } = await supabase.from('categories').insert([
        {
          name: cleanName,
          parent_id: parentId,
          level: nextLevel,
          profile_id: profileId,
          sort_order: nextSortOrder,
          is_active: true,
        },
      ])

      if (error) {
        alert(`Błąd zapisu: ${error.message}`)
        return
      }

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

  const handleRenameCategory = useCallback(
    async (categoryId: string) => {
      const category = categories.find((item) => item.id === categoryId)

      if (!category) {
        alert('Nie znaleziono kategorii.')
        return
      }

      if (category.level === 1) {
        alert('Nie można zmieniać nazwy kategorii głównej.')
        return
      }

      const categoryKind = getCategoryKindLabel(category.level)
      const nextName = prompt(`Podaj nową nazwę (${categoryKind}):`, category.name)?.trim()

      if (!nextName || nextName === category.name) {
        return
      }

      const hasDuplicate = categories.some(
        (item) =>
          item.id !== category.id &&
          item.parent_id === category.parent_id &&
          normalizeName(item.name) === normalizeName(nextName)
      )

      if (hasDuplicate) {
        alert('Kategoria o takiej nazwie już istnieje w tym miejscu.')
        return
      }

      const hasTransactions = transactions.some((transaction) => transaction.category_id === category.id)
      const confirmed = confirm(
        `Czy na pewno zmienić nazwę (${categoryKind}) "${category.name}" na "${nextName}"?`
      )

      if (!confirmed) {
        return
      }

      if (hasTransactions) {
        const confirmedHistory = confirm(
          'Ta kategoria ma aktywne wpisy. Zmiana nazwy wpłynie na nazwę widoczną w historii, ale nie usunie wpisów i nie zmieni ich category_id. Czy na pewno?'
        )

        if (!confirmedHistory) {
          return
        }
      }

      const { error } = await supabase
        .from('categories')
        .update({ name: nextName })
        .eq('id', category.id)
        .eq('profile_id', profileId)

      if (error) {
        alert(`Błąd zmiany nazwy: ${error.message}`)
        return
      }

      await loadData()
    },
    [categories, loadData, profileId, transactions]
  )

  const handleDeleteCategory = useCallback(
    async (categoryId: string) => {
      const category = categories.find((item) => item.id === categoryId)

      if (!category) {
        alert('Nie znaleziono kategorii.')
        return
      }

      if (category.level === 1) {
        alert('Nie można usuwać kategorii głównej.')
        return
      }

      const categoryKind = getCategoryKindLabel(category.level)

      if (categories.some((item) => item.parent_id === category.id)) {
        alert('Nie można usunąć kategorii, która ma podkategorie.')
        return
      }

      if (transactions.some((transaction) => transaction.category_id === category.id)) {
        alert(`Nie można usunąć tej ${categoryKind}, bo ma aktywne wpisy.`)
        return
      }

      const confirmed = confirm(`Czy na pewno usunąć pustą ${categoryKind} "${category.name}"?`)

      if (!confirmed) {
        return
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', category.id)
        .eq('profile_id', profileId)

      if (error) {
        alert(`Błąd usuwania kategorii: ${error.message}`)
        return
      }

      await loadData()
    },
    [categories, loadData, profileId, transactions]
  )

  return {
    handleImportTransactions,
    handleAddSubcategory,
    handleRenameCategory,
    handleDeleteCategory,
  }
}
