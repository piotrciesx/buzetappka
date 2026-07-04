# BudżAppka — audyt logiki „Płatności cykliczne”

## Zakres i werdykt

Audyt dotyczy wyłącznie logiki danych modułu nazywanego obecnie „Stałe płatności”. Nie obejmuje UI, CSS ani Foundation. Nie utworzono migracji i nie zmieniono kodu aplikacji.

Obecny moduł jest dobrym prototypem przypomnień miesięcznych i prostych planów ratalnych. Ma już centralny lifecycle przypomnienia, powiązanie transakcji z planem, generator harmonogramu rat oraz tabelę ręcznego harmonogramu. Nie jest jednak gotowym modelem „Płatności cyklicznych”: nie rozróżnia stałej płatności, zakupu ratalnego i kredytu, nie ma kanonicznych wystąpień, nie potrafi wiernie zapisać pominięcia ani odłożenia, a powiązanie transakcji wskazuje tylko plan, nie konkretne wystąpienie.

Najbezpieczniejsza droga to ewolucja obecnego `recurring_transactions`, a nie równoległy drugi moduł. Centralnym nowym bytem powinno zostać wystąpienie płatności. Migracja bazy wymaga osobnego zatwierdzenia.

## 1. Obecny stan modułu

### Obsługiwane warianty

Obecny typ `RecurringTransactionKind` ma dwa warianty:

- `open` — otwarte przypomnienie/stała płatność;
- `installment` — prosty plan ratalny.

Plan przechowuje nazwę, kategorię, opcjonalne źródło płatności i kwotę, opis, częstotliwość, datę początku/końca, status i opcjonalną liczbę rat. Status planu to `active`, `paused` albo `completed`.

Częstotliwości są ograniczone do:

- `monthly`;
- `yearly`;
- `custom`, interpretowanego wyłącznie jako co X miesięcy.

Nie ma interwałów dziennych ani tygodniowych. Obliczenia oczekiwanego terminu są miesięczne: występuje najwyżej jeden cykl danego planu w miesiącu, a dzień jest pobierany z `start_date` i ograniczany do długości miesiąca.

### Przypomnienia i lifecycle

Centralnym źródłem prawdy jest `lib/recurringTransactions.ts`, zgodnie z `ARCHITECTURE_FREEZE.md` i `DO_NOT_BREAK_CONTRACTS.md`.

Aktualny lifecycle aplikacyjny:

- `pending`;
- `snoozed`;
- `handled_without_transaction`;
- `handled_with_transaction`.

Stan jest składany z trzech legacy-źródeł: miesięcznego statusu, wykonania i znalezionej transakcji. `snoozed` pochodzi z lokalnego stanu UI. Nie istnieje osobny kanoniczny status „pominięte”, a legacy `skipped` jest mapowane na `handled_without_transaction`. W efekcie system nie potrafi odróżnić „zapłacono bez wpisu” od „nie zapłacono w tym okresie”.

Przypomnienie pojawia się dla bieżącego miesiąca maksymalnie trzy dni przed terminem. Stan zaległy nie jest jawnie modelowany; oczekujące przypomnienie może pozostać widoczne, ale brak osobnej, trwałej klasyfikacji i reguł zaległości.

Odłożenie przesuwa widoczność o siedem dni, najwyżej do końca wybranego miesiąca. Jest zapisane w profilowanym `localStorage`, a nie w Supabase. Nie synchronizuje się między urządzeniami i nie jest częścią historii wystąpienia.

### Raty

Istnieje realna, ale ograniczona logika rat:

- generator rat z kwoty całkowitej, kwoty raty i/lub liczby rat;
- ostatnia rata wyrównawcza;
- ręczna edycja kwot rat;
- wyrównanie ostatniej raty albo proporcjonalne;
- zapis numeru raty, terminu i kwoty w `recurring_installment_schedule`;
- kontrola, że suma harmonogramu zgadza się z kwotą całkowitą.

