'use client'

import { CSSProperties, useMemo } from 'react'
import DashboardGrid from './DashboardGrid'
import { Category, Transaction } from '../lib/budgetPageTypes'
import {
  getDashboardStats,
  getLatestTransactions,
  getTopExpenseCategories,
} from '../lib/dashboardStats'
import { useDashboardLayout } from '../lib/useDashboardLayout'

const panelStyle: CSSProperties = {
  marginBottom: 20,
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: 18,
  padding: 16,
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
}

const headerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  marginBottom: 14,
}

type Props = {
  profileId: string
  styles: Record<string, CSSProperties>
  transactions: Transaction[]
  categoriesById: Record<string, Category>
  selectedMonth: string
  getSignedAmountForTransaction: (transaction: Transaction) => number
}

export default function DashboardPanel({
  profileId,
  styles,
  transactions,
  categoriesById,
  selectedMonth,
  getSignedAmountForTransaction,
}: Props) {
  const { widgets, addWidget, updateWidgetType, removeWidget, resizeWidget, moveWidget } =
    useDashboardLayout({
      profileId,
    })

  const dashboardStats = useMemo(
    () =>
      getDashboardStats(
        transactions,
        categoriesById,
        selectedMonth,
        getSignedAmountForTransaction
      ),
    [transactions, categoriesById, selectedMonth, getSignedAmountForTransaction]
  )

  const topExpenseCategories = useMemo(
    () =>
      getTopExpenseCategories(
        transactions,
        categoriesById,
        selectedMonth,
        getSignedAmountForTransaction
      ),
    [transactions, categoriesById, selectedMonth, getSignedAmountForTransaction]
  )

  const latestTransactions = useMemo(
    () => getLatestTransactions(transactions, selectedMonth, 8),
    [transactions, selectedMonth]
  )

  return (
    <section style={panelStyle}>
      <div style={headerStyle}>
        <div>
          <div style={styles.sectionTitle}>Dashboard</div>
          <div style={{ ...styles.pageSubtitle, marginBottom: 0 }}>
            Dodaj kafel, a potem na samym kaflu wybierz, jaką statystykę ma pokazywać.
          </div>
        </div>

        <button type="button" style={styles.primaryButton} onClick={addWidget}>
          Dodaj kafel
        </button>
      </div>

      <DashboardGrid
        widgets={widgets}
        transactions={transactions}
        selectedMonth={selectedMonth}
        dashboardStats={dashboardStats}
        topExpenseCategories={topExpenseCategories}
        latestTransactions={latestTransactions}
        categoriesById={categoriesById}
        getSignedAmountForTransaction={getSignedAmountForTransaction}
        onWidgetTypeChange={updateWidgetType}
        onMoveWidget={moveWidget}
        onRemoveWidget={removeWidget}
        onResizeWidget={resizeWidget}
        styles={styles}
      />
    </section>
  )
}
