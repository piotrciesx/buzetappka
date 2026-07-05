# Audyt plików rodziny „moduły zarządzania”

Stan audytu: bieżący working tree. Dokument nie proponuje zmian domeny; mapuje miejsca, które trzeba znać przed projektowaniem wspólnej rodziny kart, toolbarów i szczegółów.

## Wspólny entry point i shell

Wszystkie cztery moduły są otwierane jako utility panels przez `components/BudgetPageStatusPanels.tsx`, a renderowane przez `components/BudgetPageMainPanels.tsx` we wspólnym overlayu `data-budget-utility-overlay` / `data-budget-utility-panel`. `BudgetPageMainPanels` dostarcza wspólny `HeroHeader`, ikonę, opis, zamknięcie oraz — obecnie tylko dla części modułów — akcję dodawania i kontekst szczegółów.

Props powstają głównie w `components/budget-app/useBudgetPageMainPanelsProps.tsx`, a ich źródłem jest `components/BudgetAppController.tsx`. Widoczność modułów pochodzi z `components/budget-app/useBudgetAppShellState.ts`. To naturalna granica dla przyszłego `ManagementModuleShell`; nie należy duplikować drugiego pełnego shella wewnątrz paneli.

## 1. Źródła płatności

### Pliki i odpowiedzialności

- panel, lista, karty, szczegóły, filtry i creator: `components/PaymentSourcesPanel.tsx`;
- hook CRUD i ustawienia: `lib/usePaymentSources.ts`;
- typy bazowe `PaymentSource`, `PaymentMethodType` i transakcje: `lib/budgetPageTypes.ts`;
- opcje typów, ikon/kolorów, statystyki, sortowanie i `PaymentSourceViewModel`: `lib/paymentSources.ts`;
- integracja hooka z kontrolerem: `components/budget-app/useBudgetAppPaymentSourcesBridge.ts`;
- props panelu: `components/budget-app/useBudgetPageMainPanelsProps.tsx`;
- kontrolowany stan szczegółów i kontekstowy nagłówek: `components/BudgetPageMainPanels.tsx`;
- zależne użycia źródeł: `components/PaymentSplitEditor.tsx`, `components/TransactionCreatorModal.tsx` i komponenty drzewa kategorii.

### Karta rekordu

Karta jest renderowana przez lokalną funkcję w `PaymentSourcesPanel.tsx`, nie przez osobny plik. Dostaje źródło, statystyki i sumy; ma nazwę, ikonę/kolor, typ metody, dostępność przychód/wydatek, stan archiwizacji, liczby i sumy transakcji, udziały oraz ostatnie użycie. Widok korzysta z `buildPaymentSourceViewModel` i dodatkowych lokalnych obliczeń.

Karta jest klikalna. Klik ustawia `selectedSourceDetailsId` przez `onSelectedSourceDetailsIdChange`. Stan jest kontrolowany w `BudgetPageMainPanels.tsx` (`paymentSourceDetailsId`), z lokalnym fallbackiem w `PaymentSourcesPanel.tsx`. To jedyny moduł, w którym rodzic zna wybrany rekord i zmienia `HeroHeader` na wariant kontekstowy.

Brakujący element strukturalny to osobny `PaymentSourceCard`; dane docelowe są zasadniczo dostępne. Obecne zagnieżdżenie render function utrudnia użycie tej samej karty poza panelem i testowanie kontraktu karty.

### Szczegóły

Szczegóły istnieją jako widok zastępujący listę wewnątrz tego samego utility panelu (`data-ui-payment-sources-mode="details"`), nie jako osobny modal/drawer. Renderuje je lokalna `renderSourceDetails` w `PaymentSourcesPanel.tsx`. Dostępne są pełne dane, metryki, procenty, ostatnie użycie, transakcje oraz akcje: edycja, archiwizacja/usunięcie, przywrócenie i ustawienie domyślnego źródła.

Nie ma osobnego `PaymentSourceDetailsViewModel`; szczegóły łączą `PaymentSourceViewModel`, stats i transakcje bezpośrednio w panelu. Przed zmianą prezentacji trzeba zachować rozdzielenie kwot przychodów/wydatków oraz semantykę archiwizacji.

### Kreator i edycja

