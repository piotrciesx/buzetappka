import { getCategoryPathLabel } from './budgetPageHelpers'
import { Category, Transaction, TransactionShortcut } from './budgetPageTypes'

export const getAddableTransactionCategoryIds = (visibleCategories: Category[]) => {
  return new Set(
    visibleCategories
      .filter((category) => category.level >= 1 && category.level <= 3)
      .filter((category) => {
        const hasVisibleChildren = visibleCategories.some((item) => item.parent_id === category.id)
        return !hasVisibleChildren
      })
      .map((category) => category.id)
  )
}

export const getTransactionCategoryPathLabels = (
  addableTransactionCategoryIds: Set<string>,
  categoriesById: Record<string, Category>
) => {
  const nextLabels: Record<string, string> = {}

  for (const categoryId of addableTransactionCategoryIds) {
    nextLabels[categoryId] = getCategoryPathLabel(categoryId, categoriesById)
  }

  return nextLabels
}

export const getAddableTransactionCategoryRootIds = (
  addableTransactionCategoryIds: Set<string>,
  categoriesById: Record<string, Category>
) => {
  const nextRootIds: Record<string, string> = {}

  for (const categoryId of addableTransactionCategoryIds) {
    let currentCategory = categoriesById[categoryId]

    while (currentCategory?.parent_id) {
      currentCategory = categoriesById[currentCategory.parent_id]
    }

    const rootId = currentCategory?.level === 1 ? currentCategory.id : null

    if (rootId) {
      nextRootIds[categoryId] = rootId
    }
  }

  return nextRootIds
}

export const getTopTransactionShortcutCategoriesByType = (
  transactions: Transaction[],
  addableTransactionCategoryRootIds: Record<string, string>,
  transactionCategoryPathLabels: Record<string, string>
) => {
  const groupedStats: Record<string, Record<string, { count: number; latestIndex: number }>> = {}

  for (const [index, transaction] of transactions.entries()) {
    const rootId = addableTransactionCategoryRootIds[transaction.category_id]

    if (!rootId) {
      continue
    }

    if (!groupedStats[rootId]) {
      groupedStats[rootId] = {}
    }

    if (!groupedStats[rootId][transaction.category_id]) {
      groupedStats[rootId][transaction.category_id] = { count: 0, latestIndex: index }
    }

    groupedStats[rootId][transaction.category_id].count += 1
    groupedStats[rootId][transaction.category_id].latestIndex = Math.min(
      groupedStats[rootId][transaction.category_id].latestIndex,
      index
    )
  }

  return Object.entries(groupedStats).reduce<Record<string, TransactionShortcut[]>>(
    (acc, [rootId, stats]) => {
      acc[rootId] = Object.entries(stats)
        .filter(([categoryId]) => Boolean(transactionCategoryPathLabels[categoryId]))
        .sort((a, b) => {
          if (b[1].count !== a[1].count) {
            return b[1].count - a[1].count
          }

          if (a[1].latestIndex !== b[1].latestIndex) {
            return a[1].latestIndex - b[1].latestIndex
          }

          return transactionCategoryPathLabels[a[0]].localeCompare(
            transactionCategoryPathLabels[b[0]],
            'pl',
            { sensitivity: 'base' }
          )
        })
        .slice(0, 4)
        .map(([categoryId]) => ({
          id: categoryId,
          label: transactionCategoryPathLabels[categoryId],
        }))

      return acc
    },
    {}
  )
}

export const getRecentTransactionShortcutCategoriesByType = (
  transactions: Transaction[],
  addableTransactionCategoryRootIds: Record<string, string>,
  transactionCategoryPathLabels: Record<string, string>
) => {
  const groupedRecent: Record<string, TransactionShortcut[]> = {}
  const seenByType: Record<string, Set<string>> = {}

  for (const transaction of transactions) {
    const rootId = addableTransactionCategoryRootIds[transaction.category_id]

    if (!rootId) {
      continue
    }

    if (!transactionCategoryPathLabels[transaction.category_id]) {
      continue
    }

    if (!groupedRecent[rootId]) {
      groupedRecent[rootId] = []
      seenByType[rootId] = new Set<string>()
    }

    if (groupedRecent[rootId].length === 4) {
      continue
    }

    if (seenByType[rootId].has(transaction.category_id)) {
      continue
    }

    seenByType[rootId].add(transaction.category_id)
    groupedRecent[rootId].push({
      id: transaction.category_id,
      label: transactionCategoryPathLabels[transaction.category_id],
    })

    if (groupedRecent[rootId].length === 4) {
      continue
    }
  }

  return groupedRecent
}