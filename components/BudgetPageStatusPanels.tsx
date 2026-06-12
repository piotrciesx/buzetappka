'use client'

import { ComponentProps, CSSProperties, useEffect, useRef, useState } from 'react'
import AppSettingsPanel from './AppSettingsPanel'
import BudgetHeaderPanel from './BudgetHeaderPanel'
import ProfileMonthNotePanel from './ProfileMonthNotePanel'
import UserProfileMenu from './UserProfileMenu'
import UserAvatar from './UserAvatar'
import DropdownShell from './dropdown/DropdownShell'
import type { BudgetUtilityPanel } from './BudgetPageMainPanels'
import type { AppModuleVisibility } from '../lib/useAppModuleVisibility'
import { uiInputApi } from '../lib/uiFoundation'

type SidebarPrimaryPanel = 'profile' | 'settings' | null

type ProfilePanelProps = {
  userEmail: string
  displayName?: string
  avatarKey?: string | null
  accountCreatedAt: string | null
  transactionsCount: number
  categoriesCount: number
  totalBalance: number
  topCategories: Array<{ id: string; name: string; count: number }>
}

type TopbarPinnedCategory = {
  id: string
  label: string
  kind: 'income' | 'expense' | 'neutral'
}

type Props = {
  styles: Record<string, CSSProperties>
  userProfileMenuProps: ComponentProps<typeof UserProfileMenu>
  budgetHeaderPanelProps: ComponentProps<typeof BudgetHeaderPanel>
  appSettingsPanelProps: ComponentProps<typeof AppSettingsPanel>
  visibleModules: AppModuleVisibility
  activeSidebarPrimaryPanel: SidebarPrimaryPanel
  isSettingsPanelVisible: boolean
  isDashboardOpen: boolean
  onOpenProfilePanel: () => void
  onOpenSettingsPanel: () => void
  onClosePrimaryPanel: () => void
  profilePanelProps: ProfilePanelProps
  onToggleDashboard: () => void
  activeUtilityPanel: BudgetUtilityPanel
  onOpenUtilityPanel: (panel: BudgetUtilityPanel) => void
  onQuickAdd: () => void
  onQuickAddIncome?: () => void
  onQuickAddExpense?: () => void
  profileId: string
  userId: string
  selectedMonth: string
  previousMonthCloseReminder: string | null
  pinnedCategories: TopbarPinnedCategory[]
  onLockPreviousMonth: (month: string) => Promise<void>
  onHidePreviousMonthCloseReminder: () => void
  onOpenPinnedCategory: (categoryId: string) => void
}

type IconName =
  | 'user'
  | 'settings'
  | 'dashboard'
  | 'alert'
  | 'bell'
  | 'drafts'
  | 'payments'
  | 'goals'
  | 'backup'
  | 'import'
  | 'trash'
  | 'calendar'
  | 'search'
  | 'plus'
  | 'star'
  | 'more'

type SidebarItem = {
  id: string
  label: string
  icon: IconName
  badge?: number
  active?: boolean
  onClick: () => void
}