Brakuje blokowania wybranych rat przed przeliczeniem, trybu 0% vs kosztowego, pierwszej wpłaty jako osobnego pojęcia, obsługi pominięcia/nadpłaty i wersjonowania zmian harmonogramu.

Pole `initial_payment_amount` ma dziś błędną semantykę. Formularz zapisuje do niego `installmentTotalAmount`, a odczyt traktuje je jako całkowitą wartość planu. Nie jest to pierwsza wpłata. Pole formularza `initialPaymentAmount` również nie jest zapisane jako niezależna wartość.

### Statystyki

Aktualne podsumowanie rat liczy liczbę wystąpień obsłużonych z transakcją i bez transakcji. Obie grupy zwiększają `effectiveCompletedCount`. Historyczne `skipped` może więc zwiększyć postęp tak samo jak zapłacona rata.

Kwota planowana jest liczona jako `liczba rat × domyślna kwota`, nawet gdy istnieje ręczny harmonogram o różnych kwotach. W szczegółach suma realna bazuje na wszystkich nieusuniętych transakcjach z `recurring_transaction_id`. Nie istnieje jedna centralna funkcja implementująca wymagany priorytet: kwota wpisu, potem kwota planowana dla wykonanego bez wpisu, w przeciwnym razie zero.

## 2. Obecne tabele i typy

### Tabele Supabase widoczne w repo

#### `recurring_transactions`

Definicja znajduje się w `sql/foundation_stage_15_17.sql`, a późniejsze kolumny w `sql/budget_start_date_excluded_months.sql`.

Najważniejsze kolumny:

- `id`, `profile_id`;
- `name`, `description`;
- `category_id`, `payment_source_id`;
- `amount`, `use_amount_when_creating`;
- `initial_payment_amount`;
- `frequency`, `custom_interval_months`;
- `start_date`, `end_date`;
- `installment_total_count`;
- `kind`, `status`, `created_at`.

Ograniczenia bazy dopuszczają `frequency`: `monthly`, `yearly`, `custom`; `kind`: `open`, `installment`; `status`: `active`, `paused`, `completed`.

#### `recurring_installment_schedule`

Definicja znajduje się w `sql/recurring_installment_schedule.sql`.

Kolumny:

- `id`, `profile_id`, `recurring_transaction_id`;
- `installment_number`;
- `due_date`;
- `amount`;
- `created_at`, `updated_at`.

Numer raty jest unikalny w obrębie planu. Tabela ma RLS per `profile_id`. Nie ma statusu raty, blokady przed przeliczeniem, wersji harmonogramu ani informacji o pochodzeniu kwoty.

#### `recurring_transaction_executions`

Kolumny:

- `id`, `recurring_transaction_id`;
- opcjonalne `transaction_id`;
- `generated_for_date`;
- `status`: `completed` albo `skipped`;
- `marked_at`, `created_at`.

Unikalność `(recurring_transaction_id, generated_for_date)` wymusza jedno wykonanie na datę. Obecny hook odczytuje tę tabelę, lecz `saveRecurringExecution()` nie zapisuje do niej — deleguje zapis do miesięcznych statusów. Tabela pełni rolę legacy/fallback.

#### `recurring_reminder_month_statuses`

Kolumny:

- `id`, `profile_id`, `reminder_id`;
- `month` zawsze ustawiony na pierwszy dzień miesiąca;
- `status`: wyłącznie `read` albo `linked`;
- opcjonalne `transaction_id`;
- timestamps.

Unikalność `(profile_id, reminder_id, month)` oznacza jeden stan planu na miesiąc. Tabela nie obsłuży dwóch należności w jednym miesiącu ani pełnego zestawu wymaganych statusów.

#### `transactions.recurring_transaction_id`

Transakcja może wskazać jeden plan cykliczny. Wiele transakcji może wskazywać ten sam plan, ale relacja nie wskazuje konkretnego wystąpienia/raty. Dopasowanie wystąpienia odbywa się przez miesiąc daty transakcji.

