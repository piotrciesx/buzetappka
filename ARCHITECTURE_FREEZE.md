# ARCHITECTURE FREEZE

Data freeze: 2026-05-25

Ten dokument formalnie zamyka etap logiki BudżAppki przed design-system i UI architecture.

To nie jest refaktor ani plan migracji. To jest zamrożenie kontraktów logicznych. Nowe prace UI mogą zmieniać wygląd, ergonomię, layout, komponenty i podział widoków, ale nie mogą tworzyć równoległej logiki biznesowej ani nowych wyjątków lokalnych.

## Status freeze

Freeze wykonany dla kontraktów:
- transaction scope
- signed amount
- root category contract
- reminder lifecycle
- payment attribution
- trash / reset / export
- feature toggles
- multiuser / profile
- dashboard aggregation
- excluded months
- budgetStartDate
- dayless

`DO_NOT_BREAK_CONTRACTS.md` pozostaje manifestem ostrzegawczym. Ten dokument jest manifestem freeze: mówi, które kontrakty są finalne, co jest legacy, które fallbacki są tylko migracyjne i czego nie wolno dopisywać po freeze.

## Zasada nadrzędna

Od tego momentu nowy kod ma używać wyłącznie centralnych helperów kontraktowych.

Nie wolno:
- dodawać lokalnych scope transakcji
- dodawać lokalnych zasad plus/minus
- zgadywać typu kategorii po nazwach
- dodawać UI-only toggles
- dodawać lokalnych wyjątków payment/reminder logic
- rozszerzać legacy fallbacków bez osobnej decyzji architektonicznej

## 1. Transaction Scope

Finalne source-of-truth:
- `lib/transactionScope.ts`
- `EffectiveTransactionScopeMode`
- `getEffectiveTransactionScope()`
- `isTransactionInEffectiveScope()`
- `getTransactionIdsInEffectiveScope()`
- `isTransactionBeforeBudgetStart()`
- `isMonthBeforeBudgetStart()`

Finalne tryby scope:
- `stats`
- `calendar`
- `search`
- `goals`
- `limits`
- `reminders`
- `export-active`
- `backup-full`
- `trash`

Kontrakt:
- `backup-full` jako jedyny tryb zawiera wszystko.
- `trash` jako jedyny tryb zwraca kosz.
- Pozostałe tryby ignorują kosz.
- `budgetStartDate` jest respektowane przez centralny scope.
- `excludedMonthsSet` działa tylko tam, gdzie polityka trybu na to pozwala: dziś `stats` i `goals`.

Legacy nadal istnieje:
- `isTransactionInScope()`
- `filterTransactionsInScope()`
- `isTransactionInBudgetRange`
- `filterTransactionsByBudgetStartDate`

Te aliasy są tolerowane tylko jako kompatybilność starszego kodu. Nie są wzorcem dla nowych dashboardów, trendów, celów, limitów, searcha ani eksportów.

Nie wolno już dodawać:
- lokalnego `transaction.date.startsWith(month)` jako scope
- lokalnego `date.slice(0, 7)` jako filtr historii finansowej
- lokalnego `transaction.is_deleted !== true` jako polityki modułu analitycznego
- własnych wariantów excluded months
- własnych wariantów budgetStartDate

## 2. Signed Amount

Finalne source-of-truth:
- `lib/transactionDomain.ts`
- `getSignedAmountByRootType()`
- `getTransactionRootType()`
- `getRootCategoryType()`
- `getRootLevel1IdForCategory()`

Kontrakt:
- Kwota transakcji jest bezwzględna w danych wejściowych.
- Znak wynika z root category contract.
- `income` daje kwotę dodatnią.
- `expense` daje kwotę ujemną.
- `unknown` daje `0`, a nie lokalne zgadywanie.

Lokalna logika tolerowana:
- UI może formatować etykiety typu "Przychody" i "Wydatki".
- UI może filtrować po już wyliczonym signed amount, jeśli signed amount pochodzi z centralnego helpera.

Nie wolno już dodawać:
- mnożenia przez `-1` poza centralnym signed helperem
- zgadywania po `category.name`
- zgadywania po tekstach "Przychody", "Wydatki", "stałe", "zmienne"
- traktowania dodatniego `amount` jako przychodu

## 3. Root Category

Finalne source-of-truth:
- `lib/transactionDomain.ts`
- `getBudgetRootCategoryIds()`
- `getRootLevel1Category()`
- `getRootLevel1IdForCategory()`
- `getRootCategoryType()`

