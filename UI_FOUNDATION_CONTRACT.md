# BudżAppka — UI Foundation Contract

## 1. Cel kontraktu

Ten dokument jest źródłem prawdy dla pracy nad UI BudżAppki.

Każda zmiana wizualna, audyt UI, refactor Foundation, praca nad modalem, kreatorem, utility, dropdownem, pickerem albo ekranem musi najpierw sprawdzić ten kontrakt.

Kontrakt nie jest pixel-perfect specyfikacją każdego elementu.
Kontrakt definiuje:
- rodziny UI,
- granice globalne/rodzinne/lokalne,
- zasady wspólnych primitive,
- zakazy,
- sposób rozszerzania systemu.

## 2. Warstwy decyzji UI

BudżAppka ma trzy warstwy UI:

### Globalne primitive

Elementy wspólne dla całej aplikacji:
- ikony,
- chevrony,
- inputy,
- textarea,
- buttony,
- tabs/pills,
- badges/status pills,
- checkboxy,
- switch/radio,
- dropdown surface,
- picker surface,
- modal surface,
- record surface,
- utility row,
- focus state,
- disabled state,
- empty/info/error/loading states.

Globalne primitive definiują:
- kształt,
- rytm,
- zachowanie,
- role ikon,
- focus/disabled,
- podstawowe warianty.

Lokalne ekrany nie mogą tworzyć własnych wersji globalnych primitive.

### Rodziny UI

Rodziny definiują układ większych ekranów lub modułów.

Aktualne rodziny:
1. Modale modułowe / panele zarządzania.
2. Kreatory.
3. Utility.
4. Dropdowny / pickery / popovery.
5. Samotne duże ekrany.
6. Globalne kontrolki.

Rodzina definiuje szkielet i zasady układu.
Lokalny ekran wypełnia ten szkielet treścią.

### Lokalne dopasowania

Lokalny ekran odpowiada za:
- treść,
- dane,
- kolejność sekcji,
- liczbę metryk,
- liczbę rekordów,
- domenowe preview,
- konkretne akcje biznesowe,
- teksty przycisków,
- warunki walidacji.

Lokalny ekran nie może:
- redefiniować inputów,
- redefiniować pickerów,
- redefiniować chevronów,
- redefiniować buttonów,
- redefiniować modala,
- redefiniować footera,
- dublować globalnych primitive.

## 3. Rodzina: Modale modułowe / panele zarządzania

Do tej rodziny należą:
- Cele finansowe,
- Budżety i limity,
- Stałe płatności,
- Źródła płatności.

Wspólne zasady:
- duże moduły zarządzania obiektami,
- nagłówek modułu,
- opis,
- główna akcja „Dodaj XYZ”,
- opcjonalne sekcje górne / przypięte / informacyjne,
- tabs lub filtry, jeżeli potrzebne,
- lista rekordów,
- klikalne karty rekordów,
- metryki w kartach,
- pionowe separatory między metrykami,
- akcje po prawej,
- spójne radiusy, bordery, tła i hover.

Lokalnie może się różnić:
- liczba rekordów,
- liczba metryk,
- liczba separatorów,
- teksty,
- statusy,
- akcje,
- kolejność informacji,
- obecność sekcji górnych.

Nie wolno:
- robić dla każdego modułu osobnego stylu karty,
- lokalnie zmieniać primitive kart,
- lokalnie zmieniać stylu przycisku „Dodaj”,
- mieszać tej rodziny z Utility.

## 4. Rodzina: Utility

Do tej rodziny należą:
- Kosz,
- Import / Eksport danych,
- Notatki / lista notatek.

Wspólne zasady:
- lżejsze panele narzędziowe,
- brak dużych kart rekordów,
- brak ciężkich paneli w panelu,
- elementy jako lekkie wiersze,
- krótkie informacje,
- separatory delikatne i nie na całą szerokość,
- mniej metryk,
- bardziej informacyjne niż reprezentacyjne.

Utility nie powinno używać dużych klikalnych kart z modali modułowych.

## 5. Rodzina: Kreatory

Kreatory są osobną rodziną od modali modułowych.

Do tej rodziny należą:
- Nowe / Edytuj źródło,
- Nowy / Edytuj cel,
- Nowy wpis,
- Nowa kategoria,
- Nowa stała płatność,
- Nowy budżet / limit.

Wspólne zasady:
- modal formularzowy,
- header,
- sekcje,
- opcjonalna oś kroków,
- inputy,
- pickery,
- checkbox cards / wybory,
- opcjonalne summary / preview,
- footer: Anuluj + główna akcja.

Kreator tworzy lub edytuje jeden obiekt.
Panel/moduł zarządzania pokazuje listę obiektów.
Tych rodzin nie należy mieszać.

## 6. Rodzina: Dropdowny / pickery / popovery

Do tej rodziny należą:
- TopbarDropdown,
- ActionDropdown,
- PickerDropdown,
- Command/SearchDropdown,
- FoundationColorPicker,
- FoundationIconPicker,
- MonthPicker,
- CategoryPicker,
- SourcePicker.

Wspólne zasady:
- trigger,
- jeden globalny chevron,
- menu / popover surface,
- hover,
- selected state,
- focus,
- scroll,
- z-index,
- zamykanie po kliknięciu poza.

Nie wolno:
- rysować chevronów lokalnie różnymi hackami,
- stylować pickera przez konkretny ekran,
- robić lokalnej kopii color pickera,
- robić lokalnej kopii icon pickera.

## 7. Rodzina: Samotne duże ekrany

Do tej rodziny należą:
- Kalendarz,
- Wyszukiwarka,
- Dashboard.