Dodawanie i edycja używają tego samego formularza inline w `PaymentSourcesPanel.tsx`, opakowanego przez Foundation `CreatorModal`. Używane są m.in. `HeroHeader`, `CreatorModal`, `CreatorSummaryCard`, `FormField`, `PrimaryAction`, `SecondaryAction`, `DangerAction`, pickery Foundation i klasy `ui-input`, `ui-select`, `ui-checkbox__*`.

Creator należy do osobnej rodziny „kreatory”. Nie należy budować go z przyszłego `ManagementRecordCard`; wspólne mogą być shell modala, footer, pola, summary preview oraz walidacyjne bannery.

### Filtry, sortowanie i tryby

Lokalny state panelu: `activeList`, `methodFilter`, `availabilityFilter`, `sortMode`. Tryb Aktywne/Archiwalne używa `data-ui-list-switch`; filtry i sortowanie są lokalnymi selectami. Logika sortowania (`sortPaymentSources`) jest nadal w komponencie, mimo że typ i lista opcji leżą w `lib/paymentSources.ts`.

To dobry pierwszy wzorzec dla `ManagementModeSwitch`, `ManagementFilterRow` i `ManagementSortControl`, ale nie należy globalizować nazw filtrów ani sposobu liczenia stats.

### Sekcja pomocnicza

Nad listą istnieje sekcja domyślnych źródeł, zwijana lokalnym `isDefaultSourcesCollapsed`. Jest lekka i odpowiada docelowemu auxiliary content. Powinna później użyć rodzinnego `CollapsibleAuxiliarySection`; obecny Foundation ma już zbliżony `CollapsibleSecondarySection`.

### CSS / Foundation

Panel intensywnie używa data-atrybutów Foundation: `data-ui-payment-sources-shell`, `data-ui-record-*`, `data-ui-metric-*`, `data-ui-status-*`, `data-ui-list-switch`, creator/form primitives. Reguły specyficzne są w `app/styles/foundation.css`, zwłaszcza sekcje dla `data-ui-payment-sources-shell`. Są też style inline: wysokość okna listy, CSS custom property postępu i shell max-height.

Ryzyko: `PaymentSourcesPanel.tsx` skupia domenę, sortowanie, render listy, szczegóły i creator w jednym dużym pliku. Wizualne wydzielenie musi zachować kontrolowany `selectedSourceDetailsId`, statystyki z transakcji, obsługę duplikatów i ustawienia domyślne.

## 2. Cele finansowe

### Pliki i odpowiedzialności

- wrapper integracyjny: `components/FinancialGoalsContainer.tsx`;
- główny orkiestrator UI i obliczeń miesiąca: `components/FinancialGoalsPanel.tsx`;
- lista i przełączniki: `components/financial-goals/FinancialGoalsList.tsx`;
- osobna karta: `components/financial-goals/FinancialGoalCard.tsx`;
- summary: `components/financial-goals/FinancialGoalsSummary.tsx`;
- tryb Priorytet/Alokacja: `components/financial-goals/FinancialGoalsModeControls.tsx`;
- creator/edit modal: `components/financial-goals/FinancialGoalEditModal.tsx`;
- wspólny formularz add/edit: `components/financial-goals/FinancialGoalForm.tsx`;
- props i form types: `components/financial-goals/financialGoalsPanelTypes.ts`;
- lokalne funkcje panelu: `components/financial-goals/financialGoalsPanelUtils.ts`;
- hook CRUD, statusy, priorytety i konfiguracje miesiąca: `lib/useFinancialGoals.ts`;
- domena, plan, mappery oraz card/details/momentum view models: `lib/financialGoals.ts`;
- integracja: `BudgetAppController.tsx`, `useBudgetPageMainPanelsProps.tsx`, `BudgetPageMainPanels.tsx`.

### Karta rekordu

Karta jest osobnym komponentem z wariantami `SortableGoalCard` i `StaticGoalCard` w `FinancialGoalCard.tsx`. Dane trafiają przez `GoalCardBaseProps`: cel, zebrana/brakująca kwota, procent, status, deadline, blokada miesiąca, alokacja/priorytet oraz akcje.

