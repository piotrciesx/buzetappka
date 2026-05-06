'use client'

import { Dispatch, SetStateAction, useEffect } from 'react'
import { MoveTarget, Transaction } from '../../lib/budgetPageTypes'

type MigrationPromptState = {
  categoryId: string
  mode: 'now' | 'next'
  hideMonth: string
  transactionIds: string[]
  targetCategoryId: string
  errorText: string
}

type UseBudgetAppEffectsParams = {
  loadData: () => Promise<void>
  loadBudgetLimits: () => Promise<void>
  setErrorText: Dispatch<SetStateAction<string>>
  setCurrentDayOfMonth: Dispatch<SetStateAction<number | null>>
  scopedTransactions: Transaction[]
  setSelectedTransactionIds: Dispatch<SetStateAction<string[]>>
  bulkMoveTargetCategoryId: string
  commonBulkMoveTargets: MoveTarget[]
  setBulkMoveTargetCategoryId: Dispatch<SetStateAction<string>>
  migrationPromptState: MigrationPromptState | null
  migrationPromptMoveTargets: MoveTarget[]
  setMigrationPromptState: Dispatch<SetStateAction<MigrationPromptState | null>>
}

export function useBudgetAppEffects({
  loadData,
  loadBudgetLimits,
  setErrorText,
  setCurrentDayOfMonth,
  scopedTransactions,
  setSelectedTransactionIds,
  bulkMoveTargetCategoryId,
  commonBulkMoveTargets,
  setBulkMoveTargetCategoryId,
  migrationPromptState,
  migrationPromptMoveTargets,
  setMigrationPromptState,
}: UseBudgetAppEffectsParams) {
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [loadData])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadBudgetLimits().catch((error) => {
        setErrorText(error instanceof Error ? error.message : 'Nie udało się wczytać limitów.')
      })
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [loadBudgetLimits, setErrorText])

  useEffect(() => {
    const refreshCurrentDay = () => {
      setCurrentDayOfMonth(new Date().getDate())
    }

    refreshCurrentDay()

    const intervalId = window.setInterval(refreshCurrentDay, 60 * 1000)
    window.addEventListener('focus', refreshCurrentDay)
    document.addEventListener('visibilitychange', refreshCurrentDay)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', refreshCurrentDay)
      document.removeEventListener('visibilitychange', refreshCurrentDay)
    }
  }, [setCurrentDayOfMonth])

  useEffect(() => {
    const activeTransactionIds = new Set(scopedTransactions.map((transaction) => transaction.id))
    setSelectedTransactionIds((prev) => prev.filter((id) => activeTransactionIds.has(id)))
  }, [scopedTransactions, setSelectedTransactionIds])

  useEffect(() => {
    if (!bulkMoveTargetCategoryId) {
      return
    }

    const isStillAvailable = commonBulkMoveTargets.some(
      (target) => target.id === bulkMoveTargetCategoryId
    )

    if (!isStillAvailable) {
      setBulkMoveTargetCategoryId('')
    }
  }, [bulkMoveTargetCategoryId, commonBulkMoveTargets, setBulkMoveTargetCategoryId])

  useEffect(() => {
    if (!migrationPromptState?.targetCategoryId) {
      return
    }

    const isStillAvailable = migrationPromptMoveTargets.some(
      (target) => target.id === migrationPromptState.targetCategoryId
    )

    if (!isStillAvailable) {
      setMigrationPromptState((prev) =>
        prev
          ? {
              ...prev,
              targetCategoryId: '',
            }
          : null
      )
    }
  }, [migrationPromptMoveTargets, migrationPromptState, setMigrationPromptState])
}
