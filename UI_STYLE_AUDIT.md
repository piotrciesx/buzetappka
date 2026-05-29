# UI STYLE AUDIT

Data audytu: 2026-05-25

Zakres: tylko raport. Nie zmieniono kodu, CSS ani działania aplikacji.

Cel audytu: wskazać miejsca, gdzie wygląd jest ustawiany lokalnie zamiast przez wspólny design system.

## Podsumowanie

Aplikacja ma już częściowe style współdzielone, ale nie ma jednego spójnego design-systemu. Widoczne są trzy warstwy stylowania:

- globalne i obszarowe CSS w `app/styles/*`
- centralny, ale nadal lokalny obiekt `lib/budgetPageStyles.ts`
- liczne obiekty `CSSProperties` i inline `style={...}` w komponentach

Największe skupiska lokalnych stylów:
- `components/dashboard-widget/*`
- `components/BudgetAuthScreens.tsx`
- `components/PaymentSourcesPanel.tsx`
- `components/ImportExportPanel.tsx`
- `components/ReminderBellPanel.tsx`
- `components/TrashPanel.tsx`
- `components/month-calendar/*`
- `components/recurring-transactions/*`
- `components/financial-goals/*`
- `app/styles/layout-depth/*`
- `app/styles/category-tree/*`
- `app/styles/topbar/*`
- `app/styles/right-rail/*`
- `app/styles/side-panels/*`

## Raport

