'use client'

import { ComponentProps, CSSProperties, useState } from 'react'
import AppSettingsPanel from './AppSettingsPanel'
import BudgetHeaderPanel from './BudgetHeaderPanel'
import UserProfileMenu from './UserProfileMenu'
import type { BudgetUtilityPanel } from './BudgetPageMainPanels'
import type { AppModuleVisibility } from '../lib/useAppModuleVisibility'

type Props = {
  styles: Record<string, CSSProperties>
  userProfileMenuProps: ComponentProps<typeof UserProfileMenu>
  budgetHeaderPanelProps: ComponentProps<typeof BudgetHeaderPanel>
  appSettingsPanelProps: ComponentProps<typeof AppSettingsPanel>
  visibleModules: AppModuleVisibility
  isSettingsPanelVisible: boolean
  isDashboardOpen: boolean
  onToggleDashboard: () => void
  activeUtilityPanel: BudgetUtilityPanel
  onOpenUtilityPanel: (panel: BudgetUtilityPanel) => void
  onQuickAdd: () => void
}

type IconName =
  | 'user'
  | 'settings'
  | 'dashboard'
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
  isSettingsPanelVisible,
  isDashboardOpen,
  onToggleDashboard,
  activeUtilityPanel,
  onOpenUtilityPanel,
  onQuickAdd,
}: Props) {
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false)

  const openPanel = (panel: BudgetUtilityPanel) => {
    onOpenUtilityPanel(activeUtilityPanel === panel ? null : panel)
  }

  const basicSidebarItems: SidebarItem[] = [
    { id: 'profile', label: 'Profil', icon: 'user', onClick: userProfileMenuProps.onToggleSettings },
    {
      id: 'settings',
      label: 'Ustawienia',
      icon: 'settings',
      active: isSettingsPanelVisible,
      onClick: userProfileMenuProps.onToggleSettings,
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      active: isDashboardOpen,
      onClick: onToggleDashboard,
    },
    {
      id: 'drafts',
      label: 'Szkice',
      icon: 'drafts',
      active: activeUtilityPanel === 'drafts',
      onClick: () => openPanel('drafts'),
    },
    {
      id: 'import',
      label: 'Dane / backup',
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

  const optionalSidebarItems: SidebarItem[] = ([
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
      id: 'recurring',
      label: 'Przypomnienia / raty',
      icon: 'bell',
      active: activeUtilityPanel === 'recurringTransactions',
      onClick: () => openPanel('recurringTransactions'),
    },
  ] satisfies SidebarItem[]).filter((item) => {
    if (item.id === 'payments') return visibleModules.paymentSources
    if (item.id === 'goals') return visibleModules.financialGoals
    if (item.id === 'recurring') return visibleModules.recurringTransactions
    return true
  })

  const sidebarItems = [...basicSidebarItems, ...optionalSidebarItems]

  return (
    <>
      <aside data-budget-sidebar="true" aria-label="Moduły aplikacji">
        <div data-budget-sidebar-avatar="true">B</div>
        <nav data-budget-sidebar-nav="true" data-sidebar-desktop-nav="true">
          <div data-sidebar-section="primary">
            <span data-sidebar-section-label="true">Podstawowe</span>
            {basicSidebarItems.map((item) => (
              <button
                key={item.id}
                type="button"
                title={item.label}
                aria-label={item.label}
                data-active={item.active ? 'true' : 'false'}
                onClick={item.onClick}
              >
                <Icon name={item.icon} />
                <span data-sidebar-label="true">{item.label}</span>
                {item.badge ? <span data-sidebar-badge="true">{item.badge}</span> : null}
              </button>
            ))}
          </div>

          {optionalSidebarItems.length > 0 && (
            <div data-sidebar-section="optional">
              <span data-sidebar-section-label="true">Dodatkowe</span>
              {optionalSidebarItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  title={item.label}
                  aria-label={item.label}
                  data-active={item.active ? 'true' : 'false'}
                  onClick={item.onClick}
                >
                  <Icon name={item.icon} />
                  <span data-sidebar-label="true">{item.label}</span>
                  {item.badge ? <span data-sidebar-badge="true">{item.badge}</span> : null}
                </button>
              ))}
            </div>
          )}
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
          <button
            type="button"
            aria-label="Więcej"
            title="Więcej"
            aria-expanded={isMobileMoreOpen}
            onClick={() => setIsMobileMoreOpen((value) => !value)}
          >
            <Icon name="more" />
            <span>Więcej</span>
          </button>
        </nav>

        {isMobileMoreOpen && (
          <div data-budget-mobile-more-menu="true">
            {sidebarItems
              .filter((item) => !['calendar', 'search'].includes(item.id))
              .map((item) => (
                <button
                  key={item.id}
                  type="button"
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
          </div>
        )}
      </aside>

      <div data-budget-shell-content="true">
        <div data-budget-header-row="true">
          <div data-budget-brand="true">
            <div style={styles.pageTitle}>Budżet testowy</div>
            <span>wersja robocza</span>
          </div>

          <BudgetHeaderPanel {...budgetHeaderPanelProps} />
        </div>

        {isSettingsPanelVisible && (
          <section data-app-view="settings">
            <div data-app-view-header="true">
              <div>
                <strong>Ustawienia</strong>
                <span>Profil, moduły i zachowanie aplikacji</span>
              </div>
              <button type="button" onClick={userProfileMenuProps.onToggleSettings}>
                Zamknij
              </button>
            </div>
            <AppSettingsPanel {...appSettingsPanelProps} />
          </section>
        )}
      </div>
    </>
  )
}