const Icon = ({ name }: { name: IconName }) => {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
      {name === 'user' && (
        <>
          <circle cx="12" cy="8" r="3.5" {...common} />
          <path d="M5 20a7 7 0 0 1 14 0" {...common} />
        </>
      )}
      {name === 'settings' && (
        <>
          <circle cx="12" cy="12" r="3" {...common} />
          <path
            d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"
            {...common}
          />
        </>
      )}
      {name === 'dashboard' && (
        <>
          <path d="M4 13a8 8 0 1 1 16 0" {...common} />
          <path d="M12 13l4-4" {...common} />
          <path d="M6 17h12" {...common} />
        </>
      )}
      {name === 'alert' && (
        <>
          <path d="M12 3 3 19h18L12 3Z" {...common} />
          <path d="M12 9v4M12 17h.01" {...common} />
        </>
      )}
      {name === 'bell' && (
        <>
          <path d="M6 9a6 6 0 1 1 12 0c0 7 2 6 2 8H4c0-2 2-1 2-8" {...common} />
          <path d="M10 20h4" {...common} />
        </>
      )}
      {name === 'drafts' && (
        <>
          <path d="M6 3h9l3 3v15H6z" {...common} />
          <path d="M14 3v4h4M9 12h6M9 16h4" {...common} />
        </>
      )}
      {name === 'payments' && (
        <>
          <rect x="3" y="6" width="18" height="12" rx="2" {...common} />
          <path d="M3 10h18M7 15h4" {...common} />
        </>
      )}
      {name === 'goals' && (
        <>
          <circle cx="12" cy="12" r="8" {...common} />
          <circle cx="12" cy="12" r="4" {...common} />
          <path d="M12 8v4l3 2" {...common} />
        </>
      )}
      {name === 'import' && (
        <>
          <path d="M12 3v11" {...common} />
          <path d="m8 10 4 4 4-4" {...common} />
          <path d="M5 19h14" {...common} />
        </>
      )}
      {name === 'backup' && (
        <>
          <path d="M5 7h14v12H5z" {...common} />
          <path d="M8 7V5h8v2M9 12h6M9 16h4" {...common} />
        </>
      )}
      {name === 'trash' && (
        <>
          <path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14" {...common} />
          <path d="M10 11v6M14 11v6" {...common} />
        </>
      )}
      {name === 'calendar' && (
        <>
          <rect x="4" y="5" width="16" height="15" rx="2" {...common} />
          <path d="M8 3v4M16 3v4M4 10h16" {...common} />
        </>
      )}
      {name === 'search' && (
        <>
          <circle cx="11" cy="11" r="6" {...common} />
          <path d="m16 16 4 4" {...common} />
        </>
      )}
      {name === 'plus' && <path d="M12 5v14M5 12h14" {...common} />}
      {name === 'star' && (
        <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" {...common} />
      )}
      {name === 'more' && (
        <>
          <circle cx="5" cy="12" r="1.2" {...common} />
          <circle cx="12" cy="12" r="1.2" {...common} />
          <circle cx="19" cy="12" r="1.2" {...common} />
        </>
      )}
    </svg>
  )
}

