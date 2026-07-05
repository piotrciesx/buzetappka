import type {
  BudgetLimitCategoryNode,
  BudgetLimitScope,
  BudgetLimitTransactionCandidate,
} from './types'

export type BudgetLimitScopeDecision = {
  result: 'included' | 'excluded' | 'unknown'
  reason:
    | 'included'
    | 'deleted'
    | 'not_expense'
    | 'unstable_semantic_type'
    | 'category_not_in_scope'
    | 'category_metadata_missing'
}

const included: BudgetLimitScopeDecision = { result: 'included', reason: 'included' }

export const getBudgetLimitScopeDecision = ({
  transaction,
  scope,
  categoriesById,
}: {
  transaction: BudgetLimitTransactionCandidate
  scope: BudgetLimitScope
  categoriesById: Readonly<Record<string, BudgetLimitCategoryNode>>
}): BudgetLimitScopeDecision => {
  if (transaction.isDeleted) return { result: 'excluded', reason: 'deleted' }
  if (transaction.rootType !== 'expense') return { result: 'excluded', reason: 'not_expense' }

  const semanticType = transaction.semanticType ?? 'standard'
  if (semanticType !== 'standard') {
    return { result: 'unknown', reason: 'unstable_semantic_type' }
  }

  if (scope.type === 'global_expenses') return included

  const category = categoriesById[transaction.categoryId]
  if (!category) return { result: 'unknown', reason: 'category_metadata_missing' }

  if (scope.type === 'category_l3') {
    const scopeCategory = categoriesById[scope.categoryId]
    if (!scopeCategory || scopeCategory.level !== 3) {
      return { result: 'unknown', reason: 'category_metadata_missing' }
    }
    return transaction.categoryId === scope.categoryId && category.level === 3
      ? included
      : { result: 'excluded', reason: 'category_not_in_scope' }
  }

  if (scope.type === 'category_l2') {
    const scopeCategory = categoriesById[scope.categoryId]
    if (!scopeCategory || scopeCategory.level !== 2) {
      return { result: 'unknown', reason: 'category_metadata_missing' }
    }
    const matches =
      transaction.categoryId === scope.categoryId ||
      (category.level === 3 && category.parentId === scope.categoryId)
    return matches ? included : { result: 'excluded', reason: 'category_not_in_scope' }
  }

  return scope.categoryIds.includes(transaction.categoryId)
    ? included
    : { result: 'excluded', reason: 'category_not_in_scope' }
}

export const isTransactionIncludedInBudgetLimitScope = (input: {
  transaction: BudgetLimitTransactionCandidate
  scope: BudgetLimitScope
  categoriesById: Readonly<Record<string, BudgetLimitCategoryNode>>
}) => getBudgetLimitScopeDecision(input).result === 'included'
