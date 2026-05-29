# DO NOT BREAK CONTRACTS

Finalny manifest architektoniczny BudżAppki przed wejściem w design system.

Ten dokument zamraża logikę biznesową aplikacji. Design system może zmieniać wygląd, komponenty, layout i ergonomię, ale nie może tworzyć równoległych źródeł prawdy dla danych finansowych.

## 1. Transaction Scope Contract

Source-of-truth:
- `lib/transactionScope.ts`
- `getEffectiveTransactionScope()`
- `isTransactionInEffectiveScope()`
- `EffectiveTransactionScopeMode`

Obowiązkowe helpery:
- `getEffectiveTransactionScope(transactions, { mode, budgetStartDate, excludedMonthsSet })`
- `getTransactionIdsInEffectiveScope()`
- `isTransactionBeforeBudgetStart()`
- `isMonthBeforeBudgetStart()`

Nie wolno robić lokalnie:
- lokalnego filtrowania historii przez `date.slice(0, 7)` jako scope
- lokalnego `transaction.date.startsWith(month)` jako scope
- lokalnego ignorowania kosza przez `transaction.is_deleted !== true` w modułach analitycznych
- osobnych polityk dla `budgetStartDate`
- osobnych polityk excluded months

Zabronione fallbacki:
- `filterTransactionsInScope()` jako główne źródło dla dashboardów, trendów, celów, limitów, eksportów
- ładowanie całej historii bez mode-aware scope
- filtrowanie kosza poza `mode: 'trash'` i `mode: 'backup-full'`

## 2. Signed Amount Contract

Source-of-truth:
- `lib/transactionDomain.ts`
- `getSignedAmountByRootType()`
- `getTransactionRootType()`
- `getRootCategoryType()`

Obowiązkowe helpery:
- `getSignedAmountForTransaction`
- `getSignedAmountByRootType()`
- `getRootLevel1IdForCategory()`
- `getTransactionRootType()`

Nie wolno robić lokalnie:
- zgadywać plus/minus po nazwie kategorii
- traktować dodatniego `amount` jako przychodu bez root contract
- mnożyć kwoty przez `-1` poza centralnym signed helperem
- liczyć przychodów/wydatków przez tekst UI

Zabronione fallbacki:
- `category.name.includes('Przych')`
- `category.name.includes('Wydat')`
- `startsWith('Przychody')`
- `startsWith('Wydatki')`
- helpery typu `isIncomeCategoryName`, `isExpenseName`, `categoryNameSign`

## 3. Root Category Contract

Source-of-truth:
- `lib/transactionDomain.ts`
- `getBudgetRootCategoryIds()`
- root metadata, root id, inherited root direction

Obowiązkowe helpery:
- `getBudgetRootCategoryIds(categories)`
- `getRootLevel1Category()`
- `getRootLevel1IdForCategory()`
- `getRootCategoryType()`

Nie wolno robić lokalnie:
- rozpoznawać rootów po nazwie
- zakładać, że pierwszy root zawsze jest przychodem, jeśli istnieje jawny root metadata
- zakładać, że użytkownik nie zmieni nazwy root kategorii
- budować logiki dashboardu na etykietach „stałe” i „zmienne”

Zabronione fallbacki:
- root po `category.name`
- root po polskiej nazwie
- „Przychody/Wydatki” jako kontrakt biznesowy
- „stałe/zmienne” jako heurystyka dashboardowa po nazwie kategorii

## 4. Reminder Lifecycle Contract

Source-of-truth:
- `lib/recurringTransactions.ts`
- `ReminderMonthLifecycleStatus`
- `mapLegacyReminderStateToLifecycle()`
- `getReminderMonthLifecycle()`
- `getRecurringReminderState()`

Dozwolone statusy lifecycle:
- `pending`
- `snoozed`
- `handled_without_transaction`
- `handled_with_transaction`

Obowiązkowe helpery:
- `getReminderMonthLifecycle()`
- `mapLegacyReminderStateToLifecycle()`
- `isReminderMonthHandled()`
- `mapReminderLifecycleStatusToStoredStatus()`

Nie wolno robić lokalnie:
- interpretować `skipped`, `completed`, `read`, `linked` poza mapperem legacy
- liczyć dzwonka przypomnień inną logiką niż lifecycle
- traktować snooze jako wykonania
- tworzyć osobnych liczników pending
- reaktywować past due jako równoległy system zaległości

Zabronione fallbacki:
- lokalne `status === 'skipped'`
- lokalne `status === 'completed'`
- lokalne `status === 'read'`
- lokalne `status === 'linked'`
- osobny `pastDue` placeholder jako źródło prawdy
- snooze jako trwały status wykonania

## 5. Payment Attribution Contract

Source-of-truth:
- `lib/paymentSources.ts`
- `getPaymentSourceAttribution()`
- `buildPaymentSourceStats()`
- `isPaymentSourcesEnabledForLogic()`