| Plik | Element | Lokalny styl | Co powinno trafić do design systemu | Ryzyko |
|---|---|---|---|---|
| `lib/budgetPageStyles.ts` | `page` | Font stack, tło, kolor bazowy, padding strony | `--font-family-app`, page background tokens, app shell spacing | Wysokie: baza aplikacji może rozjechać się z nowym shell/UI foundation |
| `lib/budgetPageStyles.ts` | `topPanel`, `card`, `infoBox`, `emptyStateCard` | Lokalne gradienty, border, radius 12/14, shadows, padding | `Surface`, `Panel`, `Card`, `InfoBox` tokens | Wysokie: panele różnych modułów będą wyglądały podobnie, ale nie identycznie |
| `lib/budgetPageStyles.ts` | `primaryButton`, `secondaryButton`, `dangerButton` | Lokalne button variants, gradienty, border, fontWeight, radius 8 | `Button` variants: primary, secondary, danger, ghost, compact | Wysokie: wiele komponentów nadpisuje przyciski własnymi wariantami |
| `lib/budgetPageStyles.ts` | `input`, `smallInput` | Lokalne input height, padding, border, radius, fontSize | `Input`, `Select`, size tokens `sm/md` | Wysokie: formularze mają różne wysokości, radiusy i stany focus |
| `lib/budgetPageStyles.ts` | `floatingActionPanel`, `floatingActionButton` | Fixed position, zIndex 950, circular buttons, income/expense gradients | `FloatingActionButton`, z-index token, semantic action colors | Średnie: kolizje z modalami/dropdownami i mobile shell |
| `components/BudgetAuthScreens.tsx` | `authStyles` | Osobny system fontów, kolorów, szkła, radius 28-34, shadows | Auth layout tokens albo osobny `AuthSurface` w DS | Wysokie: ekran auth ma oddzielny język wizualny od aplikacji |
| `components/BudgetAuthScreens.tsx` | Inputs, primary/secondary/text buttons | Lokalne button/input shells, radii 14/18/999, hardcoded blue/navy | DS form controls i button variants | Wysokie: auth będzie trudny do zsynchronizowania z resztą UI |
| `components/BudgetLimitEditorModal.tsx` | Modal overlay/content/actions | Lokalne overlay, z-index, modal radius 16, shadow, button variants | `Modal`, `ModalOverlay`, `DialogActions`, z-index scale | Wysokie: kilka modali ma własne overlaye i stacking |
| `components/financial-goals/FinancialGoalEditModal.tsx` | Modal | Lokalne `zIndex: 1000`, radius 16, shadow | Wspólny modal token i stacking layer | Wysokie: konflikt z innymi modalami/dropdownami |
| `components/DraftPromptModal.tsx` | Modal | Lokalne `zIndex: 1100`, shadow, radius 16 | `Modal` + z-index token | Wysokie: z-index różni się od innych modal layers |
| `components/RecurringExecutionConfirmModal.tsx` | Modal | Osobny overlay/content style | `Modal`/`ConfirmationDialog` | Średnie: wizualnie podobny modal może odbiegać od reszty |
| `components/month-calendar/monthCalendarStyles.ts` | Calendar modal | Overlay `zIndex: 1000`, modal radius 16, shadow, border | `Modal`, `CalendarDialog`, overlay token | Wysokie: kalendarz ma własny modal system |
| `components/DescriptionSuggestionDeleteMenu.tsx` | Dropdown/popover | Lokalne `zIndex: 1200/1201`, radius 12, shadow | `Dropdown`, `Popover`, z-index token | Wysokie: dropdown może konkurować ze shell/sidebar layers |
| `components/UserProfileMenu.tsx` | Profile dropdown/avatar/menu buttons | Lokalne dropdown, avatar button, menu button styles | `AvatarButton`, `Menu`, `MenuItem` | Średnie: menu profilowe nie korzysta z jednego dropdown pattern |
| `components/category-tree/level3SectionStyles.ts` | Suggestions dropdown, tag badges, compact buttons | Zduplikowane style dropdown/tag/button | `AutocompleteDropdown`, `Tag`, compact button sizes | Wysokie: bardzo podobne style istnieją też w inline add i month calendar |
| `components/category-tree/Level3InlineAddForm.tsx` | Suggestions dropdown/tag badges/buttons | Lokalne kopie dropdown, active item, tag badge, compact buttons | Wspólny autocomplete/tag/button system | Wysokie: duplikacja stylów i stanów hover/active |
| `components/month-calendar/MonthCalendarTransactionCard.tsx` | Suggestion rows, tag badges, amount color | Inline kolory aktywnej sugestii, tagi, form rows | `AutocompleteItem`, `Tag`, semantic amount color tokens | Średnie: lokalne stany aktywne i semantyczne kolory mogą się różnić |
| `components/PaymentSourcesPanel.tsx` | Panel/cards/settings/source list | Lokalne panel/card/badge/input/button/list styles | `SettingsPanel`, `SettingsCard`, `Badge`, `FormField` | Wysokie: cały panel ma własny mini system |
| `components/PaymentSourcesPanel.tsx` | responsivePaymentSourcesStyle | Lokalny string CSS w komponencie | Responsywność paneli w CSS/DS utilities | Średnie: CSS osadzony w komponencie utrudnia globalne reguły |
| `components/ImportExportPanel.tsx` | Panel, action rows, light buttons, status boxes | Lokalne panel/card/button/status style | `UtilityPanel`, `ActionRow`, `StatusBox`, `Button` variants | Wysokie: import/export ma lokalny układ i warianty przycisków |
| `components/TrashPanel.tsx` | Trash panel/list/rows/buttons | Lokalne panel, list row, fields, danger buttons | `UtilityPanel`, `ListRow`, `DangerButton`, `MetadataGrid` | Średnie: kosz może odbiegać od innych paneli narzędziowych |
| `components/ReminderBellPanel.tsx` | Reminder panel/dropdowns/actions | Dużo inline i lokalnych styles, lokalne przyciski/statusy | `NotificationPanel`, `ReminderCard`, `ActionButton`, `StatusBadge` | Wysokie: panel przypomnień miesza popup, listę, statusy i akcje |
| `components/reminder-bell/reminderBellStyles.ts` | Reminder details styles | Lokalne row/card/badge/details style | `DetailsPanel`, `StatusBadge`, `LinkedItemRow` | Średnie: szczegóły reminderów powinny dzielić tokens z innymi detail views |
| `components/BudgetLimitAlertsPanel.tsx` | Alert popover/list item | Lokalne popover, item button, count badge | `Popover`, `AlertBadge`, `AlertItem` | Średnie: alerty limitów mają własny popover pattern |
| `components/BulkActionsBar.tsx` | Bulk action bar | Lokalne layout/button/status style | `BulkActionBar`, `ToolbarButton`, `SelectionBadge` | Średnie: action bary mogą pojawić się w innych modułach |
| `components/DraftsPanel.tsx` | Draft cards/buttons | Lokalny card/button/badge system | `DraftCard`, `Card`, `Badge`, button variants | Średnie: powiela karty i pill badges |
| `components/SearchPanel.tsx` | Search filters/results | Lokalne style wielu pól, wyników i akcji | `SearchPanel`, `FilterBar`, `ResultRow`, `InputGroup` | Wysokie: search zwykle wymaga spójnych inputów, list i badges |
| `components/search-panel/searchPanelStyles.ts` | Search style module | Lokalne panel/result/filter tokens | DS search primitives | Średnie: już wyciągnięte, ale nadal poza systemem tokenów |
| `components/TransactionCreatorModal.tsx` | Transaction creator layout/inline overrides | Inline form order, input wrappers, suggestion styles, colors | `TransactionForm`, `FormField`, responsive form grid, autocomplete tokens | Wysokie: kluczowy flow ma dużo lokalnych wyjątków wizualnych |
| `components/transaction-creator/transactionCreatorModalStyles.ts` | Creator modal styles | Lokalny modal/form/button/input style module | `Modal`, `Form`, `SegmentedControl`, `Button`, `Input` | Wysokie: powinien stać się jednym z głównych wzorców DS |
| `components/transaction-creator/TransactionCreatorModeToggles.tsx` | Mode toggles | Lokalne toggles/active state | `SegmentedControl`, semantic transaction type tokens | Średnie: może rozjechać się z innymi segmented controls |
| `components/recurring-transactions/recurringTransactionsPanelStyles.ts` | Recurring panel/card/progress | Lokalne card, badge, progress, gradient | `RecurringCard`, `ProgressBar`, `Badge`, panel tokens | Średnie: powiela karty i progress bary |
| `components/recurring-transactions/RecurringTransactionForm.tsx` | Form inputs/selects | Wielokrotne `styles.input` z lokalnymi width overrides | `FormGrid`, `Input`, `Select`, `Checkbox` | Średnie: forma wymaga systemowych field sizes |
| `components/financial-goals/FinancialGoalCard.tsx` | Goal card/progress/actions | Lokalna karta, progress bar, drag shadow, action styles | `GoalCard`, `ProgressBar`, drag state token | Średnie: podobne wzorce do budget limits i dashboard |
| `components/financial-goals/financialGoalsPanelUtils.ts` | Goal panel utility styles | Lokalne helper styles | DS panel/card/list helpers | Niskie/średnie: mniej rozproszone, ale poza tokenami |
| `components/ProfileMembersPanel.tsx` | Member rows/invite/delete account sections | Inline grid/flex, borders, danger colors | `ProfileSection`, `MemberRow`, `DangerZone`, form controls | Wysokie: profile/settings powinny mieć wspólny system |
| `components/ProfileMonthNotePanel.tsx` | Notes panel | Inline panel/list/action styles | `NotesPanel`, `NoteCard`, `Toolbar` | Średnie: notatki będą wyglądać inaczej niż inne utility panels |
| `components/DashboardGrid.tsx` | Grid canvas/ghost/drag state | Lokalne grid/ghost geometry | `DashboardGrid`, drag overlay tokens | Średnie: dashboard layout potrzebuje własnych, nazwanych primitives |
| `components/dashboard-widget/dashboardWidgetTileStyles.ts` | Widget tile, metric cards, controls | Lokalny token set: colors, tile surface, glass, cards, controls | `DashboardWidget`, `MetricCard`, chart tokens, semantic colors | Wysokie: to osobny mini design-system widgetów |
| `components/dashboard-widget/TopItemsWidget.tsx` | Top items widget | Dużo lokalnych CSSProperties i inline chart styles | `WidgetList`, `ChartPanel`, `RankBadge`, semantic colors | Wysokie: bardzo logic-heavy i style-heavy widget |
| `components/dashboard-widget/StabilityLeaksWidget.tsx` | Panels, hero, bars, counts | Lokalne panel/card/bar/status style set | `WidgetPanel`, `StatusHero`, `BarChart`, `StatusBadge` | Wysokie: powiela powierzchnie i wykresy |
| `components/dashboard-widget/BudgetControlWidget.tsx` | Budget control widget | Lokalne chart/control/status styles | `BudgetControlWidget` primitives, progress/chart tokens | Wysokie: duża liczba lokalnych wariantów |
| `components/dashboard-widget/DailyAveragesWidget.tsx` | Cards/charts | Lokalne gradient cards, chart blocks | `MetricCard`, `ChartSurface`, data-viz tokens | Średnie: spójność dashboard data-viz |
| `components/dashboard-widget/DayActivityWidget.tsx` | Heatmap/cards | Lokalne heatmap colors/radius/shadows | Heatmap tokens, metric surface tokens | Średnie: heatmap colors powinny być globalne |
| `components/dashboard-widget/WeeklyTrendWidget.tsx` | Trend chart/cards | Lokalne chart surface, bars, labels | Chart tokens, trend colors, radius scale | Średnie: wykresy trendów mają osobne style |
| `components/dashboard-widget/IncomeExpenseTrendWidget.tsx` | Trend dropdown/chart | Lokalne dropdown `zIndex: 20`, chart controls, colors | `ChartDropdown`, z-index token, chart series tokens | Średnie: dropdown w widgetach ma własny stack |
| `components/dashboard-widget/MonthFinanceWidget.tsx` | Circular visuals/cards | Inline circles, shadows, cards | `MetricCard`, `IconCircle`, semantic finance colors | Średnie: dekoracyjne warianty nie są tokenizowane |
| `components/month-calendar/monthCalendarStyles.ts` | Calendar cells, buttons, inputs, badges, heatmap | Duży lokalny styl modułu: grid, modal, form, dropdown, buttons, heatmap | `Calendar`, `CalendarCell`, `Modal`, `Button`, `Input`, `HeatmapLegend` | Wysokie: osobny mini system z własnymi kontrolkami |
| `components/month-calendar/buildMonthCalendarDayCells.tsx` | Day cell dynamic style | Inline dynamic backgrounds, focus ring, text color | `CalendarCell` state tokens: selected, future, excluded, heatmap scale | Średnie: dynamiczne stany mogą nie pasować do DS |
| `components/FloatingActionButtons.tsx` | Floating action buttons | Inline fixed action buttons | `FloatingActionButton` component/tokens | Średnie: duplikacja z `budgetPageStyles` |
| `components/UndoBanner.tsx` | Undo banner | Inline banner layout/button | `Toast`/`UndoBanner` primitive | Średnie: transient feedback powinien być systemowy |
| `components/BudgetLimitIndicator.tsx` | Progress indicator | Lokalne progress bar, icon, semantic colors | `ProgressBar`, `LimitIndicator`, semantic status tokens | Średnie: progress patterns powtarzają się w goals/widgets |
| `components/BudgetLimitAlertsPanel.tsx` | Badge/count/popover | Lokalny count badge i popover shadow | `AlertBadge`, `Popover` | Średnie: powtarza dropdown/popover problem |
| `app/styles/base.css` | Global buttons/inputs/focus | Global element selectors plus `!important` overrides | Base reset, focus ring, control tokens | Wysokie: global selectors mogą walczyć z komponentami DS |
| `app/styles/base.css` | CSS variables | Nieliczne vars: background/foreground/workspace shadows | Pełny token set: color, typography, spacing, radius, shadow, z-index | Wysokie: brak pełnych tokenów powoduje hardcoding w komponentach |
| `app/styles/shell.css` | Shell backgrounds, floating actions, month switch | Lokalne gradients, shadows, radii, selectors po data attributes i style attr | `AppShell`, `Topbar`, `FloatingActions`, shell tokens | Wysokie: shell będzie fundamentem UI architecture |
| `app/styles/topbar/topbar-controls.css` | Topbar buttons/dropdowns | Lokalne button styles, dropdown widths, selectors nth-child | `TopbarButton`, `TopbarDropdown`, icon button tokens | Wysokie: topbar jest bardzo specyficzny i trudny do generalizacji |
| `app/styles/topbar/topbar-shell.css` | Topbar shell | Lokalne shell layout/effects | Topbar layout tokens | Średnie: powinno wejść do shell DS |
| `app/styles/left-sidebar.css` | Left sidebar | Glass gradients, radius 28, shadows, backdrop blur | `Sidebar`, `NavItem`, glass/surface tokens | Wysokie: sidebar ma osobny glass system |
| `app/styles/right-rail/right-rail-shell.css` | Right rail | Gradients, radii, shadows, z-index 1200/3600/12000 | `RightRail`, `ContextCard`, z-index scale | Wysokie: kilka local z-index layers |
| `app/styles/right-rail/right-rail-live-widgets.css` | Live widgets | Local card/tabs/progress/mini chart styles | `LiveWidgetCard`, mini chart tokens, tab control | Średnie: powiela dashboard widget patterns |
| `app/styles/side-panels/side-panels-shell.css` | Utility panels | Panel z-index 2300/2600/2610, glass, widths, border radius | `SidePanel`, `Drawer`, overlay/stacking tokens | Wysokie: kluczowy stacking i layout paneli |
| `app/styles/side-panels/side-panels-details.css` | Settings/profile details | Buttons, inputs, danger/profile sections | `SettingsPanel`, `DangerZone`, form controls | Średnie: settings/profile style lokalne w CSS |
| `app/styles/dashboard.css` | Dashboard drawer/panel | Drawer overlay, blur, shadows, dashboard controls | `DashboardDrawer`, `DashboardPanel`, widget surface tokens | Wysokie: dashboard ma własną warstwę overlay/glass |
| `app/styles/category-tree/level1.css` | Level 1 cards | Local card gradients, shadows, drag/active states | `CategoryLevelCard`, drag state tokens | Wysokie: kategorie mają osobny system powierzchni |
| `app/styles/category-tree/category-row.css` | Category rows/popovers | Local row radius/shadow, popover z-index 20000/20010, glass blur | `CategoryRow`, `CategoryPopover`, z-index scale | Wysokie: dużo `!important` i wysokich z-indexów |
| `app/styles/category-tree/entries-popup.css` | Entries popup | z-index 130000, modal-like popup, buttons, badges | `EntriesPopup`, overlay/stacking token, list row tokens | Wysokie: ekstremalny z-index poza skalą |
| `app/styles/category-tree/toolbar.css` | Toolbar | Local toolbar buttons/filters | `Toolbar`, `IconButton`, `SegmentedControl` | Średnie: toolbar controls powinny być wspólne |
| `app/styles/category-tree/menus.css` | Menus | Local menu/dropdown styles | `Menu`, `Dropdown`, `MenuItem` | Średnie: menu pattern powiela topbar/profile/dropdowns |
| `app/styles/layout-depth/base-depth.css` | Layout reset/stacking | `!important`, z-index 90000/120000/120001, radius/shadow resets | Global stacking scale, shell layering contract | Wysokie: obecnie pełni rolę awaryjnej warstwy naprawczej |
| `app/styles/layout-depth/targeted-overrides.css` | Targeted overrides | Dużo `!important`, gradients, glass, z-index 22000, component-specific patches | Migration-only overrides; docelowo tokens/components | Wysokie: największe ryzyko konfliktów z przyszłym DS |
| `app/styles/layout-depth/mobile-stabilization.css` | Mobile overrides | Mobile z-index 2400/3100/3200, radius patches | Responsive shell tokens, mobile layer scale | Wysokie: mobilny layout może walczyć z DS breakpoints |
| `app/styles/layout-depth/transaction-creator-mobile.css` | Mobile creator | Mobile-specific radii, shadows, gradients, z-index | `TransactionCreator` responsive variants | Średnie/wysokie: osobna ścieżka stylowania formularza |
| `app/styles/mobile/mobile-base.css` | Mobile base | Mobile spacing/panel overrides | Responsive spacing tokens | Średnie: mobile style powinny wynikać z breakpoint tokens |
| `app/styles/mobile/mobile-panel-overrides.css` | Mobile panels | Panel overrides, local constraints | Responsive panel/drawer primitives | Średnie: ryzyko konfliktów przy nowym shellu |
| `components/budget-app/useFloatingDropdownDismissal.ts` | Floating dropdown z-index | Imperatywne ustawianie `z-index: 130000` | Centralny z-index manager / overlay system | Wysokie: styl ustawiany przez hook zamiast DS |