Kontrakt:
- Root direction pochodzi z jawnego metadata, jeśli istnieje.
- Fallback orderu rootów jest tylko kompatybilnością dla profili bez metadata.
- Nazwa root kategorii nie jest kontraktem.
- Użytkownik może zmienić nazwy rootów bez zmiany logiki.

Fallback migracyjny:
- `getBudgetRootCategoryIds()` nadal umie rozpoznać rooty przez kolejność, gdy metadata nie istnieje.
- Ten fallback jest tylko dla starych danych, nie dla nowego kodu.

Nie wolno już dodawać:
- rootów po polskich nazwach
- rootów po kolejności poza centralnym helperem
- dashboardowej logiki "stałe/zmienne" po nazwach kategorii

## 4. Reminder Lifecycle

Finalne source-of-truth:
- `lib/recurringTransactions.ts`
- `ReminderMonthLifecycleStatus`
- `mapLegacyReminderStateToLifecycle()`
- `getReminderMonthLifecycle()`
- `getRecurringReminderState()`
- `isReminderMonthHandled()`
- `mapReminderLifecycleStatusToStoredStatus()`

Finalne statusy lifecycle:
- `pending`
- `snoozed`
- `handled_without_transaction`
- `handled_with_transaction`

Kontrakt:
- Dzwonek, panel przypomnień i wykonania muszą opierać się o lifecycle.
- `snoozed` nie oznacza wykonania.
- Powiązana transakcja oznacza `handled_with_transaction`.
- Obsługa bez transakcji oznacza `handled_without_transaction`.

Fallback migracyjny:
- `skipped`
- `completed`
- `read`
- `linked`

Te statusy mogą istnieć tylko jako wejście do mapperów legacy albo jako zapis kompatybilny przez centralny mapper. Nie mogą wrócić jako osobne prawdy.

Nie wolno już dodawać:
- lokalnych liczników pending
- lokalnego `status === 'skipped'`
- lokalnego `status === 'completed'`
- lokalnego `status === 'read'`
- lokalnego `status === 'linked'`
- osobnego systemu past-due poza lifecycle

## 5. Payment Attribution

Finalne source-of-truth:
- `lib/paymentSources.ts`
- `getPaymentSourceAttribution()`
- `getPrimaryPaymentSourceId()`
- `getDefaultPaymentSourceForTransaction()`
- `buildPaymentSourceStats()`
- `isPaymentSourcesEnabledForLogic()`

Kontrakt:
- Moduł źródeł płatności działa logicznie tylko przez `isPaymentSourcesEnabledForLogic()`.
- Splity mają pierwszeństwo przed `transaction.payment_source_id`.
- Signed amount dostarcza znak, a split dostarcza udział kwoty.
- Statystyki źródeł płatności liczy wyłącznie `buildPaymentSourceStats()`.

Fallback migracyjny:
- `default_payment_source_id` może zasilać nowe domyślne pola jako odczyt legacy.
- Legacy split payload w `paymentSplitUtils.ts` jest adapterem odczytu, nie nowym modelem.

Nie wolno już dodawać:
- statystyk splitów przez lokalne `filter().reduce()`
- searcha po źródłach opartego tylko o `transaction.payment_source_id`
- logiki źródeł płatności działającej mimo wyłączonego modułu
- nowych defaultów opartych o `default_payment_source_id`

## 6. Trash / Reset / Export

Finalne source-of-truth:
- `getEffectiveTransactionScope()` z trybami `export-active`, `backup-full`, `trash`
- `lib/exportBackup.ts`
- `lib/importExportUtils.ts`
- trash/reset actions w warstwie transakcji
- `triggerTextDownload()`

Kontrakt:
- Aktywny export nie zawiera kosza.
- Pełny backup profilu może zawierać pełne dane profilu.
- Kosz ma osobny scope.
- Reset historii finansowej nie resetuje struktury budżetu.
- Eksport tekstowy pozostaje UTF-8 bez BOM, chyba że osobny kontrakt jawnie wymaga inaczej.

Fallback migracyjny:
- Opcjonalne tabele w backupie mogą być pominięte, gdy stara baza ich nie ma.
- Stare import/export payloady są obsługiwane tylko w adapterach.

Nie wolno już dodawać:
- exportu aktywnego z koszem
- pełnego backupu udającego export aktywny
- ręcznego CSV/JSON z pominięciem centralnego scope
- BOM w eksportach tekstowych bez jawnej decyzji

## 7. Feature Toggles

Finalne source-of-truth:
- `lib/modulePolicy.ts`
- `getEffectiveAppMode()`
- `getEffectiveModuleVisibility()`
- `isModuleEnabledForLogic()`
- feature-specific helpers, np. `isPaymentSourcesEnabledForLogic()`

