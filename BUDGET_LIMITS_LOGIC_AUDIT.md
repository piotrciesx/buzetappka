# BudżAppka — audyt logiki „Limity budżetowe”

## Zakres i werdykt

Audyt dotyczy wyłącznie logiki modułu limitów budżetowych. Nie obejmuje zmian UI, CSS ani Foundation. Nie zmieniono kodu aplikacji i nie utworzono migracji.

Moduł nie jest placeholderem — działa już dla miesięcznego limitu całych wydatków oraz limitów kategorii L2/L3. Respektuje centralny scope transakcji, odrzuca kosz i dane sprzed początku budżetu, rozpoznaje stronę wydatkową przez root contract oraz reaguje na zmianę listy transakcji i miesiąca. Ma też proste wersjonowanie limitu przez zakres `start_month`–`end_month` i wyliczane alerty 80/90/100%.

Obecny model jest jednak zbyt wąski dla docelowego modułu: zakres jest zakodowany jako nullable `category_id`, okres zawsze miesięczny, kwoty są liczone jako `number`, alerty nie są trwałe, nie ma grup kategorii ani historii wykorzystania. Docelowo należy ewoluować istniejący moduł, zachowując `getEffectiveTransactionScope(..., { mode: 'limits' })` i signed amount contract jako obowiązkowe źródła prawdy.

## 1. Obecny stan

### Obsługiwane limity

Aktualnie można zapisać limit:

- globalny dla wszystkich wydatków — `category_id = null`;
- dla kategorii L2 — obejmuje L2 i jej bezpośrednie dzieci L3;
- dla kategorii L3 — obejmuje tylko tę kategorię;
- od wybranego miesiąca bez końca;
- tylko dla wybranego miesiąca;
- od wybranego miesiąca do miesiąca końcowego.

Każdy rekord ma tryb alertu:

- `normal` — ostrzeżenia 80%, 90% i przekroczenie;
- `strict` — tylko przekroczenie.

System nie blokuje zapisu transakcji po przekroczeniu limitu. Limit jest warstwą informacyjną.

### Aktywność i wersjonowanie

Limit jest aktywny, gdy `start_month <= selectedMonth` i `end_month` jest pusty albo nie wcześniejszy niż miesiąc.

Aktualizacja z późniejszym `startMonth` zamyka poprzedni rekord na miesiącu poprzedzającym i dodaje nowy rekord. To jest zalążek wersjonowania „od przyszłego miesiąca”. Edycja obowiązująca od tego samego miesiąca aktualizuje rekord w miejscu. Usunięcie limitu mającego historię zamyka go przed bieżącym miesiącem; nowy rekord może zostać usunięty fizycznie.

Brakuje jawnej tożsamości planu łączącej kolejne wersje. Wersje są niezależnymi wierszami, więc nie da się pewnie odtworzyć, które rekordy są kontynuacją tego samego limitu.

### Przeliczanie

`useBudgetLimits()` wylicza stan na bieżąco z aktualnej tablicy transakcji. Przeniesienie transakcji, zmiana kwoty/kategorii, usunięcie do kosza oraz zmiana wybranego miesiąca powodują ponowne przeliczenie przez zależności Reacta.

Nie istnieje snapshot historii wykorzystania. Wynik dla starego miesiąca jest rekonstruowany z bieżących transakcji i bieżącej struktury kategorii.

## 2. Obecne tabele i typy

### Tabela `budget_limits`

Definicja znajduje się w `sql/budget_limits.sql`.

Kolumny:

- `id uuid`;
- `profile_id uuid`;
- `category_id uuid null` z FK do `categories` i `on delete cascade`;
- `amount numeric`;
- `start_month text` w formacie `YYYY-MM`;
- `end_month text null`;
- `mode text`: `normal | strict`;
- `created_at`.

Istnieją indeksy po profilu oraz `(profile_id, category_id)`. Tabela ma RLS. Polityki dopuszczają właściciela oraz rolę `anon`; przed przyszłą migracją trzeba zweryfikować, czy ten wyjątek jest nadal świadomie potrzebny w produkcji.

Nie znaleziono tabel:

- alertów limitów;
- odczytów/wyciszeń alertów;
- grup kategorii dla limitów;
- instancji okresów;
- snapshotów historii wykorzystania;
- wersji limitów połączonych wspólnym identyfikatorem.

### Typy TypeScript

W `lib/budgetPageTypes.ts`:

- `BudgetLimitMode = 'normal' | 'strict'`;
- `BudgetLimit` odpowiadający tabeli;
- `BudgetLimitAlertLevel = 'none' | 'warning' | 'strong' | 'exceeded'`;
- `BudgetLimitAlertState` z poziomem i tekstem.

W `lib/useBudgetLimits.ts`:

- `SaveBudgetLimitInput`;
- `UpdateBudgetLimitInput`;
- `BudgetLimitUsageState` z limitem, wykorzystaniem, procentem i alertem.

Kwoty i procenty są typem `number`. Nie ma osobnych typów zakresu, okresu, wersji, statusu limitu, progów ani historii.

### Backup

`lib/exportBackup.ts` uwzględnia tabelę `budget_limits`. Przyszłe tabele modułu będą musiały zostać jawnie dodane do pełnego backupu zgodnie z Export/Backup Contract.

## 3. Obecne komponenty

Moduł ma aktywne komponenty i integracje:

- `components/BudgetLimitEditorModal.tsx` — kwota, tryb alertu, miesiąc końcowy, zapis/usunięcie/wyłączenie;
- `components/BudgetLimitIndicator.tsx` — wykorzystanie limitu przy kategorii/globalnie;
- `components/BudgetLimitAlertsPanel.tsx` — lista wyliczonych alertów;
- `components/budget-app/useBudgetLimitViews.ts` — mapowanie aktywnego stanu po `category_id`;
- `components/BudgetCategoryTree.tsx` i komponenty L1/L2/L3 — miejsca podpięcia limitów;
- `components/budget-app/BudgetWorkspaceTopNotices.tsx` — panel alertów;
- `components/budget-app/useBudgetAppWorkspaceDataBridge.ts` — inicjalizacja hooka;
- `components/BudgetAppController.tsx` i hooki propsów — orkiestracja;
- `components/budget-app/BudgetAppControllerView.tsx` — techniczny snapshot liczników modułu.

Moduł jest chroniony feature policy przez `isModuleEnabledForLogic(..., 'budgetLimits')`, więc wyłączenie nie jest wyłącznie ukryciem UI.

Ograniczenie: `useBudgetLimitViews` przechowuje jeden widok pod kluczem kategorii/globalnym. Gdy w tym samym okresie istnieje więcej aktywnych limitów o tym samym `category_id`, późniejszy nadpisuje wcześniejszy. `getLimitForCategory()` z kolei zwraca pierwszy. Baza nie ma constraintu zapobiegającego takim nakładkom.

## 4. Braki względem docelowej logiki

### Typ i zakres

- brak jawnych typów: miesięczny, cykliczny, jednorazowy;
- `category_id = null` niejawnie oznacza wszystkie wydatki;
- brak grupy wielu niezależnych kategorii;
- brak scope jako osobnego typu;
- brak przyszłego scope tagów;
- L2 obejmuje tylko aktualne bezpośrednie L3, bez historycznego snapshotu członkostwa.

### Okres

- tylko pełne miesiące;
- brak dokładnych dat od–do;
- brak cyklu co X dni/tygodni/miesięcy;
- brak instancji okresu i jednoznacznych granic;
- brak polityki dla transakcji bez dnia (`day_is_null`) w okresach dziennych;
- `excludedMonthsSet` świadomie nie wpływa na tryb `limits`, ale ta polityka nie jest opisana w samym module.

### Kwoty i statystyki

- arytmetyka float zamiast groszy;
- brak `remainingAmount`, dni do końca, dozwolonego średniego wydatku dziennego i prognozy;
- procent może mieć dowolną precyzję i nie ma ustalonej polityki dzielenia przez zero/zaokrągleń;
- brak centralnej, czystej warstwy domenowej oddzielonej od hooka React/Supabase.

### Alerty

- progi 80/90 są zaszyte w funkcji;
- próg 50% nie jest obsługiwany;
- alert zależy dodatkowo od arbitralnego postępu miesiąca (`80%` przed `75%` czasu, `90%` przed `85%` czasu);
- brak trwałego `read`, `muted`, `snoozed`;
- brak deduplikacji zdarzeń i historii przekroczeń progów;
- alert jest generowany przy każdym renderze, nie przy przejściu przez próg;
- brak wyciszenia tylko dla konkretnego okresu.

### Historia