Pokazuje ikonę/kolor, nazwę, status, okres, cztery metryki, lifecycle actions i pasek postępu. Ma komplet docelowych danych karty. `lib/financialGoals.ts` posiada też `FinancialGoalCardViewModel`, ale aktualna karta jest zasilana bezpośrednio propsami z planu, nie tym view modelem.

Karta ma atrybut `data-ui-record-interactive`, lecz nie ma obsługi kliknięcia otwierającego szczegóły. Klikalne są akcje i drag handle. Nie istnieje `selectedGoalId` dla szczegółów. To najważniejsza luka względem docelowej rodziny kart.

### Szczegóły

Nie ma obecnie widoku szczegółów celu po kliknięciu — ani modalnego, ani inline. `FinancialGoalDetailsViewModel` i `buildFinancialGoalDetailsViewModel` istnieją w `lib/financialGoals.ts`, ale nie są podłączone do panelu. Model udostępnia saldo, progress/history i jawne `linkedTransactions`; relacja transakcja–cel nie jest kompletna, więc UI nie może sugerować pełnej historii wpłat/wypłat.

Akcje lifecycle są już na karcie: Wstrzymaj, Wznów, Oznacz jako zrealizowany, Archiwizuj bez realizacji. Docelowe szczegóły powinny użyć tych samych handlerów, nie duplikować mutation logic.

### Kreator i edycja

Add i edit używają `FinancialGoalEditModal` + wspólnego `FinancialGoalForm`. Otwieranie create następuje również przez event `budget-open-financial-goal-create` wysyłany z `BudgetPageMainPanels.tsx`. Foundation: `CreatorModal`, `HeroHeader`, `IconAction`, `CreatorSummaryCard`, `FormField`, `MoneyField`, `MonthField`, `PrimaryAction`, `SecondaryAction`, `FoundationIconPicker`, `FoundationColorPicker`.

To rozwinięta rodzina creatorów i powinna pozostać oddzielona od record card/details. Ryzykiem jest event globalny oraz utrzymywanie dwóch instancji `FinancialGoalEditModal` w panelu (create i edit).

### Filtry, sortowanie i tryby

`FinancialGoalsList.tsx` obsługuje Bieżące/Archiwalne oraz filtr wyniku archiwizacji. `FinancialGoalsModeControls.tsx` obsługuje Priorytet/Alokacja. Sortowanie bieżących celów jest domenowe: DnD w trybie priorytetu i wartość procentowa w trybie alokacji. Nie powinno być zastąpione generycznym sortem bez zachowania zapisu miesięcznych priorytetów.

Wspólne wizualnie mogą być switch, toolbar i filter row; lokalne muszą zostać DnD, allocation menu i reguły locków miesiąca.

### Sekcja pomocnicza

Nad listą istnieją `FinancialGoalsSummary` (saldo, nadwyżka, stan miesiąca) oraz prosty inline `data-financial-goals-momentum` z wpłatami, wypłatami, netto, zebrano i brakuje. Momentum jest lekkie, ale obecnie wypłaty mogą być niepełne zgodnie z flagą domenową. Docelowy `CollapsibleAuxiliarySection` powinien odróżnić summary operacyjne od Momentum i nie ukrywać ograniczenia danych.

### CSS / Foundation

To moduł najmocniej oparty o rekordowe wzorce Foundation: `data-ui-large-record`, `data-ui-record-card`, identity/meta/status, metric cards, action group i progress. Specyficzne reguły celów w `app/styles/foundation.css` obejmują summary, list switch i allocation control/menu. Karta ma style inline tylko dla transformacji DnD i CSS variables paska postępu.

Ryzyko: panel intensywnie miesza lokalny optimistic state, obliczenia planu, zapis priorytetów i render. Przenoszenie list/card shell jest bezpieczne dopiero po zachowaniu event propagation DnD, locków miesięcy oraz rozróżnienia active/paused/archive.

## 3. Płatności cykliczne

### Pliki i odpowiedzialności

