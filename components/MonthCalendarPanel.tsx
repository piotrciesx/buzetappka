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
import { FoundationSegmentedControl } from './ui/FoundationPrimitives'

import type {
  HeatmapMode,
  MonthCalendarPanelProps,
  Transaction,
} from './month-calendar/monthCalendarTypes'
import MonthCalendarContainer from './month-calendar/MonthCalendarContainer'
import MonthCalendarNoDaySection from './month-calendar/MonthCalendarNoDaySection'
import MonthCalendarTransactionCard from './month-calendar/MonthCalendarTransactionCard'
import MonthCalendarTransactionList from './month-calendar/MonthCalendarTransactionList'
import MonthCalendarToolbar from './month-calendar/MonthCalendarToolbar'
import { buildMonthCalendarDayCells } from './month-calendar/buildMonthCalendarDayCells'
import {
  formatAmount,
  getReferenceValue,
  getStoredHeatmapSettings,
} from './month-calendar/monthCalendarPanelUtils'
import { getEffectiveTransactionScope } from '../lib/transactionScope'
import {
  bucketTransactionsByConcreteDay,
  isDaylessTransaction,
  splitTransactionsByDayPresence,
} from '../lib/transactionDomain'

type MonthQuickFilter = 'all' | 'income' | 'expense' | 'no-day'

const quickFilterBarStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  marginBottom: 8,
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
    legacyHeatmapStorageKeys = [],
    showHeatmapControls = true,
    descriptionSuggestions,
    getPaymentSourceOptionsForCategoryId,
    transactionTagsMap = {},
    transactionPaymentSplitsMap = {},
    onTagClick,
    onDeleteDescriptionSuggestion,
  } = props

  const [localHeatmapSettings, setLocalHeatmapSettings] = useState(() =>
    getStoredHeatmapSettings(
      heatmapStorageKey,
      legacyHeatmapStorageKeys,
      defaultHeatmapMode,
      defaultHeatmapInverted
    )
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

  const scopedTransactions = useMemo(
    () =>
      getEffectiveTransactionScope(transactions, {
        mode: 'calendar',
        budgetStartDate,
      }),
    [budgetStartDate, transactions]
  )

  const filteredTransactions = useMemo(() => {
    if (quickFilter === 'income') {
      return scopedTransactions.filter((transaction) => getSignedAmountForTransaction(transaction) > 0)
    }

    if (quickFilter === 'expense') {
      return scopedTransactions.filter((transaction) => getSignedAmountForTransaction(transaction) < 0)
    }

    if (quickFilter === 'no-day') {
      return scopedTransactions.filter((transaction) => isDaylessTransaction(transaction))
    }

    return scopedTransactions
  }, [getSignedAmountForTransaction, quickFilter, scopedTransactions])

  const transactionDayBuckets = useMemo(
    () => splitTransactionsByDayPresence(filteredTransactions),
    [filteredTransactions]
  )

  const transactionsWithDay = transactionDayBuckets.withDay

  const isSelectedMonthPartial = isMonthPartialByBudgetStart(selectedMonth, budgetStartDate)

  useEffect(() => {
    if (!selectedDay || !isDateBeforeBudgetStart(`${selectedMonth}-${selectedDay}`, budgetStartDate)) {
      return
    }

    setSelectedDay(null)
  }, [budgetStartDate, selectedDay, selectedMonth])

  const transactionsWithoutDay = transactionDayBuckets.withoutDay

  const transactionsByDay = useMemo(() => {
    return bucketTransactionsByConcreteDay(
      transactionsWithDay.filter(
        (transaction) => !isDateBeforeBudgetStart(transaction.date, budgetStartDate)
      )
    )
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

  const selectedDayIncomeTotal = selectedDayTransactions.reduce((total, transaction) => {
    const signedAmount = getSignedAmountForTransaction(transaction)
    return signedAmount > 0 ? total + signedAmount : total
  }, 0)

  const selectedDayExpenseTotal = selectedDayTransactions.reduce((total, transaction) => {
    const signedAmount = getSignedAmountForTransaction(transaction)
    return signedAmount < 0 ? total + Math.abs(signedAmount) : total
  }, 0)

  const monthIncomeTotal = filteredTransactions.reduce((total, transaction) => {
    const signedAmount = getSignedAmountForTransaction(transaction)
    return signedAmount > 0 ? total + signedAmount : total
  }, 0)

  const monthExpenseTotal = filteredTransactions.reduce((total, transaction) => {
    const signedAmount = getSignedAmountForTransaction(transaction)
    return signedAmount < 0 ? total + Math.abs(signedAmount) : total
  }, 0)

  const monthBalanceTotal = monthIncomeTotal - monthExpenseTotal

  const topActiveDays = Object.entries(dayStats)
    .sort(([, first], [, second]) => second.count - first.count)
    .slice(0, 5)

  const recentCalendarTransactions = [...transactionsWithDay]
    .sort((first, second) => (second.date || '').localeCompare(first.date || ''))
    .slice(0, 6)

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
    setEditDay(isDaylessTransaction(transaction) ? '' : getDayInputFromDate(transaction.date, selectedMonth))
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
    let nextDayIsNull = isDaylessTransaction(currentTransaction)

    if (normalizedDay) {
      const builtDate = buildDateFromDayInput(selectedMonth, normalizedDay)

      if (!builtDate) {
        alert('Podaj poprawny dzień transakcji')
        return
      }

      nextTransactionDate = builtDate
      nextDayIsNull = false
    } else if (!isDaylessTransaction(currentTransaction)) {
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

  const selectedDayLabel = selectedDay
    ? `${selectedDay}.${selectedMonth.slice(5, 7)}.${selectedMonth.slice(0, 4)}`
    : ''

  const rightPanel = selectedDay ? (
    <div data-month-calendar-side-content="day">
      <header data-month-calendar-side-header="true">
        <div>
          <span>Wybrany dzień</span>
          <strong>{selectedDayLabel}</strong>
        </div>
        <button type="button" data-month-calendar-side-clear="true" onClick={closeModal}>
          Miesiąc
        </button>
      </header>

      <section data-month-calendar-side-metrics="true">
        <div>
          <span>Liczba wpisów</span>
          <strong>{selectedDayTransactions.length}</strong>
        </div>
        <div>
          <span>Bilans dnia</span>
          <strong data-financial-state={selectedDaySignedSum < 0 ? 'negative' : selectedDaySignedSum > 0 ? 'positive' : 'zero'}>
            {selectedDaySignedSum > 0 ? '+' : ''}
            {formatAmount(selectedDaySignedSum)} zł
          </strong>
        </div>
        <div>
          <span>Przychody</span>
          <strong data-financial-state="positive">{formatAmount(selectedDayIncomeTotal)} zł</strong>
        </div>
        <div>
          <span>Wydatki</span>
          <strong data-financial-state="negative">{formatAmount(selectedDayExpenseTotal)} zł</strong>
        </div>
      </section>

      <section data-month-calendar-side-list="true">
        <h3>Wpisy z dnia</h3>
        {selectedDayTransactions.length === 0 ? (
          <div data-month-calendar-side-empty="true">Brak wpisów w tym dniu.</div>
        ) : (
          <MonthCalendarTransactionList
            transactions={selectedDayTransactions}
            context="day"
            renderTransactionCard={renderTransactionCard}
          />
        )}
      </section>

      {!isSelectedMonthLocked && onAddTransactionForDay && (
        <button
          type="button"
          data-month-calendar-side-add="true"
          onClick={() => onAddTransactionForDay(selectedDay)}
        >
          Dodaj wpis tego dnia
        </button>
      )}
    </div>
  ) : (
    <div data-month-calendar-side-content="month">
      <header data-month-calendar-side-header="true">
        <div>
          <span>Kalendarz</span>
          <strong>{selectedMonth}</strong>
        </div>
      </header>

      <section data-month-calendar-side-metrics="true">
        <div>
          <span>Przychody</span>
          <strong data-financial-state="positive">{formatAmount(monthIncomeTotal)} zł</strong>
        </div>
        <div>
          <span>Wydatki</span>
          <strong data-financial-state="negative">{formatAmount(monthExpenseTotal)} zł</strong>
        </div>
        <div>
          <span>Saldo</span>
          <strong data-financial-state={monthBalanceTotal < 0 ? 'negative' : monthBalanceTotal > 0 ? 'positive' : 'zero'}>
            {monthBalanceTotal > 0 ? '+' : ''}
            {formatAmount(monthBalanceTotal)} zł
          </strong>
        </div>
        <div>
          <span>Liczba wpisów</span>
          <strong>{transactionsWithDay.length}</strong>
        </div>
      </section>

      <section data-month-calendar-side-list="true">
        <h3>Najaktywniejsze dni</h3>
        {topActiveDays.length === 0 ? (
          <div data-month-calendar-side-empty="true">Brak wpisów w kalendarzu.</div>
        ) : (
          topActiveDays.map(([day, stats]) => (
            <button
              key={day}
              type="button"
              data-month-calendar-side-row="true"
              onClick={() => setSelectedDay(day)}
            >
              <span>{day}.{selectedMonth.slice(5, 7)}</span>
              <strong>{stats.count}</strong>
            </button>
          ))
        )}
      </section>

      <section data-month-calendar-side-list="true">
        <h3>Ostatnie wpisy</h3>
        {recentCalendarTransactions.length === 0 ? (
          <div data-month-calendar-side-empty="true">Brak ostatnich wpisów.</div>
        ) : (
          recentCalendarTransactions.map((transaction) => {
            const signedAmount = getSignedAmountForTransaction(transaction)

            return (
              <div key={transaction.id} data-month-calendar-side-row="true">
                <span>{transaction.description || 'Bez opisu'}</span>
                <strong data-financial-state={signedAmount < 0 ? 'negative' : signedAmount > 0 ? 'positive' : 'zero'}>
                  {signedAmount > 0 ? '+' : ''}
                  {formatAmount(signedAmount)} zł
                </strong>
              </div>
            )
          })
        )}
      </section>
    </div>
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
            <FoundationSegmentedControl<MonthQuickFilter>
              value={quickFilter}
              ariaLabel="Zakres wpisów kalendarza"
              density="compact"
              options={[
                { value: 'all', label: 'Wszystkie' },
                { value: 'income', label: 'Przychody' },
                { value: 'expense', label: 'Wydatki' },
                { value: 'no-day', label: 'Bez dnia' },
              ]}
              onChange={setQuickFilter}
            />
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
            <div data-month-calendar-subtle-action="true">
              <button
                type="button"
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
      rightPanel={rightPanel}
      suggestionMenu={
        <DescriptionSuggestionDeleteMenu
          isOpen={Boolean(suggestionToDelete)}
          x={deletePromptPosition.x}
          y={deletePromptPosition.y}
          onConfirm={confirmDeleteSuggestion}
          onCancel={closeDeletePrompt}
        />
      }
    />
  )
}