Obowiązkowe helpery:
- `getPaymentSourceAttribution({ transaction, splitItems, getSignedAmountForTransaction, getAmountNumber, isPaymentSourcesEnabled })`
- `getPrimaryPaymentSourceId()`
- `getDefaultPaymentSourceForTransaction()`
- `buildPaymentSourceStats()`

Nie wolno robić lokalnie:
- liczyć splitów przez własny `filter().reduce()` poza central attribution
- używać `payment_source_id` jako jedynego źródła prawdy, gdy istnieją splity
- pokazywać/filtrwać źródeł płatności logicznie, gdy moduł jest wyłączony
- zakładać, że split zawsze jest dodatni bez znaku z signed amount

Zabronione fallbacki:
- `default_payment_source_id` jako aktywny system ustawień
- legacy split mode jako logika aplikacji
- search po źródle oparty tylko o `transaction.payment_source_id`
- statystyki źródeł liczone poza `buildPaymentSourceStats()`

## 6. Trash / Reset / Export Contract

Source-of-truth:
- `getEffectiveTransactionScope()` modes:
  - `export-active`
  - `backup-full`
  - `trash`
- `lib/exportBackup.ts`
- `lib/importExportUtils.ts`
- akcje trash/reset w warstwie transakcji

Obowiązkowe helpery:
- `getEffectiveTransactionScope(..., { mode: 'export-active' })`
- `getEffectiveTransactionScope(..., { mode: 'trash' })`
- `getEffectiveTransactionScope(..., { mode: 'backup-full' })`
- `triggerTextDownload()` dla eksportów tekstowych bez BOM

Nie wolno robić lokalnie:
- wliczać kosza do dashboardów, celów, limitów, searcha, trendów
- mieszać eksportu aktywnego z pełnym backupem profilu
- hard delete relacji nadrzędnych razem z wpisem
- resetować struktury budżetu przy resecie historii finansowej

Zabronione fallbacki:
- export aktywny zawierający kosz
- backup pełny udający export aktywny
- ręczne składanie CSV/JSON z pominięciem scoped helpers
- dokładanie BOM do eksportów, jeśli nie jest jawnie wymagane

## 7. Feature Toggle Contract

Source-of-truth:
- `lib/modulePolicy.ts`
- `getEffectiveModuleVisibility()`
- `getEffectiveAppMode()`
- `isModuleEnabledForLogic()`

Obowiązkowe helpery:
- `getEffectiveModuleVisibility({ visibleModules, simpleMode })`
- `isModuleEnabledForLogic(effectiveVisibleModules, moduleKey)`
- feature-specific helpers, np. `isPaymentSourcesEnabledForLogic()`

Nie wolno robić lokalnie:
- wyłączać funkcji tylko przez ukrycie UI
- liczyć danych modułu, gdy moduł logicznie jest wyłączony
- pomijać trybu prostego przy logice dodatkowych modułów
- tworzyć lokalnej listy modułów opcjonalnych

Zabronione fallbacki:
- `display: none` jako jedyne wyłączenie funkcji
- lokalne `simpleMode ? ...` bez `modulePolicy`
- stary moduł działający w tle mimo wyłączonego toggle

## 8. Multiuser / Profile Contract

Source-of-truth:
- `profile_id` w mutacjach danych profilowych
- `lib/profileStorage.ts`
- `getProfileStorageKey()`
- `readProfileStorageValue()`

Obowiązkowe helpery:
- `getProfileStorageKey({ userId, profileId, featureKey })`
- `readProfileStorageValue({ storageKey, legacyStorageKeys })`
- wszystkie mutacje Supabase muszą dopinać właściwy `profile_id`

Nie wolno robić lokalnie:
- używać globalnych localStorage keys dla danych profilowych
- mieszać danych między userami/profilami
- zapisywać ustawień profilu bez `profileId`
- opierać lokalnego storage tylko na `featureKey`

Zabronione fallbacki:
- globalny `dashboardLayout`
- globalny `pinnedCategories`
- globalny `simpleMode` dla danych profilowych
- odczyt legacy key bez migracji do `userId:profileId:featureKey`

## 9. Dashboard Aggregation Contract

Source-of-truth:
- `components/DashboardPanel.tsx`
- `lib/dashboard-stats/dashboardStatsOverview.ts`
- `lib/dashboardStats.ts`
- centralne dashboard stats helpers

Obowiązkowe helpery:
- `getEffectiveTransactionScope(..., { mode: 'stats' })`
- `getDashboardOverview()`
- `getDashboardStats()` tylko dla niezależnych, punktowych użyć
- `getDashboardTrendStats()`, `getDashboardMonthOverMonthStats()`, `getDashboardCategoryPatternStats()`, `getDashboardForecastStats()`

Nie wolno robić lokalnie:
- ponownie liczyć tych samych podstawowych agregacji dashboardu w kilku miejscach
- filtrować historii dashboardu po aktualnie otwartym miesiącu jako źródle danych
- tworzyć widgetowych lokalnych scope dla trash/budgetStartDate
- zgadywać kategorii po nazwach w dashboardzie

Zabronione fallbacki:
- dashboard zależny od `currentMonthTransactions` jako historii
- osobne top categories liczone równolegle do `getDashboardOverview()`
- repeated full-history traversals bez potrzeby
- lokalne „stałe/zmienne” po nazwie