- nadrzędny panel z legacy i Etapem 2: `components/RecurringTransactionsPanel.tsx`;
- funkcjonalny panel planów v1/Etap 2.5: `components/recurring-transactions/RecurringPaymentsStage2Panel.tsx`;
- formularz planu: `components/recurring-transactions/RecurringPaymentPlanForm.tsx`;
- legacy karta/form: `RecurringTransactionCard.tsx`, `RecurringTransactionForm.tsx`;
- legacy props/utils/styles: `recurringTransactionsPanelTypes.ts`, `recurringTransactionsPanelUtils.ts`, `recurringTransactionsPanelStyles.ts`;
- nowe dane/hook: `lib/recurring-payments/useRecurringPaymentsData.ts`;
- nowe typy DB/draft: `lib/recurring-payments/data.ts`, `types.ts`;
- nowe view modele: `lib/recurring-payments/viewModels.ts`;
- domena: `cadence.ts`, `occurrences.ts`, `installments.ts`, `loans.ts`, `money.ts`, `actionPolicies.ts`, `occurrenceLinkIntent.ts`, `legacyAdapter.ts`;
- legacy hook/domena: `lib/useRecurringTransactions.ts`, `lib/recurringTransactions.ts`;
- integracja z transaction creator: `RecurringTransactionsPanel.tsx`, `TransactionCreatorModal.tsx`, `occurrenceLinkIntent.ts`;
- wejście główne: `BudgetPageMainPanels.tsx`, props w `useBudgetPageMainPanelsProps.tsx`.

### Karta rekordu

Istnieją dwie rodziny kart równolegle:

1. Legacy `RecurringTransactionCard.tsx` — osobny komponent, klikalny `article`; klik obsługiwany przez nadrzędny `RecurringTransactionsPanel` i prowadzi do legacy edycji/formularza. Karta używa licznych inline style objects z `recurringTransactionsPanelStyles.ts`.
2. Nowa karta planu — inline `button` w `RecurringPaymentsStage2Panel.tsx`. Jest klikalna, ustawia lokalny `selectedId`, a następnie zastępuje listę szczegółami.

Nowy `RecurringPaymentCardViewModel` dostarcza nazwę, typ, lifecycle, kwotę, cadence, termin, kategorię/źródło, bieżący status, pending/overdue oraz postęp rat/kredytu. Karta inline nie wyświetla jeszcze wszystkich dostępnych pól (np. kategorii/źródła i pełnych kwot postępu), ale kontrakt danych już je ma.

Największe ryzyko: nie stylizować legacy karty jako docelowej karty planu bez decyzji migracyjnej. Obie listy są dziś renderowane w jednym panelu i mogą reprezentować te same rekordy poprzez adapter/backfill.

### Szczegóły

Nowe szczegóły istnieją w `RecurringPaymentsStage2Panel.tsx` jako inline panel zastępujący listę. Używają `buildRecurringPaymentDetailsViewModel`. Pokazują metryki, harmonogram, wszystkie occurrence, wiele powiązanych transakcji, statusy, wykonanie bez wpisu, pominięcie, snooze, zaległości i historię.

Dostępne akcje: Edytuj, Wstrzymaj, Wznów, Zakończ, Przywróć, Dodaj wpis, Wykonane bez wpisu, Pomiń, Odłóż, Powiąż wpis oraz decyzje kwoty/nadpłaty/harmonogramu. Część zaawansowanych decyzji kończy się kontrolowanym komunikatem backlogu.

Legacy nie ma równoważnego read-only details view; klik legacy karty jest bliższy przejściu do edycji.

### Kreator i edycja

Nowe add/edit używają tego samego `RecurringPaymentPlanForm`, renderowanego jako pełny stan panelu, bez `CreatorModal`. Formularz obsługuje trzy typy i korzysta głównie ze zwykłych label/input/select oraz `PrimaryAction`/`SecondaryAction`. Legacy używa `RecurringTransactionForm` i primitives z lokalnego stylowanego systemu przypomnień.

Nowy formularz należy do rodziny creatorów, lecz przed wizualizacją trzeba oddzielić go od lifecycle/list state. Logiki rat, kredytów, kalkulacji i harmonogramu nie wolno przenosić do generycznej karty ani Foundation.

### Filtry, sortowanie i tryby

Nowy panel ma lokalny switch Bieżące/Zakończone; active są przed paused, paused zawsze na końcu. Nie ma jeszcze pełnego toolbaru filtrów i sortowania. Legacy ma własne podziały Aktywne/Archiwum i statusy miesiąca. Wspólny rodzinny switch jest możliwy dopiero po wskazaniu nowej listy jako kanonicznej.

