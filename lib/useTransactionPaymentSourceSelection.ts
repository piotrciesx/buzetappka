import { SetStateAction, useCallback, useMemo } from 'react'
import { PaymentSource } from './budgetPageTypes'
import { getPaymentSourceOptionLabel } from './paymentSources'

type PaymentSourceSettings = {
  defaultIncomePaymentSourceId: string | null
  defaultExpensePaymentSourceId: string | null
  showIncomePaymentSource: boolean
  showExpensePaymentSource: boolean
}

type PaymentSourceOption = {
  id: string
  name: string
  type: string
  optionLabel?: string
}

type UseTransactionPaymentSourceSelectionParams = {
  expenseLevel1Id: string | null
  incomeLevel1Id: string | null
  paymentSources: PaymentSource[]
  paymentSourceOptions: PaymentSourceOption[]
  incomePaymentSourceOptions: PaymentSourceOption[]
  expensePaymentSourceOptions: PaymentSourceOption[]
  paymentSourceSettings: PaymentSourceSettings
  selectedTransactionTypeId: string | null
  transactionCreatorLockedLevel1Id: string | null
  getRootLevel1IdForCategory: (categoryId: string) => string | null
  setSelectedPaymentSourceId: (value: string) => void
  setSelectedTransactionTypeId: (value: string | null) => void
}

export function useTransactionPaymentSourceSelection({
  expenseLevel1Id,
  incomeLevel1Id,
  paymentSources,
  paymentSourceOptions,
  incomePaymentSourceOptions,
  expensePaymentSourceOptions,
  paymentSourceSettings,
  selectedTransactionTypeId,
  transactionCreatorLockedLevel1Id,
  getRootLevel1IdForCategory,
  setSelectedPaymentSourceId,
  setSelectedTransactionTypeId,
}: UseTransactionPaymentSourceSelectionParams) {
  const bankSearchPaymentSourceOptions = useMemo(() => {
    return paymentSources
      .map((source) => ({
        id: source.id,
        label: getPaymentSourceOptionLabel(source),
      }))
      .sort((left, right) => left.label.localeCompare(right.label, 'pl'))
  }, [paymentSources])

  const getPaymentSourceKindForLevel1Id = useCallback(
    (level1Id: string | null) => {
      if (!level1Id) {
        return null
      }

      if (incomeLevel1Id && level1Id === incomeLevel1Id) {
        return 'income' as const
      }

      if (expenseLevel1Id && level1Id === expenseLevel1Id) {
        return 'expense' as const
      }

      return null
    },
    [expenseLevel1Id, incomeLevel1Id]
  )

  const getPaymentSourceOptionsForCategoryId = useCallback(
    (categoryId: string) => {
      const rootLevel1Id = getRootLevel1IdForCategory(categoryId)
      const kind = getPaymentSourceKindForLevel1Id(rootLevel1Id)

      if (kind === 'income') {
        return incomePaymentSourceOptions
      }

      if (kind === 'expense') {
        return expensePaymentSourceOptions
      }

      return paymentSourceOptions
    },
    [
      expensePaymentSourceOptions,
      getPaymentSourceKindForLevel1Id,
      getRootLevel1IdForCategory,
      incomePaymentSourceOptions,
      paymentSourceOptions,
    ]
  )

  const currentTransactionCreatorKind = useMemo(() => {
    return getPaymentSourceKindForLevel1Id(
      transactionCreatorLockedLevel1Id || selectedTransactionTypeId
    )
  }, [
    getPaymentSourceKindForLevel1Id,
    selectedTransactionTypeId,
    transactionCreatorLockedLevel1Id,
  ])

  const currentTransactionCreatorPaymentSourceOptions = useMemo(() => {
    if (currentTransactionCreatorKind === 'income') {
      return incomePaymentSourceOptions
    }

    if (currentTransactionCreatorKind === 'expense') {
      return expensePaymentSourceOptions
    }

    return []
  }, [currentTransactionCreatorKind, expensePaymentSourceOptions, incomePaymentSourceOptions])

  const currentTransactionCreatorDefaultPaymentSourceId = useMemo(() => {
    if (currentTransactionCreatorKind === 'income') {
      return paymentSourceSettings.defaultIncomePaymentSourceId
    }

    if (currentTransactionCreatorKind === 'expense') {
      return paymentSourceSettings.defaultExpensePaymentSourceId
    }

    return null
  }, [currentTransactionCreatorKind, paymentSourceSettings])

  const isTransactionCreatorPaymentSourceVisible = useMemo(() => {
    if (currentTransactionCreatorKind === 'income') {
      return paymentSourceSettings.showIncomePaymentSource
    }

    if (currentTransactionCreatorKind === 'expense') {
      return paymentSourceSettings.showExpensePaymentSource
    }

    return false
  }, [currentTransactionCreatorKind, paymentSourceSettings])

  const getDefaultPaymentSourceIdForLevel1Id = useCallback(
    (level1Id: string | null) => {
      const kind = getPaymentSourceKindForLevel1Id(level1Id)

      if (kind === 'income') {
        return paymentSourceSettings.showIncomePaymentSource
          ? paymentSourceSettings.defaultIncomePaymentSourceId || ''
          : ''
      }

      if (kind === 'expense') {
        return paymentSourceSettings.showExpensePaymentSource
          ? paymentSourceSettings.defaultExpensePaymentSourceId || ''
          : ''
      }

      return ''
    },
    [getPaymentSourceKindForLevel1Id, paymentSourceSettings]
  )

  const setSelectedTransactionTypeIdWithPaymentSource = useCallback(
    (value: SetStateAction<string | null>) => {
      const nextValue =
        typeof value === 'function' ? value(selectedTransactionTypeId) : value

      setSelectedTransactionTypeId(nextValue)
      setSelectedPaymentSourceId(getDefaultPaymentSourceIdForLevel1Id(nextValue))
    },
    [
      getDefaultPaymentSourceIdForLevel1Id,
      selectedTransactionTypeId,
      setSelectedPaymentSourceId,
      setSelectedTransactionTypeId,
    ]
  )

  return {
    bankSearchPaymentSourceOptions,
    getPaymentSourceKindForLevel1Id,
    getPaymentSourceOptionsForCategoryId,
    currentTransactionCreatorKind,
    currentTransactionCreatorPaymentSourceOptions,
    currentTransactionCreatorDefaultPaymentSourceId,
    isTransactionCreatorPaymentSourceVisible,
    setSelectedTransactionTypeIdWithPaymentSource,
  }
}