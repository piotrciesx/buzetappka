'use client'

import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react'
import DashboardGrid from './DashboardGrid'
import { Category, Tag, Transaction } from '../lib/budgetPageTypes'
import { getDashboardOverview } from '../lib/dashboardStats'
import { useDashboardLayout } from '../lib/useDashboardLayout'
import { getEffectiveTransactionScope } from '../lib/transactionScope'
import { DASHBOARD_WIDGET_DEFINITIONS } from '../lib/dashboardWidgetConfig'
import { uiSurfacePrimitives, uiZIndex, uiTypographyTokens } from '../lib/uiFoundation'
import type { DashboardContainerType } from '../lib/dashboardTypes'

const panelStyle: CSSProperties = {
  marginBottom: 14,
  background: uiSurfacePrimitives.surfacePanel.background,
  border: uiSurfacePrimitives.surfacePanel.border,
  borderRadius: uiSurfacePrimitives.surfacePanel.radius,
  padding: 14,
  boxShadow: uiSurfacePrimitives.surfacePanel.shadow,
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
  userId: string
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
  userId,
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
    userId,
  })

  const scopedTransactions = useMemo(
    () =>
      getEffectiveTransactionScope(transactions, {
        mode: 'stats',
        budgetStartDate,
        excludedMonthsSet,
      }),
    [budgetStartDate, excludedMonthsSet, transactions]
  )

  const dashboardOverview = useMemo(
    () =>
      getDashboardOverview(
        scopedTransactions,
        categoriesById,
        selectedMonth,
        getSignedAmountForTransaction,
        { excludedMonthsSet, latestLimit: 8 }
      ),
    [
      scopedTransactions,
      categoriesById,
      selectedMonth,
      getSignedAmountForTransaction,
      excludedMonthsSet,
    ]
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
          <div style={styles.sectionTitle}>Statystyki</div>
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
                zIndex: uiZIndex.widgetOverlay,
                width: 280,
                borderRadius: uiSurfacePrimitives.surfaceDropdown.radius,
                border: uiSurfacePrimitives.surfaceDropdown.border,
                background: uiSurfacePrimitives.surfaceDropdown.background,
                boxShadow: uiSurfacePrimitives.surfaceDropdown.shadow,
                padding: 12,
                backdropFilter: 'blur(16px)',
              }}
            >
              <label style={{ display: 'grid', gap: 6, fontSize: uiTypographyTokens.role.metadata, color: 'var(--ui-color-secondary-text)' }}>
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
                color: 'var(--ui-color-income)',
                fontSize: uiTypographyTokens.role.metadata,
                fontWeight: uiTypographyTokens.weight.semibold,
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
        dashboardStats={dashboardOverview.dashboardStats}
        topExpenseCategories={dashboardOverview.topExpenseCategories}
        latestTransactions={dashboardOverview.latestTransactions}
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