### Sekcja pomocnicza

Legacy panel ma intro/status ostrzegawczy i podsumowania przypomnień. Nowy Stage 2 nie ma osobnej sekcji „Wymaga reakcji”; dane do niej wynikają z aktywnych occurrences pending/overdue/snoozed. Powinna być lekka i budowana z nowego view modelu, nie z legacy read statuses.

### CSS / Foundation

Nadrzędny panel używa `CalendarSurface`, `ReminderActionRow`, `ReminderStatusBadge` oraz wielu inline style objects z `recurringTransactionsPanelStyles.ts`; plik zawiera też literalny responsive CSS string. Nowy panel używa `data-recurring-stage2`, ogólnego `data-ui-card` i tylko `PrimaryAction`/`SecondaryAction`, więc jego struktura nie ma jeszcze docelowego record-card Foundation.

Ryzyko: to największy dług wizualny z powodu dwóch systemów danych/UI, długich inline JSX w Stage 2 oraz lokalnego systemu styles w legacy. Foundation extraction musi zacząć się od kanonicznego kontraktu planu/occurrence, nie od kopiowania legacy DOM.

## 4. Limity budżetowe

### Pliki i odpowiedzialności

- panel, karta inline, details inline, creator, filtry i sortowanie: `components/BudgetLimitsV1Panel.tsx`;
- hook danych i kalkulowane okresy: `lib/budget-limits/useBudgetLimitsData.ts`;
- typy DB/draft: `lib/budget-limits/data.ts`;
- typy domenowe: `lib/budget-limits/types.ts`;
- view modele: `lib/budget-limits/viewModels.ts`;
- kalkulacje: `calculations.ts`;
- zakresy kategorii: `scopes.ts`;
- okresy: `periods.ts`;
- wersjonowanie/historia: `history.ts`;
- alerty: `alerts.ts`;
- adapter legacy: `legacyAdapter.ts`;
- bridge do drzewa: `treeBridge.ts`;
- starsze elementy w drzewie/alertach: `components/BudgetLimitIndicator.tsx`, `BudgetLimitEditorModal.tsx`, `BudgetLimitAlertsPanel.tsx`, `lib/useBudgetLimits.ts`;
- integracja: `BudgetPageMainPanels.tsx`, `useBudgetPageMainPanelsProps.tsx`, `components/budget-app/useBudgetLimitViews.ts`.

### Karta rekordu

Karta jest inline `button` w `BudgetLimitsV1Panel.tsx`. Jest klikalna; klik ustawia lokalny `selectedId`. Panel przechowuje także `listMode`, filtry i sort. `BudgetLimitCardViewModel` dostarcza scope/category id, nazwę, ikonę, slot koloru, poziom, aktywność, limit/wydatki/remaining/exceeded, procent, status, prognozę, ryzyko i critical alert.

Karta pokazuje wybrany miesiąc i większość danych docelowych. Kolor pozostaje jawnie niedostępny (`colorKey: null`) w obecnym bazowym modelu kategorii. Nie należy wymyślać koloru w komponencie.

### Szczegóły

Szczegóły istnieją jako inline panel zastępujący listę, w tym samym `BudgetLimitsV1Panel.tsx`. Korzystają z `buildBudgetLimitDetailsViewModel`; pokazują bieżące metryki, alerty, transakcje, historię miesięczną, historię zmian oraz rozbicie podkategorii. View model zawiera również trend i `inactiveMonths`, choć minimalny panel nie wizualizuje jeszcze pełnego trendu.

Akcje: Edytuj od miesiąca, Wyłącz limit, Włącz limit, przeczytaj/wycisz alert. Kluczowe jest zachowanie związku `plan → version → period snapshot`; wizualna edycja nie może traktować pojedynczej karty jako jednego mutowalnego rekordu kwoty.

### Kreator i edycja

Ten sam formularz inline w `BudgetLimitsV1Panel.tsx` obsługuje add/edit. Nie ma osobnego komponentu ani modalnego shella. Używa zwykłych input/select oraz `PrimaryAction`/`SecondaryAction`. Creator jest kandydatem do osobnego pliku i rodziny creatorów, ale wersjonowanie od `effective_month` musi zostać lokalne.

