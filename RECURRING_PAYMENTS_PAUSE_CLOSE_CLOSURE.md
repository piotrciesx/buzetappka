# Płatności cykliczne — domknięcie wstrzymania i zakończenia

## Finalny lifecycle

Plan ma jeden z trzech statusów: `active`, `paused` albo `archived`.

- `active` jest na liście bieżącej, generuje i pokazuje przypomnienia, zaległości oraz najbliższe terminy.
- `paused` pozostaje na liście bieżącej, ale zawsze pod aktywnymi. Nie generuje nowych przypomnień, nie jest zaległy i nie trafia do „wymaga reakcji” ani najbliższych płatności.
- `archived` jest widoczny wyłącznie w trybie zakończonych. Nie generuje przypomnień ani przyszłych statystyk.

Legacy status `completed` jest bezpiecznie mapowany na `archived`. Dane, wystąpienia i stare kolumny pozostają zachowane.

## Wstrzymanie a zakończenie

Wstrzymanie jest przerwą odwracalną i plan pozostaje bieżący. Zakończenie usuwa plan z głównej listy, lecz nie usuwa jego harmonogramu, historii ani powiązanych wpisów.

Wznowienie i przywrócenie domyślnie zaczynają oczekujący harmonogram od dzisiejszej daty. Wszystkie nadal oczekujące wystąpienia są układane ponownie według cadence, dzięki czemu przerwa nie tworzy nagle historii zaległości.

## Sortowanie i listy

Aktywne plany zachowują bieżące sortowanie. Wstrzymane są dołączane po wszystkich aktywnych i nie mieszają się z nimi podczas sortowania. Zakończone występują tylko w osobnym trybie listy.

## Blokada nazw

Nazwa jest porównywana po usunięciu skrajnych spacji i bez rozróżniania wielkości liter.

- istniejący plan `active` lub `paused` blokuje utworzenie drugiego; kontrola działa w UI i w triggerze bazy;
- istniejący `archived` wywołuje miękkie ostrzeżenie z decyzjami: przywróć istniejący, utwórz nowy mimo to albo anuluj;
- edycja planu nie koliduje z jego własną nazwą.

## Karta

View model karty udostępnia nazwę, typ, status planu, status bieżącego wystąpienia, kwotę, termin, cadence, kategorię i źródło płatności. Dla rat i kredytów udostępnia także ratę X/Y, liczbę pozostałych rat, kwoty zapłaconą i pozostałą oraz procent postępu.

## Szczegóły

Szczegóły zawierają harmonogram, statusy wystąpień, historię i wszystkie wpisy powiązane z danym wystąpieniem. Wiele wpisów przy stałej płatności jest informacyjne. Przy racie lub kredycie wiele wpisów albo rozbieżność kwoty ustawia jawny stan wymagający decyzji nadpłaty/harmonogramu i korzysta z istniejącego modelu decyzji v1.

## Poza zakresem

- finalny polish kart, listy i szczegółów;
- zaawansowany ręczny edytor harmonogramu;
- bankowy kalkulator odsetek;
- usuwanie legacy oraz historycznych danych;
- automatyczne zgadywanie powiązań transakcji.
