# BudżAppka — kontrakt logiki „Płatności cykliczne”

## Status dokumentu

Ten dokument jest źródłem prawdy dla dalszego projektowania i implementacji modułu „Płatności cykliczne”. Definiuje docelową domenę przed migracją bazy i przełączeniem aplikacji.

Kontrakt nie przełącza istniejącego panelu ani legacy lifecycle. Do czasu osobnego etapu migracji i integracji działająca aplikacja nadal korzysta z `lib/recurringTransactions.ts`, `ReminderMonthLifecycleStatus` i obecnych tabel. Nowy model nie może być wdrażany lokalnie w komponentach ani jako równoległa, częściowo podpięta prawda.

Każde przyszłe przełączenie musi zachować Transaction Scope, Signed Amount, Root Category, Payment Attribution, Feature Toggle, Multiuser/Profile, Trash/Export, BudgetStartDate i Dayless Contract z `ARCHITECTURE_FREEZE.md` oraz `DO_NOT_BREAK_CONTRACTS.md`.

## 1. Finalna nazwa modułu

Finalna nazwa produktu i domeny brzmi:

**Płatności cykliczne**

Nazwa „Stałe płatności” jest nazwą legacy i nie obejmuje planów ratalnych ani kredytów. Fizyczne nazwy istniejących tabel i pól mogą pozostać tymczasowo bez zmian jako warstwa kompatybilności.

## 2. Finalne typy płatności

`RecurringPaymentPlanType` ma trzy wartości:

- `fixed_payment` — Stała płatność;
- `installment_purchase` — Zakup na raty;
- `loan` — Kredyt / pożyczka.

Typ planu jest jawny i nie może być odgadywany z nazwy, kategorii, kwoty ani długości harmonogramu.

Legacy adapter mapuje:

- `open` → `fixed_payment`;
- `installment` → `installment_purchase`.

Legacy nie ma odpowiednika `loan`. Typ `loan` może powstać wyłącznie z nowych, jawnych danych albo po świadomej decyzji użytkownika podczas późniejszej konwersji.

## 3. Plan, wystąpienie, przypomnienie i wpis

### Plan płatności

`RecurringPaymentPlan` opisuje regułę i wspólną tożsamość płatności:

- typ;
- nazwę i dane domenowe;
- cadence/interwał;
- datę początku i opcjonalnego końca;
- domyślną kwotę planowaną;
- status planu;
- regułę generowania przyszłych wystąpień.

Plan nie jest dowodem zapłaty. Zmiana planu nie może przepisywać historii obsłużonych wystąpień.

### Wystąpienie płatności

`RecurringPaymentOccurrence` jest konkretną należnością w konkretnym terminie. Ma własne:

- `id` i `planId`;
- termin `dueDate`;
- opcjonalną kwotę planowaną;
- trwały status wykonania;
- opcjonalne odłożenie przypomnienia;
- numer/kolejność w harmonogramie;
- blokady i rewizję harmonogramu, jeśli dotyczy.

Wystąpienie jest kanoniczną jednostką historii, statystyk, przypomnień i powiązań z transakcjami.

### Przypomnienie

Przypomnienie jest widokiem operacyjnym wystąpienia, a nie osobną płatnością. Wynika z terminu, statusu, bieżącej daty i `snoozedUntil`.

- odłożenie zmienia widoczność/czas przypomnienia;
- odłożenie nie zmienia `dueDate`;
- odłożenie nie zmienia harmonogramu;
- odłożenie nie oznacza wykonania.

### Powiązany wpis/transakcja

Transakcja jest faktycznym wpisem finansowym. Musi być powiązana z konkretnym wystąpieniem przez docelową relację occurrence–transaction. Jedno wystąpienie może mieć wiele powiązanych wpisów. Plan może mieć wiele wystąpień w jednym miesiącu.

Legacy `transactions.recurring_transaction_id` wskazuje wyłącznie plan i pozostaje tymczasowym polem kompatybilności. Nie jest docelowym źródłem prawdy o konkretnym wystąpieniu.

## 4. Finalne statusy wystąpienia

`RecurringOccurrenceStatus` zawiera wyłącznie:

- `pending` — wystąpienie oczekuje na decyzję lub płatność;
- `completed_with_transaction` — wykonano i istnieje co najmniej jeden powiązany wpis;
- `completed_without_transaction` — wykonano bez tworzenia wpisu;
- `skipped` — w tym okresie płatność się nie odbyła.

