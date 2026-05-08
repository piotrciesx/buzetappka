import {
  Category,
  PaymentSource,
  Transaction,
  TransactionPaymentSplit,
} from './budgetPageTypes'

export const PAYMENT_SOURCE_TYPE_LABELS = {
  cash: 'Gotówka',
  card: 'Karta',
  account: 'Konto',
  other: 'Inne',
} as const

export const DEFAULT_PAYMENT_SOURCE_EMOJI: Record<PaymentSource['type'], string> = {
  cash: '💵',
  card: '💳',
  account: '🏦',
  other: '🔹',
}

export const DEFAULT_PAYMENT_SOURCE_COLOR: Record<PaymentSource['type'], string> = {
  cash: '#16a34a',
  card: '#2563eb',
  account: '#7c3aed',
  other: '#475569',
}

export type PaymentSourceStats = {
  sourceId: string
  incomeTotal: number
  expenseTotal: number
  transactionCount: number
}

export type PaymentSourceListKind = 'income' | 'expense'

export const getPaymentSourceTypeLabel = (type: PaymentSource['type']) => {
  return PAYMENT_SOURCE_TYPE_LABELS[type]
}

export const getPaymentSourceEmoji = (source: PaymentSource) => {
  return source.emoji?.trim() || DEFAULT_PAYMENT_SOURCE_EMOJI[source.type]
}

export const getPaymentSourceColor = (source: PaymentSource) => {
  return source.color?.trim() || DEFAULT_PAYMENT_SOURCE_COLOR[source.type]
}

export const getPaymentSourceBadgeLabel = (source: PaymentSource) => {
  return `${getPaymentSourceEmoji(source)} ${source.name}`
}

export const getPaymentSourceOptionLabel = (source: PaymentSource) => {
  return `${getPaymentSourceBadgeLabel(source)} • ${getPaymentSourceTypeLabel(source.type)}`
}

export const normalizePaymentSourceEmoji = (value: string, type: PaymentSource['type']) => {
  return value.trim() || DEFAULT_PAYMENT_SOURCE_EMOJI[type]
}

export const normalizePaymentSourceColor = (value: string, type: PaymentSource['type']) => {
  return value.trim() || DEFAULT_PAYMENT_SOURCE_COLOR[type]
}

export const isPaymentSourceVisibleForKind = (
  source: PaymentSource,
  kind: PaymentSourceListKind | null
) => {
  if (kind === 'income') {
    return source.is_income_source !== false
  }

  if (kind === 'expense') {
    return source.is_expense_source !== false
  }

  return true
}

export const buildPaymentSourceStats = ({
  paymentSources,
  transactions,
  categoriesById,
  incomeLevel1Id,
  expenseLevel1Id,
  getRootLevel1IdForCategory,
  getAmountNumber,
  transactionPaymentSplitsMap = {},
}: {
  paymentSources: PaymentSource[]
  transactions: Transaction[]
  categoriesById: Record<string, Category>
  incomeLevel1Id: string | null
  expenseLevel1Id: string | null
  getRootLevel1IdForCategory: (categoryId: string) => string | null
  getAmountNumber: (value: unknown) => number
  transactionPaymentSplitsMap?: Record<string, TransactionPaymentSplit[]>
}) => {
  const statsById = paymentSources.reduce<Record<string, PaymentSourceStats>>((acc, source) => {
    acc[source.id] = {
      sourceId: source.id,
      incomeTotal: 0,
      expenseTotal: 0,
      transactionCount: 0,
    }
    return acc
  }, {})

  transactions.forEach((transaction) => {
    const rootLevel1Id = getRootLevel1IdForCategory(transaction.category_id)
    const amount = getAmountNumber(transaction.amount)
    const splitItems = transactionPaymentSplitsMap[transaction.id] || []

    const registerAmount = (sourceId: string, partialAmount: number) => {
      if (!sourceId || !statsById[sourceId] || partialAmount <= 0) {
        return
      }

      const stats = statsById[sourceId]
      stats.transactionCount += 1

      if (rootLevel1Id && incomeLevel1Id && rootLevel1Id === incomeLevel1Id) {
        stats.incomeTotal += partialAmount
        return
      }

      if (rootLevel1Id && expenseLevel1Id && rootLevel1Id === expenseLevel1Id) {
        stats.expenseTotal += partialAmount
        return
      }

      const category = categoriesById[transaction.category_id]

      if (!category) {
        stats.expenseTotal += partialAmount
      }
    }

    if (splitItems.length > 0) {
      splitItems.forEach((split) => {
        registerAmount(split.payment_source_id, split.amount)
      })
      return
    }

    if (transaction.payment_source_id) {
      registerAmount(transaction.payment_source_id, amount)
    }
  })

  return paymentSources.map((source) => statsById[source.id])
}
