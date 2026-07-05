# Płatności cykliczne — funkcjonalne domknięcie v1

## Cel dokumentu

Ten dokument opisuje funkcjonalny zakres v1 modułu „Płatności cykliczne”: model danych, operacje użytkownika, trwałe skutki operacji i granice wersji. Nie jest specyfikacją wyglądu ani listą prac projektowych UI.

Warunkiem działania ścieżki v1 jest zastosowanie migracji:

1. `sql/recurring_payments_stage_2.sql`;
2. `sql/recurring_payments_stage_2_5.sql`.

Migracje są addytywne. Legacy panel, tabele, kolumny, executions, statusy miesięczne i istniejące dane pozostają zachowane.

## Model funkcjonalny v1

### Plan

Obsługiwane są trzy typy planu:

- stała płatność;
- zakup na raty;
- kredyt / pożyczka.

Plan przechowuje kategorię, opcjonalne źródło płatności, opis, tryb kwoty, cykl day/week/month/year, interwał, datę startu i opcjonalną datę końca. Dane rat i kredytu są przechowywane w osobnych tabelach subtype.

### Wystąpienie

Kanonicznym obiektem wykonania jest konkretne wystąpienie planu. Przechowuje termin, planowaną kwotę, status, snooze, blokady oraz rewizję harmonogramu.

Trwałe statusy v1:

- `pending`;
- `completed_with_transaction`;
- `completed_without_transaction`;
- `skipped`.

`overdue` jest stanem wyliczanym. Snooze nie zmienia terminu finansowego ani statusu wykonania.

### Powiązanie z wpisem

Źródłem prawdy jest relacja `recurring_occurrence_transactions`. Pole `transactions.recurring_transaction_id` pozostaje linkiem kompatybilności z legacy. `transactions.recurring_occurrence_id` wskazuje konkretne wystąpienie.

## Kreator planu v1

### Pola wspólne

- nazwa;
- opis;
- typ planu;
- kategoria;
- opcjonalne źródło płatności;
- jednostka i wielokrotność interwału;
- pierwszy termin.

### Stała płatność

- opcjonalna kwota;
- tryb: stała, zmienna, tylko przypomnienie;
- cykl day/week/month/year.

### Zakup na raty

- cena zakupu;
- pierwsza wpłata;
- wyliczana kwota finansowana;
- liczba rat;
- kwota raty;
- data pierwszej raty;
- tryb 0% lub z kosztem;
- podgląd harmonogramu;
- rata wyrównawcza zapisywana w wystąpieniach.

### Kredyt / pożyczka

- kapitał początkowy;
- kwota zapłacona przed BudżAppką;
- liczba rat zapłaconych przed BudżAppką;
- opcjonalny pozostały kapitał;
- liczba rat;
- rata startowa;
- data pierwszej raty;
- informacyjne oprocentowanie;
- tryb oprocentowania: stałe, zmienne, nieznane.

## Akcje realnie działające w v1

Po zastosowaniu obu migracji działają i zapisują trwały skutek:

- utworzenie planu każdego z trzech typów;
- edycja podstawowych danych planu i danych subtype;
- otwarcie karty i szczegółów planu;
- lista kanonicznych wystąpień;
- „Dodaj wpis” — otwiera istniejący kreator z kategorią, opisem, planowaną kwotą, terminem i źródłem planu;
- po zapisaniu wpisu — powiązanie z konkretnym wystąpieniem i status `completed_with_transaction`;
- anulowanie kreatora — usuwa oczekującą intencję powiązania, więc kolejny wpis nie zostanie podpięty przypadkiem;
- „Wykonane bez wpisu” — status `completed_without_transaction`;
- „Pomiń” dla stałej płatności — status `skipped`;
- „Pomiń / zostaw harmonogram” dla rat i kredytu;
- „Pomiń / dodaj ratę na koniec” — tworzy kolejne wystąpienie;
- „Odłóż o dzień” — zapisuje trwały `snoozed_until`;
- powiązanie istniejącego wpisu z wystąpieniem;
- wykrycie różnicy między kwotą planowaną i realną;
- „Tylko to wystąpienie” — zachowuje przyszły harmonogram;
- „Zmień od następnego wystąpienia” — aktualizuje przyszłe oczekujące, niezablokowane wystąpienia;
- „Zmniejsz przyszłe raty” — rozkłada nadpłatę na przyszłe oczekujące, niezablokowane wystąpienia;
- zapis historii zmian statusu i decyzji harmonogramu.

## Dane dostępne w szczegółach v1

- wszystkie wystąpienia i ich statusy;
- planowana kwota;
- realna suma aktywnych powiązanych wpisów;
- lista powiązanych wpisów;
- informacja o `skipped` i `completed_without_transaction`;
- liczba wykonanych, pominiętych i oczekujących;
- suma planowana i realna;
- postęp rat/kredytu;
- najbliższe wystąpienie;
- zaległe wystąpienia;
- historia trwałych zmian i decyzji.

## Poza zakresem v1

Poniższe decyzje istnieją w modelu i są widoczne jako jawne przejście do backlogu, ale nie wykonują automatycznej przebudowy:

- ręczny edytor harmonogramu;
- automatyczne skrócenie harmonogramu po nadpłacie;
- ręczna edycja harmonogramu po różnicy kwoty;
- ręczna edycja harmonogramu po pominięciu raty.

Poza v1 pozostają również:

- pełne wersjonowanie warunków planu od dowolnego wystąpienia;
- zaawansowane odpinanie ostatniego wpisu wraz z wyborem nowego statusu;
- bankowe wyliczenia odsetek, RRSO, WIBOR i prognozy zmiennych stóp;
- automatyczne wyliczanie pozostałego kapitału z części kapitałowej i odsetkowej rat;
- finalny projekt wizualny, polish i mikrointerakcje.

## Ograniczenia techniczne v1

- zapis planu i danych subtype odbywa się sekwencyjnie po stronie klienta; pełne atomowe RPC dla całego kreatora pozostaje osobnym utwardzeniem warstwy zapisu;
- automatyczna przebudowa dotyczy wyłącznie przyszłych wystąpień `pending`, które nie mają blokady kwoty;
- moduł wymaga rzeczywistego zastosowania migracji w Supabase; sam build aplikacji nie weryfikuje produkcyjnego schematu ani danych.

## Zasady, których nie wolno zgubić

- Nie usuwać legacy tabel, kolumn ani danych.
- Nie traktować miesięcznego legacy statusu jako kanonicznego wystąpienia.
- Nie zmieniać obsłużonych ani zablokowanych wystąpień podczas automatycznej przebudowy.
- Pieniądze wyliczać w groszach; ostatnia rata wyrównuje różnicę.
- Nie zapisywać `overdue` jako trwałego statusu.
- Nie traktować snooze jako przesunięcia terminu płatności.
- Nie przedstawiać informacyjnego oprocentowania jako kalkulacji bankowej.
- Decyzje wymagające ręcznego edytora muszą pozostać jawne, a nie być wykonywane pozornie.