Kontrakt:
- Tryb prosty wyłącza opcjonalne moduły logicznie.
- Ukrycie UI nie wystarcza do wyłączenia funkcji.
- Moduł wyłączony logicznie nie powinien liczyć danych, emitować efektów ani wymuszać relacji w innych modułach.

Nie wolno już dodawać:
- lokalnych list modułów opcjonalnych
- lokalnego `simpleMode ? ...` jako polityki biznesowej
- modułu, który działa w tle mimo wyłączonego toggle
- UI-only toggle bez logic gate

## 8. Multiuser / Profile

Finalne source-of-truth:
- `profile_id` w danych profilowych i mutacjach Supabase
- `lib/profileStorage.ts`
- `getProfileStorageKey()`
- `readProfileStorageValue()`

Kontrakt:
- Dane profilowe muszą być dopięte do `profile_id`.
- Local storage dla ustawień profilu musi zawierać `userId`, `profileId` i `featureKey`.
- Mutacje Supabase muszą filtrować albo zapisywać właściwy `profile_id`.

Fallback migracyjny:
- `legacyStorageKeys` w `readProfileStorageValue()` są dozwolone wyłącznie do jednorazowego odczytu i przeniesienia starej wartości do scoped key.
- Stare drafty/localStorage mogą być czytane tylko przez dedykowane adaptery migracyjne.

Nie wolno już dodawać:
- globalnych localStorage keys dla danych profilowych
- zapisu ustawień profilu bez `profileId`
- cache/store bez `userId`, `profileId`, `featureKey`
- mutacji danych profilowych bez `profile_id`

## 9. Dashboard Aggregation

Finalne source-of-truth:
- `components/DashboardPanel.tsx`
- `lib/dashboardStats.ts`
- `lib/dashboard-stats/dashboardStatsOverview.ts`
- centralne dashboard stats helpers

Obowiązkowe helpery:
- `getEffectiveTransactionScope(..., { mode: 'stats' })`
- `getDashboardOverview()`
- `getDashboardStats()`
- `getDashboardTrendStats()`
- `getDashboardMonthOverMonthStats()`
- `getDashboardCategoryPatternStats()`
- `getDashboardForecastStats()`
- `getIncludedMonthRange()`

Kontrakt:
- Dashboard dostaje scoped transactions.
- Widgety mogą robić lokalne obliczenia prezentacyjne, ale nie mogą tworzyć własnego scope biznesowego.
- Excluded months w trendach są wyrwami, nie zerami.
- Dayless nie trafia do dziennych heatmap i daily stats jako dzień 1.

Lokalna logika tolerowana:
- Formatowanie etykiet i danych wykresu.
- Punktowe przekształcenia view-modelu widgetu.
- Użycie `excludedMonthsSet.has(selectedMonth)` jako warunek pustego stanu bieżącego miesiąca, ale nie jako filtr historii poza centralną polityką.

Nie wolno już dodawać:
- widgetowego scope historii
- top categories liczonego równolegle do centralnego overview, jeśli dotyczy tych samych agregacji
- dashboardu opartego na `currentMonthTransactions` jako historii
- logiki kategorii po nazwach

## 10. Excluded Months

Finalne source-of-truth:
- `lib/dateUtils.ts`
- `isMonthExcludedFromStats()`
- `getEffectiveTransactionScope()` mode policy
- `getIncludedMonthRange()`

Kontrakt:
- Excluded month jest polityką statystyk i celów, nie globalnym usunięciem danych.
- Trendy mają omijać excluded months przez `getIncludedMonthRange()`.
- Scope trybu decyduje, czy excluded months są respektowane.

Lokalna logika tolerowana:
- Sprawdzenie pustego stanu dla aktualnie wybranego miesiąca.
- Oznaczenie miesiąca jako wykluczonego w UI.

Nie wolno już dodawać:
- lokalnego filtra historii `excludedMonthsSet.has(month)`
- wypełniania excluded month zerami w trendach
- mieszania excluded months z budgetStartDate

## 11. BudgetStartDate

Finalne source-of-truth:
- `lib/transactionScope.ts`
- `isTransactionBeforeBudgetStart()`
- `isMonthBeforeBudgetStart()`
- `getEffectiveTransactionScope()`
- pomocnicze funkcje daty w `lib/dateUtils.ts` tylko dla UI i walidacji dat

Kontrakt:
- Transakcja z konkretnym dniem porównuje pełną datę.
- Transakcja dayless porównuje miesiąc.
- Miesiące przed startem budżetu nie wchodzą do statystyk, celów, limitów ani searcha.

