# Limity budżetowe — aktywność i historia miesięczna

## Tożsamość limitu

Rekord widoczny dla użytkownika reprezentuje zakres wydatków albo kategorię L1/L2/L3, która ma lub kiedykolwiek miała limit. Kategorie bez historii limitu nie są tworzone jako karty.

## Aktywny i nieaktywny

Limit ma dwa stany: `active` oraz `inactive`. Nie używa `paused`, `closed` ani osobnego archiwum, ponieważ limit nie jest trwającą usługą — jest miesięczną regułą obowiązującą albo nieobowiązującą dla tego samego zakresu.

Nieaktywny limit zachowuje plan, wersje, okresy, transakcje i alerty historyczne. Nie uczestniczy w bieżących alertach ani sekcji „Wymaga uwagi”.

## Historia miesięczna i zmiany

Każda zmiana od wskazanego miesiąca tworzy lub aktualizuje wersję efektywną od pierwszego dnia tego miesiąca. Poprzednia wersja kończy się dzień wcześniej. Snapshoty wcześniejszych miesięcy nie są aktualizowane.

Okres miesięczny zapisuje kwotę i stan aktywności obowiązujące w danym miesiącu. Szczegóły mogą więc odtworzyć kwotę, wydatki, wynik, procent, alerty oraz miesiące nieaktywne.

## Wyłączenie i ponowne włączenie

„Wyłącz limit” tworzy od wskazanego miesiąca nieaktywną wersję tej samej tożsamości. Nie usuwa historii. „Włącz limit” kontynuuje ten sam plan i tworzy aktywną wersję od wskazanego miesiąca, opcjonalnie z nową kwotą.

## Karta i lista

Karta pokazuje wybrany miesiąc: zakres, poziom, ikonę, stan aktywności, limit, wydatki, pozostałą lub przekroczoną kwotę, wykorzystanie, status, prognozę i alert krytyczny. Lista rozdziela aktywne i nieaktywne oraz udostępnia filtry poziomu/statusu i pełny model sortowania.

## Szczegóły

Szczegóły zawierają historię miesiąc po miesiącu, transakcje wybranego okresu, trend, historię wersji kwoty, miesiące nieaktywne oraz rozbicie L1/L2 na bezpośrednie podkategorie składające się na wykorzystanie.

## Poza zakresem

- finalny wygląd kart, wykresów i filtrów;
- drag and drop ręcznej kolejności;
- usuwanie legacy;
- przebudowa Foundation i globalnych stylów;
- tworzenie kart dla kategorii, które nigdy nie miały limitu.