Status wystąpienia jest trwałym stanem domenowym. `overdue` i `snoozed` nie mogą być zapisane jako zamienniki tych statusów.

Inwarianty:

- `completed_with_transaction` wymaga co najmniej jednego aktywnego powiązania z transakcją;
- `completed_without_transaction` nie ma aktywnego powiązania z transakcją;
- `skipped` nie jest wykonaniem;
- `pending` może być zaległe albo odłożone bez zmiany statusu bazowego.

## 5. Stany wyliczane przypomnienia

`RecurringDerivedReminderState` zawiera:

- `overdue` — bazowy status to `pending`, a `dueDate` jest wcześniejszy niż dzisiejsza data;
- `snoozed` — bazowy status to `pending`, a `snoozedUntil` nie minął.

Priorytet dla `pending`:

1. aktywne odłożenie daje `snoozed`;
2. w przeciwnym razie miniony termin daje `overdue`;
3. w przeciwnym razie stan pozostaje `pending`.

Stan wyliczany nie może zmieniać wyniku finansowego ani harmonogramu.

## 6. Akcje użytkownika na wystąpieniu

Dozwolone akcje:

1. `add_transaction` — utwórz wpis, powiąż go z wystąpieniem i ustaw `completed_with_transaction`.
2. `complete_without_transaction` — ustaw `completed_without_transaction`.
3. `skip` — ustaw `skipped`.
4. `snooze` — ustaw lub zmień `snoozedUntil`, pozostawiając `pending` i nie zmieniając terminu.
5. `open_details` / `edit_details` — pokaż lub edytuj dozwolone dane wystąpienia.
6. `reopen` — cofnij status do `pending` wyłącznie wtedy, gdy nie prowadzi to do utraty albo osierocenia danych.

Akcja `reopen` jest bezpieczna, gdy:

- dla `completed_without_transaction` lub `skipped` nie istnieją powiązane wpisy;
- dla `completed_with_transaction` użytkownik wcześniej odłączy albo jawnie obsłuży powiązane wpisy;
- wystąpienie nie zostało objęte nieodwracalnym zamknięciem/archiwizacją bez osobnej procedury;
- operacja zachowuje historię zmian.

Operacje zmieniające wystąpienie i jego linki do transakcji muszą być atomowe.

## 7. Twarde rozróżnienie wykonania bez wpisu i pominięcia

### `completed_without_transaction`

Znaczy: płatność faktycznie się odbyła, ale użytkownik nie chce lub nie może utworzyć wpisu finansowego.

- wystąpienie jest wykonane;
- zwiększa liczbę wykonanych wystąpień;
- jeśli istnieje kwota planowana, może zasilić statystyki kwotowe tą kwotą;
- jeśli kwota planowana jest nieznana, wykonanie pozostaje prawdziwe, ale kwota jest nieznana.

### `skipped`

Znaczy: w tym okresie płatność się nie odbyła.

- wystąpienie nie jest wykonane;
- nie zwiększa zapłaconej kwoty;
- nie może użyć kwoty planowanej ani przypadkowo powiązanej transakcji w statystykach;
- dla rat może uruchomić decyzję o dalszym harmonogramie.

Tych stanów nie wolno mapować do jednej wartości w nowym modelu. Legacy dane, które nie pozwalają ich rozróżnić, muszą pozostać oznaczone jako niejednoznaczne podczas backfillu.

## 8. Priorytet kwot wystąpienia

Efektywna kwota wystąpienia jest liczona w groszach.

Reguły:

1. Jeśli status nie jest `skipped` i istnieją aktywne powiązane wpisy, suma ich kwot ma pierwszeństwo (`source = transactions`).
2. Jeśli nie ma wpisów, status to `completed_without_transaction` i istnieje `plannedAmountGrosze`, używa się kwoty planowanej (`source = planned`).
3. W pozostałych przypadkach kwota efektywna wynosi 0 (`source = none`).
4. `skipped` zawsze daje 0, również przy niespójnych legacy danych z powiązanym wpisem.

Brak znanej kwoty nie jest równoznaczny z faktyczną płatnością 0 zł. Statystyki powinny zachować informację o źródle kwoty i liczbie wykonanych wystąpień z kwotą nieznaną.