export default function BudgetPageStatusPanels({
  styles,
  userProfileMenuProps,
  budgetHeaderPanelProps,
  appSettingsPanelProps,
  visibleModules,
  activeSidebarPrimaryPanel,
  isSettingsPanelVisible,
  isDashboardOpen,
  onOpenProfilePanel,
  onOpenSettingsPanel,
  onClosePrimaryPanel,
  profilePanelProps,
  onToggleDashboard,
  activeUtilityPanel,
  onOpenUtilityPanel,
  onQuickAdd,
  onQuickAddIncome,
  onQuickAddExpense,
  profileId,
  userId,
  selectedMonth,
  previousMonthCloseReminder,
  pinnedCategories,
  onLockPreviousMonth,
  onHidePreviousMonthCloseReminder,
  onOpenPinnedCategory,
}: Props) {
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false)
  const [openedTopbarPanel, setOpenedTopbarPanel] = useState<
    'alert' | 'add' | 'note' | 'pinned' | 'search' | null
  >(null)
  const [topbarSearchText, setTopbarSearchText] = useState('')
  const topbarActionsRef = useRef<HTMLDivElement | null>(null)
  const topbarSearchInputRef = useRef<HTMLInputElement | null>(null)
  const pinnedCategoryParts = pinnedCategories.map((category) => ({
    id: category.id,
    parts: category.label
      .split(/\s*(?:›|>|\/)\s*/)
      .map((part) => part.trim())
      .filter(Boolean),
  }))
  const pinnedLeafCounts = pinnedCategoryParts.reduce<Record<string, number>>((counts, category) => {
    const leaf = category.parts.at(-1) || ''

    if (leaf) {
      counts[leaf] = (counts[leaf] || 0) + 1
    }

    return counts
  }, {})

  useEffect(() => {
    if (!activeSidebarPrimaryPanel) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClosePrimaryPanel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeSidebarPrimaryPanel, onClosePrimaryPanel])

  useEffect(() => {
    if (openedTopbarPanel === 'search') {
      topbarSearchInputRef.current?.focus()
    }
  }, [openedTopbarPanel])

  const openPanel = (panel: BudgetUtilityPanel) => {
    window.dispatchEvent(new CustomEvent('budget-close-floating-ui'))
    onOpenUtilityPanel(activeUtilityPanel === panel ? null : panel)
  }

  const runTopbarAction = (action: () => void) => {
    window.dispatchEvent(new CustomEvent('budget-close-floating-ui'))
    action()
  }

  const getPinnedCategoryDisplay = (category: TopbarPinnedCategory) => {
    const parts =
      pinnedCategoryParts.find((pinnedCategory) => pinnedCategory.id === category.id)?.parts || []
    const leaf = parts.at(-1) || category.label
    const path = parts.length > 1 ? parts.join(' › ') : ''
    const title = path && pinnedLeafCounts[leaf] > 1 ? parts.join(' ') : leaf

    return { title, path }
  }

  const submitTopbarSearch = () => {
    const query = topbarSearchText.trim()

    if (!query) {
      return
    }

    setTopbarSearchText('')
    setOpenedTopbarPanel(null)
    openPanel('search')
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      maximumFractionDigits: 2,
    }).format(value)

  const settingsSidebarItem: SidebarItem = {
    id: 'settings',
    label: 'Ustawienia',
    icon: 'settings',
    active: isSettingsPanelVisible,
    onClick: () => {
      window.dispatchEvent(new CustomEvent('budget-close-floating-ui'))
      onOpenSettingsPanel()
    },
  }

  const navigationSidebarItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Statystyki',
      icon: 'dashboard',
      active: isDashboardOpen,
      onClick: () => {
        window.dispatchEvent(new CustomEvent('budget-close-floating-ui'))
        onToggleDashboard()
      },
    },
    {
      id: 'calendar',
      label: 'Kalendarz',
      icon: 'calendar',
      active: activeUtilityPanel === 'monthCalendar',
      onClick: () => openPanel('monthCalendar'),
    },
    {
      id: 'search',
      label: 'Wyszukiwarka',
      icon: 'search',
      active: activeUtilityPanel === 'search',
      onClick: () => openPanel('search'),
    },
  ]

  const toolsSidebarItems: SidebarItem[] = ([
    {
      id: 'payments',
      label: 'Źródła płatności',
      icon: 'payments',
      active: activeUtilityPanel === 'paymentSources',
      onClick: () => openPanel('paymentSources'),
    },
    {
      id: 'goals',
      label: 'Cele finansowe',
      icon: 'goals',
      active: activeUtilityPanel === 'financialGoals',
      onClick: () => openPanel('financialGoals'),
    },
    {
      id: 'budget-limits',
      label: 'Budżety i limity',
      icon: 'alert',
      active: false,
      onClick: () => window.dispatchEvent(new CustomEvent('budget-close-floating-ui')),
    },
    {
      id: 'recurring',
      label: 'Stałe płatności',
      icon: 'bell',
      active: activeUtilityPanel === 'recurringTransactions',
      onClick: () => openPanel('recurringTransactions'),
    },
  ] satisfies SidebarItem[]).filter((item) => {
    if (item.id === 'payments') return visibleModules.paymentSources
    if (item.id === 'goals') return visibleModules.financialGoals
    if (item.id === 'budget-limits') return visibleModules.budgetLimits
    if (item.id === 'recurring') return visibleModules.recurringTransactions
    return true
  })

  const reportsSidebarItems: SidebarItem[] = [
    {
      id: 'import',
      label: 'Import / Eksport danych',
      icon: 'backup',
      active: activeUtilityPanel === 'importExport',
      onClick: () => openPanel('importExport'),
    },
    {
      id: 'trash',
      label: 'Kosz',
      icon: 'trash',
      active: activeUtilityPanel === 'trash',
      onClick: () => openPanel('trash'),
    },
  ]

  const sidebarItems = [
    ...navigationSidebarItems,
    ...toolsSidebarItems,
    ...reportsSidebarItems,
    settingsSidebarItem,
  ]

  const renderSidebarItem = (item: SidebarItem) => (
    <button
      key={item.id}
      type="button"
      title={item.label}
      aria-label={item.label}
      data-active={item.active ? 'true' : 'false'}
      data-sidebar-item={item.id}
      onClick={item.onClick}
    >
      <Icon name={item.icon} />
      <span data-sidebar-label="true">{item.label}</span>
      {item.badge ? <span data-sidebar-badge="true">{item.badge}</span> : null}
    </button>
  )

  return (
    <>
      <aside data-budget-sidebar="true" aria-label="Moduły aplikacji">
        <nav data-budget-sidebar-nav="true" data-sidebar-desktop-nav="true">
          <div data-sidebar-section="navigation">
            <span data-sidebar-section-label="true">NAWIGACJA</span>
            {navigationSidebarItems.map(renderSidebarItem)}
          </div>

          <div data-sidebar-section="tools">
            <span data-sidebar-section-label="true">NARZĘDZIA</span>
            {toolsSidebarItems.map(renderSidebarItem)}
          </div>

          <div data-sidebar-section="reports">
            <span data-sidebar-section-label="true">RAPORTY I DANE</span>
            {reportsSidebarItems.map(renderSidebarItem)}
          </div>

          <div data-sidebar-section="settings">
            {renderSidebarItem(settingsSidebarItem)}
          </div>
        </nav>

        <nav data-budget-mobile-nav="true" aria-label="Główna nawigacja mobilna">
          <button type="button" aria-label="Dodaj" title="Dodaj" onClick={onQuickAdd}>
            <Icon name="plus" />
            <span>Dodaj</span>
          </button>
          <button
            type="button"
            aria-label="Szukaj"
            title="Szukaj"
            data-active={activeUtilityPanel === 'search' ? 'true' : 'false'}
            onClick={() => openPanel('search')}
          >
            <Icon name="search" />
            <span>Szukaj</span>
          </button>
          <button
            type="button"
            aria-label="Kalendarz"
            title="Kalendarz"
            data-active={activeUtilityPanel === 'monthCalendar' ? 'true' : 'false'}
            onClick={() => openPanel('monthCalendar')}
          >
            <Icon name="calendar" />
            <span>Kalendarz</span>
          </button>
          <DropdownShell
            open={isMobileMoreOpen}
            onOpenChange={setIsMobileMoreOpen}
            size="action"
            trigger={(triggerProps) => (
              <button type="button" aria-label="Więcej" title="Więcej" {...triggerProps}>
                <Icon name="more" />
                <span>Więcej</span>
              </button>
            )}
          >
            {sidebarItems
              .filter((item) => !['calendar', 'search'].includes(item.id))
              .map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="ui-dropdown__item"
                  data-active={item.active ? 'true' : 'false'}
                  onClick={() => {
                    setIsMobileMoreOpen(false)
                    item.onClick()
                  }}
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                </button>
              ))}
          </DropdownShell>
        </nav>
      </aside>

      <div data-budget-shell-content="true">
        <div data-budget-header-row="true">
          <div data-budget-brand="true">
            <img
              src="/brand/budzappka-logo-light.png"
              alt="BudżAppka"
              width={1199}
              height={359}
              data-budget-topbar-logo-image="true"
            />
          </div>

          <div data-budget-topbar-month-group="true">
            <BudgetHeaderPanel {...budgetHeaderPanelProps} />
            <button
              type="button"
              data-topbar-action="calendar"
              aria-label="Kalendarz"
              title="Kalendarz"
              data-active={activeUtilityPanel === 'monthCalendar' ? 'true' : 'false'}
              onClick={() => openPanel('monthCalendar')}
            >
              <Icon name="calendar" />
            </button>
          </div>

          <div
            data-budget-topbar-quick-actions="true"
            aria-label="Szybkie akcje"
            ref={topbarActionsRef}
          >
            <div data-topbar-floating-action="true">
              <DropdownShell
                open={openedTopbarPanel === 'pinned'}
                onOpenChange={(open) => setOpenedTopbarPanel(open ? 'pinned' : null)}
                size="utility"
                trigger={(triggerProps) => (
                  <button type="button" data-topbar-action="pinned" {...triggerProps}>
                    <Icon name="star" />
                    <span>Przypięte kategorie</span>
                    <span data-ui-picker-chevron="true" aria-hidden="true" />
                  </button>
                )}
              >
                {pinnedCategories.length > 0 ? (
                  <div data-topbar-pinned-list="true">
                    {pinnedCategories.map((category) => {
                      const display = getPinnedCategoryDisplay(category)

                      return (
                        <button
                          key={category.id}
                          type="button"
                          className="ui-dropdown__item"
                          data-topbar-pinned-item="true"
                          data-pinned-category-kind={category.kind}
                          title={category.label}
                          onClick={() => {
                            runTopbarAction(() => onOpenPinnedCategory(category.id))
                            setOpenedTopbarPanel(null)
                          }}
                        >
                          <span data-topbar-pinned-dot="true" />
                          <span data-topbar-pinned-copy="true">
                            <strong>{display.title}</strong>
                            {display.path && <small>{display.path}</small>}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <p>Brak przypiętych kategorii.</p>
                )}
              </DropdownShell>
            </div>

            <div data-topbar-floating-action="true">
              <DropdownShell
                open={openedTopbarPanel === 'add'}
                onOpenChange={(open) => setOpenedTopbarPanel(open ? 'add' : null)}
                size="action"
                trigger={(triggerProps) => (
                  <button type="button" data-topbar-action="primary-add" {...triggerProps}>
                    <span>Dodaj wpis</span>
                    <span data-ui-picker-chevron="true" aria-hidden="true" />
                  </button>
                )}
              >
                <button
                  type="button"
                  className="ui-dropdown__item"
                  onClick={() => {
                    setOpenedTopbarPanel(null)
                    onQuickAddIncome?.()
                  }}
                >
                  Przychód
                </button>
                <button
                  type="button"
                  className="ui-dropdown__item"
                  onClick={() => {
                    setOpenedTopbarPanel(null)
                    onQuickAddExpense?.()
                  }}
                >
                  Wydatek
                </button>
              </DropdownShell>
            </div>

            <div data-topbar-floating-action="true">
              <DropdownShell
                open={openedTopbarPanel === 'search'}
                onOpenChange={(open) => setOpenedTopbarPanel(open ? 'search' : null)}
                size="search"
                trigger={(triggerProps) => (
                  <button
                    type="button"
                    data-topbar-action="search"
                    aria-label="Wyszukiwarka"
                    title="Wyszukiwarka"
                    {...triggerProps}
                  >
                    <Icon name="search" />
                    <span>Szukaj...</span>
                  </button>
                )}
              >
                <input
                  ref={topbarSearchInputRef}
                  className={uiInputApi.classNames.searchField}
                  data-input-width={uiInputApi.width.full}
                  data-input-density={uiInputApi.density.compact}
                  value={topbarSearchText}
                  onChange={(event) => setTopbarSearchText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      submitTopbarSearch()
                    }
                  }}
                  placeholder="Szukaj wpisu..."
                  aria-label="Szukaj wpisu"
                />
              </DropdownShell>
            </div>

            <div data-topbar-floating-action="true">
              <DropdownShell
                open={openedTopbarPanel === 'alert'}
                onOpenChange={(open) => setOpenedTopbarPanel(open ? 'alert' : null)}
                size="utility"
                trigger={(triggerProps) => (
                  <button
                    type="button"
                    data-topbar-action="month-alert"
                    aria-label="Alerty miesiąca"
                    title="Alerty miesiąca"
                    {...triggerProps}
                  >
                    <Icon name="alert" />
                    {previousMonthCloseReminder && <span data-topbar-action-badge="true">1</span>}
                  </button>
                )}
              >
                {previousMonthCloseReminder ? (
                  <>
                    <p>Poprzedni miesiąc {previousMonthCloseReminder} nie jest jeszcze zamknięty.</p>
                    <div data-topbar-dropdown-actions="true">
                      <button
                        type="button"
                        className="ui-dropdown__item"
                        onClick={async () => {
                          await onLockPreviousMonth(previousMonthCloseReminder)
                          setOpenedTopbarPanel(null)
                        }}
                      >
                        Zamknij
                      </button>
                      <button
                        type="button"
                        className="ui-dropdown__item"
                        onClick={() => {
                          onHidePreviousMonthCloseReminder()
                          setOpenedTopbarPanel(null)
                        }}
                      >
                        Później
                      </button>
                    </div>
                  </>
                ) : (
                  <p>Brak alertów miesiąca.</p>
                )}
              </DropdownShell>
            </div>

            <div data-topbar-floating-action="true">
              <DropdownShell
                open={openedTopbarPanel === 'note'}
                onOpenChange={(open) => setOpenedTopbarPanel(open ? 'note' : null)}
                size="content"
                panelAttributes={{ 'data-topbar-dropdown': 'note' }}
                trigger={(triggerProps) => (
                  <button
                    type="button"
                    data-topbar-action="month-note"
                    aria-label="Notatka miesiąca"
                    title="Notatka miesiąca"
                    {...triggerProps}
                  >
                    <Icon name="drafts" />
                  </button>
                )}
              >
                <ProfileMonthNotePanel
                  profileId={profileId}
                  userId={userId}
                  selectedMonth={selectedMonth}
                  styles={styles}
                />
              </DropdownShell>
            </div>
            <button
              type="button"
              data-topbar-action="notifications"
              aria-label="Powiadomienia"
              title="Powiadomienia"
              data-active={activeUtilityPanel === 'recurringTransactions' ? 'true' : 'false'}
              disabled={!visibleModules.recurringTransactions}
              onClick={() => openPanel('recurringTransactions')}
            >
              <Icon name="bell" />
            </button>

            <button
              type="button"
              data-topbar-action="profile"
              aria-label="Profil"
              title="Profil"
              data-active={activeSidebarPrimaryPanel === 'profile' ? 'true' : 'false'}
              onClick={() => runTopbarAction(onOpenProfilePanel)}
            >
              <Icon name="user" />
            </button>
          </div>
        </div>

        {activeSidebarPrimaryPanel && (
          <button
            type="button"
            data-sidebar-primary-backdrop="true"
            aria-label="Zamknij panel"
            onClick={onClosePrimaryPanel}
          />
        )}

        {isSettingsPanelVisible && (
          <section data-app-view="settings">
            <div data-app-view-header="true">
              <div>
                <strong>Ustawienia</strong>
                <span>Profil, moduły i zachowanie aplikacji</span>
              </div>
              <button type="button" onClick={onClosePrimaryPanel}>
                Zamknij
              </button>
            </div>
            <AppSettingsPanel {...appSettingsPanelProps} />
          </section>
        )}

        {activeSidebarPrimaryPanel === 'profile' && (
          <section data-app-view="profile">
            <div data-app-view-header="true">
              <div>
                <strong>Profil</strong>
                <span>{profilePanelProps.displayName || 'Podsumowanie profilu'}</span>
              </div>
              <button type="button" onClick={onClosePrimaryPanel}>
                Zamknij
              </button>
            </div>
            <div data-profile-panel-body="true">
              <section data-profile-summary-card="true">
                <div data-profile-main-identity="true">
                  <UserAvatar
                    avatarKey={profilePanelProps.avatarKey}
                    label={profilePanelProps.displayName || profilePanelProps.userEmail}
                    size="lg"
                  />
                  <div>
                    <span>Nazwa użytkownika</span>
                    <strong>{profilePanelProps.displayName || 'brak nazwy'}</strong>
                  </div>
                </div>
                <div>
                  <span>E-mail użytkownika</span>
                  <strong>{profilePanelProps.userEmail || 'brak danych'}</strong>
                </div>
                <div>
                  <span>Konto od</span>
                  <strong>{profilePanelProps.accountCreatedAt || 'brak danych'}</strong>
                </div>
              </section>

              <section data-profile-stat-grid="true">
                <div data-profile-stat-card="true">
                  <span>Liczba wpisów</span>
                  <strong>{profilePanelProps.transactionsCount}</strong>
                </div>
                <div data-profile-stat-card="true">
                  <span>Liczba kategorii</span>
                  <strong>{profilePanelProps.categoriesCount}</strong>
                </div>
                <div data-profile-stat-card="true">
                  <span>Bilans całkowity</span>
                  <strong>{formatCurrency(profilePanelProps.totalBalance)}</strong>
                </div>
              </section>

              <section data-profile-top-categories="true">
                <div data-profile-panel-section-title="true">Najczęstsze kategorie</div>
                {profilePanelProps.topCategories.length > 0 ? (
                  profilePanelProps.topCategories.map((category) => (
                    <div key={category.id} data-profile-category-row="true">
                      <span>{category.name}</span>
                      <strong>{category.count}</strong>
                    </div>
                  ))
                ) : (
                  <div data-profile-panel-placeholder="true">Brak danych o kategoriach.</div>
                )}
              </section>
            </div>
          </section>
        )}
      </div>
    </>
  )
}