## 10. Dayless Contract

Source-of-truth:
- `lib/transactionDomain.ts`
- `isDaylessTransaction()`
- `getTransactionDay()`
- `splitTransactionsByDayPresence()`
- `bucketTransactionsByConcreteDay()`

Obowiązkowe helpery:
- `isDaylessTransaction(transaction)`
- `getTransactionDay(transaction)`
- `hasConcreteTransactionDay(transaction)`
- `bucketTransactionsByConcreteDay(transactions)`

Nie wolno robić lokalnie:
- traktować dayless jak 1. dzień miesiąca
- wrzucać dayless do heatmap dziennych
- liczyć dayless jako konkretnego dnia w kalendarzu
- parsować dnia przez `date.slice(8, 10)` bez sprawdzenia `day_is_null`

Zabronione fallbacki:
- `Number(transaction.date.slice(8, 10))` jako jedyne źródło dnia
- `day || 1`
- dayless w daily heatmap
- dayless jako pełna data dzienna zamiast wpis miesięczny

## 11. Excluded Months Contract

Source-of-truth:
- `lib/dateUtils.ts`
- `isMonthExcludedFromStats()`
- `getEffectiveTransactionScope()` mode policy
- `getIncludedMonthRange()`

Obowiązkowe helpery:
- `isMonthExcludedFromStats(month, excludedMonthsSet)`
- `getEffectiveTransactionScope(..., { mode: 'stats' | 'goals', excludedMonthsSet })`
- `getIncludedMonthRange(selectedMonth, count, excludedMonthsSet)`

Nie wolno robić lokalnie:
- traktować excluded month jako zero w trendzie, jeśli polityka wymaga wyrwy
- usuwać excluded months z modułów, których mode nie powinien ich respektować
- samodzielnie robić `excludedMonthsSet.has(month)` jako źródła scope
- mieszać excluded months z `budgetStartDate`

Zabronione fallbacki:
- lokalne `excludedMonthsSet.has(month)` jako filtr danych historycznych
- wypełnianie wykluczonego miesiąca zerami w trendach
- ręczne cofanie miesięcy z pominięciem `getIncludedMonthRange()`

## 12. BudgetStartDate Contract

Source-of-truth:
- `lib/transactionScope.ts`
- `isTransactionBeforeBudgetStart()`
- `isMonthBeforeBudgetStart()`
- `getEffectiveTransactionScope()`

Obowiązkowe helpery:
- `isTransactionBeforeBudgetStart(transaction, budgetStartDate)`
- `isMonthBeforeBudgetStart(month, budgetStartDate)`
- `getEffectiveTransactionScope(..., { budgetStartDate })`

Nie wolno robić lokalnie:
- porównywać tylko miesięcy dla wpisów z konkretnym dniem
- ignorować `day_is_null` przy starcie budżetu
- liczyć historii przed datą startu w dashboardzie, celach, limitach i searchu
- ręcznie docinać danych bez mode-aware scope

Zabronione fallbacki:
- `transaction.date >= budgetStartDate` bez dayless policy
- `transaction.date.slice(0, 7) >= budgetStartDate.slice(0, 7)` dla wszystkich wpisów
- stary `filterTransactionsInScope()` jako kontrakt dla modułów analitycznych

## Najbardziej niebezpieczne rzeczy, które mogą znowu rozwalić architekturę

1. Dodanie nowego widgetu dashboardu, który sam filtruje historię zamiast używać scoped transactions i dashboard helpers.
2. Powrót logiki po nazwach kategorii: „Przychody”, „Wydatki”, „stałe”, „zmienne”.
3. Liczenie plus/minus z samego `amount`, bez root contract.
4. Search po źródłach płatności oparty tylko na `payment_source_id`, bez split attribution.
5. Traktowanie wyłączonego modułu jako UI-only toggle, podczas gdy logika dalej działa.
6. Użycie globalnego localStorage key dla danych profilowych.
7. Wliczenie kosza do statystyk przez lokalny filter albo brak scope.
8. Reaktywowanie `skipped/completed/read/linked` jako osobnych prawd w przypomnieniach.
9. Dayless potraktowany jak pierwszy dzień miesiąca w kalendarzu, heatmapie albo daily stats.
10. Dashboard zależny od aktualnie otwartego miesiąca jako źródła historii.
11. Excluded month pokazany jako zero zamiast wyrwy w trendzie.
12. Export aktywny pomieszany z pełnym backupem profilu.
13. Nowy reset, który usuwa strukturę budżetu razem z historią finansową.
14. Ręczne `date.slice(0, 7)` użyte jako scope biznesowy zamiast `getTransactionMonth()` i `getEffectiveTransactionScope()`.
15. Nowy cache/store, który zapamiętuje dane bez `userId`, `profileId`, feature key i mode scope.

Jeśli nowy kod narusza którykolwiek punkt tego dokumentu, refactor design-systemu musi się zatrzymać do czasu naprawienia kontraktu.
