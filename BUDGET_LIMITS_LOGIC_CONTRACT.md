# BudżAppka — kontrakt logiki „Limity budżetowe”

## Status dokumentu

Ten dokument jest źródłem prawdy dla dalszej implementacji modułu „Limity budżetowe”. Definiuje docelową domenę przed utworzeniem nowej warstwy kodu, migracją danych i zmianami UI.

Nie zmienia działania obecnego `useBudgetLimits()` ani tabeli `budget_limits`. Do czasu kontrolowanego przełączenia obecny moduł i jego adaptery pozostają aktywne. Nowa logika nie może być dopisywana lokalnie do komponentów ani tworzyć równoległych zasad scope, znaku kwot, daty początku budżetu lub kosza.

Każda implementacja musi zachować kontrakty z `ARCHITECTURE_FREEZE.md`, `DO_NOT_BREAK_CONTRACTS.md` i `UI_FOUNDATION_CONTRACT.md`, w szczególności Transaction Scope, Signed Amount, Root Category, Feature Toggle, Multiuser/Profile, Trash/Export, BudgetStartDate i Dayless Contract.

## 1. Finalna nazwa modułu

Finalna nazwa modułu brzmi:

**Limity budżetowe**

Limit jest regułą kontrolną i analityczną. Nie jest blokadą transakcji, rezerwacją środków ani budżetem kopertowym.

## 2. Cel modułu

Moduł służy do:

- kontrolowania wydatków w określonym zakresie i okresie;
- ostrzegania przed zbliżaniem się do limitu;
- pokazywania przekroczeń;
- analizowania tempa wydawania pieniędzy;
- prognozowania wyniku na koniec aktywnego okresu;
- zachowania historii wykorzystania i zmian limitu.

Moduł nie może:

- blokować dodawania, edycji ani przenoszenia wpisów po przekroczeniu limitu;
- zmieniać kwoty lub kategorii transakcji;
- traktować ostrzeżenia jako walidacji zapisu;
- tworzyć własnego scope transakcji poza centralnym kontraktem.

## 3. Finalne typy limitów

Docelowa domena obsługuje:

1. `monthly_category` — limit miesięczny pojedynczej kategorii L2 albo L3.
2. `monthly_category_group` — limit miesięczny jawnej grupy kategorii.
3. `monthly_global_expense` — limit miesięczny wszystkich wydatków.
4. `one_off_date_range` — jednorazowy limit okresowy od daty do daty.
5. `recurring_custom_period` — limit cykliczny z własnym okresem.

`recurring_custom_period` jest uzasadniony domenowo, ponieważ pozwala obsłużyć np. budżet tygodniowy albo okres rozliczeniowy niezaczynający się pierwszego dnia miesiąca. Nie jest obowiązkowym zakresem MVP v1.

Typ limitu jest jawny. Nie może być odgadywany z `category_id = null`, nazwy, zakresu dat ani obecności dzieci kategorii.

## 4. Zakres limitu

`BudgetLimitScopeType` ma docelowo wartości:

- `category` — pojedyncza kategoria L2 albo L3;
- `category_group` — jawna lista kategorii;
- `global_expense` — cały root wydatków;
- `tags` — zarezerwowane rozszerzenie przyszłościowe.

### Kategoria L2

Obejmuje transakcje przypisane do L2 oraz odpowiednich potomków L3 zgodnie z wersją reguły zakresu.

### Kategoria L3

Obejmuje wyłącznie transakcje przypisane do wskazanego L3.

### Grupa kategorii

Obejmuje sumę transakcji należących do jawnie wskazanych członków. Członkostwo jest częścią wersji limitu. Ta sama transakcja nie może zostać policzona dwukrotnie wewnątrz jednego limitu, nawet jeśli pasuje do kilku członków grupy.

### Całe Wydatki

Obejmuje wszystkie transakcje rozpoznane jako `expense` przez Root Category i Signed Amount Contract. Nazwa root kategorii nie jest źródłem prawdy.

### Tagi

Tag scope nie wchodzi do pierwszego wdrożenia. Wymaga stabilnej polityki OR/AND, zachowania po usunięciu tagu oraz zgodności z historią relacji transaction–tag.

## 5. Okres limitu

### Jeden miesiąc

Jedna instancja obejmuje pełny miesiąc kalendarzowy od pierwszego do ostatniego dnia.

