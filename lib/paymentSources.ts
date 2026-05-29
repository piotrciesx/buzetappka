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

export type PaymentSourceAttributionItem = {
  paymentSourceId: string
  amount: number
  signedAmount: number
  isPrimary: boolean
}

type PaymentSourceSettings = {
  defaultIncomePaymentSourceId: string | null
  defaultExpensePaymentSourceId: string | null
  showIncomePaymentSource: boolean
  showExpensePaymentSource: boolean
}

type PaymentSourceDefaultOverride = {
  categoryId: string
  paymentSourceId: string | null
}

export const isPaymentSourcesEnabledForLogic = (isEnabled: boolean | null | undefined) => {
  return isEnabled === true
}

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

export const getPaymentSourceAttribution = ({
  transaction,
  splitItems = [],
  getSignedAmountForTransaction,
  getAmountNumber,
  isPaymentSourcesEnabled = true,
}: {
  transaction: Transaction
  splitItems?: TransactionPaymentSplit[]
  getSignedAmountForTransaction: (transaction: Transaction) => number
  getAmountNumber: (value: unknown) => number
  isPaymentSourcesEnabled?: boolean
}): PaymentSourceAttributionItem[] => {
  if (!isPaymentSourcesEnabledForLogic(isPaymentSourcesEnabled)) {
    return []
  }

  const signedAmount = getSignedAmountForTransaction(transaction)
  const sign = signedAmount >= 0 ? 1 : -1

  if (splitItems.length > 0) {
    const attributionBySource = new Map<string, PaymentSourceAttributionItem>()
    let primaryPaymentSourceId: string | null = null

    splitItems.forEach((split) => {
      if (!split.payment_source_id || split.amount <= 0) {
        return
      }

      if (!primaryPaymentSourceId) {
        primaryPaymentSourceId = split.payment_source_id
      }

      const current = attributionBySource.get(split.payment_source_id)

      if (current) {
        attributionBySource.set(split.payment_source_id, {
          ...current,
          amount: current.amount + split.amount,
          signedAmount: current.signedAmount + split.amount * sign,
        })
        return
      }

      attributionBySource.set(split.payment_source_id, {
        paymentSourceId: split.payment_source_id,
        amount: split.amount,
        signedAmount: split.amount * sign,
        isPrimary: split.payment_source_id === primaryPaymentSourceId,
      })
    })

    return [...attributionBySource.values()]
  }

  if (!transaction.payment_source_id) {
    return []
  }

  const amount = Math.abs(getAmountNumber(transaction.amount))

  if (amount <= 0) {
    return []
  }

  return [
    {
      paymentSourceId: transaction.payment_source_id,
      amount,
      signedAmount,
      isPrimary: true,
    },
  ]
}

export const getPrimaryPaymentSourceId = ({
  transaction,
  splitItems = [],
  isPaymentSourcesEnabled = true,
}: {
  transaction: Pick<Transaction, 'payment_source_id'>
  splitItems?: TransactionPaymentSplit[]
  isPaymentSourcesEnabled?: boolean
}) => {
  if (!isPaymentSourcesEnabledForLogic(isPaymentSourcesEnabled)) {
    return null
  }

  return splitItems[0]?.payment_source_id || transaction.payment_source_id || null
}

export const getDefaultPaymentSourceForTransaction = ({
  categoryId,
  settings,
  getRootLevel1IdForCategory,
  getPaymentSourceKindForLevel1Id,
  categoryOverrides = [],
  isPaymentSourcesEnabled = true,
}: {
  categoryId: string
  settings: PaymentSourceSettings
  getRootLevel1IdForCategory: (categoryId: string) => string | null
  getPaymentSourceKindForLevel1Id: (level1Id: string | null) => PaymentSourceListKind | null
  categoryOverrides?: PaymentSourceDefaultOverride[]
  isPaymentSourcesEnabled?: boolean
}) => {
  if (!isPaymentSourcesEnabledForLogic(isPaymentSourcesEnabled)) {
    return ''
  }

  const matchingOverride = [...categoryOverrides]
    .reverse()
    .find((override) => override.categoryId === categoryId)

  if (matchingOverride) {
    return matchingOverride.paymentSourceId || ''
  }

  const rootLevel1Id = getRootLevel1IdForCategory(categoryId)
  const kind = getPaymentSourceKindForLevel1Id(rootLevel1Id)

  if (kind === 'income') {
    return settings.showIncomePaymentSource ? settings.defaultIncomePaymentSourceId || '' : ''
  }

  if (kind === 'expense') {
    return settings.showExpensePaymentSource ? settings.defaultExpensePaymentSourceId || '' : ''
  }

  return ''
}

export const buildPaymentSourceStats = ({
  paymentSources,
  transactions,
  categoriesById,
  incomeLevel1Id,
  expenseLevel1Id,
  getRootLevel1IdForCategory,
  getAmountNumber,
  getSignedAmountForTransaction,
  transactionPaymentSplitsMap = {},
  isPaymentSourcesEnabled = true,
}: {
  paymentSources: PaymentSource[]
  transactions: Transaction[]
  categoriesById: Record<string, Category>
  incomeLevel1Id: string | null
  expenseLevel1Id: string | null
  getRootLevel1IdForCategory: (categoryId: string) => string | null
  getAmountNumber: (value: unknown) => number
  getSignedAmountForTransaction: (transaction: Transaction) => number
  transactionPaymentSplitsMap?: Record<string, TransactionPaymentSplit[]>
  isPaymentSourcesEnabled?: boolean
}) => {
  if (!isPaymentSourcesEnabledForLogic(isPaymentSourcesEnabled)) {
    return []
  }

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
    const attribution = getPaymentSourceAttribution({
      transaction,
      splitItems: transactionPaymentSplitsMap[transaction.id] || [],
      getSignedAmountForTransaction,
      getAmountNumber,
      isPaymentSourcesEnabled,
    })

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

    attribution.forEach((item) => {
      registerAmount(item.paymentSourceId, item.amount)
    })
  })

  return paymentSources.map((source) => statsById[source.id])
}
