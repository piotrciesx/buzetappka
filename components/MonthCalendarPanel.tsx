'use client'

import { CSSProperties, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react'
import DescriptionSuggestionDeleteMenu from './DescriptionSuggestionDeleteMenu'
import {
  buildDateFromDayInput,
  getDayInputFromDate,
  getDaysInMonth,
  isDateBeforeBudgetStart,
  isFutureDate,
  isMonthPartialByBudgetStart,
  normalizeDayInput,
} from '../lib/dateUtils'
import { useDescriptionSuggestions } from '../lib/useDescriptionSuggestions'
import {
  createPaymentSplitItemsFromStoredSplits,
  PaymentSplitInput,
} from '../lib/paymentSplitUtils'

import type {
  HeatmapMode,
  MonthCalendarPanelProps,
  Transaction,
} from './month-calendar/monthCalendarTypes'
import MonthCalendarContainer from './month-calendar/MonthCalendarContainer'
import MonthCalendarDayModal from './month-calendar/MonthCalendarDayModal'
import MonthCalendarNoDaySection from './month-calendar/MonthCalendarNoDaySection'
import MonthCalendarTransactionCard from './month-calendar/MonthCalendarTransactionCard'
import MonthCalendarToolbar from './month-calendar/MonthCalendarToolbar'
import { buildMonthCalendarDayCells } from './month-calendar/buildMonthCalendarDayCells'
import {
  formatAmount,
  getReferenceValue,
  getStoredHeatmapSettings,
} from './month-calendar/monthCalendarPanelUtils'

type MonthQuickFilter = 'all' | 'income' | 'expense' | 'no-day'

const quickFilterBarStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  marginBottom: 12,
}