### Typy TypeScript

W `lib/budgetPageTypes.ts` istnieją:

- `RecurringTransactionFrequency`;
- `RecurringTransactionKind`;
- `RecurringTransactionStatus`;
- `RecurringTransaction`;
- `RecurringInstallment`;
- `RecurringTransactionExecution`;
- `RecurringReminderMonthStatus`;
- `Transaction.recurring_transaction_id`.

W `lib/recurringTransactions.ts` istnieją dodatkowo:

- `ReminderMonthLifecycleStatus`;
- `ReminderMonthState`;
- `RecurringStatusSummary`.

Typy są zorientowane na miesiąc i nie modelują trzech docelowych rodzajów, warunków kredytu, wersji harmonogramu, wielu wpisów przypiętych do wystąpienia ani źródła kwoty statystycznej.

## 3. Obecne komponenty i warstwy logiki

### Panel i formularz

- `components/RecurringTransactionsPanel.tsx` — lista aktywnych/archiwalnych planów, otwieranie formularza, zapis i usuwanie;
- `components/recurring-transactions/RecurringTransactionForm.tsx` — edycja przypomnienia i planu ratalnego;
- `components/recurring-transactions/RecurringTransactionCard.tsx` — stan planu, podsumowanie, akcje;
- `components/recurring-transactions/recurringTransactionsPanelTypes.ts` — stan formularza i propsy;
- `components/recurring-transactions/recurringTransactionsPanelUtils.ts` — generator i bilans harmonogramu.

### Przypomnienia

- `components/ReminderBellPanel.tsx` — starszy pełny panel zarządzania i dzwonek;
- `components/reminder-bell/ReminderBellPopup.tsx` — oczekujące przypomnienia i oznaczenie jako obsłużone;
- `components/reminder-bell/ReminderBellDetailsModal.tsx` — szczegóły i historia;
- `components/budget-app/useBudgetAppControllerViewProps.tsx` — wyliczenie alertów oraz snooze w `localStorage`;
- komponenty prawego raila korzystają z `getPendingRecurringTransactions()`.

`components/RecurringExecutionConfirmModal.tsx` deklaruje potwierdzenie wykonania/pominięcia, ale nie ma aktywnego importu ani użycia w kodzie aplikacji. Jest obecnie martwym komponentem.

### Dane i domena

- `lib/useRecurringTransactions.ts` — odczyt i zapis Supabase;
- `lib/recurringTransactions.ts` — centralny lifecycle, terminy, dopasowania, sugestie i podsumowania;
- `lib/useRecurringOptions.ts` — opcje/sugestie planów w kreatorze transakcji;
- `lib/useRecurringTransactionCreator.ts` — otwieranie kreatora z planu i oznaczenie miesiąca po zapisie;
- `components/budget-app/useBudgetAppRecurringOptionsBridge.ts` oraz `useBudgetAppTransactionCreatorBridge.ts` — spięcie z kontrolerem;
- `components/BudgetAppController.tsx` i `components/budget-app/useBudgetPageMainPanelsProps.tsx` — orkiestracja modułu.

### Powiązanie z transakcjami

`lib/useTransactionEntryActions.ts` zapisuje `recurring_transaction_id` w nowej transakcji. Po zapisie `useRecurringTransactionCreator.handleTransactionSaved()` zapisuje miesięczny status `handled_with_transaction` z `transaction_id`.

Domyślne dane transakcji są pobierane z planu: kategoria, opis, opcjonalna kwota i źródło płatności. Nie ma dialogu rozbieżności kwoty ani decyzji „tylko to wystąpienie / od teraz”.

Funkcje dopasowujące potrafią sugerować plan na podstawie kategorii, daty i kwoty, ale wynik nadal łączy transakcję z planem, nie z kanonicznym wystąpieniem.

## 4. Braki względem docelowej logiki

### Wspólne

