# UI FOUNDATION ARCHITECTURE

Data foundation: 2026-05-25

To jest fundament systemu UI BudżAppki. To nie jest redesign, polish ani zmiana wyglądu. Dokument opisuje architekturę, tokeny i kontrakty, które mają umożliwić przyszły design-system bez przenoszenia logiki, bez lokalnych wyjątków CSS i bez kolejnych magicznych warstw.

Powiązane dokumenty:
- `ARCHITECTURE_FREEZE.md`
- `UI_LOGIC_BOUNDARY.md`
- `UI_STYLE_AUDIT.md`
- `DO_NOT_BREAK_CONTRACTS.md`

## 1. Foundation Files

Nowe pliki:
- `app/styles/foundation.css`
- `lib/uiFoundation.ts`
- `UI_FOUNDATION_ARCHITECTURE.md`

`foundation.css` jest importowany przed resztą CSS w `app/globals.css`, więc dostarcza tokeny bez zmiany istniejących reguł wizualnych.

`uiFoundation.ts` jest TS source-of-truth dla wartości używanych w inline styles i hookach, gdzie CSS variables nie są wygodne.

## 2. Stacking System

Docelowy stacking system:
- `base`
- `sticky`
- `dropdown`
- `popover`
- `drawer`
- `modal`
- `toast`
- `criticalOverlay`

CSS tokens:
- `--ui-z-base`
- `--ui-z-sticky`
- `--ui-z-dropdown`
- `--ui-z-popover`
- `--ui-z-drawer`
- `--ui-z-modal`
- `--ui-z-toast`
- `--ui-z-critical-overlay`

TS tokens:
- `uiZIndex.base`
- `uiZIndex.sticky`
- `uiZIndex.dropdown`
- `uiZIndex.popover`
- `uiZIndex.drawer`
- `uiZIndex.modal`
- `uiZIndex.toast`
- `uiZIndex.criticalOverlay`

Legacy-compatible aliases zostały dodane po to, żeby obecny UI nie zmienił wyglądu ani kolejności warstw. Przykłady:
- `--ui-z-topbar`
- `--ui-z-topbar-overlay`
- `--ui-z-category-popover`
- `--ui-z-side-panel`
- `--ui-z-global-critical`

Zasada:
- Nowy kod używa docelowych tokenów.
- Istniejący kod może chwilowo używać aliasów legacy.
- Nie wolno dodawać nowych liczb `z-index` poza `foundation.css` i `uiFoundation.ts`.

### 2.1. UI-FOUNDATION-7: Semantic Layers, Legacy Aliases, Migration Bridges

Semantic layers to docelowe warstwy dla nowego UI:
- `base`
- `raised`
- `sticky`
- `dropdown`
- `popover`
- `drawer`
- `modal`
- `toast`
- `criticalOverlay`

Legacy aliases to nazwy zachowujące obecny stacking bez zmiany wyglądu:
- `sidebar`
- `dashboardOverlay`
- `mobileDrawer`
- `dashboardAddPanel`
- `floatingMenu`
- `floatingMenuBase`
- `floatingMenuElevated`
- `sidebarPanel`
- `mobilePanel`
- `sidePanelOverlay`
- `sidePanel`
- `sidePanelDropdown`
- `profileMenu`
- `workspacePopover`
- `mobilePopover`
- `mobileCritical`
- `rightRailDropdown`
- `widgetDropdown`
- `widgetConfig`
- `widgetControl`
- `widgetHeader`
- `widgetConfigOpen`
- `widgetOverlay`
- `creatorDropdown`
- `local*`
- `mobileCategoryMenu`
- `categoryPopover`
- `categoryPopoverElevated`
- `categoryAutocomplete`
- `categoryOverlay`
- `topbar`
- `topbarDropdown`
- `topbarOverlay`
- `topbarOverlayRaised`
- `topbarCritical`
- `globalCritical`

