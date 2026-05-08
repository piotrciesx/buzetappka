'use client'

import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react'
import DashboardGrid from './DashboardGrid'
import { Category, Tag, Transaction } from '../lib/budgetPageTypes'
import {
  getDashboardStats,
  getLatestTransactions,
  getTopExpenseCategories,
} from '../lib/dashboardStats'
import { useDashboardLayout } from '../lib/useDashboardLayout'
import { filterTransactionsInScope } from '../lib/transactionScope'
import { DASHBOARD_WIDGET_DEFINITIONS } from '../lib/dashboardWidgetConfig'
import type { DashboardContainerType } from '../lib/dashboardTypes'

const panelStyle: CSSProperties = {
  marginBottom: 14,
  background:
    'linear-gradient(145deg, rgba(255,255,255,0.78), rgba(241,245,249,0.66)), radial-gradient(circle at 12% 0%, rgba(59,130,246,0.13), transparent 32%), radial-gradient(circle at 92% 8%, rgba(20,184,166,0.10), transparent 28%)',
  border: '1px solid rgba(226, 232, 240, 0.72)',
  borderRadius: 18,
  padding: 14,
  boxShadow: '0 22px 64px rgba(15, 23, 42, 0.11), inset 0 1px 0 rgba(255,255,255,0.72)',
  backdropFilter: 'blur(24px) saturate(1.18)',
}

const headerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 10,
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  marginBottom: 10,
}

type Props = {
  profileId: string
  styles: Record<string, CSSProperties>
  transactions: Transaction[]
  transactionTagsMap?: Record<string, Tag[]>
  categoriesById: Record<string, Category>
  selectedMonth: string
  budgetStartDate: string
  excludedMonthsSet: Set<string>
  getSignedAmountForTransaction: (transaction: Transaction) => number
}

export default function DashboardPanel({
  profileId,
  styles,
  transactions,
  transactionTagsMap = {},
  categoriesById,
  selectedMonth,
  budgetStartDate,
  excludedMonthsSet,
  getSignedAmountForTransaction,
}: Props) {
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false)
  const [containerTypeToAdd, setContainerTypeToAdd] =
    useState<DashboardContainerType>('month-finance')
  const [addFeedbackText, setAddFeedbackText] = useState('')
  const addPanelRef = useRef<HTMLDivElement | null>(null)

  const {
    widgets,
    addWidget,
    updateWidgetConfig,
    toggleWidgetSize,
    removeWidget,
    moveWidget,
  } = useDashboardLayout({
    profileId,
  })

  const scopedTransactions = useMemo(
    () => filterTransactionsInScope(transactions, budgetStartDate),
    [transactions, budgetStartDate]
  )

  const dashboardStats = useMemo(
    () =>
      getDashboardStats(
        scopedTransactions,
        categoriesById,
        selectedMonth,
        getSignedAmountForTransaction,
        { excludedMonthsSet }
      ),
    [
      scopedTransactions,
      categoriesById,
      selectedMonth,
      getSignedAmountForTransaction,
      excludedMonthsSet,
    ]
  )

  const topExpenseCategories = useMemo(
    () =>
      getTopExpenseCategories(
        scopedTransactions,
        categoriesById,
        selectedMonth,
        getSignedAmountForTransaction,
        { excludedMonthsSet }
      ),
    [
      scopedTransactions,
      categoriesById,
      selectedMonth,
      getSignedAmountForTransaction,
      excludedMonthsSet,
    ]
  )

  const latestTransactions = useMemo(
    () => getLatestTransactions(scopedTransactions, selectedMonth, 8, { excludedMonthsSet }),
    [scopedTransactions, selectedMonth, excludedMonthsSet]
  )

  useEffect(() => {
    if (!isAddPanelOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null
      if (!target) return
      if (addPanelRef.current?.contains(target)) return
      setIsAddPanelOpen(false)
    }

    window.addEventListener('pointerdown', handlePointerDown)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [isAddPanelOpen])

  return (
    <section data-dashboard-panel="true" style={panelStyle}>
      <div style={headerStyle}>
        <div>
          <div style={styles.sectionTitle}>Dashboard</div>
          <div style={{ ...styles.pageSubtitle, marginBottom: 0 }}>
            Kontenery finansowe liczą tylko wpisy od daty startu budżetu.
          </div>
        </div>

        <div
          ref={addPanelRef}
          data-dashboard-ignore-drag="true"
          style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end' }}
        >
          <button
            type="button"
            style={styles.primaryButton}
            onClick={() => setIsAddPanelOpen((value) => !value)}
          >
            Dodaj kafel
          </button>

          {isAddPanelOpen && (
            <div
              data-dashboard-add-panel="true"
              style={{
                position: 'absolute',
                right: 0,
                top: 40,
                zIndex: 8,
                width: 280,
                borderRadius: 18,
                border: '1px solid rgba(148, 163, 184, 0.28)',
                background: 'rgba(255, 255, 255, 0.94)',
                boxShadow: '0 18px 44px rgba(15, 23, 42, 0.18)',
                padding: 12,
                backdropFilter: 'blur(16px)',
              }}
            >
              <label style={{ display: 'grid', gap: 6, fontSize: 12, color: '#475569' }}>
                Typ kontenera
                <select
                  value={containerTypeToAdd}
                  onChange={(event) =>
                    setContainerTypeToAdd(event.target.value as DashboardContainerType)
                  }
                  style={styles.input}
                >
                  {DASHBOARD_WIDGET_DEFINITIONS.map((definition) => (
                    <option key={definition.type} value={definition.type}>
                      {definition.title}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                style={{ ...styles.primaryButton, width: '100%', marginTop: 10 }}
                onClick={() => {
                  addWidget(containerTypeToAdd)
                  setIsAddPanelOpen(false)
                  setAddFeedbackText('Kafel został dodany.')
                  window.setTimeout(() => setAddFeedbackText(''), 1800)
                }}
              >
                Dodaj
              </button>
            </div>
          )}

          {addFeedbackText && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: isAddPanelOpen ? 180 : 42,
                color: '#15803d',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {addFeedbackText}
            </div>
          )}
        </div>
      </div>

      <DashboardGrid
        widgets={widgets}
        transactions={scopedTransactions}
        selectedMonth={selectedMonth}
        budgetStartDate={budgetStartDate}
        excludedMonthsSet={excludedMonthsSet}
        transactionTagsMap={transactionTagsMap}
        dashboardStats={dashboardStats}
        topExpenseCategories={topExpenseCategories}
        latestTransactions={latestTransactions}
        categoriesById={categoriesById}
        getSignedAmountForTransaction={getSignedAmountForTransaction}
        onWidgetConfigChange={updateWidgetConfig}
        onMoveWidget={moveWidget}
        onToggleWidgetSize={toggleWidgetSize}
        onRemoveWidget={removeWidget}
        styles={styles}
      />
    </section>
  )
}