Transakcje muszą wcześniej przejść odpowiedni Transaction Scope i Signed Amount Contract. Usunięte wpisy nie są aktywnymi powiązaniami.

## 9. Logika stałej płatności

Stała płatność (`fixed_payment`) może działać bez końca albo do opcjonalnej daty końca.

### Tryb kwoty

- `fixed` — plan ma domyślną kwotę dla kolejnych wystąpień;
- `variable` — kwota jest spodziewana, ale może różnić się pomiędzy wystąpieniami;
- `reminder_only` — kwota może być pusta; plan działa jako przypomnienie.

### Cadence

Cadence składa się z dodatniego integera `interval` oraz jednostki:

- `day`;
- `week`;
- `month`;
- `year`.

Terminy wylicza się deterministycznie od daty kotwicy. Dla miesięcy i lat dzień jest ograniczany do ostatniego prawidłowego dnia miesiąca; kolejne terminy nadal odnoszą się do pierwotnej kotwicy, aby uniknąć dryfu po lutym.

### Zmiana kwoty

Zmiana „od przyszłego wystąpienia”:

- nie modyfikuje wykonanych, pominiętych ani zablokowanych wystąpień;
- aktualizuje wyłącznie przyszłe `pending` od wybranego occurrence;
- powinna tworzyć rewizję warunków planu albo jawnie zapisać źródło zmiany.

### Wpis o innej kwocie

Po powiązaniu wpisu o kwocie różnej od planowanej system wymaga decyzji:

- `this_occurrence_only` — wpis ma pierwszeństwo tylko dla bieżącego wystąpienia;
- `change_from_next_occurrence` — zaktualizuj domyślną kwotę przyszłych `pending`;
- `edit_schedule_manually` — jeśli plan posiada jawny harmonogram.

Brak decyzji nie może po cichu zmieniać przyszłych kwot.

## 10. Logika zakupu na raty

Zakup na raty (`installment_purchase`) przechowuje:

- `purchaseAmountGrosze` — cenę zakupu;
- `downPaymentAmountGrosze` — pierwszą wpłatę, dopuszczalne 0;
- `financedAmountGrosze = purchaseAmountGrosze - downPaymentAmountGrosze`;
- `installmentCount`;
- domyślną `installmentAmountGrosze`;
- tryb `zero_percent | with_cost`;
- harmonogram konkretnych wystąpień.

Inwarianty:

- kwoty są integerami groszy;
- `0 <= downPayment <= purchaseAmount`;
- liczba rat jest dodatnim integerem;
- rata jest dodatnia, z wyjątkiem nierozstrzygniętego przypadku całkowicie spłaconego zakupu bez rat;
- plan ma co najmniej jeden poprawny sposób wyliczenia harmonogramu;
- zapis planu i harmonogramu jest atomowy.

### Wejścia kalkulatora

- kwota finansowana + liczba rat → wylicz raty;
- kwota finansowana + kwota raty → wylicz liczbę rat;
- liczba rat + kwota raty → wylicz sumę rat i koszt/nadwyżkę;
- ostatnia rata może być wyrównawcza co do grosza.

### Raty 0%

- `downPayment + sum(installments) = purchaseAmount` dokładnie w groszach;
- niespełnienie inwariantu blokuje zapis;
- `installmentCostGrosze = 0`.

### Raty z kosztem

- suma rat może przekraczać kwotę finansowaną;
- `installmentCostGrosze = downPayment + sum(installments) - purchaseAmount`;
- dodatnia różnica jest kosztem/nadwyżką;
- ujemna różnica wymaga ostrzeżenia lub blokady zgodnie z nierozstrzygniętą polityką produktu.

### Harmonogram

- każda rata jest osobnym wystąpieniem z numerem, terminem i kwotą;
- użytkownik może ręcznie edytować przyszłe raty;
- `isAmountLocked` chroni kwotę przed automatycznym przeliczeniem;
- `isDateLocked` chroni termin;
- wykonane, pominięte i zablokowane raty nie mogą być przepisywane przez automatyczne przeliczenie;
- zmiana harmonogramu tworzy rewizję lub audytowalny zapis zmian.

### Pominięcie, nadpłata i wiele rat w miesiącu

