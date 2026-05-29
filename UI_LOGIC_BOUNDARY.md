# UI LOGIC BOUNDARY

Data boundary: 2026-05-25

Ten dokument definiuje granicę między zamrożoną logiką BudżAppki a przyszłym UI foundation i design-system.

To nie jest design-system. To nie jest redesign. To nie jest etap wyglądu, CSS, layoutu ani widgetów. To jest kontrakt warstw: UI ma prezentować gotowe znaczenie, a nie tworzyć własną logikę domenową.

Dokument obowiązuje razem z:
- `ARCHITECTURE_FREEZE.md`
- `DO_NOT_BREAK_CONTRACTS.md`

## Zasada nadrzędna

UI nie jest source-of-truth dla finansów, scope, znaków kwot, kategorii root, przypomnień, płatności, kosza, profili ani dashboardu.

UI może:
- renderować
- formatować
- układać
- animować
- obsługiwać interakcję
- pokazywać stany semantyczne dostarczone z logiki

UI nie może:
- zgadywać znaczenia danych
- filtrować historii finansowej jako logiki biznesowej
- liczyć równoległych agregacji domenowych
- tworzyć lokalnych wyjątków dla payment/reminder/scope
- chować funkcji bez logic-off
- zapisywać danych profilowych bez scope użytkownika i profilu

## 1. Transaction Scope Boundary

UI nie może:
- filtrować lokalnie transakcji jako source-of-truth
- liczyć excluded months
- liczyć budgetStartDate
- zgadywać active scope
- decydować lokalnie, czy kosz ma być widoczny w danych
- traktować `date.slice(0, 7)` albo `date.startsWith()` jako scope biznesowego

UI dostaje:
- gotowy scoped dataset
- gotowe agregacje
- gotowe view modele
- gotowe listy active/trash/export, zależnie od trybu

Granica:
- Scope kończy się w helperach domenowych, głównie `getEffectiveTransactionScope()`.
- Prezentacja zaczyna się dopiero po wybraniu właściwego datasetu.

Dozwolone w UI:
- filtrowanie widocznej listy już scoped danych na potrzeby wyszukiwarki albo kontrolki prezentacyjnej
- sortowanie widocznych elementów
- paginacja, rozwijanie, zwijanie i grupowanie wizualne

Niedozwolone w UI:
- tworzenie nowego wariantu scope
- lokalne ignorowanie `is_deleted`
- lokalne docinanie historii przez `budgetStartDate`
- lokalne usuwanie excluded months z historii

## 2. Signed Amount Boundary

UI nie może:
- zgadywać plus/minus
- interpretować nazw kategorii
- odwracać lokalnie kwot
- traktować dodatniego `amount` jako przychodu
- liczyć przychodów i wydatków po tekście UI

UI dostaje:
- signed amount
- semantic type, np. `income`, `expense`, `unknown`
- formatted state, np. label, kolor, wariant, trend direction

Granica:
- Znak kwoty kończy się w kontrakcie domenowym `getSignedAmountByRootType()` albo w helperach opartych o ten kontrakt.
- UI może użyć znaku tylko jako gotowego stanu do prezentacji.

Dozwolone w UI:
- formatowanie waluty
- wybór koloru na podstawie gotowego typu semantycznego
- ikony plus/minus jako prezentacja gotowego typu

Niedozwolone w UI:
- `amount * -1`
- `category.name.includes(...)`
- `amount > 0 ? income : expense`

## 3. Root Category Boundary

UI nie może:
- rozpoznawać rootów po nazwach
- znać logiki "Przychody/Wydatki" jako kontraktu
- znać logiki "stałe/zmienne" jako kontraktu biznesowego
- zakładać, że użytkownik nie zmieni nazw rootów

UI używa:
- root contract
- metadata
- root ids/types
- gotowych path labels jako tekstów prezentacyjnych

Granica:
- Root category i kierunek finansowy kończą się w helperach domenowych.
- UI dostaje root id/type albo gotową strukturę kategorii do renderowania.

Dozwolone w UI:
- wyświetlanie nazw kategorii użytkownika
- wyświetlanie etykiet "Przychody" i "Wydatki" jako tekstu interfejsu
- style zależne od gotowego root type

