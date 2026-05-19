'use client'

import { useCallback } from 'react'
import { getAmountNumber } from '../../lib/transactionUtils'
import { usePaymentSources } from '../../lib/usePaymentSources'
import { useTransactionPaymentSourceSelection } from '../../lib/useTransactionPaymentSourceSelection'

type Params = Record<string, any>

export function useBudgetAppPaymentSourcesBridge(ctx: Params) {
  const paymentSourcesApi = usePaymentSources({
    profileId: ctx.profileId,
    transactions: ctx.scopedTransactions,
    transactionPaymentSplitsMap: ctx.transactionPaymentSplitsMap,
    categoriesById: ctx.categoriesById,
    incomeLevel1Id: ctx.incomeLevel1Id,
    expenseLevel1Id: ctx.expenseLevel1Id,
    getRootLevel1IdForCategory: ctx.getRootLevel1IdForCategory,
    getAmountNumber,
    onDeletedSelectedPaymentSource: (paymentSourceId) => {
      if (ctx.selectedPaymentSourceId === paymentSourceId) {
        ctx.setSelectedPaymentSourceId('')
      }
    },
  })

  const selectionApi = useTransactionPaymentSourceSelection({
    expenseLevel1Id: ctx.expenseLevel1Id,
    incomeLevel1Id: ctx.incomeLevel1Id,
    paymentSources: ctx.isPaymentSourcesModuleEnabled ? paymentSourcesApi.paymentSources : [],
    paymentSourceOptions: ctx.isPaymentSourcesModuleEnabled ? paymentSourcesApi.paymentSourceOptions : [],
    incomePaymentSourceOptions: ctx.isPaymentSourcesModuleEnabled
      ? paymentSourcesApi.incomePaymentSourceOptions
      : [],
    expensePaymentSourceOptions: ctx.isPaymentSourcesModuleEnabled
      ? paymentSourcesApi.expensePaymentSourceOptions
      : [],
    paymentSourceSettings: ctx.isPaymentSourcesModuleEnabled
      ? paymentSourcesApi.paymentSourceSettings
      : {
          ...paymentSourcesApi.paymentSourceSettings,
          defaultIncomePaymentSourceId: null,
          defaultExpensePaymentSourceId: null,
          showIncomePaymentSource: false,
          showExpensePaymentSource: false,
        },
    selectedTransactionTypeId: ctx.selectedTransactionTypeId,
    transactionCreatorLockedLevel1Id: ctx.transactionCreatorLockedLevel1Id,
    getRootLevel1IdForCategory: ctx.getRootLevel1IdForCategory,
    setSelectedPaymentSourceId: ctx.setSelectedPaymentSourceId,
    setSelectedTransactionTypeId: ctx.setSelectedTransactionTypeId,
  })

  const getDefaultPaymentSourceIdForCategoryId = useCallback(
    (categoryId: string) => {
      if (!ctx.isPaymentSourcesModuleEnabled) {
        return ''
      }

      const rootLevel1Id = ctx.getRootLevel1IdForCategory(categoryId)
      const kind = selectionApi.getPaymentSourceKindForLevel1Id(rootLevel1Id)

      if (kind === 'income') {
        return paymentSourcesApi.paymentSourceSettings.showIncomePaymentSource
          ? paymentSourcesApi.paymentSourceSettings.defaultIncomePaymentSourceId || ''
          : ''
      }

      if (kind === 'expense') {
        return paymentSourcesApi.paymentSourceSettings.showExpensePaymentSource
          ? paymentSourcesApi.paymentSourceSettings.defaultExpensePaymentSourceId || ''
          : ''
      }

      return ''
    },
    [
      ctx,
      paymentSourcesApi.paymentSourceSettings,
      selectionApi.getPaymentSourceKindForLevel1Id,
    ]
  )

  return {
    ...paymentSourcesApi,
    ...selectionApi,
    getDefaultPaymentSourceIdForCategoryId,
  }
}