- brak wspólnego `plan_id` dla wersji;
- brak snapshotów wykorzystania okresu;
- edycja w tym samym miesiącu nadpisuje definicję;
- usunięcie kategorii kasuje limit przez `on delete cascade`;
- zmiana hierarchii kategorii może zmienić historyczny wynik limitu L2.

## 5. Proponowany model domenowy

Model powinien rozdzielić cztery pojęcia.

### 5.1. Definicja limitu — `BudgetLimitPlan`

- `id`, `profileId`;
- `name` opcjonalna dla limitu pojedynczej kategorii, wymagana dla grupy;
- `status`: `active | archived`;
- `currency: 'PLN'`;
- `createdAt`, `archivedAt`;
- opcjonalne metadane przyszłego tag scope.

Definicja daje trwałą tożsamość. Nie zawiera bezpośrednio zmiennej w czasie kwoty ani zakresu.

### 5.2. Wersja reguł — `BudgetLimitVersion`

- `id`, `planId`, `profileId`;
- `effectiveFrom` jako początek okresu obowiązywania;
- `effectiveTo` nullable;
- `limitAmountGrosze` jako dodatni integer;
- `scopeType` i dane zakresu;
- `periodType` i konfiguracja okresu;
- konfigurowalne progi alertów;
- `createdAt`, opcjonalnie `replacedByVersionId`.

Wersje nie mogą się nakładać w obrębie jednego planu. Zmiana „od następnego okresu” zamyka starą wersję i tworzy nową atomowo.

### 5.3. Instancja okresu — `BudgetLimitPeriod`

- `id`, `planId`, `versionId`, `profileId`;
- `periodStart`, `periodEnd`;
- `status`: `open | closed`;
- opcjonalne snapshoty `spentGrosze`, `transactionCount`, `calculatedAt`;
- opcjonalne `closedAt`.

Instancja identyfikuje konkretny miesiąc/cykl/zakres. Dla otwartego okresu wynik jest liczony na żywo. Po zamknięciu może zostać utrwalony snapshot, ale należy zachować możliwość kontrolowanego przeliczenia po odblokowaniu i edycji historycznej transakcji.

### 5.4. Członkostwo zakresu

Dla grup potrzebna jest relacja `BudgetLimitScopeCategory`:

- `versionId` albo `scopeId`;
- `categoryId`;
- opcjonalnie `includeDescendants`;
- snapshot poziomu/ścieżki wyłącznie informacyjnie.

Zakres nie może polegać na nazwie kategorii. Globalny zakres wydatków korzysta z expense root contract. Dla L2 należy zdecydować, czy nowe L3 automatycznie wchodzą do aktywnej grupy. Historyczne okresy powinny zachować efektywny snapshot członkostwa albo deterministyczną wersję reguł.

## 6. Proponowane typy limitów

Typ limitu powinien wynikać z reguły okresu i scope, nie z osobnych, częściowo nakładających się tabel.

### Typy biznesowe

- `monthly_category` — pełny miesiąc, pojedyncze L2 albo L3;
- `monthly_category_group` — pełny miesiąc, jawna grupa kategorii;
- `monthly_global_expense` — pełny miesiąc, cały expense root;
- `recurring_custom_period` — kolejne okresy co X dni/tygodni/miesięcy;
- `one_off_date_range` — jeden domknięty zakres dat.

### Typy scope

- `category` — pojedyncze L2/L3, opcjonalnie z potomkami;
- `category_group` — lista członków;
- `global_expense` — wszystkie transakcje typu expense;
- `tags` — zarezerwowane, nie implementować bez osobnego etapu i polityki OR/AND.

Nakładające się limity są dozwolone. Ta sama transakcja może być policzona niezależnie w limicie L3, grupowym i globalnym. Nie należy dzielić jej kwoty pomiędzy limity.

## 7. Proponowany model okresów

### `calendar_month`

- początek: pierwszy dzień miesiąca;
- koniec: ostatni dzień miesiąca;
- wariant jednorazowy albo powtarzany co miesiąc;
- zgodny z istniejącym `selectedMonth` i wpisami `day_is_null`.

### `fixed_date_range`

- jawne `startDate` i `endDate`, oba włącznie;
- jedna instancja okresu;
- data końca nie może poprzedzać początku.

### `rolling_cycle`

- `anchorDate`;
- `cadenceUnit: day | week | month`;
- `cadenceInterval` jako dodatni integer;
- deterministycznie wyliczane półotwarte granice `[start, nextStart)`; prezentowany `periodEnd` to dzień przed kolejnym początkiem.