Niedozwolone w UI:
- rozpoznawanie root type po polskiej nazwie
- logika widgetu oparta o "stałe" albo "zmienne"
- fallback po kolejności rootów poza centralnym helperem

## 4. Reminder Boundary

UI nie może:
- interpretować `skipped`, `completed`, `read`, `linked`
- tworzyć lokalnych lifecycle
- liczyć pending samodzielnie
- traktować snooze jako wykonania
- tworzyć osobnej logiki zaległości

UI dostaje:
- lifecycle state
- reminder actions
- reminder month status
- gotowe informacje o powiązanej transakcji
- gotowy stan widoczności dzwonka i panelu

Granica:
- Reminder lifecycle kończy się w `lib/recurringTransactions.ts`.
- UI renderuje status i wywołuje akcje, ale nie rozstrzyga znaczenia statusu.

Dozwolone w UI:
- label statusu
- badges i empty states
- przyciski wykonania, pominięcia, snooze, połączenia z transakcją

Niedozwolone w UI:
- lokalne `status === 'skipped'`
- lokalne `status === 'completed'`
- lokalne `status === 'read'`
- lokalne `status === 'linked'`
- lokalny licznik pending w komponencie

## 5. Payment Attribution Boundary

UI nie może:
- liczyć splitów
- rozdzielać płatności lokalnie
- interpretować głównego źródła
- ignorować splitów, gdy istnieją
- działać logicznie, gdy moduł źródeł płatności jest wyłączony

UI dostaje:
- payment attribution
- allocated amounts
- grouped payment data
- primary payment source jako gotowy stan
- listy i statystyki policzone przez centralne helpery

Granica:
- Attribution kończy się w `getPaymentSourceAttribution()` i `buildPaymentSourceStats()`.
- UI może renderować grupy, ale nie może ich wyliczać jako source-of-truth.

Dozwolone w UI:
- tabela źródeł płatności
- badges, opisy i sumy dostarczone w propsach
- edycja inputów splitu przed zapisem, jeśli walidacja i payload idą przez centralny helper

Niedozwolone w UI:
- lokalne `filter().reduce()` dla split stats
- search tylko po `transaction.payment_source_id`
- własny algorytm primary source

## 6. Feature Toggle Boundary

UI nie może:
- robić UI-only disable
- chować funkcji bez logic-off
- utrzymywać modułu działającego w tle po ukryciu panelu
- definiować własnej listy opcjonalnych modułów

Feature toggle:
- wyłącza logikę
- UI tylko respektuje stan
- simple mode jest polityką logiczną, nie tylko stylem

UI dostaje:
- effective app mode
- effective module visibility
- feature-specific enabled flags

Granica:
- Polityka modułów kończy się w `modulePolicy`.
- UI renderuje dostępność, ale nie decyduje, czy moduł logicznie działa.

Dozwolone w UI:
- disabled state
- ukrycie panelu po logic-off
- komunikat o niedostępności modułu

Niedozwolone w UI:
- `display: none` jako jedyny toggle
- lokalny `simpleMode` jako polityka biznesowa
- pobieranie/liczenie danych modułu wyłączonego logicznie

## 7. Dashboard Boundary

Widget nie może:
- agregować lokalnie historii jako source-of-truth
- liczyć własnego scope
- interpretować excluded months lokalnie jako filtra historii
- zgadywać typów kategorii
- dublować podstawowych agregacji dashboardu

Widget dostaje:
- prepared dashboard data
- prepared aggregates
- prepared trend series
- prepared empty/excluded states
- gotowe semantic states do renderowania

Granica:
- Dashboard aggregation kończy się w `lib/dashboardStats.ts`, `lib/dashboard-stats/*` i przyszłych dashboard view-model builders.
- Widget renderuje wykres, listę, kafel albo summary.

Dozwolone w widgetach:
- obliczenia czysto prezentacyjne, np. procent szerokości paska na podstawie gotowej wartości
- formatowanie etykiet osi
- sortowanie już przygotowanych elementów widoku, jeśli nie zmienia sensu danych

Niedozwolone w widgetach:
- lokalne przechodzenie po całej historii w celu policzenia głównych sum
- własny scope per widget
- excluded month jako zero w trendzie
- `currentMonthTransactions` jako historia dashboardu

