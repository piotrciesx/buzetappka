# BudżAppka — kontrakt UI rodziny modułów zarządzania

Status: kontrakt bazowy po zaakceptowanych wizualizacjach desktop. Dokument opisuje wspólny szkielet UI, który ma wynikać z charakteru czterech modułów, a nie narzucać im sztucznego wzoru.

Moduły rodziny:

- Źródła płatności
- Cele finansowe
- Płatności cykliczne
- Limity budżetowe

## 1. Główna zasada desktop

Każdy moduł zarządzania ma dwa stany.

### Widok domyślny

Widok domyślny pokazuje pełną listę rekordów:

- nagłówek modułu,
- opis,
- przycisk dodawania,
- przycisk zamknięcia całego modala,
- pasek pomocniczy / pasek podsumowania / sekcję zwijaną,
- toolbar filtrów i sortowania,
- pełne karty rekordów.

### Widok po kliknięciu rekordu

Kliknięcie rekordu nie przenosi użytkownika do całkowicie nowego ekranu. Modal przechodzi w układ dzielony:

- lewa strona: skrócona lista mini-kart rekordów,
- prawa strona: szczegóły wybranego rekordu,
- kliknięcie innej mini-karty zmienia szczegóły po prawej,
- panel szczegółów ma własny przycisk zamknięcia/wrócenia do pełnej listy,
- zamknięcie szczegółów nie zamyka całego modala.

## 2. Elementy globalne

Globalne są kształty, rytm, spacing, typografia i zachowania bazowe:

- shell modala,
- nagłówek modułu,
- przyciski dodawania/zamykania,
- pasek pomocniczy,
- toolbar,
- przełączniki trybów,
- selecty i filtry,
- karty rekordów,
- mini-karty rekordów,
- panel szczegółów,
- sekcje szczegółów,
- status badge,
- level badge,
- progress bary,
- separator,
- pionowa kolumna akcji Edytuj/Usuń,
- empty/loading/error/notice states.

Globalne elementy nie importują typów domenowych i nie znają logiki modułów.

## 3. Elementy lokalne

Lokalne są dane, znaczenie metryk, akcje domenowe i szczegółowe sekcje.

### Źródła płatności

Lokalne zostają:

- typ źródła / metoda płatności,
- dostępność przychody/wydatki,
- liczba transakcji i procent udziału,
- sumy przychodów/wydatków,
- lista transakcji źródła,
- oznaczenie split payment.

### Cele finansowe

Lokalne zostają:

- tryb alokacja/priorytet,
- lifecycle celu,
- cel/uzbierano/brakuje,
- momentum celu,
- historia celu,
- interpretacja danych, aby nie sugerować ręcznych wpłat, jeśli moduł działa alokacyjnie.

### Płatności cykliczne

Lokalne zostają:

- typ planu,
- status planu,
- status wystąpienia,
- harmonogram,
- raty/kredyty/nadpłaty,
- powiązane wpisy,
- decyzje harmonogramu.

### Limity budżetowe

Lokalne zostają:

- miesięczne snapshoty,
- wersje limitu,
- historia miesiąc po miesiącu,
- rozbicie na podkategorie,
- ryzyko/prognoza.

## 4. Toolbar

Toolbar ma zawsze rezerwować dwa pionowe miejsca:

- label slot,
- control slot.

Jeśli dana grupa nie ma labelki, label slot nadal istnieje jako puste miejsce. Dzięki temu wszystkie przełączniki, selecty i filtry stoją na jednej wysokości.

## 5. Paski pomocnicze

Paski pomocnicze i zwijane sekcje mają:

- tę samą szerokość co lista kart,
- brak wcięcia względem rekordów,
- delikatny tint,
- lekką ramkę,
- separatory wewnętrzne zamiast kilku ciężkich kafli.

Zawartość paska jest lokalna.

## 6. Karty rekordów

Karta rekordu ma wspólny szkielet:

- ikona / kafel,
- nazwa,
- meta/podpis,
- badge statusu,
- metryki,
- opcjonalny progress,
- prawa pionowa kolumna akcji,
- hover,
- selected state.

Przyciski Edytuj i Usuń są globalne wizualnie i ustawione po prawej stronie jeden pod drugim.

## 7. Mini-karty

Mini-karty w trybie szczegółów są kompaktowym wariantem kart:

- mniej metryk,
- niższa wysokość,
- wyraźny selected state,
- kliknięcie zmienia panel szczegółów.

## 8. Panel szczegółów

Panel szczegółów ma wspólny shell:

- prawa kolumna,
- header rekordu,
- X / zamknij szczegóły,
- sekcje szczegółów,
- metric grid,
- listy historii / transakcji / harmonogramu,
- action bar.

Układ wewnątrz sekcji jest lokalny.

## 9. Statusy i kolory

Tokeny semantyczne:

- success/completed: zielony,
- danger/failed/cancelled/not completed: czerwony,
- warning/paused: żółty/bursztynowy,
- active-in-progress/neutral active: niebieski,
- inactive: szary albo czerwony zależnie od znaczenia.

Jeśli „aktywny” oznacza „w trakcie / jeszcze nierozstrzygnięte”, używamy niebieskiego. Jeśli oznacza „włączone i działa”, a przeciwieństwem jest nieaktywne, można użyć zielonego.

## 10. Progress bary

Progress bary są globalne strukturalnie, ale lokalne znaczeniowo.

Dla celów finansowych pasek realizacji powinien pozwalać na płynny kolor w spektrum czerwony → zielony zależnie od procentu realizacji, nie tylko progi.

## 11. Zakazy

Nie wolno:

- tworzyć drugiego równoległego shella dla modułów,
- przenosić logiki domenowej do Foundation,
- mieszać legacy i v1 bez decyzji o kanonicznej ścieżce,
- traktować miesięcznych snapshotów limitów jak zwykłego pola karty,
- sugerować „wpłat” na cele, jeśli dane pochodzą z alokacji lub historii celu,
- ustawiać toolbarów krzywo przez brak labelki nad jedną grupą,
- przenosić lokalnych metryk do globalnych primitive.
