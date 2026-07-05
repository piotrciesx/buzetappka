# Cele finansowe — domknięcie statusów

## Finalny model

Jedynym trwałym polem lifecycle jest `financial_goals.status`:

- `active` — aktywny;
- `paused` — wstrzymany;
- `archived_completed` — archiwalny zrealizowany;
- `archived_not_completed` — archiwalny niezrealizowany.

Nie istnieje stan „zrealizowany aktywny”. Migracja mapuje legacy `completed` na `archived_completed`, a `cancelled` na `archived_not_completed`. Istniejące dane i kolumny pozostają zachowane.

## Wstrzymany

Cel pozostaje na liście bieżących i zachowuje dane oraz historię. Od miesiąca zmiany statusu nie uczestniczy w podziale nadwyżki, alokacji ani priorytetach. Wznowienie ustawia `active`; zapisane historyczne priorytety nie są automatycznie przepisywane.

Jeżeli po wykluczeniu celu suma ręcznych procentów wymaga korekty, panel pokazuje istniejący bezpieczny stan sumy. Dane innych celów nie są automatycznie nadpisywane bez działania użytkownika.

## Zrealizowany

Akcja „Oznacz jako zrealizowany” ustawia `archived_completed`, czas zakończenia i archiwizacji. Cel trafia do archiwum i nie uczestniczy dalej w alokacji.

Dotychczasowe domknięcie celu po osiągnięciu kwoty i zamknięciu miesiąca pozostaje kompatybilne jako wyliczony wynik `zrealizowany`.

## Archiwalny niezrealizowany

Akcja „Archiwizuj bez realizacji” ustawia `archived_not_completed`. Cel zachowuje saldo i historię, ale nie bierze udziału w przyszłych alokacjach ani priorytetach.

## Listy i filtry

Lista bieżąca zawiera cele aktywne oraz wstrzymane. Lista archiwalna jest osobna i ma filtry:

- wszystkie archiwalne;
- zrealizowane;
- niezrealizowane.

## Dane karty i szczegółów

Centralne view modele udostępniają nazwę, status, wynik archiwizacji, termin, kwotę docelową, saldo, brakującą kwotę, procent, alokację i historię miesięczną. Akcje lifecycle są dostępne na kartach i mogą zostać użyte przez przyszły widok szczegółów.

Obecny model nie ma jednoznacznej relacji transakcja–cel. `linkedTransactions` w view modelu jest przygotowany jako jawne wejście, ale nie zgaduje powiązań na podstawie opisu ani kategorii.

## Momentum

Dostępne są:

- wpłaty/alokacje bieżącego miesiąca;
- zmiana netto możliwa do wyliczenia z obecnego ledgera;
- łącznie uzbierano;
- łącznie brakuje.

Obecny ledger pomniejsza wcześniejsze partie przy pokrywaniu strat, ale nie zapisuje osobnych zdarzeń wypłaty z datą. Dlatego `withdrawalsThisMonth` ma bezpieczną wartość 0 i flagę `isWithdrawalHistoryComplete: false`; UI nie może przedstawiać jej jako kompletnej historii wypłat.

## Poza zakresem

- finalny wygląd kart i szczegółów;
- osobna księga wpłat/wypłat celu;
- automatyczne przepisywanie procentów pozostałych celów po wstrzymaniu;
- zgadywanie powiązanych transakcji;
- usuwanie legacy pól lub danych.