## 8. Dayless Boundary

UI nie może:
- przypisywać wpisów dayless do fake date
- wrzucać dayless do heatmapy
- traktować pustego dnia jako 1. dnia miesiąca
- ukrywać `day_is_null` podczas prezentacji dziennej

UI dostaje:
- jawny dayless state
- jawne grouped sections
- osobne sekcje "bez dnia" tam, gdzie są potrzebne
- gotowe buckets tylko dla transakcji z konkretnym dniem

Granica:
- Dayless kończy się w helperach `isDaylessTransaction()`, `getTransactionDay()`, `splitTransactionsByDayPresence()` i `bucketTransactionsByConcreteDay()`.
- UI pokazuje dzień albo stan bez dnia, ale go nie wymyśla.

Dozwolone w UI:
- label "bez dnia"
- osobna sekcja wpisów miesięcznych
- pusty input dnia jako intencja dayless w formularzu

Niedozwolone w UI:
- `day || 1`
- `Number(date.slice(8, 10))` bez sprawdzenia dayless
- dayless w daily heatmap

## 9. Trash / Deleted Boundary

UI nie może:
- filtrować deleted lokalnie jako kontraktu
- interpretować kosza
- mieszać active dataset z trash dataset
- decydować samodzielnie, co wchodzi do export-active

UI dostaje:
- active dataset
- trash dataset
- restore actions
- soft delete actions
- permanent delete actions
- undo/restore state

Granica:
- Kosz i deleted scope kończą się w `getEffectiveTransactionScope()` oraz actions warstwy transakcji.
- UI renderuje panel kosza i akcje, ale nie wybiera logiki przynależności.

Dozwolone w UI:
- potwierdzenia
- sortowanie listy kosza
- stan undo
- komunikaty i badge

Niedozwolone w UI:
- `transaction.is_deleted !== true` jako lokalny kontrakt aktywności
- export active z koszem
- backup full udający aktywny export

## 10. Multiuser Boundary

UI nie może:
- przechowywać globalnego stanu bez profile/user scope
- tworzyć globalnych storage keys
- zapisywać ustawień profilu bez `profileId`
- odpalać mutacji profilu bez profilu
- mieszać stanu między userami i profilami

UI dostaje:
- `userId`
- `profileId`
- scoped storage key
- scoped profile data
- profile actions

Granica:
- Multiuser/profile ownership kończy się w `profile_id`, helperach storage i hookach danych.
- UI pokazuje profil i ustawienia, ale nie tworzy własnego globalnego stanu domenowego.

Dozwolone w UI:
- lokalny transient state formularza
- open/close state panelu
- kontrolki profilu korzystające ze scoped props

Niedozwolone w UI:
- `localStorage.setItem('dashboardLayout', ...)`
- storage bez `userId:profileId:featureKey`
- profile mutation bez `.eq('profile_id', profileId)` albo payloadu `profile_id`

## 11. ViewModel Rule

Docelowo duże komponenty UI mają dostawać:
- prepared props
- prepared view models
- semantic states
- gotowe grouped data
- gotowe action handlers

Docelowo duże komponenty UI nie powinny dostawać:
- surowej historii do samodzielnego scope
- surowych categories do zgadywania rootów
- surowych splitów do liczenia attribution
- surowych reminder statuses do interpretacji lifecycle
- surowych flags do lokalnej polityki toggle

Reguła:
- Domena buduje znaczenie.
- View-model układa znaczenie pod ekran.
- UI renderuje znaczenie.

Przykładowe future view-model layers:
- dashboard view models dla widgetów
- transaction list view models dla drzewa i kalendarza
- reminder bell view model
- payment source panel view model
- import/export status view model
- trash panel view model

## 12. Forbidden Future Anti-Patterns

Zakazane po tej granicy:
- local scope logic
- local plus/minus
- category-name heuristics
- widget-specific transaction filtering
- inline business rules
- duplicated dashboard aggregations
- local excluded-month handling
- UI-only toggles
- local payment split calculations
- local reminder lifecycle
- local trash/deleted filtering
- global profile storage keys
- `day || 1` dla dayless
- direct `date.slice(0, 7)` jako scope finansowy
- `transaction.payment_source_id` jako jedyna prawda payment attribution