Migration bridges:
- `drawer` vs `sidebarPanel`: `drawer` jest semantic layer dla przyszłych drawerów, a `sidebarPanel` zostaje legacy bridge dla istniejących paneli drawer-like. Nie zmieniać wartości przed osobnym etapem panel/drawer migration.
- `floatingLayer` vs `floatingActions`: oba korzystają z jednego kontraktu overlay. `floatingLayer` opisuje warstwę, `floatingActions` opisuje konkretny usage dla stałych akcji pływających.
- `dropdown` vs `dashboardOverlay`: mają tę samą wartość warstwy, ale różne znaczenie. `dropdown` jest semantic layer, `dashboardOverlay` zostaje aliasem historycznym dla paneli dashboard/context.
- `modal` vs `popover`: mają tę samą wartość bazową w obecnym stackingu. Nowe UI wybiera semantyczną nazwę według roli, nie według liczby.
- `criticalOverlay` vs `globalCritical`: `criticalOverlay` jest semantic layer, `globalCritical` zostaje legacy aliasem dla historycznych overlayów topbar/modal/category.

Zasada po UI-FOUNDATION-7:
- Nowe moduły nie dodają kolejnych aliasów bez właściciela migracji.
- Wartości legacy aliasów są zamrożone do czasu osobnego etapu.
- Proste magiczne spacing/radius/shadow można przepinać tylko wtedy, gdy token ma wartość równoważną.

## 3. Overlay Architecture

Wspólna architektura overlay obejmuje:
- modal
- dropdown
- popover
- side panel
- drawer
- toast
- floating layer
- tooltip
- floating actions

Kontrakt overlay:
- Każdy overlay ma nazwany layer token.
- Każdy overlay ma jasną politykę focus ownership.
- Każdy overlay ma politykę dismiss: backdrop, outside pointer, Escape albo brak auto-dismiss.
- Overlay nie powinien sam wybierać magicznego `z-index`.

TS contract:
- `uiOverlayContracts.modal`
- `uiOverlayContracts.dropdown`
- `uiOverlayContracts.popover`
- `uiOverlayContracts.sidePanel`
- `uiOverlayContracts.drawer`
- `uiOverlayContracts.toast`
- `uiOverlayContracts.floatingLayer`
- `uiOverlayContracts.tooltip`
- `uiOverlayContracts.floatingActions`

UI-FOUNDATION-3 dodaje też `uiOverlayPrimitives`, czyli bezpieczne warianty dla istniejących warstw:
- `modal`
- `modalBase`
- `modalRaised`
- `modalPrompt`
- `dropdown`
- `dropdownRaised`
- `profileDropdown`
- `popover`
- `inlinePopover`
- `drawer`
- `sidePanel`
- `toast`
- `floatingLayer`
- `floatingActions`

Overlay tokeny w CSS:
- `--ui-overlay-backdrop-soft`
- `--ui-overlay-backdrop`
- `--ui-overlay-backdrop-strong`
- `--ui-overlay-backdrop-prompt`
- `--ui-overlay-modal-padding`
- `--ui-overlay-modal-padding-compact`
- `--ui-overlay-modal-padding-relaxed`
- `--ui-overlay-dropdown-padding`
- `--ui-overlay-popover-padding`
- `--ui-overlay-modal-shadow-neutral`
- `--ui-overlay-modal-shadow-strong`
- `--ui-overlay-dropdown-shadow-tight`

Nie zmieniono zachowania overlayów. Foundation tylko nazywa obecne warstwy i pozwala małym overlayom korzystać z kontraktu bez przebudowy UI.

## 4. UI Tokens Foundation

Token groups w `foundation.css`:
- spacing
- radius
- shadow
- z-index
- motion
- opacity
- blur
- typography scale
- semantic colors
- surfaces

Zasada:
- Tokeny nie są finalnym premium visual style.
- Tokeny są minimalną architekturą nazw.
- Obecne wartości zachowują wizualną zgodność z aplikacją.

## 5. Primitive Contracts

Foundation contracts w `lib/uiFoundation.ts`:
- Button
- IconButton
- Input
- Select
- Checkbox
- Badge
- Tag
- SegmentedControl
- Card
- Panel
- Modal
- Dropdown
- Toolbar

Kontrakt:
- Primitives są nazwane, ale komponenty nie zostały jeszcze przebudowane.
- Nowe UI powinno używać tych nazw jako przyszłych wariantów.
- Stare komponenty mogą pozostać na inline styles do czasu osobnego etapu przepinania.