- pominięcie wymaga jawnej decyzji opisanej w sekcji 11;
- nadpłata wymaga jawnej decyzji opisanej w sekcji 12;
- dwa wystąpienia w jednym miesiącu są dozwolone;
- wiele transakcji może być powiązanych z jednym wystąpieniem;
- dwie transakcje w jednym miesiącu mogą obsłużyć dwa różne wystąpienia;
- dopasowanie nie może opierać się wyłącznie na miesiącu.

## 11. Decyzje przy pominięciu raty

Po ustawieniu raty jako `skipped` użytkownik wybiera jedną politykę:

1. `append_at_end` — pozostaw pominięte wystąpienie w historii i dodaj nową ratę na końcu harmonogramu; zaktualizuj numerację/koniec bez zmiany historii.
2. `keep_schedule` — pozostaw harmonogram bez zmian; pominięta rata nie jest kompensowana.
3. `manual_schedule` — użytkownik ręcznie ustawia przyszłe raty.

Wybór wpływa tylko na przyszłe, nieobsłużone i nieblokowane wystąpienia. Samo `skipped` nigdy nie oznacza automatycznie `append_at_end`.

## 12. Decyzje przy nadpłacie lub większym wpisie

Gdy suma powiązanych wpisów przekracza kwotę planowaną wystąpienia, użytkownik wybiera:

1. `this_occurrence_only` — zachowaj nadpłatę tylko jako realną kwotę tego wystąpienia; nie zmieniaj harmonogramu.
2. `shorten_schedule` — przelicz przyszłe nieblokowane raty i usuń końcowe wystąpienia, których kwota została pokryta.
3. `reduce_future_installments` — zachowaj liczbę przyszłych rat, rozdzielając pozostałą kwotę według jawnej reguły zaokrągleń.
4. `manual_schedule` — użytkownik edytuje przyszły harmonogram ręcznie.

Operacja nie może zmienić wykonanych, pominiętych ani zablokowanych wystąpień. Dla rat kosztowych i kredytu nadpłata nie może automatycznie udawać nadpłaty kapitału bez danych pozwalających na takie rozliczenie.

## 13. Logika kredytu / pożyczki

Kredyt/pożyczka (`loan`) jest praktycznym trackerem i przypominaczem. Nie jest kalkulatorem bankowym ani źródłem prawdy zgodnym z harmonogramem banku.

Plan może przechowywać:

- `principalAmountGrosze` — kapitał początkowy;
- `paidBeforeTrackingAmountGrosze` — realnie zapłacone przed BudżAppką;
- `installmentsPaidBeforeTrackingCount`;
- `paidInAppActualGrosze` — wyliczane z wystąpień w aplikacji;
- `plannedRemainingGrosze` — suma znanych przyszłych kwot;
- opcjonalne `remainingPrincipalAtStartGrosze` lub późniejszy punkt pomiaru kapitału;
- początkową kwotę raty i harmonogram;
- opcjonalne oprocentowanie informacyjne;
- `interestMode: fixed | variable | unknown`.

Zmiana raty od danego wystąpienia:

- tworzy rewizję albo aktualizuje tylko przyszłe `pending`;
- nie przelicza automatycznie bankowego kapitału ani odsetek;
- zachowuje wartości już zapłacone;
- może zmienić prognozowany koszt i koniec deklarowanego harmonogramu.

Szacunkowy koszt:

`estimatedTotalCost = paidBeforeTracking + paidInAppActual + plannedRemaining - principalAmount`

Wynik zawsze ma `isEstimated = true`. Opcjonalny pozostały kapitał jest informacją pomocniczą i nie może być wyliczany prostym odjęciem pełnych rat od kapitału.

## 14. Statystyki i nieznane kwoty

### Wspólne statystyki planu

- liczba wszystkich wystąpień;
- liczba `pending`, `overdue`, `snoozed`;
- liczba `completed_with_transaction`;
- liczba `completed_without_transaction`;
- liczba `skipped`;
- `paidInAppActual` — suma efektywnych kwot wykonanych wystąpień;
- `plannedRemaining` / `remainingPlanned` — suma znanych kwot przyszłych `pending`.

### Kredyt/pożyczka

- `paidBeforeTracking`;
- `paidInAppActual`;
- `paidTotal = paidBeforeTracking + paidInAppActual`;
- `plannedRemaining`;
- `estimatedTotalCost` z oznaczeniem szacunkowym.