Jeśli przyszły design-system wymaga danych w innym kształcie, należy dodać albo rozszerzyć view-model builder, nie przepychać logiki do komponentu wizualnego.

## 13. Allowed Future UI Work

Dozwolone po tej granicy:
- typography
- spacing
- tokens
- layout
- responsive system
- animation system
- visual hierarchy
- component styling
- interaction polish
- focus states
- keyboard ergonomics
- accessibility states
- icon system
- component composition
- shell/navigation structure

Warunek:
- Prace UI nie zmieniają kontraktów logicznych.
- Prace UI nie przenoszą domeny do komponentów prezentacyjnych.
- Prace UI nie rozszerzają legacy fallbacków.

## 14. Potential UI / Logic Conflict Areas

Najbardziej prawdopodobne miejsca przyszłych konfliktów:
- dashboard widgets, bo część widgetów nadal przyjmuje transakcje i helpery domenowe
- calendar / heatmap, bo dayless i budgetStartDate łatwo pomylić z prezentacją dat
- category tree, bo miesza strukturę kategorii, transakcje, kwoty i interakcje
- reminder bell, bo lifecycle ma legacy statusy pod spodem
- payment sources panel, bo prezentacja splitów łatwo zaczyna liczyć attribution
- import/export panel, bo format plików bywa mylony z logiką aktywnego exportu
- settings panel, bo toggle może wyglądać jak czysty UI, ale jest logic gate
- localStorage-backed UI state, bo łatwo ominąć `userId:profileId:featureKey`

Te miejsca nie wymagają teraz refaktoru. Wymagają ostrożności przy przyszłym UI foundation.

## 15. Components That Need Future ViewModel Layer Most

Najbardziej wymagające future view-model layer:
- `components/BudgetAppController.tsx`
- `components/budget-app/useBudgetAppControllerViewProps.tsx`
- `components/budget-app/useBudgetPageMainPanelsProps.tsx`
- `components/DashboardPanel.tsx`
- `components/DashboardGrid.tsx`
- `components/dashboard-widget/*`
- `components/MonthCalendarPanel.tsx`
- `components/BudgetCategoryTree.tsx`
- `components/Level3Section.tsx`
- `components/category-tree/CategoryEntriesTreeView.tsx`
- `components/ReminderBellPanel.tsx`
- `components/RecurringTransactionsPanel.tsx`
- `components/PaymentSourcesPanel.tsx`
- `components/ImportExportPanel.tsx`
- `components/BudgetPageStatusPanels.tsx`

Powód:
- te komponenty albo przekazują dużo domenowych propsów, albo tworzą view-state blisko logiki, albo są ekranami łączącymi wiele kontraktów naraz.

## 16. Logic-Heavy Components Still Tolerated

Stare komponenty nadal zbyt logic-heavy, ale tolerowane po freeze:
- `BudgetAppController.tsx`
- `BudgetCategoryTree.tsx`
- `BudgetPageStatusPanels.tsx`
- `Level3Section.tsx`
- `CategoryEntriesTreeView.tsx`
- `MonthCalendarPanel.tsx`
- `ReminderBellPanel.tsx`
- `ImportExportPanel.tsx`
- `DashboardGrid.tsx`
- dashboard widgets z lokalnymi view calculations

Kontrakt tolerancji:
- Nie pogłębiać mieszania UI i domeny.
- Nie dodawać nowych reguł biznesowych do tych komponentów.
- Nowe potrzeby danych wyciągać do helperów domenowych albo view-model builders.
- Refaktory UI mają przesuwać logikę od komponentów do przygotowanych propsów, nie odwrotnie.

## Final Boundary

Po tej granicy przyszły design-system ma traktować logikę jako zamrożoną usługę domenową.

UI może zmienić to, jak aplikacja wygląda i jak się jej używa. UI nie może zmienić tego, co aplikacja uznaje za aktywną transakcję, przychód, wydatek, root, przypomnienie, źródło płatności, kosz, profil, dashboard month, excluded month, budgetStartDate ani dayless.
