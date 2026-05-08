import { normalizeAmountInput } from './budgetPageHelpers'
import { Transaction, TransactionPaymentSplit } from './budgetPageTypes'

export type PaymentSplitInput = {
  paymentSourceId: string
  amount: string
}

type PaymentSourceOption = {
  id: string
  name: string
  optionLabel?: string
}

export const parsePaymentSplitAmount = (value: string) => {
  const parsed = Number(normalizeAmountInput(value))
  return Number.isFinite(parsed) ? parsed : null
}

export const formatPaymentSplitAmount = (value: number) => {
  return value.toFixed(2)
}

export const createPaymentSplitItemsFromSingleSource = (
  paymentSourceId: string,
  totalAmountText: string
): PaymentSplitInput[] => {
  const totalAmount = parsePaymentSplitAmount(totalAmountText)

  return [
    {
      paymentSourceId,
      amount: totalAmount !== null && totalAmount > 0 ? formatPaymentSplitAmount(totalAmount) : '',
    },
    {
      paymentSourceId: '',
      amount: '',
    },
  ]
}

const getBalanceIndex = (items: PaymentSplitInput[], changedIndex: number) => {
  if (items.length <= 1) {
    return -1
  }

  const lastIndex = items.length - 1

  if (changedIndex !== lastIndex) {
    return lastIndex
  }

  return 0
}

export const rebalancePaymentSplitAmounts = (
  items: PaymentSplitInput[],
  changedIndex: number,
  nextAmountText: string,
  totalAmountText: string
) => {
  const nextItems = items.map((item, index) =>
    index === changedIndex
      ? {
          ...item,
          amount: normalizeAmountInput(nextAmountText),
        }
      : { ...item }
  )
  const totalAmount = parsePaymentSplitAmount(totalAmountText)

  if (totalAmount === null || totalAmount <= 0 || nextItems.length <= 1) {
    return nextItems
  }

  const balanceIndex = getBalanceIndex(nextItems, changedIndex)

  if (balanceIndex < 0) {
    return nextItems
  }

  let fixedSum = 0

  nextItems.forEach((item, index) => {
    if (index === balanceIndex) {
      return
    }

    const amount = parsePaymentSplitAmount(item.amount)
    fixedSum += amount && amount > 0 ? amount : 0
  })

  const remainingAmount = totalAmount - fixedSum
  nextItems[balanceIndex] = {
    ...nextItems[balanceIndex],
    amount: remainingAmount > 0 ? formatPaymentSplitAmount(remainingAmount) : '',
  }

  return nextItems
}

export const createPaymentSplitItemsFromStoredSplits = (splits: TransactionPaymentSplit[]) => {
  return splits.map((split) => ({
    paymentSourceId: split.payment_source_id,
    amount: formatPaymentSplitAmount(split.amount),
  }))
}

export const getPaymentSplitValidationErrors = (
  totalAmountText: string,
  items: PaymentSplitInput[]
) => {
  if (items.length <= 1) {
    return []
  }

  const totalAmount = parsePaymentSplitAmount(totalAmountText)

  if (totalAmount === null || totalAmount <= 0) {
    return ['Kwota transakcji musi być większa od zera']
  }

  const errors: string[] = []
  let sum = 0

  items.forEach((item, index) => {
    const amount = parsePaymentSplitAmount(item.amount)

    if (!item.paymentSourceId) {
      errors.push(`Uzupełnij źródło płatności ${index + 1}`)
      return
    }

    if (amount === null) {
      errors.push(`Uzupełnij kwotę źródła ${index + 1}`)
      return
    }

    if (amount <= 0) {
      errors.push(`Kwota źródła ${index + 1} musi być większa od zera`)
      return
    }

    if (amount >= totalAmount) {
      errors.push(
        `Kwota źródła ${index + 1} nie może być równa ani większa od całej transakcji`
      )
    }

    sum += amount
  })

  if (Math.abs(sum - totalAmount) > 0.01) {
    errors.push('Suma splitu musi zgadzać się z kwotą transakcji')
  }

  return [...new Set(errors)]
}

export const buildPaymentSplitPayload = ({
  totalAmountText,
  selectedPaymentSourceId,
  splitItems,
}: {
  totalAmountText: string
  selectedPaymentSourceId: string
  splitItems: PaymentSplitInput[]
}) => {
  const shouldTreatAsLegacyAdditionalItems =
    splitItems.length > 0 &&
    !!selectedPaymentSourceId &&
    splitItems[0]?.paymentSourceId !== selectedPaymentSourceId
  const effectiveSplitItems = shouldTreatAsLegacyAdditionalItems
    ? [
        {
          paymentSourceId: selectedPaymentSourceId,
          amount: '',
        },
        ...splitItems,
      ]
    : splitItems

  if (shouldTreatAsLegacyAdditionalItems) {
    const totalAmount = parsePaymentSplitAmount(totalAmountText)
    const additionalAmount = splitItems.reduce((sum, item) => {
      const amount = parsePaymentSplitAmount(item.amount)
      return sum + (amount && amount > 0 ? amount : 0)
    }, 0)

    effectiveSplitItems[0] = {
      paymentSourceId: selectedPaymentSourceId,
      amount:
        totalAmount !== null && totalAmount - additionalAmount > 0
          ? formatPaymentSplitAmount(totalAmount - additionalAmount)
          : '',
    }
  }

  if (effectiveSplitItems.length <= 1) {
    return {
      paymentSourceId: selectedPaymentSourceId || null,
      splitRows: [] as Array<{ payment_source_id: string; amount: number }>,
      errors: [],
    }
  }

  const errors = getPaymentSplitValidationErrors(totalAmountText, effectiveSplitItems)
  const splitRows =
    errors.length === 0
      ? effectiveSplitItems.map((item) => ({
          payment_source_id: item.paymentSourceId,
          amount: parsePaymentSplitAmount(item.amount) || 0,
        }))
      : []

  return {
    paymentSourceId: effectiveSplitItems[0]?.paymentSourceId || selectedPaymentSourceId || null,
    splitRows,
    errors,
  }
}

export const getPaymentSourceLabelById = (
  paymentSourceId: string,
  paymentSourceOptions: PaymentSourceOption[]
) => {
  const paymentSource = paymentSourceOptions.find((item) => item.id === paymentSourceId)
  return paymentSource?.optionLabel || paymentSource?.name || null
}

export const getTransactionPaymentSourceDisplayLines = ({
  transaction,
  splitItems,
  paymentSourceOptions,
}: {
  transaction: Pick<Transaction, 'payment_source_id'>
  splitItems?: TransactionPaymentSplit[]
  paymentSourceOptions: PaymentSourceOption[]
}) => {
  if (splitItems && splitItems.length > 1) {
    return splitItems
      .map((split) => {
        const label = getPaymentSourceLabelById(split.payment_source_id, paymentSourceOptions)

        if (!label) {
          return null
        }

        return `${label}: ${formatPaymentSplitAmount(split.amount)} zł`
      })
      .filter((item): item is string => Boolean(item))
  }

  if (!transaction.payment_source_id) {
    return []
  }

  const label = getPaymentSourceLabelById(transaction.payment_source_id, paymentSourceOptions)
  return label ? [label] : []
}