- brak rozłącznych typów `fixed_payment`, `installment_purchase`, `loan`;
- brak wystąpienia jako trwałego bytu;
- brak interwałów co X dni i co X tygodni;
- brak wielu wystąpień jednego planu w miesiącu;
- brak trwałego snooze i osobnego terminu przypomnienia;
- brak jawnego `skipped` odróżnionego od zapłaty bez wpisu;
- brak historii zmian kwoty „od teraz”;
- brak centralnego kalkulatora kwoty realnej/statystycznej;
- brak relacji transakcja–konkretne wystąpienie;
- brak kontroli konfliktów przy przebudowie harmonogramu z już obsłużonymi wystąpieniami.

### Stała płatność

- `custom` oznacza tylko miesiące;
- kwota pusta jest możliwa, ale model nie rozróżnia kwoty stałej, zmiennej i reminder-only;
- brak reakcji na wpis o innej kwocie;
- brak wersjonowania domyślnej kwoty od wybranej daty.

### Zakup na raty

- brak osobnej kwoty zakupu, pierwszej wpłaty i kwoty finansowanej;
- `initial_payment_amount` jest używane jako suma planu;
- brak trybu 0% / z kosztem;
- brak kosztu/nadwyżki;
- brak blokad pojedynczych rat;
- brak decyzji po pominięciu i nadpłacie;
- brak bezpiecznego skracania/przedłużania przyszłego harmonogramu;
- ręczny harmonogram jest kasowany i wstawiany ponownie, a błąd zapisu jest tylko logowany — plan może zostać zapisany bez harmonogramu.

### Kredyt / pożyczka

- brak osobnego typu i pól kredytowych;
- brak kapitału początkowego/pozostałego;
- brak kwot i liczby rat zapłaconych przed BudżAppką;
- brak rodzaju oprocentowania i opcjonalnej stopy;
- brak zmiany raty od konkretnego wystąpienia;
- brak przybliżonego kosztu kredytu.

## 5. Proponowany docelowy model domenowy

### 5.1. Plan płatności cyklicznej

Logiczna encja `RecurringPaymentPlan` może ewoluować z `recurring_transactions`:

- `id`, `profileId`;
- `type`: `fixed_payment | installment_purchase | loan`;
- `name`, `description`;
- `categoryId`, opcjonalne `paymentSourceId`;
- `status`: `active | paused | completed | archived`;
- `startDate`, opcjonalne `endDate`;
- `cadenceUnit`: `day | week | month | year`;
- `cadenceInterval`: dodatnie X;
- `defaultPlannedAmount`: opcjonalna kwota;
- `amountMode`: `fixed | variable | reminder_only`;
- timestamps.

Zmiany wartości obowiązujące „od teraz” nie powinny nadpisywać historii. Należy przechowywać wersje warunków planu (`effective_from`) albo materializować przyszłe wystąpienia i aktualizować tylko nieobsłużone rekordy od wskazanego terminu.

### 5.2. Dane zakupu ratalnego

Encja 1:1 `InstallmentPurchaseTerms`:

- `purchaseAmount`;
- `downPaymentAmount`;
- `financedAmount`;
- `pricingMode`: `zero_percent | with_cost`;
- opcjonalne `declaredInstallmentCount` i `defaultInstallmentAmount`;
- `scheduleMode`: `calculated | manual`.

Inwarianty:

- `downPaymentAmount >= 0` i `downPaymentAmount <= purchaseAmount`;
- `financedAmount = purchaseAmount - downPaymentAmount` dla 0%;
- w trybie 0% suma planowanych rat równa się `financedAmount` z tolerancją 0,01 zł;
- w trybie kosztowym suma rat może być większa, a różnica jest kosztem rat.

### 5.3. Dane kredytu/pożyczki

Encja 1:1 `LoanTerms`:

- `principalAmount`;
- `paidBeforeTrackingAmount`;
- `installmentsPaidBeforeTrackingCount`;
- opcjonalne `remainingPrincipalAtStart`;
- `initialInstallmentAmount`;
- opcjonalne `interestRate`;
- `interestMode`: `fixed | variable | unknown`;
- opcjonalne pola opisowe instytucji/numeru umowy dopiero w późniejszym zakresie.

Nie należy wyliczać bankowego RRSO ani symulować WIBOR. Harmonogram jest deklarowanym planem użytkownika, a nie bankowym źródłem prawdy.

### 5.4. Wystąpienie

Kanoniczna encja `RecurringPaymentOccurrence`:

- `id`, `profileId`, `planId`;
- `sequenceNumber` opcjonalny dla planów bez numeracji;
- `dueDate`;
- `plannedAmount` nullable;
- `status`;
- `completedAt`, `skippedAt` nullable;
- `snoozedUntil` nullable;
- `isAmountLocked`, `isDateLocked`;
- `scheduleRevision` albo odwołanie do wersji harmonogramu;
- `createdAt`, `updatedAt`.

Wystąpienia powinny być generowane deterministycznie w ograniczonym horyzoncie i mieć unikalność plan + logiczny numer/data cyklu. Nie należy generować nieskończonej historii z góry. Obsłużone wystąpienia są niezmienne finansowo; przebudowa dotyczy wyłącznie przyszłych, nieobsłużonych i nieblokowanych rekordów.

## 6. Proponowane statusy

### Status planu

- `active` — generuje/udostępnia wystąpienia;
- `paused` — nie generuje nowych w okresie pauzy;
- `completed` — plan zakończony;
- `archived` — ukryty historyczny plan bez utraty danych.

### Status wystąpienia zapisywany w bazie

- `pending` — oczekuje;
- `completed_with_transaction` — wykonane i ma co najmniej jedno powiązanie z wpisem;
- `completed_without_transaction` — wykonane bez wpisu;
- `skipped` — świadomie nie wykonano w tym cyklu.

`overdue` powinno być stanem wyliczanym: `pending` i `dueDate < today`. Dzięki temu nie trzeba wykonywać nocnej migracji statusów. `snoozed` najlepiej modelować jako widok przypomnienia (`snoozedUntil > now`) nad finansowym statusem `pending`; odłożenie nie zmienia terminu ani harmonogramu.

To rozszerza obecny lifecycle. Nie wolno dodawać nowych statusów lokalnie w komponentach — zmiana musi przejść przez centralny kontrakt w `lib/recurringTransactions.ts` i dokumenty architektoniczne.

## 7. Proponowane akcje użytkownika

### Dla wystąpienia

1. `add_transaction` — utwórz wpis, powiąż go z wystąpieniem i oznacz wykonanie.
2. `complete_without_transaction` — zapisz wykonanie z kwotą planowaną lub bez kwoty.
3. `skip` — zapisz, że płatność się nie odbyła.
4. `snooze` — ustaw wyłącznie `snoozedUntil`.
5. `reopen` — kontrolowane cofnięcie statusu, jeśli nie narusza powiązanych wpisów.

### Rozbieżność kwoty

Po powiązaniu wpisu o kwocie różnej od planowanej:

- `this_occurrence_only` — nie zmieniaj przyszłości;
- `change_from_next_occurrence` — zaktualizuj przyszłe nieobsłużone wystąpienia;
- `edit_schedule_manually` — przejdź do jawnej edycji przyszłego harmonogramu.

### Pominięcie raty

- `append_at_end` — dodaj nowe przyszłe wystąpienie i przelicz koniec;
- `keep_schedule` — rata pozostaje pominięta bez kompensacji;
- `manual_schedule` — użytkownik ustala przyszłość ręcznie.

### Nadpłata

- `this_occurrence_only`;
- `shorten_schedule`;
- `reduce_future_installments`;
- `manual_schedule`.

Każda operacja przebudowy musi zachować obsłużone i zablokowane wystąpienia oraz wykonać się transakcyjnie.

