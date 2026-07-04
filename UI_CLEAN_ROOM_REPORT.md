# UI Clean Room — raport

## 1. Krótki werdykt

Głównym źródłem bałaganu był `app/styles/foundation.css`: 10 607 linii, kolejne generacje Creator/Foundation oraz końcowe bloki `final`, `polish`, `freeze` i `stabilization` nadpisujące wcześniejsze kontrakty. Występowały też równoległe nazwy tego samego kontraktu (`data-ui-emphasis` i `data-ui-field-emphasis`, `data-ui-creator-summary-card` i `data-ui-creator-preview-card`) oraz trzy lokalne implementacje color pickera.

Nie potwierdzono martwego pliku UI, który można byłoby usunąć bez naruszenia tras podglądowych lub aktualnych importów. Potwierdzono natomiast martwe propsy, helpery i selektory.

## 2. Usunięte pliki

| Ścieżka | Powód | Zastąpienie |
|---|---|---|
| — | Nie znaleziono pliku UI jednoznacznie martwego | — |

Dodano `components/ui/FoundationColorPicker.tsx` jako jedyny primitive color pickera.

## 3. Usunięte bloki CSS

| Zakres | Dotyczył | Powód | Pozostawiony kontrakt |
|---|---|---|---|
| `UI Foundation V2` → `Foundation Color role guards` | Creator, modal, form, picker, goals, payment sources | 34 kolejne warstwy wersjonowanych nadpisań | bazowe primitive + aktualny system kolorów + `FOUNDATION CREATOR — canonical flat creator contract` |
| 45 reguł / 76 selektorów | nieemitowane `data-ui-*` | brak aktualnego markupu | wyłącznie selektory emitowane przez repo |
| alternatywne selektory emphasis/summary | FormField i CreatorSummaryCard | podwójne nazwy tego samego kontraktu | `data-ui-field-emphasis`, `data-ui-creator-preview-card` |
| selektory `:first-child` / `:nth-child` dla kroków | wygląd sekcji Creator | logika wizualna zależna od kolejności | jawny `data-ui-creator-section-variant="hero"` i `data-ui-tone` |

`foundation.css` zmniejszył się z 10 607 do około 4 800 linii.

## 4. Zostawione core UI

- tokeny i semantyczne warstwy z-index,
- overlay, modal surface i utility surfaces,
- action/button primitive,
- input, amount i month primitive,
- checkbox primitive,
- jeden kontrakt icon pickera i jeden color picker,
- help/tooltip,
- jeden kanoniczny Creator contract,
- jeden Creator preview/summary contract,
- aktualnie używane kontrakty paneli, rekordów i summary.

## 5. Foundation vs lokalne

| Foundation | Lokalne ekrany | Późniejsza migracja |
|---|---|---|
| modal/overlay, Creator layout, sekcje, footer, action, input, checkbox, pickery, summary | dane, teksty, kolejność sekcji, zapis/usuwanie, domyślna ikona i kolor, metryki domenowe | Financial Goals nadal emituje część sekcji Creator bez `CreatorSection`; można migrować ekran osobno |
| stabilne `data-ui-*`, warstwy i tokeny kolorów | logika Payment Sources, Goals i Notes pozostała bez zmian | część starszych paneli korzysta nadal z obiektów stylów z `lib/uiFoundation.ts` |

## 6. Pickery

- Icon picker: jeden `FoundationIconPicker`; usunięto martwy prop `moreLabel`.
- Color picker: jeden `FoundationColorPicker`, używany przez Payment Sources, Financial Goals i Notes.
- Oba używają wspólnego `data-ui-picker-*` i jednego chevrona.
- Icon menu pozostaje portalowane i korzysta z tokenu `--ui-z-modal-popover`.
- Color menu pozostaje lokalne; ewentualne portalowanie powinno być osobną zmianą primitive.

## 7. Kolory i ikony

Pozostawiono 44 publiczne kolory `UI_COLOR_OPTIONS`; każdy ma regułę `surface`, `border` i `text/ink` w Foundation. Kolory użytkownika pozostają oddzielone od semantycznych statusów.

Usunięto martwe aliasy kolorów mapujące aktualny klucz na niego samego. Pozostawiono aliasy zapisanych danych: `neutral`, `information-plum`, `information-clay` i `neutral-accent-1..6`.

Aliasów ikon kompatybilności nie usuwano: mogą występować w zapisanych rekordach. `COMPATIBILITY_ICON_KEYS` i `LEGACY_VARIANT_ICON_KEYS` pozostają jawną warstwą legacy.

## 8. Build / lint

| Polecenie | Wynik | Uwagi |
|---|---|---|
| `npm run build` | PASS | Next.js 16.2.2; kompilacja, TypeScript i generowanie stron zakończone poprawnie |
| ESLint zmienionych plików UI | PASS | 0 błędów |
| `npm run lint` | FAIL | 45 istniejących błędów poza zakresem UI cleanupu; głównie `no-explicit-any`, reguły React Compiler i synchronizowanie state w effectach |

Pierwsze próby builda wykryły dwa martwe odwołania pozostałe po cleanupie (`getUiColor` import i reset `setExpandedNoteIds`). Zostały naprawione minimalnie; finalny build przechodzi.

## 9. Ryzyka po cleanupie

- Payment Sources: może wyglądać surowiej po usunięciu warstw freeze/polish.
- Financial Goals: główny panel utracił historyczne, lokalne nadpisania Foundation; zalecana późniejsza migracja jednego ekranu.
- Notes: wspólny color picker zastąpił lokalny wariant `rich`.
- Creator: sekcja hero wymaga teraz jawnego `variant="hero"`; kolejność dzieci nie steruje wyglądem.
- Starsze utility panels: mogą stracić ozdobniki po usunięciu selektorów bez emitowanego markupu.
- Repo nie ma zielonego pełnego lint baseline; naprawa wymaga osobnego zadania obejmującego logikę i typy, nie UI.

## 10. Minimalna lista plików do dalszej pracy

Do pracy nad pierwszym ekranem należy wysłać:

1. `app/styles/foundation.css`
2. `components/ui/FoundationPrimitives.tsx`
3. `components/ui/FoundationColorPicker.tsx`
4. `components/ui/FoundationIconPicker.tsx`
5. plik wybranego ekranu, np. `components/PaymentSourcesPanel.tsx`
6. `lib/userAppearance.ts`
7. ten raport