export default function MonthCalendarPanel(props: MonthCalendarPanelProps) {
  const {
    selectedMonth,
    transactions,
    budgetStartDate,
    isSelectedMonthExcluded = false,
    isUpdatingSelectedMonthExclusion = false,
    onToggleSelectedMonthExcluded,
    styles,
    isSelectedMonthLocked,
    getAmountNumber,
    getMoveTargetsForTransaction,
    getSignedAmountForTransaction,
    onUpdateTransaction,
    onDeleteTransaction,
    onMoveTransaction,
    onDuplicateTransaction,
    onAddTransactionForDay,
    calendarTitle = 'Kalendarz miesiąca',
    calendarSubtitle = '',
    heatmapVariant = 'balance',
    onHeatmapVariantChange,
    heatmapMode: controlledHeatmapMode,
    onHeatmapModeChange,
    heatmapInverted: controlledHeatmapInverted,
    onHeatmapInvertedChange,
    onResetHeatmapSettings,
    defaultHeatmapMode = 'balance',
    defaultHeatmapInverted = false,
    heatmapStorageKey,
    showHeatmapControls = true,
    descriptionSuggestions,
    getPaymentSourceOptionsForCategoryId,
    transactionTagsMap = {},
    transactionPaymentSplitsMap = {},
    onTagClick,
    onDeleteDescriptionSuggestion,
  } = props

  const [localHeatmapSettings, setLocalHeatmapSettings] = useState(() =>
    getStoredHeatmapSettings(heatmapStorageKey, defaultHeatmapMode, defaultHeatmapInverted)
  )

  const heatmapMode = controlledHeatmapMode ?? localHeatmapSettings.mode
  const heatmapInverted = controlledHeatmapInverted ?? localHeatmapSettings.inverted

  useEffect(() => {
    if (!heatmapStorageKey || controlledHeatmapMode !== undefined) {
      return
    }

    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(
      heatmapStorageKey,
      JSON.stringify({
        mode: localHeatmapSettings.mode,
        inverted: localHeatmapSettings.inverted,
      })
    )
  }, [controlledHeatmapMode, heatmapStorageKey, localHeatmapSettings])

  const handleHeatmapModeChange = (value: HeatmapMode) => {
    if (controlledHeatmapMode === undefined) {
      setLocalHeatmapSettings((prev) => ({
        ...prev,
        mode: value,
      }))
    }

    onHeatmapModeChange?.(value)
  }

  const handleHeatmapInvertedChange = (value: boolean) => {
    if (controlledHeatmapInverted === undefined) {
      setLocalHeatmapSettings((prev) => ({
        ...prev,
        inverted: value,
      }))
    }

    onHeatmapInvertedChange?.(value)
  }

  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [quickFilter, setQuickFilter] = useState<MonthQuickFilter>('all')
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null)
  const [editDay, setEditDay] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editTagNames, setEditTagNames] = useState<string[]>([])
  const [editTagInput, setEditTagInput] = useState('')
  const [editPaymentSourceId, setEditPaymentSourceId] = useState('')
  const [editPaymentSplitItems, setEditPaymentSplitItems] = useState<PaymentSplitInput[]>([])
  const [isEditDescriptionFocused, setIsEditDescriptionFocused] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [movingTransactionId, setMovingTransactionId] = useState<string | null>(null)
  const [moveTargetCategoryId, setMoveTargetCategoryId] = useState('')
  const [isMoving, setIsMoving] = useState(false)

  const editAmountInputRef = useRef<HTMLInputElement | null>(null)
  const editDescriptionInputRef = useRef<HTMLInputElement | null>(null)

  const [year, month] = selectedMonth.split('-').map(Number)
  const daysInMonth = getDaysInMonth(selectedMonth)
  const firstDayOffset = (new Date(year, month - 1, 1).getDay() + 6) % 7

  const filteredTransactions = useMemo(() => {
    if (quickFilter === 'income') {
      return transactions.filter((transaction) => getSignedAmountForTransaction(transaction) > 0)
    }

    if (quickFilter === 'expense') {
      return transactions.filter((transaction) => getSignedAmountForTransaction(transaction) < 0)
    }

    if (quickFilter === 'no-day') {
      return transactions.filter((transaction) => transaction.day_is_null)
    }

    return transactions
  }, [getSignedAmountForTransaction, quickFilter, transactions])

  const transactionsWithDay = useMemo(() => {
    return filteredTransactions.filter((transaction) => !transaction.day_is_null)
  }, [filteredTransactions])

  const isSelectedMonthPartial = isMonthPartialByBudgetStart(selectedMonth, budgetStartDate)

  useEffect(() => {
    if (!selectedDay || !isDateBeforeBudgetStart(`${selectedMonth}-${selectedDay}`, budgetStartDate)) {
      return
    }

    setSelectedDay(null)
  }, [budgetStartDate, selectedDay, selectedMonth])

  const transactionsWithoutDay = useMemo(() => {
    return filteredTransactions.filter((transaction) => transaction.day_is_null)
  }, [filteredTransactions])

  const transactionsByDay = useMemo(() => {
    return transactionsWithDay.reduce<Record<string, Transaction[]>>((acc, transaction) => {
      if (isDateBeforeBudgetStart(transaction.date, budgetStartDate)) {
        return acc
      }

      const day = transaction.date.slice(8, 10)

      if (!day) {
        return acc
      }

      if (!acc[day]) {
        acc[day] = []
      }

      acc[day].push(transaction)
      return acc
    }, {})
  }, [budgetStartDate, transactionsWithDay])

  const dayStats = useMemo(() => {
    return Object.entries(transactionsByDay).reduce<
      Record<string, { count: number; rawSum: number; signedSum: number }>
    >((acc, [day, dayTransactions]) => {
      const rawSum = dayTransactions.reduce((total, transaction) => {
        return total + getAmountNumber(transaction.amount)
      }, 0)

      const signedSum = dayTransactions.reduce((total, transaction) => {
        return total + getSignedAmountForTransaction(transaction)
      }, 0)

      acc[day] = {
        count: dayTransactions.length,
        rawSum,
        signedSum,
      }

      return acc
    }, {})
  }, [transactionsByDay, getAmountNumber, getSignedAmountForTransaction])

  const positiveHeatmapReference = useMemo(() => {
    const values = Object.entries(dayStats)
      .filter(([day]) => !isFutureDate(`${selectedMonth}-${day}`))
      .map(([, item]) => item.signedSum)
      .filter((value) => value > 0)

    return getReferenceValue(values)
  }, [dayStats, selectedMonth])

  const negativeHeatmapReference = useMemo(() => {
    const values = Object.entries(dayStats)
      .filter(([day]) => !isFutureDate(`${selectedMonth}-${day}`))
      .map(([, item]) => item.signedSum)
      .filter((value) => value < 0)
      .map((value) => Math.abs(value))

    return getReferenceValue(values)
  }, [dayStats, selectedMonth])

  const sumHeatmapReference = useMemo(() => {
    const values = Object.entries(dayStats)
      .filter(([day]) => !isFutureDate(`${selectedMonth}-${day}`))
      .map(([, item]) => item.rawSum)
      .filter((value) => value > 0)

    return getReferenceValue(values)
  }, [dayStats, selectedMonth])

  const selectedDayTransactions = selectedDay ? transactionsByDay[selectedDay] || [] : []

  const selectedDayRawSum = selectedDayTransactions.reduce((total, transaction) => {
    return total + getAmountNumber(transaction.amount)
  }, 0)

  const selectedDaySignedSum = selectedDayTransactions.reduce((total, transaction) => {
    return total + getSignedAmountForTransaction(transaction)
  }, 0)

  const getDayMetricLabel = () => {
    return heatmapVariant === 'balance' ? 'Bilans' : 'Suma'
  }

  const getDayMetricValue = (stats: { rawSum: number; signedSum: number } | undefined) => {
    if (!stats) {
      return 0
    }

    return heatmapVariant === 'balance' ? stats.signedSum : stats.rawSum
  }

  const selectedDayPrimaryValue =
    heatmapVariant === 'balance' ? selectedDaySignedSum : selectedDayRawSum

  const noDayTransactionsSum = useMemo(() => {
    return transactionsWithoutDay.reduce((total, transaction) => {
      return total + getAmountNumber(transaction.amount)
    }, 0)
  }, [transactionsWithoutDay, getAmountNumber])

  const legendLabels = useMemo(() => {
    if (heatmapVariant === 'income') {
      return {
        left: heatmapInverted ? 'większa suma przychodów' : 'mniejsza suma przychodów',
        right: heatmapInverted ? 'mniejsza suma przychodów' : 'większa suma przychodów',
      }
    }

    if (heatmapVariant === 'expense') {
      return {
        left: heatmapInverted ? 'mniejsza suma wydatków' : 'większa suma wydatków',
        right: heatmapInverted ? 'większa suma wydatków' : 'mniejsza suma wydatków',
      }
    }

    return {
      left: heatmapInverted ? 'dodatni bilans' : 'ujemny bilans',
      right: heatmapInverted ? 'ujemny bilans' : 'dodatni bilans',
    }
  }, [heatmapInverted, heatmapVariant])

  const currentEditingTransaction = useMemo(() => {
    if (!editingTransactionId) {
      return null
    }

    return transactions.find((transaction) => transaction.id === editingTransactionId) || null
  }, [editingTransactionId, transactions])

  const {
    filteredSuggestions: filteredDescriptionSuggestions,
    activeSuggestionIndex,
    applySuggestion,
    handleKeyDown: handleSuggestionKeyDown,
    handleSuggestionContextMenu,
    handleSuggestionPointerDown,
    handleSuggestionPointerUp,
    handleSuggestionPointerLeave,
    suggestionToDelete,
    deletePromptPosition,
    closeDeletePrompt,
    confirmDeleteSuggestion,
  } = useDescriptionSuggestions({
    query: editDescription,
    setQuery: setEditDescription,
    categoryId: currentEditingTransaction?.category_id,
    isEnabled: isEditDescriptionFocused,
    descriptionSuggestions,
    inputRef: editDescriptionInputRef,
    onDeleteSuggestion: onDeleteDescriptionSuggestion,
  })

  const closeModal = () => {
    setSelectedDay(null)
    setEditingTransactionId(null)
    setEditDay('')
    setEditAmount('')
    setEditDescription('')
    setEditTagNames([])
    setEditTagInput('')
    setEditPaymentSourceId('')
    setIsEditDescriptionFocused(false)
    setIsUpdating(false)
    setMovingTransactionId(null)
    setMoveTargetCategoryId('')
    setIsMoving(false)
    closeDeletePrompt()
  }

  const startEditingTransaction = (transaction: Transaction) => {
    setMovingTransactionId(null)
    setMoveTargetCategoryId('')
    setEditingTransactionId(transaction.id)
    setEditDay(transaction.day_is_null ? '' : getDayInputFromDate(transaction.date, selectedMonth))
    setEditAmount(String(getAmountNumber(transaction.amount)))
    setEditDescription(transaction.description || '')
    const nextTagNames = (transactionTagsMap[transaction.id] || []).map((tag) => tag.name)
    setEditTagNames(nextTagNames)
    setEditTagInput(nextTagNames.join(', '))
    setEditPaymentSourceId(transaction.payment_source_id || '')
    setEditPaymentSplitItems(
      createPaymentSplitItemsFromStoredSplits(transactionPaymentSplitsMap[transaction.id] || [])
    )
    closeDeletePrompt()

    window.setTimeout(() => {
      editAmountInputRef.current?.focus()
    }, 0)
  }

  const cancelEditingTransaction = () => {
    setEditingTransactionId(null)
    setEditDay('')
    setEditAmount('')
    setEditDescription('')
    setEditTagNames([])
    setEditTagInput('')
    setEditPaymentSourceId('')
    setEditPaymentSplitItems([])
    setIsEditDescriptionFocused(false)
    setIsUpdating(false)
    closeDeletePrompt()
  }

  const saveEditingTransaction = async (transactionId: string) => {
    if (isUpdating) {
      return
    }

    const currentTransaction = transactions.find((item) => item.id === transactionId)

    if (!currentTransaction) {
      alert('Nie znaleziono wpisu do zapisu')
      return
    }

    const normalizedDay = normalizeDayInput(editDay, selectedMonth)
    let nextTransactionDate = currentTransaction.date
    let nextDayIsNull = Boolean(currentTransaction.day_is_null)

    if (normalizedDay) {
      const builtDate = buildDateFromDayInput(selectedMonth, normalizedDay)

      if (!builtDate) {
        alert('Podaj poprawny dzień transakcji')
        return
      }

      nextTransactionDate = builtDate
      nextDayIsNull = false
    } else if (!currentTransaction.day_is_null) {
      alert('Podaj dzień transakcji')
      return
    } else {
      nextDayIsNull = true
    }

    setIsUpdating(true)

    try {
      await onUpdateTransaction(
        transactionId,
        editAmount,
        editDescription,
        nextTransactionDate,
        editTagNames,
        nextDayIsNull,
        editPaymentSourceId || null,
        editPaymentSplitItems
      )
      cancelEditingTransaction()
    } catch {
      setIsUpdating(false)
    }
  }

  const handleEditFieldKeyDown = async (
    event: KeyboardEvent<HTMLInputElement>,
    transactionId: string,
    field: 'day' | 'amount' | 'description'
  ) => {
    if (field === 'description' && handleSuggestionKeyDown(event)) {
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      cancelEditingTransaction()
      return
    }

    if (event.key !== 'Enter' || event.shiftKey) {
      return
    }

    event.preventDefault()

    if (field === 'day') {
      editAmountInputRef.current?.focus()
      return
    }

    if (field === 'amount') {
      editDescriptionInputRef.current?.focus()
      return
    }

    await saveEditingTransaction(transactionId)
  }

  const startMovingTransaction = (transaction: Transaction) => {
    setEditingTransactionId(null)
    setEditDay('')
    setEditAmount('')
    setEditDescription('')
    setEditTagNames([])
    setEditTagInput('')
    setEditPaymentSourceId('')
    setMovingTransactionId(transaction.id)
    setMoveTargetCategoryId('')
    closeDeletePrompt()
  }

  const cancelMovingTransaction = () => {
    setMovingTransactionId(null)
    setMoveTargetCategoryId('')
    setIsMoving(false)
  }

  const saveMovingTransaction = async (transactionId: string) => {
    if (isMoving || !moveTargetCategoryId) {
      return
    }

    setIsMoving(true)

    try {
      await onMoveTransaction(transactionId, moveTargetCategoryId)
      cancelMovingTransaction()
    } catch {
      setIsMoving(false)
    }
  }

  const renderTransactionCard = (transaction: Transaction, context: 'day' | 'no-day') => (
    <MonthCalendarTransactionCard
      key={transaction.id}
      transaction={transaction}
      context={context}
      selectedMonth={selectedMonth}
      isSelectedMonthLocked={isSelectedMonthLocked}
      heatmapVariant={heatmapVariant}
      styles={styles}
      getAmountNumber={getAmountNumber}
      getMoveTargetsForTransaction={getMoveTargetsForTransaction}
      getSignedAmountForTransaction={getSignedAmountForTransaction}
      getPaymentSourceOptionsForCategoryId={getPaymentSourceOptionsForCategoryId}
      transactionTagsMap={transactionTagsMap}
      transactionPaymentSplitsMap={transactionPaymentSplitsMap}
      onTagClick={onTagClick}
      onDeleteTransaction={onDeleteTransaction}
      onDuplicateTransaction={onDuplicateTransaction}
      editingTransactionId={editingTransactionId}
      movingTransactionId={movingTransactionId}
      moveTargetCategoryId={moveTargetCategoryId}
      editDay={editDay}
      editAmount={editAmount}
      editDescription={editDescription}
      editTagNames={editTagNames}
      editTagInput={editTagInput}
      editPaymentSourceId={editPaymentSourceId}
      editPaymentSplitItems={editPaymentSplitItems}
      isUpdating={isUpdating}
      isMoving={isMoving}
      activeSuggestionIndex={activeSuggestionIndex}
      filteredDescriptionSuggestions={filteredDescriptionSuggestions}
      editAmountInputRef={editAmountInputRef}
      editDescriptionInputRef={editDescriptionInputRef}
      setEditDay={setEditDay}
      setEditAmount={setEditAmount}
      setEditDescription={setEditDescription}
      setEditTagNames={setEditTagNames}
      setEditTagInput={setEditTagInput}
      setEditPaymentSourceId={setEditPaymentSourceId}
      setEditPaymentSplitItems={setEditPaymentSplitItems}
      setIsEditDescriptionFocused={setIsEditDescriptionFocused}
      setMoveTargetCategoryId={setMoveTargetCategoryId}
      startEditingTransaction={startEditingTransaction}
      cancelEditingTransaction={cancelEditingTransaction}
      saveEditingTransaction={saveEditingTransaction}
      handleEditFieldKeyDown={handleEditFieldKeyDown}
      startMovingTransaction={startMovingTransaction}
      cancelMovingTransaction={cancelMovingTransaction}
      saveMovingTransaction={saveMovingTransaction}
      applySuggestion={applySuggestion}
      handleSuggestionContextMenu={handleSuggestionContextMenu}
      handleSuggestionPointerDown={handleSuggestionPointerDown}
      handleSuggestionPointerUp={handleSuggestionPointerUp}
      handleSuggestionPointerLeave={handleSuggestionPointerLeave}
    />
  )

  const dayCells = buildMonthCalendarDayCells({
    daysInMonth,
    selectedMonth,
    selectedDay,
    budgetStartDate,
    dayStats,
    heatmapMode,
    heatmapVariant,
    heatmapInverted,
    negativeHeatmapReference,
    positiveHeatmapReference,
    sumHeatmapReference,
    getDayMetricLabel,
    getDayMetricValue,
    setSelectedDay,
  })

  return (
    <MonthCalendarContainer
      firstDayOffset={firstDayOffset}
      dayCells={dayCells}
      heatmapMode={heatmapMode}
      legendLabels={legendLabels}
      toolbar={
        <MonthCalendarToolbar
          title={calendarTitle}
          subtitle={calendarSubtitle}
          styles={styles}
          heatmapMode={heatmapMode}
          heatmapVariant={heatmapVariant}
          heatmapInverted={heatmapInverted}
          showHeatmapControls={showHeatmapControls}
          onHeatmapModeChange={handleHeatmapModeChange}
          onHeatmapVariantChange={onHeatmapVariantChange}
          onHeatmapInvertedChange={handleHeatmapInvertedChange}
          onResetHeatmapSettings={onResetHeatmapSettings}
        />
      }
      notices={
        <>
          <div style={quickFilterBarStyle}>
            {[
              ['all', 'wszystko'],
              ['income', 'tylko przychody'],
              ['expense', 'tylko wydatki'],
              ['no-day', 'bez dnia'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                style={quickFilter === value ? styles.primaryButton : styles.secondaryButton}
                onClick={() => setQuickFilter(value as MonthQuickFilter)}
              >
                {label}
              </button>
            ))}
          </div>
          {isSelectedMonthPartial && (
            <div style={{ ...styles.infoBox, marginBottom: 10 }}>
              Ten miesiąc jest niepełny — dane przed datą startową nie są liczone.
            </div>
          )}
          {isSelectedMonthExcluded && (
            <div style={{ ...styles.infoBox, marginBottom: 10 }}>
              Ten miesiąc jest wyłączony ze statystyk.
            </div>
          )}
          {onToggleSelectedMonthExcluded && (
            <div style={{ marginBottom: 10 }}>
              <button
                type="button"
                style={isSelectedMonthExcluded ? styles.primaryButton : styles.secondaryButton}
                disabled={isUpdatingSelectedMonthExclusion}
                onClick={() => {
                  void onToggleSelectedMonthExcluded()
                }}
              >
                {isUpdatingSelectedMonthExclusion
                  ? 'Zapisywanie...'
                  : isSelectedMonthExcluded
                    ? 'Przywróć miesiąc do statystyk'
                    : 'Wyłącz miesiąc ze statystyk'}
              </button>
            </div>
          )}
        </>
      }
      noDaySection={
        <MonthCalendarNoDaySection
          transactionsWithoutDay={transactionsWithoutDay}
          noDayTransactionsSum={noDayTransactionsSum}
          styles={styles}
          formatAmount={formatAmount}
          renderTransactionCard={renderTransactionCard}
        />
      }
      suggestionMenu={
        <DescriptionSuggestionDeleteMenu
          isOpen={Boolean(suggestionToDelete)}
          x={deletePromptPosition.x}
          y={deletePromptPosition.y}
          onConfirm={confirmDeleteSuggestion}
          onCancel={closeDeletePrompt}
        />
      }
      dayModal={
        selectedDay ? (
          <MonthCalendarDayModal
            selectedDay={selectedDay}
            selectedMonth={selectedMonth}
            selectedDayTransactions={selectedDayTransactions}
            selectedDayPrimaryValue={selectedDayPrimaryValue}
            selectedDayRawSum={selectedDayRawSum}
            heatmapVariant={heatmapVariant}
            isSelectedMonthLocked={isSelectedMonthLocked}
            styles={styles}
            getDayMetricLabel={getDayMetricLabel}
            formatAmount={formatAmount}
            renderTransactionCard={renderTransactionCard}
            onAddTransactionForDay={onAddTransactionForDay}
            onClose={closeModal}
          />
        ) : null
      }
    />
  )
}