## 8. Proponowany model harmonogramu

Harmonogram powinien być listą przyszłych wystąpień, nie wyłącznie wzorem miesięcznym.

### Stała płatność

Generator używa `startDate + cadenceUnit + cadenceInterval`. Dla miesięcy i lat należy jawnie zachować regułę dnia końca miesiąca. Plan bez kwoty nadal generuje wystąpienia z `plannedAmount = null`.

### Zakup ratalny

Generator obsługuje trzy wejścia:

- kwota finansowana + liczba rat → wylicza ratę;
- kwota finansowana + rata → wylicza liczbę rat i ratę końcową;
- liczba rat + rata → wylicza sumę rat.

Przy wyliczeniach pieniężnych należy używać groszy jako integerów albo biblioteki decimal, nie arytmetyki zmiennoprzecinkowej. Ostatnia rata wyrównuje różnicę. Raty z `isAmountLocked` nie uczestniczą w automatycznym rozdziale pozostałej kwoty.

### Kredyt/pożyczka

Pierwszy harmonogram może powstać z liczby rat i raty startowej. Zmiana raty od daty tworzy nową rewizję lub aktualizuje tylko przyszłe wystąpienia. Oprocentowanie jest metadanym informacyjnym; planowane kwoty po zmianie pochodzą z wartości podanej przez użytkownika.

### Integralność zapisu

Zapis planu i harmonogramu musi być atomowy. Obecny schemat „zapisz plan, usuń harmonogram, spróbuj wstawić nowy, tylko zaloguj błąd” grozi częściowym zapisem. Docelowo potrzebna jest funkcja/RPC lub transakcja po stronie bazy.

## 9. Proponowany model powiązania z transakcjami

Potrzebna jest tabela łącząca, logicznie `recurring_occurrence_transactions`:

- `id`, `profileId`;
- `occurrenceId`;
- `transactionId`;
- opcjonalne `allocatedAmount` na przyszłość;
- `createdAt`;
- unikalność pary occurrence–transaction.

Relacja pozwala:

- przypiąć wiele wpisów do jednego wystąpienia;
- przypiąć dwie płatności w jednym miesiącu do różnych rat;
- jednoznacznie policzyć realną kwotę wystąpienia;
- zachować historię mimo przesunięcia terminu.

Obecne `transactions.recurring_transaction_id` może pozostać przejściowo jako denormalizowany/legacy link do planu. Nowy kod powinien traktować link do wystąpienia jako źródło prawdy. Podczas migracji istniejące transakcje można dopasować do wystąpień po planie i miesiącu tylko tam, gdzie wynik jest jednoznaczny; niejednoznaczne rekordy wymagają flagi do ręcznej weryfikacji.

Status `completed_with_transaction` powinien wynikać z istnienia aktywnego linku albo być aktualizowany atomowo razem z linkiem. Usunięcie/odpięcie ostatniej transakcji wymaga jawnej decyzji, czy wystąpienie wraca do `pending`, czy zostaje `completed_without_transaction`.

## 10. Zasady liczenia statystyk

### Kwota efektywna wystąpienia

1. Jeśli istnieją powiązane, nieusunięte wpisy — suma ich kwot ma pierwszeństwo.
2. Jeśli nie ma wpisów, a status to `completed_without_transaction` i istnieje `plannedAmount` — licz `plannedAmount`.
3. Jeśli nie ma wpisów ani kwoty planowanej — licz 0 i oznacz kwotę jako nieznaną, nie jako realne zero płatności.
4. Dla `pending`, `skipped` i zaległego `pending` — nie doliczaj kwoty zapłaconej.

### Stała płatność

- `paidActual` = suma efektywnych kwot wykonanych wystąpień;
- opcjonalne `plannedUpcoming` = suma przyszłych znanych kwot;
- reminder-only bez kwoty nie wpływa na sumy.

### Zakup ratalny