UI-FOUNDATION-4 dodaje `uiControlPrimitives` dla najprostszych kontrolek:
- `button.primary`
- `button.secondary`
- `button.danger`
- `button.menuItem`
- `button.profileMenuItem`
- `iconButton.default`
- `iconButton.avatar`
- `input.modal`
- `select.modal`
- `checkbox.default`
- `badge.danger`
- `tag.default`
- `segmentedControl.default`

Control tokeny w CSS:
- `--ui-color-focus-border`
- `--ui-color-focus-ring`
- `--ui-control-focus-border`
- `--ui-control-focus-ring`
- `--ui-control-disabled-opacity`
- `--ui-button-padding-md`
- `--ui-button-menu-padding`
- `--ui-button-profile-menu-padding`
- `--ui-input-height-lg`
- `--ui-input-padding-md`
- `--ui-checkbox-gap`
- `--ui-badge-radius`
- `--ui-badge-height-sm`
- `--ui-badge-min-width-sm`

Zasada:
- Control primitives są fundamentem, nie redesignem.
- Bezpiecznie przepięte mogą być tylko małe, samowystarczalne kontrolki.
- Kontrolki w dashboard widgets, category tree, transaction creator, calendar, reminder panel i auth pozostają legacy do osobnych etapów.

## 6. Surface Hierarchy

Zdefiniowane surfaces:
- app background
- workspace
- sidebar
- rail
- widget
- modal
- overlay
- floating layer

CSS tokens:
- `--ui-surface-app-background`
- `--ui-surface-workspace`
- `--ui-surface-sidebar`
- `--ui-surface-rail`
- `--ui-surface-widget`
- `--ui-surface-modal`
- `--ui-surface-overlay`
- `--ui-surface-floating`

UI-FOUNDATION-5 dodaje `uiSurfacePrimitives` dla:
- `card`
- `panel`
- `utilityPanel`
- `modalSurface`
- `modalSurfaceNeutral`
- `modalSurfacePrompt`
- `modalSurfaceStrong`
- `modalSurfaceInfoBorder`
- `dropdownSurface`
- `profileDropdownSurface`
- `popoverSurface`
- `widgetSurface`
- `emptyState`
- `infoBox`
- `statusBox.danger`

Surface tokeny w CSS:
- `--ui-surface-card`
- `--ui-surface-dropdown`
- `--ui-surface-info`
- `--ui-surface-status-danger`
- `--ui-surface-border-default`
- `--ui-surface-border-control`
- `--ui-surface-border-info`
- `--ui-surface-border-danger`
- `--ui-surface-empty-border`
- `--ui-surface-card-padding`
- `--ui-surface-panel-padding`
- `--ui-surface-modal-padding`
- `--ui-surface-modal-padding-compact`
- `--ui-surface-dropdown-padding`
- `--ui-surface-popover-padding`
- `--ui-surface-empty-padding`
- `--ui-surface-status-padding`
- `--ui-surface-status-radius`
- `--ui-surface-modal-shadow-prompt`

Zasada:
- Surface hierarchy opisuje głębokość i rolę UI, nie nowy wygląd.
- Przyszły DS powinien najpierw przepiąć powierzchnie, a dopiero później zmieniać estetykę.
- `widgetSurface` jest tylko kontraktem foundation; dashboard widgets pozostają legacy do osobnego etapu.

## 7. Layout Shell Foundation

UI-FOUNDATION-6 dodaje `uiLayoutPrimitives` dla:
- `appShell`
- `topbar`
- `leftSidebar`
- `rightRail`
- `workspace`
- `sidePanel`
- `drawer`
- `floatingLayer`

