import { Category, Transaction } from './budgetPageTypes'
import { isCategoryVisibleInMonth } from './categoryUtils'
import { getTransactionMonth } from './transactionDomain'

export function isAllowedMoveTarget(
  transaction: Transaction,
  targetCategoryId: string,
  categories: Category[],
  categoriesById: Record<string, Category>,
  getRootLevel1IdForCategory: (categoryId: string) => string | null
) {
  const sourceCategory = categoriesById[transaction.category_id]
  const targetCategory = categoriesById[targetCategoryId]

  if (!sourceCategory || !targetCategory) {
    return false
  }

  if (sourceCategory.id === targetCategory.id) {
    return false
  }

  if (targetCategory.level === 1) {
    return false
  }

  if (targetCategory.level === 2) {
    const hasLevel3Children = categories.some(
      (category) => category.parent_id === targetCategory.id && category.level === 3
    )

    if (hasLevel3Children) {
      return false
    }
  }

  if (targetCategory.level !== 2 && targetCategory.level !== 3) {
    return false
  }

  const sourceRootId = getRootLevel1IdForCategory(sourceCategory.id)
  const targetRootId = getRootLevel1IdForCategory(targetCategory.id)

  if (!sourceRootId || !targetRootId || sourceRootId !== targetRootId) {
    return false
  }

  const transactionMonth = getTransactionMonth(transaction)

  if (!isCategoryVisibleInMonth(targetCategory, transactionMonth)) {
    return false
  }

  return true
}