- `purchaseAmount` — cena zakupu;
- `downPaymentAmount` — pierwsza wpłata;
- `financedAmount` — kwota rozłożona na raty;
- `paidInstallmentsActual` — suma efektywnych kwot wykonanych rat;
- `remainingPlanned` — suma planowanych kwot niewykonanych rat;
- `installmentCost` = suma wszystkich planowanych rat + pierwsza wpłata − cena zakupu;
- dla 0% `installmentCost` musi wynosić 0 z tolerancją 0,01 zł.

Pierwszą wpłatę należy liczyć jako zapłaconą tylko wtedy, gdy model jawnie określa, że została już poniesiona; najlepiej pozwolić powiązać ją z osobnym wpisem albo przechowywać jej status/datę.

### Kredyt/pożyczka

- `paidBeforeTrackingAmount` pokazywane osobno;
- `paidInAppActual` = suma efektywnych kwot wykonanych po rozpoczęciu śledzenia;
- `paidTotal` = obie wartości;
- `plannedRemaining` = suma planowanych niewykonanych wystąpień;
- `estimatedTotalCost` = `paidTotal + plannedRemaining - principalAmount`;
- opcjonalny pozostały kapitał jest informacją pomocniczą, a nie wynikiem odejmowania całych rat od kapitału.

Wynik kosztu należy oznaczać jako szacunkowy, szczególnie przy zmiennym/nieznanym oprocentowaniu.

## 11. Ryzyka

- Rozszerzenie statusów narusza zamrożony reminder lifecycle, jeśli zostanie wykonane lokalnie zamiast centralnie.
- Legacy `read`/`skipped` nie pozwalają pewnie odtworzyć intencji „zapłacono bez wpisu” kontra „pominięto”. Migracja musi przyjąć udokumentowane założenie albo zachować `legacy_unknown_handled` do ręcznej klasyfikacji.
- Miesięczna unikalność statusów nie obsługuje częstotliwości dziennej/tygodniowej i wielu rat w miesiącu.
- `initial_payment_amount` zawiera obecnie najpewniej sumę planu, więc nie wolno automatycznie uznać go za pierwszą wpłatę.
- Brak pełnego źródła schematu produkcyjnej bazy w repo. Pliki SQL pokazują zamierzoną strukturę, ale przed migracją trzeba zweryfikować rzeczywisty schemat Supabase, constrainty, RLS i dane.
- Obecny zapis harmonogramu nie jest atomowy i ignoruje błąd operacji podrzędnej.
- Automatyczne dopasowanie starych transakcji po miesiącu jest niejednoznaczne przy wielu wpisach i wielu terminach.
- Przeliczenie harmonogramu może zmienić historię, jeśli nie odseparuje obsłużonych i zablokowanych wystąpień.
- Kwoty `number` w TypeScript mogą generować różnice groszowe.
- Snooze w `localStorage` może zniknąć lub różnić się między urządzeniami.
- `RecurringExecutionConfirmModal` i `recurring_transaction_executions` sugerują niedokończone równoległe ścieżki; nie należy budować na nich bez ujednolicenia.

## 12. Proponowane etapy implementacji

Każdy etap powinien mieć osobny zakres i testy. Etapy bazodanowe wymagają osobnego potwierdzenia.

### Etap 0 — decyzje i inwentaryzacja produkcji

- zweryfikować rzeczywisty schemat i wolumen danych w Supabase;
- ustalić interpretację legacy `read` i `skipped`;
- zdecydować, czy zachowujemy nazwę fizyczną `recurring_transactions`;
- zdefiniować inwarianty i scenariusze testowe w czystych funkcjach domenowych.

### Etap 1 — model domenowy bez przełączania UI

- wprowadzić trzy typy planu i cadence day/week/month/year;
- wydzielić kalkulator pieniędzy w groszach;
- zdefiniować `OccurrenceStatus` i centralny selektor stanu;
- zachować adapter od obecnych typów legacy.