Layout shell tokeny w CSS:
- `--ui-shell-left-width`
- `--ui-shell-right-rail-width`
- `--ui-shell-top-height`
- `--ui-shell-gap`
- `--ui-shell-radius`
- `--ui-shell-workspace-rail-width`
- `--ui-shell-desktop-breakpoint`
- `--ui-shell-collapse-breakpoint`
- `--ui-topbar-inset-y`
- `--ui-topbar-inset-x`
- `--ui-topbar-radius`
- `--ui-topbar-gap`
- `--ui-topbar-padding`
- `--ui-topbar-min-height`
- `--ui-topbar-brand-width`
- `--ui-topbar-max-width`
- `--ui-left-sidebar-width`
- `--ui-left-sidebar-radius`
- `--ui-left-sidebar-desktop-inset`
- `--ui-left-sidebar-padding`
- `--ui-right-rail-width`
- `--ui-right-rail-content-max-width`
- `--ui-right-rail-sticky-top`
- `--ui-drawer-left`
- `--ui-drawer-top`
- `--ui-drawer-width`
- `--ui-drawer-bottom-gap`
- `--ui-side-panel-left`
- `--ui-side-panel-top`
- `--ui-side-panel-bottom-gap`
- `--ui-side-panel-width`
- `--ui-side-panel-profile-width`
- `--ui-side-panel-settings-width`
- `--ui-side-panel-utility-width`
- `--ui-side-panel-import-export-width`
- `--ui-side-panel-radius`
- `--ui-floating-layer-z`

Bezpiecznie przepięte shell elementy:
- `app/styles/shell.css`
- `app/styles/topbar/topbar-shell.css`
- `app/styles/left-sidebar.css`
- `app/styles/right-rail/right-rail-shell.css`
- `app/styles/side-panels/side-panels-shell.css`

Zasada:
- Layout shell tokens opisują istniejące pozycje, szerokości i warstwy; nie definiują nowego layoutu.
- Breakpoint tokens są dokumentacyjne, bo CSS custom properties nie mogą sterować media query.
- `layout-depth/*`, mobile stabilization, category z-index emergency, entries popup i transaction creator mobile overrides pozostają legacy shell bridge.

## 8. Glass System Foundation

Zdefiniowano:
- blur scale
- transparency scale
- border opacity scale
- elevation hierarchy

Tokens:
- `--ui-blur-xs`
- `--ui-blur-sm`
- `--ui-blur-md`
- `--ui-blur-lg`
- `--ui-blur-xl`
- `--ui-blur-2xl`
- `--ui-glass-border-soft`
- `--ui-glass-border-strong`
- `--ui-glass-surface-soft`
- `--ui-glass-surface`
- `--ui-glass-surface-strong`

Zasada:
- Glass effects nie powinny być dopisywane lokalnie.
- Nowe blur/saturate/alpha mają przechodzić przez tokens.
- Obecne glass CSS pozostaje bez redesignu.

## 9. Motion Foundation

Zdefiniowano:
- `--ui-motion-fast`
- `--ui-motion-normal`
- `--ui-motion-slow`
- `--ui-motion-hover`
- `--ui-motion-overlay`
- `--ui-motion-drawer`
- `--ui-motion-modal`
- `--ui-motion-ease-standard`
- `--ui-motion-ease-emphasized`

Zasada:
- Nie dodajemy nowego animation polish.
- Przyszłe hover/overlay/drawer/modal timings mają korzystać z tokenów.
- Istniejące animacje można później przepinać mechanicznie.

## 10. CSS Architecture Audit

Legacy emergency `!important`:
- `app/styles/layout-depth/base-depth.css`
- `app/styles/layout-depth/targeted-overrides.css`
- `app/styles/layout-depth/mobile-stabilization.css`
- `app/styles/layout-depth/transaction-creator-mobile.css`
- duże fragmenty `app/styles/category-tree/*`
- część `app/styles/dashboard.css`
- część `app/styles/modals.css`

Override do późniejszego usunięcia:
- targetowane selektory po `[style*="..."]`
- warstwy `layout-depth/*`
- mobile panel overrides, które ręcznie walczą z panelem
- category tree z wysokimi warstwami popoverów
- topbar dropdown warstwy z historycznie ekstremalnymi wartościami

Najbardziej niebezpieczne dla future DS:
- `app/styles/layout-depth/targeted-overrides.css`
- `app/styles/category-tree/category-row.css`
- `app/styles/category-tree/entries-popup.css`
- `app/styles/topbar/topbar-controls.css`
- `app/styles/side-panels/side-panels-shell.css`
- `components/budget-app/useFloatingDropdownDismissal.ts`