Roczny cykl można później dodać bez zmiany modelu, ale nie jest konieczny w pierwszym wdrożeniu.

### Relacja z nawigacją miesiąca

`selectedMonth` jest kontekstem prezentacji, nie źródłem granic wszystkich okresów. Dla limitu miesięcznego wybiera instancję `YYYY-MM`. Dla zakresu/cyklu należy znaleźć wszystkie instancje przecinające wybrany miesiąc.

`budgetStartDate` pozostaje respektowane przez centralny scope `limits`. Miesiące wykluczone ze statystyk obecnie nie wyłączają limitów i tę politykę warto zachować: limit kontrolny ma liczyć realne wydatki nawet w miesiącu pominiętym w trendach. Zamknięcie miesiąca powinno zamykać/snapshotować miesięczne instancje limitów, ale nie blokować samego ostrzegania.

Dla `day_is_null`:

- pełny miesiąc — uwzględnić;
- zakres obejmujący cały miesiąc transakcji — uwzględnić;
- częściowy zakres dzienny — nie wolno zgadywać dnia; potrzebna jest jawna polityka, rekomendowane wyłączenie z wyniku dziennego z licznikiem „kwota bez dnia poza kalkulacją” albo osobna decyzja użytkownika.

## 8. Proponowany model alertów

### Konfiguracja

Wersja limitu przechowuje uporządkowane progi, np. 50, 80, 90 i 100 procent. Progi muszą być unikalne, rosnące i mieścić się w sensownym zakresie. `strict` może zostać zaadaptowany jako konfiguracja zawierająca tylko 100%.

### Zdarzenie/strefa alertu

Logiczna encja `BudgetLimitAlert`:

- `id`, `profileId`, `planId`, `periodId`;
- `thresholdPercent` albo `kind: approaching | exceeded`;
- `triggeredAt`;
- `spentGroszeAtTrigger`, `limitGroszeAtTrigger`;
- `readAt` nullable;
- `mutedUntil` nullable;
- `mutedForPeriod` boolean;
- opcjonalne `resolvedAt` po spadku poniżej progu.

Unikalność plan/period/próg zapobiega męczącym powtórzeniom. Alert powstaje przy przejściu z wartości poniżej progu na równą/wyższą, nie przy każdym renderze. Jeśli wydatek spadnie i ponownie przekroczy próg, polityka ponownego alertu powinna być świadoma — rekomendacja: nie więcej niż raz na próg w okresie, chyba że użytkownik jawnie zresetuje alerty.

### Wyciszenie i odczyt

- `read` usuwa licznik nieprzeczytanych, ale nie ukrywa stanu limitu;
- `mute_for_period` blokuje kolejne notyfikacje tego planu tylko w danym okresie;
- opcjonalne `mute_until` opóźnia notyfikację, nie zmienia kalkulacji;
- przekroczenie nadal jest widoczne w stanie limitu nawet po wyciszeniu alertu.

Alerty limitów powinny korzystać z istniejących powierzchni powiadomień, ale ich lifecycle nie powinien być mieszany z reminder lifecycle płatności cyklicznych.

## 9. Proponowane statusy

Należy rozdzielić status definicji, status finansowy okresu i stan powiadomienia.

### Status definicji

- `active`;
- `archived`.

### Wyliczany status wykorzystania okresu

- `safe` — poniżej najniższego aktywnego progu;
- `near_limit` — osiągnięto próg ostrzegawczy, ale mniej niż 100%;
- `exceeded` — `spent >= limit`.

### Stan alertu

- `unread`;
- `read`;
- `muted`.

`muted` nie jest statusem finansowym limitu. Wyciszony, przekroczony limit nadal ma usage status `exceeded`. `archived` dotyczy definicji, a nie konkretnego okresu.

## 10. Zasady liczenia kwot i procentów

### Scope transakcji

1. Użyć `getEffectiveTransactionScope(transactions, { mode: 'limits', budgetStartDate })`.
2. Nie liczyć kosza.
3. Nie liczyć transakcji sprzed daty początku budżetu.
4. Ustalić expense przez centralny root/signed amount contract, nie nazwę ani znak zapisanej kwoty.
5. Liczyć transakcję tylko wtedy, gdy jej data i kategoria/tag należą do instancji okresu i scope wersji.