### Zakup na raty

- `purchaseAmount`;
- `downPaymentAmount`;
- `financedAmount`;
- suma faktycznie zapłaconych rat;
- `remainingPlanned`;
- `installmentCost`.

### Obsługa kwoty nieznanej

- `completed_without_transaction` bez kwoty planowanej zwiększa licznik wykonania, ale nie kwotę;
- `pending` bez kwoty planowanej nie zwiększa `plannedRemaining`;
- `skipped` zawsze daje 0;
- statystyki muszą raportować liczbę wykonanych wystąpień o nieznanej kwocie;
- UI nie może przedstawiać nieznanej kwoty jako potwierdzone „0 zł”.

`paidInAppActual` jest nazwą kontraktową statystyki, mimo że może zawierać planowaną kwotę wystąpienia `completed_without_transaction`. Źródło każdej składowej musi pozostać rozróżnialne (`transactions | planned | none`). Jeżeli produkt wymaga nazwy oznaczającej wyłącznie wpisy transakcyjne, należy dodać osobną statystykę, a nie zmieniać tę regułę po cichu.

## 15. MVP v1 modułu

Pierwsza wersja wdrożenia po migracji musi zawierać:

1. Trzy jawne typy planu.
2. Kanoniczne wystąpienia z czterema statusami.
3. Wyliczane `overdue` i trwałe, profilowane `snoozedUntil`.
4. Cadence `day | week | month | year` dla stałych płatności.
5. Kwotę opcjonalną oraz tryby `fixed | variable | reminder_only`.
6. Relację wystąpienie–transakcja obsługującą wiele wpisów.
7. Akcje: dodaj wpis, wykonaj bez wpisu, pomiń, odłóż, szczegóły i bezpieczne cofnięcie.
8. Priorytet kwot i statystyki w groszach.
9. Zakup ratalny: cena, pierwsza wpłata, kwota finansowana, liczba/kwota raty, harmonogram, 0%/koszt, rata wyrównawcza, ręczna edycja i blokady.
10. Jawne decyzje po pominięciu i nadpłacie; przynajmniej `this_occurrence_only`, `keep_schedule`, `append_at_end` i `manual_schedule` muszą być bezpiecznie zapisane.
11. Kredyt/pożyczka jako tracker: kapitał, zapłacone przed śledzeniem, harmonogram deklarowany, zmiana raty od wystąpienia i szacunkowy koszt.
12. Zachowanie legacy danych i adapterów bez kasowania starych tabel/pól.
13. Atomowe mutacje planu, harmonogramu, wystąpienia i linków.
14. RLS/profile scope, feature toggle, backup oraz centralne kontrakty transakcji.
15. Testy migracji, inwariantów finansowych, cadence, statusów, statystyk i konfliktów linków.

MVP nie wymaga automatycznej symulacji bankowej. Dla operacji harmonogramu, których reguł nie da się bezpiecznie zautomatyzować, MVP może wymagać edycji ręcznej zamiast zgadywania.

## 16. Funkcje odłożone na później

Poza MVP pozostają:

- pełny kalkulator bankowy;
- dokładne WIBOR, WIRON, RRSO i bankowe harmonogramy;
- automatyczne pobieranie oprocentowania;
- rozdzielanie raty na kapitał i odsetki bez jawnych danych;
- skomplikowane nadpłaty kapitału i prowizje za nadpłatę;
- refinansowanie, wakacje kredytowe i wieloetapowe karencje;
- zaawansowane symulacje wielu scenariuszy;
- automatyczne prognozowanie zmiennej raty;
- automatyczne dopasowanie niejednoznacznych legacy transakcji;
- nieograniczone generowanie wszystkich przyszłych wystąpień z góry.

Odłożone funkcje nie mogą wymuszać nullable pól lub skrótów, które psują MVP. Model powinien pozostawić możliwość rozszerzenia przez rewizje harmonogramu i dodatkowe dane subtype.

## 17. Etap 2 — wymagania przed migracją

Migracja wymaga osobnego zatwierdzenia. Przed jej napisaniem trzeba zweryfikować realny schemat i dane Supabase.

### Tabele do dodania

Docelowo potrzebne są co najmniej:

1. `recurring_payment_occurrences` — konkretne wystąpienia, terminy, kwoty planowane, statusy, snooze, blokady i rewizja.
2. `recurring_occurrence_transactions` — relacja wiele-do-wielu occurrence–transaction.
3. Tabela danych zakupu ratalnego 1:1, np. `recurring_installment_purchase_terms`.
4. Tabela danych kredytu/pożyczki 1:1, np. `recurring_loan_terms`.
5. Tabela rewizji warunków/harmonogramu albo jawny mechanizm wersjonowania, jeśli nie zostanie bezpiecznie osadzony w occurrences.

Nazwy fizyczne nie są zatwierdzone tym dokumentem; zatwierdzony jest podział odpowiedzialności.

### Rozszerzenia istniejącego planu

`recurring_transactions` może zostać ewolucyjnie rozszerzone o:

- docelowy `plan_type`;
- `cadence_unit` i `cadence_interval`;
- `amount_mode`;
- status planu uwzględniający archiwizację;
- metadane rewizji/generowania wystąpień;
- timestamps aktualizacji.

Alternatywa z nową tabelą planów wymaga dokładnego planu kompatybilności i nie może tworzyć dwóch aktywnych źródeł prawdy.

### Legacy pola i tabele do zachowania

Do czasu pełnego przełączenia zachować:

- `recurring_transactions.kind`;
- `frequency`, `custom_interval_months`;
- `amount`, `use_amount_when_creating`;
- `initial_payment_amount` bez zmiany interpretacji;
- `start_date`, `end_date`, `installment_total_count`;
- `recurring_installment_schedule`;
- `recurring_transaction_executions`;
- `recurring_reminder_month_statuses`;
- `transactions.recurring_transaction_id`;
- wszystkie adaptery legacy wymagane przez działający panel.

Nie wolno reinterpretować `initial_payment_amount` jako pierwszej wpłaty: obecny kod używa go najpewniej jako całkowitej wartości planu.

### Backfill bez niszczenia danych

1. Dodać nowe struktury jako nullable/nieaktywne i nie przełączać odczytu.
2. Mapować `open` → `fixed_payment`, `installment` → `installment_purchase`.
3. Mapować `monthly` → month/1, `yearly` → year/1, `custom` → month/X.
4. Konwertować kwoty do groszy z walidacją i raportem odrzuconych wartości.
5. Generować historyczne wystąpienia tylko tam, gdzie termin/status można ustalić jednoznacznie.
6. Nie rozstrzygać automatycznie niejednoznacznego `read`/`skipped` jako zapłacone lub pominięte.
7. Łączyć transakcję z occurrence tylko przy jednoznacznym dopasowaniu; resztę oznaczyć do weryfikacji.
8. Zachować stare identyfikatory i mapę legacy–new.
9. Uruchomić backfill wielokrotnie/idempotentnie w środowisku testowym.
10. Porównać liczby planów, harmonogramów, statusów, linków i sum przed przełączeniem.
11. Przełączyć odczyt/zapis osobnym etapem z możliwością wycofania.
12. Usuwać legacy dopiero po okresie stabilizacji i osobnej decyzji.

### Kontrole Supabase przed migracją

- rzeczywiste definicje tabel i kolumn;
- typy, defaulty, nullability, constrainty i indeksy;
- FK i zachowanie `on delete`;
- RLS oraz wszystkie polityki dla roli zalogowanej i anon;
- triggery, funkcje/RPC i realtime/subscriptions;
- wolumen danych i zakres dat;
- liczba rekordów z brakującym/niepoprawnym profile/category/transaction link;
- rozkład wartości `kind`, `frequency`, statusów i `initial_payment_amount`;
- obecność wielu transakcji planu w jednym miesiącu;
- niejednoznaczne statusy legacy;
- czy `recurring_installment_schedule.sql` jest faktycznie wdrożone na produkcji;
- zgodność backupu/importu/resetu z nowymi tabelami;
- możliwość atomowej transakcji przez RPC lub funkcję bazodanową;
- limity wydajności i plan indeksów dla pobierania occurrences po profilu, planie i terminie.

## 18. Decyzje nierozstrzygnięte

Poniższe kwestie wymagają danych produkcyjnych albo jawnej decyzji produktowej. Nie wolno ich zgadywać w migracji.

### Dane i migracja