To są osobne, duże układy.
Nie należy wciskać ich w schemat modali modułowych ani Utility.

Mają korzystać z globalnych primitive:
- inputów,
- buttonów,
- dropdownów,
- rekordów,
- badge’y,
- empty states,
- tooltipów.

Projekt tych ekranów następuje po zamknięciu rodzin: modale modułowe, kreatory, utility i dropdowny.

## 8. Globalny system ikon

Ikony mają role, nie losowe rozmiary.

Role ikon:
- IconHero — duża ikona w headerze / hero / module card,
- IconCard — ikona w karcie rekordu,
- IconButton — ikona w przycisku,
- IconInline — mała ikona przy tekście,
- IconPicker — ikona w pickerze,
- IconNav — ikona w nawigacji,
- IconChevron — chevron dropdownów i sekcji zwijanych,
- IconStatus — plus/minus/info/warning/success.

Nie wolno:
- używać przypadkowych rozmiarów ikon w różnych miejscach,
- ręcznie ustawiać 21px, 22px, 25px bez roli,
- tworzyć lokalnych ikon przycisków, jeśli istnieje globalny IconAction,
- rysować wielu typów chevronów.

Każda ikona powinna używać roli.
Rola definiuje rozmiar, tile, kolor i spacing.

## 9. Globalny system inputów

Inputy mają warianty, ale wspólny język wizualny.

Warianty:
- InputCompact,
- InputStandard,
- InputHero,
- InputSearch,
- InputMoney,
- InputDate / Month,
- Textarea.

Wspólne:
- radius,
- border,
- focus,
- placeholder,
- disabled,
- error,
- affix / icon,
- clear action.

Nie wolno:
- dawać jednocześnie ramki wrapperowi i inputowi,
- lokalnie zmieniać focus ringa,
- lokalnie tworzyć własnych inputów bez potrzeby.

## 10. Globalny system przycisków

Typy:
- AddAction,
- PrimaryAction,
- SecondaryAction,
- DangerAction,
- IconAction,
- GhostAction,
- TabPill,
- FilterPill.

Wspólne:
- wysokość według wariantu,
- radius,
- font,
- hover,
- disabled,
- focus,
- loading.

Nie wolno:
- lokalnie tworzyć własnego CTA,
- lokalnie dodawać gradientów,
- lokalnie zmieniać stylu przycisku zapisu,
- lokalnie zmieniać przycisku „Dodaj XYZ”.

## 11. Globalny system powierzchni

Typy:
- ModalSurface,
- ModuleSurface,
- RecordCardSurface,
- UtilityRowSurface,
- DropdownSurface,
- PickerSurface,
- InfoSurface.

Zasada:
- duże moduły zarządzania używają RecordCardSurface,
- utility używa UtilityRowSurface,
- dropdowny używają DropdownSurface / PickerSurface,
- kreatory używają ModalSurface + Creator sections.

Nie mieszać tych powierzchni bez świadomego wariantu.

## 12. Zasady zmian w kodzie

Każda zmiana UI musi odpowiedzieć na pytania:
1. Czy dotyczy globalnego primitive, rodziny UI, czy lokalnego ekranu?
2. Jakiej rodziny UI dotyczy?
3. Jaki stary kod usuwa?
4. Jaki nowy kontrakt zostaje?
5. Czy łamie istniejący kontrakt?

Zakaz:
- dopisywania quick fixów na końcu CSS,
- tworzenia final/polish/target override layer,
- zostawiania starych wersji „na wszelki wypadek”,
- dodawania lokalnych łatek na primitive,
- używania :first-child / nth-child do znaczących wariantów UI,
- używania !important bez komentarza i uzasadnienia legacy resetu.

## 13. Zasady audytu Codexa

Przed każdą zmianą UI Codex ma:
1. Przeczytać ten kontrakt.
2. Wypisać, których rodzin UI zmiana dotyczy.
3. Wypisać, które globalne primitive są dotknięte.
4. Wypisać, których zasad nie wolno złamać.
5. Dopiero potem zaproponować zmianę albo wykonać podmianę.

Wynik audytu przed zmianą ma zawierać:
- Rodzina UI:
- Globalne primitive:
- Lokalny ekran:
- Zasady kontraktu do zachowania:
- Ryzyka złamania kontraktu:
- Pliki do zmiany:
- Pliki, których nie ruszać:

## 14. Rozszerzanie kontraktu

Kontrakt można rozszerzać, ale nie przypadkowo.

Nowy wariant można dodać tylko wtedy, gdy:
- istnieją co najmniej dwa miejsca użycia albo bardzo jasny przyszły wzorzec,
- nie da się go zrealizować istniejącym wariantem,
- nie jest lokalną łatką,
- zostaje opisany w tym dokumencie.

Każde rozszerzenie ma wskazać:
- nazwę wariantu,
- rodzinę UI,
- kiedy używać,
- czego nie robić.

## 15. Kolejność pracy nad UI

Praca idzie rodzinami:
1. Globalne primitive.
2. Modale modułowe / panele zarządzania.
3. Kreatory.
4. Utility.
5. Dropdowny / pickery / popovery.
6. Samotne duże ekrany.
7. Lokalne dopracowanie ekranów.

Globalne poprawki robimy rodzinami.
Lokalne uszczegółowienia robimy później plik po pliku.

## 16. Najważniejsza zasada

Globalne = kształt, rytm, role, zachowanie.
Rodzinne = układ typu ekranu.
Lokalne = treść, dane, liczba elementów, szczegóły domenowe.

Kod po zmianie ma być prostszy, bardziej przewidywalny i bardziej zgodny z kontraktem niż przed zmianą.