### Każdy miesiąc

Plan generuje kolejne miesięczne instancje. Każda instancja ma własną historię, alerty i wynik.

### Zakres dat

`fixed_date_range` ma jawne `startDate` i `endDate`, obie granice włącznie. Data końca nie może poprzedzać początku.

### Cykl własny

`rolling_cycle` ma:

- `anchorDate`;
- `cadenceUnit: day | week | month`;
- dodatni integer `cadenceInterval`.

Granice oblicza się deterministycznie jako `[periodStart, nextPeriodStart)`. Prezentowany `periodEnd` to dzień poprzedzający kolejny początek. Bardzo złożone kalendarze pozostają poza pierwszym wdrożeniem.

### Instancja okresu

Każdy konkretny miesiąc, zakres lub cykl jest osobną `BudgetLimitPeriod`. To ona przechowuje tożsamość historii, alertów i ewentualnego snapshotu. `selectedMonth` jest kontekstem nawigacji/prezentacji, a nie uniwersalnym źródłem granic okresu.

## 6. Statusy limitu

Pojęcia muszą być rozdzielone. Nie wolno umieszczać wszystkich statusów w jednej kolumnie.

### Wyliczany status wykorzystania

- `safe` — nie osiągnięto aktywnego progu ostrzegawczego;
- `warning` — osiągnięto co najmniej jeden próg ostrzegawczy, ale wykorzystanie jest poniżej 100%;
- `exceeded` — `spentGrosze >= limitGrosze`.

### Stan powiadomienia

- `unread`;
- `read`;
- `muted`.

`muted` nie zmienia `warning` ani `exceeded`. Oznacza wyłącznie, że alert dla danego okresu nie powinien ponownie przeszkadzać użytkownikowi.

### Status definicji

- `active`;
- `archived`.

`archived` nie usuwa historii ani nie zmienia historycznych statusów wykorzystania.

Publiczne pojęcia wymagane przez produkt to zatem `safe`, `warning`, `exceeded`, `muted` i `archived`, ale należą one do trzech różnych osi domenowych.

## 7. Stany wyliczane

Dla instancji okresu wylicza się:

- `limitGrosze` — kwotę limitu;
- `spentGrosze` — sumę kwalifikowanych wydatków;
- `remainingGrosze = limitGrosze - spentGrosze`;
- `overageGrosze = max(spentGrosze - limitGrosze, 0)`;
- `usagePercent` — wykorzystanie procentowe, bez ograniczenia do 100%;
- `daysElapsed`;
- `daysLeft`;
- `actualDailyPaceGrosze` — średnie dzienne tempo wydatków;
- `averageDailySpendAllowedGrosze` — pozostały bezpieczny wydatek dzienny;
- `projectedSpendGrosze` — prognozę na koniec aktywnego okresu;
- `projectedDeltaGrosze = projectedSpendGrosze - limitGrosze`;
- `usageStatus: safe | warning | exceeded`;
- opcjonalny sygnał `projected_exceeded`.

Prognoza dla przyszłego okresu bez dni elapsed wynosi `null`, a nie 0. Dla zakończonego okresu `daysLeft = 0`, a wynik historyczny nie powinien udawać aktywnej prognozy.

Polityka, czy bieżący dzień wchodzi jednocześnie do `daysElapsed` i `daysLeft`, musi być jedna dla całej domeny i zostać pokryta testami.

## 8. Alerty

### Progi

Wersja limitu przechowuje uporządkowane, unikalne progi ostrzegawcze, np. 50%, 80% i 90%. Przekroczenie 100% jest osobnym progiem krytycznym.

Legacy `normal` może zostać zaadaptowane do 80/90/100, a `strict` do samego 100%. Nowa domena nie powinna utrwalać tych dwóch trybów jako jedynego modelu.

### Rodzaje alertów

- `threshold_reached` — osiągnięto skonfigurowany próg;
- `limit_exceeded` — osiągnięto lub przekroczono 100%;
- `projected_exceeded` — bieżące tempo wskazuje prawdopodobne przekroczenie przed końcem okresu.

Alert prognozowany musi być oznaczony jako prognoza, nie jako faktyczne przekroczenie.

### Lifecycle alertu

Alert jest przypisany do konkretnego planu i instancji okresu. Przechowuje co najmniej:

- rodzaj/próg;
- `triggeredAt`;
- kwotę wydaną i limit w chwili wyzwolenia;
- `readAt`;
- `mutedUntil` albo `mutedForPeriod`;
- opcjonalne `resolvedAt`.

### Ochrona przed męczącymi alertami

- jeden alert danego rodzaju/progu na plan i okres;
- alert powstaje przy przejściu przez próg, nie przy każdym renderze;
- oznaczenie jako przeczytany nie zmienia wyniku limitu;
- wyciszenie dla okresu blokuje kolejne powiadomienia, ale nie ukrywa `warning/exceeded` w szczegółach;
- spadek wydatków poniżej progu po edycji/usunięciu wpisu może oznaczyć alert jako rozwiązany;
- ponowne przekroczenie tego samego progu w okresie domyślnie nie tworzy kolejnego alertu bez jawnej polityki resetu;
- kilka nakładających się limitów może wygenerować osobne alerty, ale każdy musi wskazać nazwę i zakres konkretnego limitu.

Alerty limitów nie są reminder lifecycle płatności cyklicznych i nie mogą korzystać z jego statusów jako własnego źródła prawdy.

## 9. Zasady liczenia

### Centralny scope

Kwalifikowane transakcje muszą pochodzić z:

`getEffectiveTransactionScope(transactions, { mode: 'limits', budgetStartDate })`

Nie wolno lokalnie odtwarzać polityki kosza, początku budżetu ani excluded months.

### Wydatki

- liczą się wyłącznie transakcje rozpoznane jako `expense` przez centralny root/signed amount contract;
- przychody nie zużywają limitu;
- `unknown` nie zużywa limitu i powinno być diagnostycznie widoczne;
- kwota zapisana jako dodatnia nie oznacza automatycznie przychodu ani wydatku.

### Transfery/przesunięcia

Jeżeli domena ma lub otrzyma jawny typ transferu, transfer nie zużywa limitu. Nie wolno wykrywać transferów po nazwie kategorii, opisie ani parze podobnych kwot. Do czasu stabilnego, jawnego modelu transferów obowiązuje nierozstrzygnięta decyzja z sekcji 17.

### Mutacje transakcji

- wpis w koszu nie liczy się;
- przywrócenie wpisu może ponownie zwiększyć wykorzystanie;
- zmiana kwoty przelicza wszystkie pasujące, nakładające się limity;
- zmiana kategorii usuwa kwotę ze starego scope i dodaje do nowego;
- zmiana daty/miesiąca przenosi wpływ między instancjami okresów;
- zmiana ustawień/hierarchii kategorii nie może po cichu przepisać zamkniętej historii.

### Pieniądze i procenty

- wszystkie kwoty domenowe są integerami groszy;
- PLN jest walutą MVP;
- formatowanie złotych następuje dopiero na wyjściu;
- decyzje progowe porównują integery, np. `spent * 100 >= limit * threshold`;
- procent prezentacyjny może być zaokrąglony, ale nie steruje statusem;
- `remainingGrosze` może być ujemne;
- limit musi być większy od 0.

### Dayless i excluded months

- wpis `day_is_null` wchodzi do pełnego miesiąca;
- nie wolno przypisywać go do pierwszego dnia miesiąca;
- dla częściowego zakresu dziennego obowiązuje nierozstrzygnięta polityka;
- miesiąc wykluczony ze statystyk nadal może być liczony przez `mode: 'limits'`, zgodnie z centralną polityką scope.

## 10. Nakładanie limitów

Nakładanie limitów jest dozwolone i zamierzone.

Przykład: transakcja restauracyjna może jednocześnie zużywać:

- limit L3 „Restauracje”;
- limit grupy „Jedzenie”;
- globalny limit wszystkich wydatków.

Zasady:

- każdy plan liczy własny wynik niezależnie;
- kwoty nie są dzielone pomiędzy plany;
- przekroczenie jednego limitu nie zmienia statusu drugiego;
- alert wskazuje konkretny `planId`, nazwę, zakres i okres;
- wewnątrz jednego limitu transakcja jest liczona najwyżej raz;
- baza i domena muszą rozróżniać zamierzone nakładanie różnych planów od przypadkowych, konfliktowych wersji tego samego planu.

## 11. Historia limitów

Historia wymaga rozdzielenia:

- `BudgetLimitPlan` — trwała tożsamość;
- `BudgetLimitVersion` — reguły obowiązujące w czasie;
- `BudgetLimitPeriod` — konkretna instancja miesiąca/okresu;
- `BudgetLimitAlert` — zdarzenia powiadomień dla instancji.

### Historia miesięczna

Każdy miesiąc ma własną instancję z wersją reguł, kwotą limitu i wynikiem. Zamknięty okres może mieć snapshot `spentGrosze`, `transactionCount`, `usageStatus` i `calculatedAt`.

### Tryby zmiany

1. `this_period_only` — override wyłącznie dla jednej instancji; nie zmienia poprzednich ani kolejnych okresów.
2. `from_next_period` — zamyka obecną wersję na końcu bieżącego okresu i tworzy nową od następnego.
3. `current_and_future` — zmienia regułę dla całego bieżącego okresu i przyszłości, zachowując audyt poprzedniej wersji.

Częściowa zmiana miesięcznego limitu „od dzisiaj” nie jest domyślna, ponieważ dzieli semantykę miesiąca. Może zostać później wyrażona jako osobny date-range.

### Ochrona historii

- zmiana limitu nie nadpisuje zamkniętych instancji;
- archiwizacja nie usuwa wersji, okresów ani alertów;
- usunięcie/archiwizacja kategorii nie może kasować historii limitu;
- odblokowanie miesiąca i edycja historycznej transakcji oznacza snapshot jako nieaktualny i uruchamia kontrolowane przeliczenie;
- przeliczenie musi być audytowalne;
- wersje jednego planu nie mogą się nakładać.

## 12. Relacja z kategoriami

### L2

Limit L2 obejmuje transakcje przypisane bezpośrednio do L2 oraz jego L3 zgodnie z polityką zakresu. Należy zapisać, czy nowe L3 automatycznie dołączają do aktywnego limitu. Historyczny wynik nie może zależeć od obecnej, zmienionej hierarchii bez snapshotu lub wersji członkostwa.

### L3

Limit L3 obejmuje wyłącznie wskazaną podkategorię.

### Grupa

Grupa przechowuje jawną listę category IDs oraz ewentualny `includeDescendants`. Członkostwo należy do wersji planu. Duplikaty i nakładające się gałęzie są deduplikowane przed liczeniem.

### Globalny expense

Zakres globalny korzysta z `getTransactionRootType()` / `getSignedAmountByRootType()` i jawnego expense root ID. Nie używa nazwy „Wydatki”.

### Usunięta lub ukryta kategoria

Usunięcie kategorii nie może kaskadowo usunąć historii limitu. Plan może zostać oznaczony jako wymagający uwagi/archiwizacji, a historyczne scope membership i etykieta snapshotowa pozostają dostępne.

## 13. Relacja z miesiącem

- limit miesięczny używa pełnych granic aktualnie wybranego miesiąca budżetowego;
- zmiana `selectedMonth` wybiera właściwe instancje i wersje dla tego miesiąca;
- `selectedMonth` nie może nadpisywać zakresu limitu date-range/cycle;
- `budgetStartDate` jest respektowane przez centralny `mode: 'limits'`;
- zamknięcie miesiąca może zamknąć i snapshotować jego instancje limitów;
- historyczny/zamknięty miesiąc nie może zostać przypadkowo nadpisany przez edycję planu;
- edycja transakcji w odblokowanym okresie powoduje jawne przeliczenie, a nie cichą rozbieżność snapshotu;
- przyszły miesiąc może pokazywać konfigurację limitu, ale bez wydatków i aktywnej prognozy.

Miesiące wykluczone ze statystyk nie są automatycznie wykluczone z limitów. O tej polityce decyduje centralny Transaction Scope Contract.

## 14. MVP v1

Pierwsze wdrożenie nowego kontraktu musi zawierać:

1. Czystą domenę oddzieloną od Reacta, Supabase i UI.
2. Trwały `BudgetLimitPlan`, wersje reguł i miesięczne instancje okresów.
3. Miesięczny limit L2 oraz L3.
4. Miesięczny globalny limit wydatków.
5. Model grup kategorii gotowy domenowo; aktywacja grup w MVP zależy od decyzji o członkostwie i migracji.
6. Kwoty w groszach i PLN.
7. Wyniki: wydane, pozostałe, przekroczenie i procent.
8. Statusy `safe | warning | exceeded`.
9. Konfigurowalne progi ostrzegawcze oraz próg 100%.
10. Podstawową prognozę końca miesiąca, tempo dzienne i dni pozostałe.
11. Trwałe alerty z `read` i `mutedForPeriod` oraz deduplikacją.
12. Historię miesięczną bez nadpisywania po zmianie kwoty.
13. Tryby zmian: tylko ten okres, od następnego, bieżący i przyszłe.
14. Przeliczanie po dodaniu, edycji, przeniesieniu, usunięciu i przywróceniu transakcji.
15. Nakładający się limit kategorii i globalny.
16. Adapter obecnej tabeli `budget_limits` bez usuwania legacy podczas przejścia.
17. Feature toggle, profile scope, RLS, backup/reset i centralne kontrakty transakcji.
18. Testy pieniędzy, progów, scope, historii, nakładania, dayless i zamkniętych miesięcy.

MVP nie musi zawierać date-range ani custom cycle. Model nie może jednak uniemożliwiać ich późniejszego dodania.

## 15. Funkcje odłożone na później

Poza MVP pozostają:

- limity tagów;
- złożone cykle i niestandardowe kalendarze;
- jednorazowe date-range, jeśli nie zostaną świadomie włączone do pierwszego zakresu;
- automatyczne rekomendacje kwot limitów;
- uczenie nawyków i zaawansowane predykcje;
- sezonowość i prognozy wielomodelowe;
- automatyczne przenoszenie niewykorzystanego limitu;
- budżety kopertowe i rezerwacja środków;
- blokowanie transakcji po przekroczeniu;
- współdzielone pule limitów pomiędzy profilami;
- automatyczne rozpoznawanie transferów po heurystykach;
- rozbudowane scenariusze „co jeśli”.

Odłożone funkcje wymagają rozszerzenia kontraktu, a nie lokalnej łatki w kalkulatorze lub UI.

## 16. Etapy implementacji

### Etap 1 — czysta domena bez UI i migracji

- typy plan/version/scope/period/alert;
- kalkulator groszy, procentów, dni i prognoz;
- selektor wydatków korzystający z centralnych kontraktów;
- generowanie miesięcznych okresów;
- adapter obecnego `BudgetLimit`;
- test cases i inwarianty.

### Etap 2 — migracja danych

- po osobnym potwierdzeniu dodać plany, wersje, scope membership, okresy i alerty;
- zweryfikować produkcyjny schemat, RLS i dane;
- backfillować stare rekordy jako miesięczne wersje;
- zachować legacy tabelę i rollback;
- zaktualizować backup/reset.

### Etap 3 — kalkulacje i alerty

- centralny silnik kalkulacji wielu limitów;
- statusy, progi, prognozy i deduplikacja;
- read/mute per okres;
- snapshoty i invalidacja.

### Etap 4 — integracja z transakcjami

- przeliczanie po CRUD, przeniesieniu i zmianie daty;
- poprawna obsługa kosza, budget start, dayless i root type;
- wydajny indeks zależności transakcja → pasujące limity;
- obsługa zamkniętych/odblokowanych okresów.

### Etap 5 — UI modułu

- dopiero po stabilizacji domeny i migracji;
- zgodnie z `UI_FOUNDATION_CONTRACT.md`;
- bez lokalnego dublowania kalkulacji, statusów i alertów w komponentach.

### Etap 6 — cleanup legacy

- po okresie kompatybilności i porównaniu wyników;
- usunąć stare ścieżki tylko po osobnym zatwierdzeniu;
- zaktualizować `ARCHITECTURE_FREEZE.md` i `DO_NOT_BREAK_CONTRACTS.md`;
- nie usuwać historycznych danych ani adaptera potrzebnego do rollbacku zbyt wcześnie.

## 17. Decyzje nierozstrzygnięte

Poniższe kwestie wymagają danych produkcyjnych albo jawnej decyzji produktowej. Nie wolno ich zgadywać podczas implementacji lub migracji.

### Schemat i migracja

