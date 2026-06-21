# BudżAppka — raport zbiorczego importu ikon

## Źródło i wynik

- Źródło wyborów: `Ikony test.xlsx`.
- Import: 120 wyborów z Excela (65 ikon użytkownika, 26 liter, 29 ikon systemowych).
- Decyzja ręczna: `shopping = 1` została zastosowana jako `material-symbols:shopping-cart` z sekcji `shopping-cart-test`.
- Rozmiar bazowy: kafelek 24×24 px, ikona 18×18 px.
- Renderowanie: identyfikatory Iconify jako maska CSS dla ikon graficznych; kolor wyłącznie `currentColor`.
- Finalne registry zawiera 158 kluczy: 97 wyborów użytkownika, 29 systemowych, 7 zgodności oraz 25 zachowanych aliasów historycznych wariantów.
- Litery nie korzystają z Iconify. Wszystkie 32 znaki są renderowane tekstowo przez `LetterIcon` z `font-weight: 700`.

## Niejednoznaczne wybory

Poniższe pozycje w Excelu miały dopisek „do decyzji”. Zostały zaimportowane zgodnie z podanym numerem biblioteki, ale wymagają potwierdzenia:

- `restaurant` → Material Symbols Filled, `material-symbols:restaurant`.
- `travel` → Font Awesome Solid, `fa6-solid:suitcase-rolling`.
- `holiday` → Font Awesome Solid, `fa6-solid:umbrella-beach`.
- `doctor` → Phosphor Fill, `ph:stethoscope-fill`.

Puste pole dla `shopping` nie jest błędem importu — zastąpiła je jawna decyzja ręczna użytkownika.

## Finalne zamrożenie liter

- Znaki: `A B C Ć D E F G H I J K L Ł M N Ń O P Q R S Ś T U V W X Y Z Ź Ż`.
- Nie dodano `Ą` ani `Ę`.
- Każdy klucz `letter-*` wskazuje na zwykły znak tekstowy, nie identyfikator biblioteki ikon.
- Waga została zamrożona na 700.
- Kolor jest dziedziczony przez `currentColor`.

## Kontrola wizualna

Do kontroli wizualnej pozostają:

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
