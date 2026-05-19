import { CSSProperties } from 'react'
import { getUniqueCategoryLabel } from '../../lib/categoryUtils'
import { Category } from './transactionCreatorTypes'

export const getCategoryPathLabel = (
  categoryId: string,
  categoriesById: Record<string, Category>
) => {
  return getUniqueCategoryLabel(categoryId, categoriesById)
}

export const normalizeAmountInput = (value: string) => {
  return value.replace(',', '.')
}

export const compactCategoryButtonStyle: CSSProperties = {
  minHeight: 32,
  padding: '6px 10px',
  borderRadius: 10,
  fontSize: 13,
}
