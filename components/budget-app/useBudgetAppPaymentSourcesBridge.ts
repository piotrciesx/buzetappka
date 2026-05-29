'use client'

import { useCallback } from 'react'
import { getAmountNumber } from '../../lib/transactionUtils'
import { getDefaultPaymentSourceForTransaction } from '../../lib/paymentSources'
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
    getSignedAmountForTransaction: ctx.getSignedAmountForTransaction,
    isPaymentSourcesEnabled: ctx.isPaymentSourcesModuleEnabled,
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
      return getDefaultPaymentSourceForTransaction({
        categoryId,
        settings: paymentSourcesApi.paymentSourceSettings,
        getRootLevel1IdForCategory: ctx.getRootLevel1IdForCategory,
        getPaymentSourceKindForLevel1Id: selectionApi.getPaymentSourceKindForLevel1Id,
        isPaymentSourcesEnabled: ctx.isPaymentSourcesModuleEnabled,
      })
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
