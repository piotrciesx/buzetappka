# BudżAppka — raport zbiorczego importu ikon

## Źródło i wynik

- Źródło wyborów: `Ikony test.xlsx`.
- Import: 120 wyborów z Excela (65 ikon użytkownika, 26 liter, 29 ikon systemowych).
- Decyzja ręczna: `shopping = 1` została zastosowana jako `material-symbols:shopping-cart` z sekcji `shopping-cart-test`.
- Rozmiar bazowy: kafelek 24×24 px, ikona 18×18 px.
- Renderowanie: identyfikatory Iconify jako maska CSS; kolor wyłącznie `currentColor`.
- Finalne registry zawiera 152 klucze: 120 wybranych, 7 zgodności oraz 25 zachowanych aliasów historycznych wariantów.

## Niejednoznaczne wybory

Poniższe pozycje w Excelu miały dopisek „do decyzji”. Zostały zaimportowane zgodnie z podanym numerem biblioteki, ale wymagają potwierdzenia:

- `restaurant` → Material Symbols Filled, `material-symbols:restaurant`.
- `travel` → Font Awesome Solid, `fa6-solid:suitcase-rolling`.
- `holiday` → Font Awesome Solid, `fa6-solid:umbrella-beach`.
- `doctor` → Phosphor Fill, `ph:stethoscope-fill`.

Puste pole dla `shopping` nie jest błędem importu — zastąpiła je jawna decyzja ręczna użytkownika.

## Kontrola wizualna

Wszystkie litery wymagają kontroli wizualnej przy docelowym rozmiarze 18×18 px:

- `letter-a`, `letter-b`, `letter-c`, `letter-d`, `letter-e`, `letter-f`, `letter-g`.
- `letter-h`, `letter-i`, `letter-j`, `letter-k`, `letter-l`, `letter-m`, `letter-n`.
- `letter-o`, `letter-p`, `letter-q`, `letter-r`, `letter-s`, `letter-t`, `letter-u`.
- `letter-v`, `letter-w`, `letter-x`, `letter-y`, `letter-z`.

Dodatkowo do kontroli wizualnej:

- `system-close` → Material Symbols Filled, `material-symbols:close` — sprawdzić czytelność znaku X i brak niepożądanej poziomej kreski przy 18×18 px.
- `restaurant`, `travel`, `holiday`, `doctor` — potwierdzić pozycje oznaczone w źródle jako „do decyzji”.

## Do ponownego wyboru

Na etapie importu nie potwierdzono żadnej ikony z jednoznacznie niepożądaną poziomą kreską. Żaden SVG nie był ręcznie edytowany. Jeśli kontrola wizualna ujawni taki detal, klucz należy ponownie wybrać z preview zamiast modyfikować geometrię ikony.

## Zachowana kompatybilność

- `basket` → `shopping`.
- `bill` → `bills`.
- `plus` → `system-add`.
- `edit` → `system-edit`.
- `trash` → `system-trash`.
- `close` → `system-close`.
- `expand` → `system-expand`.

Zachowano również historyczne warianty `car_2…car_6`, `plane_2…plane_6`, `holiday_2…holiday_6`, `fuel_2…fuel_6` i `travel_2…travel_6`; wskazują na aktualnie wybrane ikony kluczy bazowych.
