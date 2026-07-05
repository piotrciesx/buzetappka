import {
  Category,
  PaymentSource,
  PaymentMethodType,
  Transaction,
  TransactionPaymentSplit,
} from './budgetPageTypes'
import {
  isUiIconKey,
  normalizeUiColorKey,
  type UiColorKey,
  type UiIconKey,
} from './userAppearance'

export const PAYMENT_SOURCE_TYPE_LABELS = {
  cash: 'Gotówka',
  card: 'Karta',
  account: 'Konto',
  other: 'Inne',
} as const

export const PAYMENT_METHOD_TYPE_OPTIONS: ReadonlyArray<{
  value: PaymentMethodType
  label: string
  description: string
  iconKey: UiIconKey
}> = [
  { value: 'cash', label: 'Gotówka', description: 'Płatności gotówkowe.', iconKey: 'cash' },
  { value: 'card', label: 'Karta', description: 'Karta fizyczna, mobilna, online i subskrypcje.', iconKey: 'card' },
  { value: 'bank_transfer', label: 'Przelew / konto bankowe', description: 'Przelewy i płatności bezpośrednio z konta.', iconKey: 'bank' },
  { value: 'quick_payment', label: 'BLIK / szybka płatność', description: 'BLIK, PayU, Przelewy24 i podobne płatności.', iconKey: 'exchange' },
  { value: 'gift_card', label: 'Karta podarunkowa / voucher', description: 'Bony, vouchery i karty podarunkowe.', iconKey: 'gift' },
  { value: 'app_wallet', label: 'Aplikacja / portfel', description: 'Saldo aplikacji albo portfela.', iconKey: 'wallet' },
  { value: 'other', label: 'Inne', description: 'Inna forma płatności.', iconKey: 'more' },
]

export const normalizePaymentMethodType = (value: unknown): PaymentMethodType =>
  PAYMENT_METHOD_TYPE_OPTIONS.some((option) => option.value === value)
    ? (value as PaymentMethodType)
    : 'other'

export const getPaymentMethodTypeOption = (value: unknown) =>
  PAYMENT_METHOD_TYPE_OPTIONS.find((option) => option.value === normalizePaymentMethodType(value))!

export const DEFAULT_PAYMENT_SOURCE_ICON: Record<PaymentSource['type'], UiIconKey> = {
  cash: 'cash',
  card: 'card',
  account: 'bank',
  other: 'more',
}

export const DEFAULT_PAYMENT_SOURCE_EMOJI = DEFAULT_PAYMENT_SOURCE_ICON

export const DEFAULT_PAYMENT_SOURCE_COLOR: Record<PaymentSource['type'], UiColorKey> = {
  cash: 'green',
  card: 'blue',
  account: 'teal',
  other: 'slate',
}

export type PaymentSourceStats = {
  sourceId: string
  incomeTotal: number
  expenseTotal: number
  transactionCount: number
  lastUsedAt: string | null
}

export type PaymentSourceSortMode =
  | 'manual'
  | 'transactions_count_desc'
  | 'expenses_amount_desc'
  | 'income_amount_desc'
  | 'last_used_desc'
  | 'name_asc'

export const PAYMENT_SOURCE_SORT_OPTIONS: ReadonlyArray<{ value: PaymentSourceSortMode; label: string }> = [
  { value: 'manual', label: 'Moja kolejność' },
  { value: 'transactions_count_desc', label: 'Najczęściej używane' },
  { value: 'expenses_amount_desc', label: 'Największe wydatki' },
  { value: 'income_amount_desc', label: 'Największe przychody' },
  { value: 'last_used_desc', label: 'Ostatnio używane' },
  { value: 'name_asc', label: 'Nazwa A-Z' },
]

export type PaymentSourceViewModel = {
  source: PaymentSource
  method: ReturnType<typeof getPaymentMethodTypeOption>
  stats: PaymentSourceStats
  transactionSharePercent: number
  expenseSharePercent: number
  incomeSharePercent: number
  isArchived: boolean
}

export const buildPaymentSourceViewModel = ({ source, stats, totals }: {
  source: PaymentSource
  stats: PaymentSourceStats
  totals: Pick<PaymentSourceStats, 'incomeTotal' | 'expenseTotal' | 'transactionCount'>
}): PaymentSourceViewModel => {
  const share = (value: number, total: number) => total > 0 ? (value / total) * 100 : 0
  return {
    source,
    method: getPaymentMethodTypeOption(source.payment_method_type),
    stats,
    transactionSharePercent: share(stats.transactionCount, totals.transactionCount),
    expenseSharePercent: share(stats.expenseTotal, totals.expenseTotal),
    incomeSharePercent: share(stats.incomeTotal, totals.incomeTotal),
    isArchived: Boolean(source.archived_at),
  }
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

export const getPaymentSourceIconKey = (source: PaymentSource): UiIconKey => {
  return isUiIconKey(source.emoji) ? source.emoji : DEFAULT_PAYMENT_SOURCE_ICON[source.type]
}

export const getPaymentSourceColorTone = (source: PaymentSource): UiColorKey => {
  return normalizeUiColorKey(source.color, DEFAULT_PAYMENT_SOURCE_COLOR[source.type])
}

export const getPaymentSourceEmoji = getPaymentSourceIconKey

export const getPaymentSourceColor = getPaymentSourceColorTone

export const getPaymentSourceBadgeLabel = (source: PaymentSource) => {
  return source.name
}

export const getPaymentSourceOptionLabel = (source: PaymentSource) => {
  return `${source.name} • ${getPaymentSourceTypeLabel(source.type)}`
}

export const normalizePaymentSourceEmoji = (value: string, type: PaymentSource['type']) => {
  return isUiIconKey(value.trim()) ? value.trim() : DEFAULT_PAYMENT_SOURCE_ICON[type]
}

export const normalizePaymentSourceColor = (value: string, type: PaymentSource['type']) => {
  return normalizeUiColorKey(value, DEFAULT_PAYMENT_SOURCE_COLOR[type])
}

export const isPaymentSourceVisibleForKind = (
  source: PaymentSource,
  kind: PaymentSourceListKind | null
) => {
  if (source.archived_at) {
    return false
  }

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
      lastUsedAt: null,
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
      if (!stats.lastUsedAt || transaction.date > stats.lastUsedAt) {
        stats.lastUsedAt = transaction.date
      }

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
