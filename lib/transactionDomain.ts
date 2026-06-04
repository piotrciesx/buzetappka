import type { Category, Transaction } from './budgetPageTypes'
import { getAmountNumber } from './transactionUtils'

export type RootCategoryType = 'income' | 'expense' | 'unknown'

export type BudgetRootCategoryIds = {
  incomeLevel1Id: string | null
  expenseLevel1Id: string | null
}

type RootCategoryTypeOptions = BudgetRootCategoryIds

type TransactionRootTypeOptions = RootCategoryTypeOptions & {
  categoriesById: Record<string, Category>
}

type CategoryRootContract = Category & {
  root_type?: string | null
  rootType?: string | null
  kind?: string | null
  type?: string | null
  category_type?: string | null
}

const normalizeRootCategoryName = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const readRootCategoryTypeContract = (category: Category): Exclude<RootCategoryType, 'unknown'> | null => {
  const source = category as CategoryRootContract
  const rawType = String(
    source.root_type ?? source.rootType ?? source.kind ?? source.type ?? source.category_type ?? ''
  ).toLowerCase()

  if (rawType === 'income' || rawType === 'incomes') {
    return 'income'
  }

  if (rawType === 'expense' || rawType === 'expenses') {
    return 'expense'
  }

  const normalizedName = normalizeRootCategoryName(category.name)

  if (normalizedName === 'przychody' || normalizedName === 'przychod') {
    return 'income'
  }

  if (normalizedName === 'wydatki' || normalizedName === 'wydatek') {
    return 'expense'
  }

  return null
}

const compareRootContractOrder = (left: Category, right: Category) => {
  const leftDefaultOrder = left.default_order ?? Number.MAX_SAFE_INTEGER
  const rightDefaultOrder = right.default_order ?? Number.MAX_SAFE_INTEGER

  if (leftDefaultOrder !== rightDefaultOrder) {
    return leftDefaultOrder - rightDefaultOrder
  }

  const leftSortOrder = left.sort_order ?? Number.MAX_SAFE_INTEGER
  const rightSortOrder = right.sort_order ?? Number.MAX_SAFE_INTEGER

  if (leftSortOrder !== rightSortOrder) {
    return leftSortOrder - rightSortOrder
  }

  return left.id.localeCompare(right.id)
}

export const getTransactionMonth = (transaction: Pick<Transaction, 'date'>) => {
  return typeof transaction.date === 'string' ? transaction.date.slice(0, 7) : ''
}

export const isActiveTransaction = (transaction: Pick<Transaction, 'is_deleted'>) => {
  return transaction.is_deleted !== true
}

export const isTransactionInMonth = (
  transaction: Pick<Transaction, 'date'>,
  selectedMonth: string
) => {
  return getTransactionMonth(transaction) === selectedMonth
}

export const isDaylessTransaction = (transaction: Pick<Transaction, 'day_is_null'>) => {
  return Boolean(transaction.day_is_null)
}

export const getTransactionDay = (transaction: Pick<Transaction, 'date' | 'day_is_null'>) => {
  if (isDaylessTransaction(transaction)) {
    return null
  }

  const day = Number(transaction.date.slice(8, 10))
  return Number.isFinite(day) && day > 0 ? day : null
}

export const hasConcreteTransactionDay = (
  transaction: Pick<Transaction, 'date' | 'day_is_null'>
) => getTransactionDay(transaction) !== null

export const splitTransactionsByDayPresence = <T extends Pick<Transaction, 'date' | 'day_is_null'>>(
  transactions: T[]
) => {
  return transactions.reduce<{ withDay: T[]; withoutDay: T[] }>(
    (acc, transaction) => {
      if (isDaylessTransaction(transaction)) {
        acc.withoutDay.push(transaction)
      } else {
        acc.withDay.push(transaction)
      }

      return acc
    },
    { withDay: [], withoutDay: [] }
  )
}

export const bucketTransactionsByConcreteDay = <
  T extends Pick<Transaction, 'date' | 'day_is_null'>
>(
  transactions: T[]
) => {
  return transactions.reduce<Record<string, T[]>>((acc, transaction) => {
    const day = getTransactionDay(transaction)

    if (day === null) {
      return acc
    }

    const dayKey = String(day).padStart(2, '0')

    if (!acc[dayKey]) {
      acc[dayKey] = []
    }

    acc[dayKey].push(transaction)
    return acc
  }, {})
}

export const getRootLevel1Category = (
  categoryId: string | null | undefined,
  categoriesById: Record<string, Category>
) => {
  if (!categoryId) {
    return null
  }

  let currentCategory = categoriesById[categoryId]

  while (currentCategory?.parent_id) {
    currentCategory = categoriesById[currentCategory.parent_id]
  }

  return currentCategory?.level === 1 ? currentCategory : null
}

export const getRootLevel1IdForCategory = (
  categoryId: string | null | undefined,
  categoriesById: Record<string, Category>
) => getRootLevel1Category(categoryId, categoriesById)?.id || null

export const getRootCategoryType = (
  rootLevel1Id: string | null | undefined,
  { incomeLevel1Id, expenseLevel1Id }: RootCategoryTypeOptions
): RootCategoryType => {
  if (rootLevel1Id && rootLevel1Id === incomeLevel1Id) {
    return 'income'
  }

  if (rootLevel1Id && rootLevel1Id === expenseLevel1Id) {
    return 'expense'
  }

  return 'unknown'
}

export const getTransactionRootType = (
  transaction: Pick<Transaction, 'category_id'>,
  { categoriesById, incomeLevel1Id, expenseLevel1Id }: TransactionRootTypeOptions
) => {
  const rootLevel1Id = getRootLevel1IdForCategory(transaction.category_id, categoriesById)
  return getRootCategoryType(rootLevel1Id, { incomeLevel1Id, expenseLevel1Id })
}

export const getSignedAmountByRootType = (
  transaction: Pick<Transaction, 'amount' | 'category_id'>,
  options: TransactionRootTypeOptions
) => {
  const amount = getAmountNumber(transaction.amount)
  const rootType = getTransactionRootType(transaction, options)

  if (rootType === 'income') {
    return amount
  }

  if (rootType === 'expense') {
    return amount * -1
  }

  return 0
}

export const getBudgetRootCategoryIds = (categories: Category[]): BudgetRootCategoryIds => {
  const level1 = categories.filter((category) => category.level === 1)
  const orderedRoots = [...level1].sort(compareRootContractOrder)
  const metadataIncomeRoot = level1.find((category) => readRootCategoryTypeContract(category) === 'income')
  const metadataExpenseRoot = level1.find((category) => readRootCategoryTypeContract(category) === 'expense')
  const incomeLevel1Id =
    metadataIncomeRoot?.id ??
    (metadataExpenseRoot ? orderedRoots.find((category) => category.id !== metadataExpenseRoot.id)?.id : null) ??
    null
  const expenseLevel1Id =
    metadataExpenseRoot?.id ??
    (metadataIncomeRoot ? orderedRoots.find((category) => category.id !== metadataIncomeRoot.id)?.id : null) ??
    null

  return {
    incomeLevel1Id,
    expenseLevel1Id,
  }
}