1. Czy ewoluować `budget_limits`, czy utworzyć osobne tabele planów i wersji z legacy adapterem?
2. Czy aktualny plik `sql/budget_limits.sql` odpowiada produkcji, w tym constraintom, indeksowi i RLS?
3. Czy dostęp `auth.role() = 'anon'` ma pozostać, czy jest wyłącznie pozostałością środowiska preview?
4. Czy w produkcji istnieją nakładające się rekordy tego samego `category_id` i miesiąca?
5. Jak połączyć istniejące, niezależne rekordy zakresów miesięcy w jedną tożsamość planu?
6. Jak długo utrzymywać adapter/dual-read i jaki jest plan rollbacku?
7. Jak nowe tabele uczestniczą w backupie, imporcie, resecie i usuwaniu profilu?

### Kategorie i grupy

8. Czy nowe L3 automatycznie wchodzą do aktywnego limitu L2?
9. Czy grupa przechowuje `includeDescendants`, czy wyłącznie konkretne category IDs?
10. Co dzieje się z aktywnym planem po usunięciu/archiwizacji kategorii?
11. Czy historyczne okresy przechowują snapshot członkostwa, czy odwołanie do niezmiennej wersji scope?
12. Czy grupy kategorii muszą wejść do UI MVP, czy tylko do modelu domenowego pierwszej wersji?

### Okresy i historia

13. Czy snapshot zamkniętego miesiąca jest automatyczny przy locku, czy tworzony przy pierwszym odczycie po zamknięciu?
14. Czy edycja transakcji w odblokowanym historycznym miesiącu automatycznie przelicza snapshot, czy wymaga potwierdzenia?
15. Jak długo przechowywać historię zdarzeń przeliczenia i wersji?
16. Czy `current_and_future` zmienia cały bieżący miesiąc, czy produkt potrzebuje również częściowego „od dziś”?
17. Czy date-range i custom cycle wchodzą do migracji od początku jako aktywne typy, czy tylko jako przyszłościowe typy domenowe?
18. Jaka jest finalna polityka `day_is_null` w częściowym zakresie dat?
19. Czy zamknięty okres może zmienić wynik po zmianie `budgetStartDate`?

### Kalkulacje

20. Czy bieżący dzień liczy się jednocześnie do `daysElapsed` i `daysLeft`?
21. Jak zaokrąglać `averageDailySpendAllowed` i prognozę do groszy?
22. Czy tempo dzienne liczy dni kalendarzowe, czy tylko dni od pierwszego wydatku?
23. Czy prognoza ma powstawać przy zerowych wydatkach jako 0, czy pozostać `null` do pierwszego wpisu?
24. Jak jawnie modelować transfery/przesunięcia i od kiedy wyłączać je z limitów?
25. Czy zwroty/refundy zmniejszają `spentGrosze`, a jeśli tak, po jakim jawnym typie transakcji?
26. Czy `unknown` root ma być tylko pomijany, czy generować diagnostyczne ostrzeżenie?

### Alerty

27. Jakie progi są domyślne dla nowych limitów: 50/80/90/100 czy inny zestaw?
28. Czy użytkownik może dodawać dowolne progi, czy wybiera gotowy zestaw?
29. Jaki algorytm i minimalna liczba dni/wydatków uruchamia `projected_exceeded`?
30. Czy po spadku poniżej progu i ponownym wzroście alert może pojawić się drugi raz w tym samym okresie?
31. Czy wyciszenie dotyczy konkretnego alertu, całego planu w okresie, czy obu wariantów?
32. Czy alert 100% może zostać wyciszony tak samo jak ostrzeżenia?
33. Jak agregować jednoczesne alerty z limitu L3, grupowego i globalnego, aby nie męczyć użytkownika?
34. Jak długo przechowywać przeczytane i rozwiązane alerty?

### Produkt i operacje

35. Czy walutą planu zawsze jest PLN, czy schemat ma od początku przechowywać kod waluty?
36. Czy archiwizacja planu zatrzymuje generowanie nowych okresów natychmiast, czy od następnego okresu?
37. Czy jeden scope może mieć kilka świadomie równoległych planów o różnych nazwach?
38. Jakie limity wydajności obowiązują dla liczby aktywnych planów i historii okresów?
39. Czy moduł pozostaje domyślnie włączony dla istniejących i nowych profili?
40. Które mutacje wymagają atomowego RPC Supabase?

Do czasu rozstrzygnięcia tych punktów Etap 1 może powstać jako czysta, testowalna domena. Etap 2 nie powinien wykonywać nieodwracalnego backfillu ani przełączać istniejącej aplikacji bez osobnego potwierdzenia.