### Filtry, sortowanie i tryby

Panel ma lokalne Aktywne/Nieaktywne, filtr poziomu, filtr statusu i select sortowania. `filterAndSortBudgetLimitCards` oraz typy opcji znajdują się w `viewModels.ts`; przygotowany jest także filtr `categoryId`, którego minimalny panel jeszcze nie renderuje jako drzewka.

Kontrolki wizualnie pasują do rodzinnego toolbaru. Lokalna pozostaje semantyka poziomów i filtrowania wyłącznie zakresów, które mają plan.

### Sekcja pomocnicza

Inline tekst „Wymaga uwagi” korzysta z `buildBudgetLimitsAttentionViewModel`: przekroczone, warning, prognozowane, suma przekroczeń i średnie wykorzystanie aktywnych. Jest lekki i gotowy do `CollapsibleAuxiliarySection`; nie powinien przejąć pełnej listy alertów ze szczegółów.

### CSS / Foundation

Nowy panel nie ma dedykowanego pliku CSS. Używa `data-budget-limits-view`, ogólnego `data-ui-card`, natywnego `progress`, zwykłych form controls i action primitives. Starsze wskaźniki limitów mają reguły w `app/styles/app-shell-foundation.css` (`data-level1-limit`, `data-budget-limit-*`) i reset w `app/styles/dev-reset.css`; nie są tym samym co docelowa karta zarządzania.

Ryzyko: cały panel jest skompresowany w jednym pliku i miesza wybór wersji, listę, details i creator. Przed wizualizacją warto wyznaczyć osobne granice renderowania, ale nie zmieniać sposobu wyboru wersji dla miesiąca ani snapshotów historycznych.

## Kandydaci do Foundation / wspólnej rodziny modułów zarządzania

### A. Na pewno globalne / rodzinne

- `ManagementModuleShell` — wariant istniejącego utility panel shell, bez modułowej domeny;
- `ManagementModuleToolbar`;
- `ManagementModeSwitch` — może bazować na `data-ui-list-switch`;
- `ManagementFilterRow`;
- `ManagementSortControl`;
- `ManagementRecordList`;
- `ManagementRecordCard` — shell/semantyka kliknięcia, nie zestaw metryk;
- `RecordCardHeader`;
- `RecordCardMeta`;
- `RecordCardMetrics`;
- `RecordCardProgressBar`;
- `RecordStatusBadge`;
- `RecordLevelBadge`;
- `RecordActionMenu`;
- `CollapsibleAuxiliarySection` — funkcjonalnie blisko istniejącego `CollapsibleSecondarySection`;
- `ManagementDetailsShell`;
- `DetailsHistoryList`;
- `DetailsTransactionList`;
- `DetailsMetricGrid`.

Wspólne komponenty powinny przyjmować gotowe label/value/tone/action slots. Nie powinny importować typów `PaymentSource`, `FinancialGoal`, recurring occurrence ani budget limit version.

### B. Raczej lokalne

- metryki i dostępność źródeł płatności;
- metryki celu, alokacja, priorytet, DnD i lock miesiąca;
- harmonogram i statusy wystąpień płatności cyklicznych;
- logika rat, kredytów, nadpłat i decyzji harmonogramu;
- wersjonowana historia limitów;
- rozbicie limitów na podkategorie i zakresy L1/L2/L3;
- walidacja nazw i lifecycle każdego modułu;
- wszystkie hooki mutation/data.

### C. Do decyzji po wizualizacjach

- modal, drawer, inline panel czy pełny ekran szczegółów na mobile;
- dokładna forma i domyślne zwinięcie sekcji pomocniczej;
- liczba metryk na karcie desktop;
- układ kart mobile i pozycja action menu;
- czy modułowy `HeroHeader` pozostaje poza details shell, jak dziś w Źródłach;
- czy progress jest zawsze pełną belką, czy kompaktowym wskaźnikiem zależnie od modułu.

## Ryzyka przekrojowe