## Najważniejsze wzorce do design systemu

1. **Tokens**
   - kolory semantyczne: income, expense, danger, warning, success, info, muted
   - kolory powierzchni: app background, panel, card, elevated, glass
   - typography scale: title, section title, body, meta, caption, value
   - spacing scale: 2, 4, 6, 8, 10, 12, 14, 16, 18, 24, 32
   - radius scale: 4, 8, 10, 12, 14, 16, 18, 999
   - shadow scale: none, subtle, card, panel, popover, modal, floating
   - z-index scale: base, sticky, dropdown, popover, drawer, modal, toast, critical overlay
   - glass tokens: background alpha, border alpha, blur, saturation

2. **Primitives**
   - `Button`
   - `IconButton`
   - `Input`
   - `Select`
   - `Checkbox`
   - `SegmentedControl`
   - `Badge`
   - `Tag`
   - `Card`
   - `Panel`
   - `Modal`
   - `Popover`
   - `Dropdown`
   - `Toast`
   - `ProgressBar`
   - `Toolbar`

3. **App-specific components**
   - `AppShell`
   - `Topbar`
   - `Sidebar`
   - `RightRail`
   - `SidePanel`
   - `DashboardWidget`
   - `CalendarCell`
   - `TransactionRow`
   - `CategoryRow`
   - `ReminderCard`
   - `PaymentSourceCard`
   - `GoalCard`
   - `BudgetLimitIndicator`