### Etap 2 — migracja danych i kanoniczne wystąpienia

- rozszerzyć plan oraz dodać dane subtype;
- dodać tabelę wystąpień i trwałe `snoozed_until`;
- wygenerować/backfillować jednoznaczne wystąpienia historyczne;
- zachować mapowanie legacy bez usuwania starych kolumn/tabel.

### Etap 3 — relacja z transakcjami i statystyki

- dodać join occurrence–transaction;
- przepiąć zapis nowej transakcji na konkretne wystąpienie;
- zaimplementować centralną kwotę efektywną i statystyki;
- obsłużyć odpięcie/usunięcie transakcji.

### Etap 4 — stałe płatności

- wdrożyć wszystkie jednostki interwału;
- obsłużyć brak kwoty i kwotę zmienną;
- dodać decyzję przy rozbieżności kwoty oraz wersję „od teraz”.

### Etap 5 — zakup na raty

- poprawić semantykę ceny, pierwszej wpłaty i finansowanej kwoty;
- wdrożyć 0%/koszt, blokady rat i atomowy zapis;
- dodać polityki pominięcia, nadpłaty i dwóch płatności w miesiącu.

### Etap 6 — kredyt/pożyczka

- dodać dane startowe i oprocentowanie informacyjne;
- umożliwić zmianę raty od wystąpienia;
- wdrożyć szacunkowy koszt oraz rozdział „przed BudżAppką / w BudżAppce”.

### Etap 7 — przełączenie i cleanup legacy

- przełączyć panel, dzwonek i kreator transakcji na kanoniczne wystąpienia;
- zaktualizować `ARCHITECTURE_FREEZE.md` i `DO_NOT_BREAK_CONTRACTS.md`;
- dopiero po okresie kompatybilności usunąć martwy modal, stare executons/month statuses i legacy adaptery;
- osobno wykonać późniejszą pracę UI, poza zakresem logiki.

## 13. Pliki do przekazania ChatGPT do dalszej pracy

Minimalny pakiet dla kolejnego etapu logiki:

1. `RECURRING_PAYMENTS_LOGIC_AUDIT.md`
2. `ARCHITECTURE_FREEZE.md`
3. `DO_NOT_BREAK_CONTRACTS.md`
4. `lib/budgetPageTypes.ts`
5. `lib/recurringTransactions.ts`
6. `lib/useRecurringTransactions.ts`
7. `lib/useRecurringTransactionCreator.ts`
8. `lib/useRecurringOptions.ts`
9. `lib/useTransactionEntryActions.ts`
10. `components/RecurringTransactionsPanel.tsx`
11. `components/recurring-transactions/recurringTransactionsPanelTypes.ts`
12. `components/recurring-transactions/recurringTransactionsPanelUtils.ts`
13. `components/recurring-transactions/RecurringTransactionForm.tsx`
14. `components/recurring-transactions/RecurringTransactionCard.tsx`
15. `components/ReminderBellPanel.tsx`
16. `components/reminder-bell/reminderBellTypes.ts`
17. `components/reminder-bell/reminderBellUtils.ts`
18. `components/reminder-bell/ReminderBellPopup.tsx`
19. `components/reminder-bell/ReminderBellDetailsModal.tsx`
20. `components/budget-app/useBudgetAppControllerViewProps.tsx`
21. `components/budget-app/useBudgetPageMainPanelsProps.tsx`
22. `components/BudgetAppController.tsx`
23. `sql/foundation_stage_15_17.sql`
24. `sql/budget_start_date_excluded_months.sql`
25. `sql/recurring_installment_schedule.sql`

Przed przygotowaniem migracji trzeba dodatkowo dostarczyć eksport aktualnego schematu produkcyjnego Supabase (bez danych użytkowników i sekretów), zwłaszcza definicje tabel, indeksów, constraintów, triggerów oraz polityk RLS dotyczących `transactions` i `recurring_*`.