Lokalna logika tolerowana:
- UI może sprawdzać, czy wybrany dzień w kalendarzu jest przed startem budżetu.
- Nawigacja miesięcy może wyliczać minimalny miesiąc z `budgetStartDate`.

Nie wolno już dodawać:
- `transaction.date >= budgetStartDate` jako lokalnego scope
- `transaction.date.slice(0, 7) >= budgetStartDate.slice(0, 7)` dla wszystkich wpisów
- ignorowania `day_is_null` przy starcie budżetu

## 12. Dayless

Finalne source-of-truth:
- `lib/transactionDomain.ts`
- `isDaylessTransaction()`
- `getTransactionDay()`
- `hasConcreteTransactionDay()`
- `splitTransactionsByDayPresence()`
- `bucketTransactionsByConcreteDay()`

Kontrakt:
- Dayless jest wpisem miesięcznym, nie wpisem z 1. dniem miesiąca.
- Dayless może istnieć w listach miesięcznych i podsumowaniach miesięcznych.
- Dayless nie może zasilać dziennych heatmap ani daily stats jako konkretny dzień.

Lokalna logika tolerowana:
- Formatowanie labela "bez dnia".
- Formularze mogą zamieniać pusty dzień na `day_is_null`, ale nie mogą ukrywać tej informacji w logice statystyk.

Nie wolno już dodawać:
- `day || 1`
- `Number(transaction.date.slice(8, 10))` jako jedynego źródła dnia
- dayless w daily heatmap
- dayless jako pełna data dzienna

## Legacy po freeze

Legacy nadal istnieje i jest akceptowane tylko jako warstwa kompatybilności:
- `filterTransactionsInScope()` i aliasy budget range w `lib/transactionScope.ts`
- fallback orderu rootów bez metadata w `getBudgetRootCategoryIds()`
- legacy reminder statuses: `skipped`, `completed`, `read`, `linked`
- `default_payment_source_id` jako odczyt starego ustawienia
- legacy split adapter w `paymentSplitUtils.ts`
- `legacyStorageKeys` w `readProfileStorageValue()`
- stare drafty localStorage w dedykowanych draft helpers
- optional-table fallbacks w backupie Supabase

Nie wolno rozszerzać tej listy bez aktualizacji tego dokumentu i jawnej decyzji, że chodzi o migrację starych danych, nie nową logikę.

## Fallbacki tylko migracyjne

Fallback jest migracyjny, jeżeli:
- czyta stare dane i zapisuje albo mapuje je do nowego kontraktu
- jest zamknięty w centralnym helperze albo dedykowanym adapterze
- nie jest kopiowany do UI, widgetów ani hooków domenowych
- nie tworzy nowego publicznego zachowania aplikacji

Fallback nie jest migracyjny, jeżeli:
- nowy kod zaczyna na nim bazować
- fallback omija centralny helper
- fallback działa jako równoległy kontrakt
- fallback zgaduje dane po nazwach albo tekstach UI

## Zasady przyszłych feature'ów

Nowy feature jest dozwolony po freeze tylko wtedy, gdy:
- używa istniejących helperów kontraktowych
- ma jasny scope transakcji z `EffectiveTransactionScopeMode`
- bierze signed amount z centralnego helpera
- respektuje `profile_id`
- respektuje `isModuleEnabledForLogic()` dla modułów opcjonalnych
- respektuje dayless, excluded months i budgetStartDate
- nie miesza aktywnego exportu z pełnym backupem
- nie liczy payment attribution ani reminder lifecycle lokalnie

Nowy feature jest zakazany po freeze, jeżeli:
- dodaje lokalne plus/minus
- dodaje lokalny filtr historii
- rozpoznaje kategorię po nazwie
- traktuje toggle jako czysty UI
- dodaje nowy reminder status bez rozszerzenia centralnego lifecycle
- dodaje nowe źródło prawdy dla payment splits
- dodaje globalny localStorage key dla danych profilowych
- ukrywa legacy jako nowy helper

## Gotowość do UI foundation

Projekt jest gotowy do UI foundation pod warunkiem, że prace UI:
- nie zmieniają kontraktów z tego dokumentu
- nie przenoszą logiki biznesowej do komponentów prezentacyjnych
- nie dodają lokalnych heurystyk
- nie usuwają centralnych helperów
- nie zamieniają migracyjnych fallbacków w nowe ścieżki produktowe

Design-system może teraz powstawać jako warstwa UI nad zamrożoną logiką.