## Największe ryzyka

| Ryzyko | Gdzie widać | Skutek |
|---|---|---|
| Brak jednej skali z-index | `layout-depth/*`, `entries-popup.css`, `side-panels-shell.css`, `useFloatingDropdownDismissal.ts`, modale komponentowe | Dropdowny, modale i panele będą przykrywać się przypadkowo |
| Wiele lokalnych modal systems | Budget limit, draft prompt, financial goal, recurring confirm, month calendar | Niespójne overlaye, focus states, spacing i mobile behavior |
| Wiele button variants | `budgetPageStyles`, auth, month calendar, payment sources, import/export, category tree | Niespójne affordance i stany hover/focus/disabled |
| Wiele input/select variants | `budgetPageStyles`, auth, month calendar, recurring form, payment sources, settings CSS | Różne wysokości pól i focus ringi |
| Hardcoded semantic colors | dashboard widgets, budget page, payment sources, goals, calendar | Trudna zmiana palety, możliwe konflikty accessibility |
| Glass effects bez tokenów | shell, sidebar, dashboard, side panels, widget tiles, auth | Trudno uzyskać spójny depth i performance na mobile |
| `!important` jako warstwa naprawcza | `app/styles/layout-depth/*`, `category-tree/*`, `dashboard.css`, `base.css` | DS może wymagać kolejnych override'ów zamiast prostszej kaskady |
| Inline styles w komponentach | większość dużych komponentów i widgetów | Trudna kontrola responsive, hover, focus i themingu |
| Lokalny CSS string w komponencie | `PaymentSourcesPanel.tsx` | Media queries i style poza normalną kaskadą |
| Wykresy i heatmapy stylowane lokalnie | dashboard widgets, month calendar | Brak wspólnych chart/heatmap tokens |

## Priorytet przyszłego design-systemu

1. Zdefiniować tokeny: kolor, spacing, radius, shadow, z-index, typography, glass.
2. Zbudować podstawowe kontrolki: Button, Input, Select, Checkbox, SegmentedControl, Badge, Tag.
3. Ujednolicić overlay system: Dropdown, Popover, Modal, Drawer, Toast.
4. Ujednolicić surfaces: Card, Panel, UtilityPanel, DashboardWidget.
5. Ujednolicić data-viz tokens: chart colors, heatmap scale, progress bars.
6. Dopiero potem ruszać konkretne moduły wizualnie.

## Uwagi końcowe

To jest audyt, nie lista zmian do wykonania teraz. Najważniejszy wniosek: przed redesignem warto najpierw ustalić wspólne tokeny i prymitywy, bo obecnie wygląd jest silnie rozproszony między CSS, obiektami `CSSProperties`, inline styles i targetowanymi override'ami.