Zmiana, przeniesienie, przywrócenie lub usunięcie transakcji musi unieważnić kalkulacje wszystkich nakładających się instancji, których zakres może ją obejmować.

### Pieniądze

- konwertować wejścia na integer groszy na granicy domeny;
- `limitGrosze`, `spentGrosze`, `remainingGrosze`, prognozy i średnie wyliczać z integerów;
- formatowanie PLN dopiero na wyjściu;
- `remainingGrosze = limitGrosze - spentGrosze`, wartość może być ujemna;
- do statystyk nie używać `toFixed()` jako mechanizmu korekty obliczeń.

### Procent

- gdy limit > 0: `usagePercent = spent / limit × 100`;
- do decyzji progowych porównywać iloczyny integerów (`spent * 100 >= limit * threshold`), bez błędów float;
- prezentacyjny procent może być zaokrąglany osobno;
- wykorzystanie może przekroczyć 100%.

### Dni i prognoza

- `daysElapsed` i `daysLeft` liczyć względem granic instancji oraz dzisiejszej daty;
- dla zakończonego okresu `daysLeft = 0`;
- `averageDailySpendAllowed = max(remaining, 0) / max(daysLeft, 1)` z jawnie ustaloną polityką, czy bieżący dzień jest w liczniku;
- `actualDailyPace = spent / max(daysElapsed, 1)`;
- `projectedSpend = actualDailyPace × totalDays` tylko dla aktywnego okresu;
- `projectedDelta = projectedSpend - limit`, dodatnie oznacza prognozowane przekroczenie;
- dla przyszłego okresu bez dni elapsed prognoza jest `null`, nie 0.

Prognozy są informacyjne i powinny być oznaczone jako takie.

## 11. Zasady historii zmian limitu

### „Tylko ten okres”

Utworzyć override dla jednej instancji okresu albo wersję ograniczoną dokładnie do jej granic. Poprzednia i kolejna reguła pozostają bez zmian.

### „Od następnego okresu”

Zamknąć obecną wersję na końcu bieżącej instancji i utworzyć nową od początku następnej. Operacja musi być atomowa.

### „Od teraz / przyszłości”

Dla miesięcznego limitu „od teraz” powinno oznaczać świadomą decyzję:

- zmień cały bieżący okres, zachowując historię wersji; albo
- utwórz częściowy override od dzisiejszej daty — to zmienia semantykę limitu miesięcznego i nie powinno być domyślne.

Rekomendacja dla pierwszej wersji: bieżący pełny okres + przyszłe, z audytem poprzedniej kwoty; częściowe dzielenie miesiąca dopiero z limitami date-range.

### Snapshoty

- otwarty okres jest liczony na żywo;
- zamknięcie miesiąca może utrwalić kwotę, liczbę wpisów i status;
- odblokowanie i edycja historycznej transakcji oznacza oznaczenie snapshotu jako stale i kontrolowane przeliczenie;
- zmiana nazwy lub hierarchii kategorii nie może przepisywać kwot historycznych;
- nie usuwać historii po archiwizacji planu ani kategorii.

## 12. Ryzyka

- Brak pełnego dumpa produkcyjnego schematu: plik SQL może nie odzwierciedlać aktualnych constraintów, polityk i danych.
- Polityka RLS z `auth.role() = 'anon'` może być zbyt szeroka; wymaga audytu przed migracją.
- `category_id on delete cascade` usuwa historię limitu wraz z kategorią.
- Baza pozwala na nakładające się rekordy tego samego scope, a kod wybiera pierwszy lub ostatni zależnie od ścieżki.
- Floaty mogą powodować błędy progów na granicy grosza.
- Obecny L2 scope zależy od aktualnej hierarchii, więc przeszłość może zmieniać się po reorganizacji kategorii.
- Globalny limit zależy od poprawnego expense root contract; nie wolno wrócić do polskich nazw rootów.
- Zakresy dzienne są niejednoznaczne dla wpisów `day_is_null`.
- Snapshoty mogą rozjechać się z transakcjami bez jawnego mechanizmu invalidacji/przeliczenia.
- Wiele nakładających się limitów może generować lawinę alertów po jednej transakcji.
- Progi konfigurowalne bez deduplikacji stworzą męczące powiadomienia.
- Zmiana `budgetStartDate`, przywrócenie z kosza albo edycja zamkniętego miesiąca może wymagać przeliczenia historii.
- Nowe tabele muszą trafić do backupu profilu, resetu oraz polityk RLS; pominięcie jednej ścieżki złamie kontrakty danych.

