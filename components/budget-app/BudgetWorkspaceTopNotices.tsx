'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import BudgetLimitAlertsPanel from '../BudgetLimitAlertsPanel'
import ProfileMonthNotePanel from '../ProfileMonthNotePanel'
import type { PinnedWorkspaceCategory } from '../../lib/budgetAppSummary'
import type { Category } from '../../lib/budgetPageTypes'
import type { BudgetLimitUsageState } from '../../lib/useBudgetLimits'

type OpenedNotice = 'alert' | 'note' | 'sort' | null

type BudgetWorkspaceTopNoticesProps = {
  previousMonthCloseReminder: string | null
  profileId: string
  userId: string
  selectedMonth: string
  isBudgetLimitsVisible: boolean
  activeBudgetLimitsCount: number
  activeBudgetLimitAlerts: BudgetLimitUsageState[]
  categoriesById: Record<string, Category>
  pinnedWorkspaceCategories: PinnedWorkspaceCategory[]
  styles: Record<string, CSSProperties>
  onLockMonth: (month: string) => Promise<void>
  onHidePreviousMonthCloseReminder: () => void
  onOpenBudgetLimit: (categoryId: string | null) => void
  onOpenPinnedCategory: (categoryId: string) => void
  sortContent?: ReactNode
}

const hiddenLabelStyle: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
}

const NoticeIcon = ({ type }: { type: 'alert' | 'note' }) => {
  if (type === 'alert') {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path
          d="M12 3 2.8 19h18.4L12 3Z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        <path
          d="M12 9v4"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <path
          d="M12 17h.01"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="3"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M7 4h8l3 3v13H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M15 4v4h4M8.5 12h7M8.5 16h5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  )
}

export default function BudgetWorkspaceTopNotices({
  previousMonthCloseReminder,
  profileId,
  userId,
  selectedMonth,
  isBudgetLimitsVisible,
  activeBudgetLimitsCount,
  activeBudgetLimitAlerts,
  categoriesById,
  pinnedWorkspaceCategories,
  styles,
  onLockMonth,
  onHidePreviousMonthCloseReminder,
  onOpenBudgetLimit,
  onOpenPinnedCategory,
  sortContent,
}: BudgetWorkspaceTopNoticesProps) {
  const [openedNotice, setOpenedNotice] = useState<OpenedNotice>(null)
  const noticeRef = useRef<HTMLDivElement | null>(null)
  const visiblePinnedCategories = pinnedWorkspaceCategories.slice(0, 5)

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null

      if (target && noticeRef.current?.contains(target)) {
        return
      }

      setOpenedNotice(null)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenedNotice(null)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const toggleNotice = (notice: Exclude<OpenedNotice, null>) => {
    setOpenedNotice((previousValue) => (previousValue === notice ? null : notice))
  }

  return (
    <div ref={noticeRef} data-budget-status-grid="true" data-opened-notice={openedNotice || ''}>
      <div data-budget-status-left="true">
        <div data-budget-compact-notice="alert">
          <button
            type="button"
            data-budget-notice-trigger="true"
            aria-label="Alert miesiąca"
            title="Alert miesiąca"
            aria-expanded={openedNotice === 'alert'}
            disabled={!previousMonthCloseReminder}
            onClick={() => toggleNotice('alert')}
          >
            <NoticeIcon type="alert" />
            <span style={hiddenLabelStyle}>Alert miesiąca</span>
            {previousMonthCloseReminder && <span data-budget-notice-badge="true">1</span>}
          </button>
          {openedNotice === 'alert' && previousMonthCloseReminder && (
            <div data-budget-notice-panel="alert">
              <div>Poprzedni miesiąc {previousMonthCloseReminder} nie jest jeszcze zamknięty.</div>
              <div data-budget-alert-actions="true" data-budget-actions-row="true" style={{ ...styles.actions, marginTop: 8 }}>
                <button
                  type="button"
                  style={styles.primaryButton}
                  onClick={async () => {
                    const confirmed = confirm(
                      `Czy na pewno zamknąć poprzedni miesiąc ${previousMonthCloseReminder}?`
                    )

                    if (!confirmed) {
                      return
                    }

                    await onLockMonth(previousMonthCloseReminder)
                    setOpenedNotice(null)
                  }}
                >
                  Zamknij
                </button>
                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={() => {
                    onHidePreviousMonthCloseReminder()
                    setOpenedNotice(null)
                  }}
                >
                  Później
                </button>
              </div>
            </div>
          )}
        </div>

        <div data-budget-compact-notice="note">
          <button
            type="button"
            data-budget-notice-trigger="true"
            aria-label="Notatka miesiąca"
            title="Notatka miesiąca"
            aria-expanded={openedNotice === 'note'}
            onClick={() => toggleNotice('note')}
          >
            <NoticeIcon type="note" />
            <span style={hiddenLabelStyle}>Notatka miesiąca</span>
          </button>
          {openedNotice === 'note' && (
            <div data-budget-notice-panel="note">
              <ProfileMonthNotePanel
                profileId={profileId}
                userId={userId}
                selectedMonth={selectedMonth}
                styles={styles}
              />
            </div>
          )}
        </div>
      </div>

      {visiblePinnedCategories.length > 0 && (
        <>
          <i data-budget-status-separator="true" aria-hidden="true" />
          <div data-budget-pinned-categories="true" aria-label="Przypięte kategorie">
            {visiblePinnedCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                data-budget-pinned-category="true"
                data-pinned-category-kind={category.kind}
                onClick={() => onOpenPinnedCategory(category.id)}
                title={category.label}
              >
                <span>{category.label}</span>
              </button>
            ))}
          </div>
          {sortContent && <i data-budget-status-separator="true" aria-hidden="true" />}
        </>
      )}

      {sortContent && (
        <div data-budget-status-right="true" data-budget-compact-notice="sort">
          <button
            type="button"
            data-budget-sort-trigger="true"
            aria-label="Sortuj kategorie"
            title="Sortuj kategorie"
            aria-expanded={openedNotice === 'sort'}
            onClick={() => toggleNotice('sort')}
          >
            Sortuj
          </button>
          {openedNotice === 'sort' && <div data-tree-sort-inline="true">{sortContent}</div>}
        </div>
      )}

      {isBudgetLimitsVisible && activeBudgetLimitsCount > 0 && (
        <section data-budget-compact-notice="limits">
          <div data-workspace-card-title="true">Limity</div>
          <BudgetLimitAlertsPanel
            alerts={activeBudgetLimitAlerts}
            categoriesById={categoriesById}
            styles={styles}
            onOpenLimit={onOpenBudgetLimit}
          />
        </section>
      )}
    </div>
  )
}
