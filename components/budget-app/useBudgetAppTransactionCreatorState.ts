'use client'

import { useEffect, useState } from 'react'

type Params = {
  selectedMonth: string
}

export function useBudgetAppTransactionCreatorState({ selectedMonth }: Params) {
  const [isTransactionCreatorOpen, setIsTransactionCreatorOpen] = useState(false)
  const [transactionCreatorSuggestionId, setTransactionCreatorSuggestionId] = useState<
    string | null
  >(null)
  const [transactionCreatorLockedLevel1Id, setTransactionCreatorLockedLevel1Id] = useState<
    string | null
  >(null)
  const [selectedTransactionTypeId, setSelectedTransactionTypeId] = useState<string | null>(null)
  const [selectedLevel2Id, setSelectedLevel2Id] = useState<string | null>(null)
  const [selectedTransactionCategoryId, setSelectedTransactionCategoryId] = useState<
    string | null
  >(null)
  const [newAmount, setNewAmount] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newTransactionDate, setNewTransactionDate] = useState<string>('')
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>([])
  const [selectedPaymentSourceId, setSelectedPaymentSourceId] = useState('')
  const [selectedPaymentSplitItems, setSelectedPaymentSplitItems] = useState<
    Array<{ paymentSourceId: string; amount: string }>
  >([])
  const [selectedRecurringTransactionId, setSelectedRecurringTransactionId] = useState('')
  const [isSerialTransactionCreatorEnabled, setIsSerialTransactionCreatorEnabled] = useState(false)
  const [isQuickDayModeEnabled, setIsQuickDayModeEnabled] = useState(false)
  const [quickDayDate, setQuickDayDate] = useState('')
  const [transactionCreatorInitialDate, setTransactionCreatorInitialDate] = useState<string | null>(
    null
  )

  const effectiveQuickDayDate = quickDayDate.startsWith(selectedMonth) ? quickDayDate : ''

  useEffect(() => {
    if (
      !isTransactionCreatorOpen ||
      !isQuickDayModeEnabled ||
      !effectiveQuickDayDate ||
      newTransactionDate
    ) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setNewTransactionDate(effectiveQuickDayDate)
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [
    effectiveQuickDayDate,
    isQuickDayModeEnabled,
    isTransactionCreatorOpen,
    newTransactionDate,
  ])

  return {
    effectiveQuickDayDate,
    isQuickDayModeEnabled,
    isSerialTransactionCreatorEnabled,
    isTransactionCreatorOpen,
    newAmount,
    newDescription,
    newTransactionDate,
    quickDayDate,
    selectedLevel2Id,
    selectedPaymentSourceId,
    selectedPaymentSplitItems,
    selectedRecurringTransactionId,
    selectedTagNames,
    selectedTransactionCategoryId,
    selectedTransactionTypeId,
    setIsQuickDayModeEnabled,
    setIsSerialTransactionCreatorEnabled,
    setIsTransactionCreatorOpen,
    setNewAmount,
    setNewDescription,
    setNewTransactionDate,
    setQuickDayDate,
    setSelectedLevel2Id,
    setSelectedPaymentSourceId,
    setSelectedPaymentSplitItems,
    setSelectedRecurringTransactionId,
    setSelectedTagNames,
    setSelectedTransactionCategoryId,
    setSelectedTransactionTypeId,
    setTransactionCreatorInitialDate,
    setTransactionCreatorLockedLevel1Id,
    setTransactionCreatorSuggestionId,
    transactionCreatorInitialDate,
    transactionCreatorLockedLevel1Id,
    transactionCreatorSuggestionId,
  }
}