Zasada:
- Nie usuwać emergency CSS w tym etapie.
- Oznaczyć je jako legacy bridge.
- Przyszły cleanup robić po wdrożeniu primitives i overlay systemu.

## 11. Dashboard Widget Foundation

Kontrakt widgetów:
- widget shell
- widget header
- widget body
- widget controls
- widget metric blocks
- widget chart surfaces

Istniejący punkt startowy:
- `components/dashboard-widget/dashboardWidgetTileStyles.ts`

Docelowe primitives:
- `DashboardWidgetShell`
- `DashboardWidgetHeader`
- `DashboardWidgetBody`
- `DashboardWidgetControls`
- `DashboardMetricBlock`
- `DashboardChartSurface`

Zasada:
- Widgety nie są redesignowane.
- Obecne style widgetów pozostają.
- Nowe widgety powinny używać kontraktu shell/header/body/controls/metric/chart zamiast lokalnych surface definitions.

## 12. Nie Robić Jeszcze

Nie robić teraz:
- redesignu dashboardu
- redesignu topbara
- redesignu sidebara
- redesignu formularzy
- redesignu mobile
- redesignu auth
- final typography
- final gradients
- final banking style
- lokalnego polishu widgetów
- zmian logiki

## 13. Największy Dług UI

Największy dług:
- brak jednego overlay managera
- rozproszony z-index
- dużo `!important`
- kilka systemów modal/dropdown/popover
- inline styles w dużych komponentach
- dashboard widgets jako osobny mini design-system
- month calendar jako osobny mini design-system
- auth jako osobny mini design-system
- side panels i layout-depth jako awaryjna warstwa naprawcza

## 14. Najłatwiejsze Komponenty Do Przepięcia

Najłatwiej przepiąć później:
- `BudgetLimitIndicator`
- `BulkActionsBar`
- `UndoBanner`
- `DraftPromptModal`
- `DescriptionSuggestionDeleteMenu`
- `FinancialGoalEditModal`
- `RecurringExecutionConfirmModal`
- proste badge/tag/progress elementy w goals i limits

Powód:
- mały zakres
- powtarzalne primitive patterns
- mało zależności layoutowych

## 15. Najtrudniejsze Komponenty Do Przepięcia

Najtrudniejsze:
- `BudgetAppController`
- `BudgetCategoryTree`
- `Level3Section`
- `CategoryEntriesTreeView`
- `MonthCalendarPanel`
- `TransactionCreatorModal`
- `ReminderBellPanel`
- `PaymentSourcesPanel`
- `ImportExportPanel`
- `DashboardGrid`
- `components/dashboard-widget/*`
- `BudgetAuthScreens`

Powód:
- dużo inline styles
- mieszanie layoutu, interakcji i widoku
- własne mini systems
- zależność od historycznych override'ów

## 16. Legacy CSS Do Późniejszego Cleanupu

Lista cleanupu:
- `app/styles/layout-depth/base-depth.css`
- `app/styles/layout-depth/targeted-overrides.css`
- `app/styles/layout-depth/mobile-stabilization.css`
- `app/styles/layout-depth/transaction-creator-mobile.css`
- `app/styles/mobile/mobile-panel-overrides.css`
- `app/styles/category-tree/category-row.css`
- `app/styles/category-tree/entries-popup.css`
- `app/styles/category-tree/level1.css`
- `app/styles/category-tree/menus.css`
- `app/styles/topbar/topbar-controls.css`
- `app/styles/modals.css`
- `app/styles/dashboard.css`
- local inline styles w `components/dashboard-widget/*`

Cleanup warunek:
- Najpierw primitives i overlay system.
- Potem surface hierarchy.
- Dopiero potem usuwanie emergency overrides.

## 17. Final Contract

Od tego etapu:
- nowe warstwy UI używają `foundation.css` albo `uiFoundation.ts`
- nowe overlaye nie dodają magicznych z-indexów
- nowe komponenty nie tworzą lokalnych primitive variants bez nazwania ich w foundation
- istniejące style nie są redesignowane bez osobnego etapu
- logika pozostaje zgodna z `ARCHITECTURE_FREEZE.md` i `UI_LOGIC_BOUNDARY.md`