1. Czy fizyczna tabela `recurring_transactions` pozostaje tabelą planów, czy powstaje nowa tabela `recurring_payment_plans`?
2. Czy wszystkie pliki SQL z repo są wdrożone i zgodne z produkcją?
3. Jak interpretować każdy legacy `read`, `completed` i `skipped`, gdy nie ma transakcji?
4. Jak sklasyfikować historyczne `initial_payment_amount`, które obecny kod traktuje jako sumę planu?
5. Jak obsłużyć legacy transakcje, gdy kilka wystąpień lub kilka wpisów przypada na ten sam miesiąc?
6. Jaki horyzont occurrences generować z góry i kiedy go uzupełniać?
7. Czy rewizje harmonogramu są osobną tabelą, czy wersjonowaniem pól occurrences?
8. Jak długo utrzymywać dual-write lub adapter odczytu i jaki jest plan rollbacku?

### Statusy i linki

9. Co dokładnie dzieje się po usunięciu/odpięciu ostatniej transakcji z `completed_with_transaction`: powrót do `pending` czy wybór `completed_without_transaction`?
10. Czy `snoozedUntil` jest datą, timestampem i w jakiej strefie czasowej działa przypomnienie?
11. Czy bezpieczne cofnięcie statusu ma być audytowane osobną tabelą zdarzeń?
12. Jak traktować niespójny stan `skipped` z historycznie powiązaną transakcją poza statystyką równą 0?
13. Czy jedna transakcja może być przypięta do wielu occurrences, czy globalnie tylko do jednego?
14. Czy potrzebne jest `allocatedAmount` przy częściowym rozdziale jednej transakcji?

### Stałe płatności

15. Czy zmiana kwoty „od teraz” zaczyna się od bieżącego czy następnego occurrence?
16. Czy cadence day/week może generować kilka wystąpień tego samego dnia po zmianie kotwicy i jak rozwiązywać kolizje?
17. Czy data końca jest włącznie i czy ogranicza generowanie według `dueDate`?
18. Jak długo zaległe przypomnienia pozostają aktywne i czy można je grupowo obsłużyć?

### Zakupy na raty

19. Czy pierwsza wpłata jest osobnym occurrence/transakcją, czy tylko deklarowanym polem „już zapłacono”?
20. Co zrobić, gdy `downPayment = purchaseAmount` i nie pozostaje żadna rata?
21. Czy w trybie `with_cost` ujemny `installmentCost` jest błędem, ostrzeżeniem czy rabatem?
22. Jaka jest dokładna reguła rozdziału groszy przy `reduce_future_installments`, zwłaszcza z zablokowanymi ratami?
23. Czy `append_at_end` zachowuje kwotę pominiętej raty, domyślną ratę czy pozostałe saldo?
24. Czy nadpłata skraca raty od razu, czy dopiero po zaksięgowaniu pełnej kwoty powiązanych wpisów?
25. Jak numerować nową ratę po ręcznym przesunięciu lub dwóch ratach w jednym miesiącu?

### Kredyt/pożyczka

26. Czy użytkownik podaje `remainingPrincipal` tylko przy starcie, czy może dodawać kolejne punkty pomiarowe?
27. Czy zmiana raty przy oprocentowaniu zmiennym zachowuje liczbę rat, datę końca czy oba pola pozostawia użytkownikowi?
28. Czy `paidBeforeTrackingAmount` obejmuje opłaty/prowizje, czy tylko raty?
29. Jak prezentować ujemny `estimatedTotalCost` wynikający z niepełnego harmonogramu?
30. Czy leasing w MVP korzysta dokładnie z `loan`, mimo możliwej wartości wykupu końcowego?

### Operacje i produkt

31. Jaka jest polityka edycji occurrences w zamkniętym miesiącu?
32. Jak nowe tabele uczestniczą w pełnym backupie, imporcie i resecie profilu?
33. Czy moduł jest domyślnie włączony dla istniejących i nowych profili po przełączeniu?
34. Czy użytkownik dostaje narzędzie ręcznej klasyfikacji niejednoznacznych danych po backfillu?
35. Które operacje muszą działać offline/lokalnie, a które wymagają atomowego RPC Supabase?

Do czasu rozstrzygnięcia tych punktów Etap 2 może przygotować projekt migracji i raport danych, ale nie powinien wykonywać nieodwracalnego backfillu ani przełączać aplikacji.