1. **Niespójny ownership selected state.** Źródła trzymają go w `BudgetPageMainPanels`, recurring i limity lokalnie, a cele nie mają go wcale. Wspólny details shell wymaga najpierw jawnej decyzji, czy selection kontroluje shell czy panel.
2. **View model nie zawsze zasila UI.** Cele mają card/details VM, lecz karta korzysta z osobnych propsów, a details nie są podłączone. Źródła mają VM, ale details doklejają dane lokalnie. Nie można zakładać, że sam istniejący typ jest faktycznym kontraktem renderu.
3. **Legacy i v1 współistnieją.** Szczególnie płatności cykliczne i limity mają stare oraz nowe ścieżki. Usuwanie „duplikatów UI” bez mapy danych grozi utratą funkcji albo podwójnym mutation flow.
4. **Miesięczność jest domeną, nie dekoracją.** Cele i limity zależą od wybranego/zamkniętego miesiąca, priorytetów, wersji i snapshotów. Karta nie może mutować „aktualnej wartości” bez podania miesiąca.
5. **Foundation już zawiera część wzorców.** Hero, actions, creator, summary, record identity/metrics/progress i list switch istnieją. Nowa rodzina powinna je kompozycyjnie uporządkować, a nie tworzyć równoległe tokeny/data-atrybuty.

### Ryzyka per moduł

- **Źródła:** stats i domyślne źródła są wyliczane z wielu wejść; duży panel łączy CRUD, duplicate handling, details i creator. Najłatwiej zgubić procenty, splity transakcji albo kontrolowany powrót ze szczegółów.
- **Cele:** najłatwiej naruszyć monthly allocation/priority, DnD i locki. Atrybut „interactive” nie oznacza działającego click-to-details. Historia wypłat nie jest kompletna.
- **Płatności cykliczne:** największe ryzyko to pomieszanie legacy reminder z kanonicznym plan/occurrence. Nie wolno stylować lub usuwać jednej ścieżki przed potwierdzeniem ownership danych i linkowania transakcji.
- **Limity:** kwota jest wersją efektywną w miesiącu, nie zwykłym polem karty. Nie wolno uprościć details do jednego current row ani generować kart dla kategorii bez planu/history.

## Tabela końcowa

| Moduł | Główny plik panelu | Plik/hook danych | View model | Karta rekordu | Szczegóły | Kreator/edycja | CSS/Foundation | Uwagi |
|---|---|---|---|---|---|---|---|---|
| Źródła płatności | `PaymentSourcesPanel.tsx` | `usePaymentSources.ts`, `paymentSources.ts` | `PaymentSourceViewModel` w `paymentSources.ts` | inline render function, klikalna | inline replacement, kontrolowany selected w `BudgetPageMainPanels` | wspólny add/edit `CreatorModal` inline w panelu | mocne użycie Foundation; specyficzne reguły w `foundation.css`; kilka inline styles | najbardziej kompletna nawigacja list → details, ale największy pojedynczy panel |
| Cele finansowe | `FinancialGoalsPanel.tsx` przez `FinancialGoalsContainer.tsx` | `useFinancialGoals.ts`, `financialGoals.ts` | card/details/momentum w `financialGoals.ts` | osobny `FinancialGoalCard.tsx`; nie otwiera details | brak podłączonego widoku; VM istnieje | `FinancialGoalEditModal.tsx` + wspólny `FinancialGoalForm.tsx` | dojrzałe record/metric/progress Foundation + goal-specific CSS | zachować DnD, alokację, priorytety i month locks |
| Płatności cykliczne | `RecurringTransactionsPanel.tsx` + `RecurringPaymentsStage2Panel.tsx` | `useRecurringTransactions.ts` oraz `useRecurringPaymentsData.ts` | `recurring-payments/viewModels.ts` | legacy osobna; nowa inline i klikalna | nowy inline replacement z occurrence/history/actions | nowy wspólny `RecurringPaymentPlanForm`; osobny legacy form | legacy style objects + calendar primitives; Stage 2 minimalne `data-ui-card` | dwa systemy UI/danych; najpierw ustalić kanoniczną ścieżkę |
| Limity budżetowe | `BudgetLimitsV1Panel.tsx` | `budget-limits/useBudgetLimitsData.ts` | `budget-limits/viewModels.ts` | inline button, klikalna | inline replacement, pełny details VM | wspólny formularz add/edit inline w panelu | minimalne Foundation actions; brak dedykowanego CSS; legacy indicator CSS osobno | nie rozdzielać karty od version/period snapshot semantics |