## 13. Proponowane etapy implementacji

Każdy etap powinien mieć czyste testy domenowe. Migracje wymagają osobnego potwierdzenia.

### Etap 0 — weryfikacja produkcji i inwariantów

- pobrać schemat tabeli, indeksy, RLS i statystyki danych bez danych osobowych;
- wykryć nakładające się aktywne rekordy dla tego samego scope;
- ustalić politykę `day_is_null`, excluded months i edycji zamkniętych miesięcy;
- opisać inwarianty wersji i okresów.

### Etap 1 — czysta domena bez przełączania UI

- typy plan/version/scope/period/status;
- kalkulator groszy, procentów, dni i prognoz;
- selektor kategorii/global expense oparty na centralnych kontraktach;
- generator okresów miesięcznych/date-range/cycle;
- adapter obecnego `BudgetLimit`;
- testy nakładania scope, kosza, budget start i progów.

### Etap 2 — schemat i kompatybilność danych

- dodać plan, wersje, członkostwa scope i instancje okresów;
- zachować starą tabelę/adapter w okresie przejściowym;
- backfillować obecne rekordy jako miesięczne wersje;
- dodać constrainty braku nakładania wersji w jednym planie;
- poprawić RLS i backup.

### Etap 3 — kalkulacja wielu limitów

- centralny serwis indeksujący transakcje raz na okres/scope;
- obsługa globalnego, L2, L3 i grup;
- przeliczenie po CRUD/przeniesieniu transakcji;
- invalidacja snapshotów;
- pozostawić istniejący UI na adapterze, jeśli to możliwe.

### Etap 4 — historia i operacje zmian

- „tylko ten okres”, „od następnego”, „bieżący i przyszłe”;
- atomowe zamykanie/tworzenie wersji;
- snapshot zamkniętego okresu i kontrolowane przeliczanie;
- archiwizacja zamiast kasowania historii.

### Etap 5 — trwałe alerty

- konfigurowalne progi;
- zdarzenie po przekroczeniu progu;
- read/mute per okres;
- deduplikacja i polityka alert fatigue;
- integracja z istniejącym systemem powiadomień bez mieszania reminder lifecycle.

### Etap 6 — nowe okresy

- jednorazowy date range;
- cykle dzień/tydzień/miesiąc;
- jawna obsługa dayless;
- statystyki dni i prognozy.

### Etap 7 — przełączenie i cleanup legacy

- przełączyć hook i komponenty na nową domenę;
- zaktualizować `ARCHITECTURE_FREEZE.md` i `DO_NOT_BREAK_CONTRACTS.md`;
- dopiero po weryfikacji danych usunąć legacy pola/adaptery;
- osobno wykonać ewentualne zmiany UI, poza zadaniem logiki.

## 14. Pliki do przekazania ChatGPT do dalszej pracy

Minimalny pakiet dla Etapu 1:

1. `BUDGET_LIMITS_LOGIC_AUDIT.md`
2. `ARCHITECTURE_FREEZE.md`
3. `DO_NOT_BREAK_CONTRACTS.md`
4. `lib/budgetPageTypes.ts`
5. `lib/useBudgetLimits.ts`
6. `lib/transactionScope.ts`
7. `lib/transactionDomain.ts`
8. `lib/dateUtils.ts`
9. `lib/categoryUtils.ts`
10. `lib/useBudgetCategoryTreeData.ts`
11. `lib/useBudgetMonthNavigation.ts`
12. `components/budget-app/useBudgetAppWorkspaceDataBridge.ts`
13. `components/budget-app/useBudgetLimitViews.ts`
14. `components/budget-app/useBudgetAppControllerViewProps.tsx`
15. `components/BudgetAppController.tsx`
16. `components/BudgetLimitIndicator.tsx`
17. `components/BudgetLimitAlertsPanel.tsx`
18. `components/BudgetLimitEditorModal.tsx`
19. `sql/budget_limits.sql`
20. `lib/exportBackup.ts`

Przed Etapem 2 trzeba dodatkowo dostarczyć aktualny eksport schematu Supabase bez danych użytkowników i sekretów: `budget_limits`, `transactions`, `categories`, ustawienia miesiąca, indeksy, constrainty, triggery, funkcje oraz polityki RLS. Przy projektowaniu grup/tagów potrzebne będą także typy i schemat relacji tagów do transakcji.
