export type UserPublicProfile = {
  user_id: string
  display_name: string | null
  avatar_key: string | null
}

export const USER_AVATARS = [
  { key: 'dog', label: 'Pies', color: 'var(--ui-color-primary-blue)' },
  { key: 'cat', label: 'Kot', color: 'var(--ui-color-primary-navy)' },
  { key: 'fox', label: 'Lis', color: 'var(--ui-color-warning)' },
  { key: 'owl', label: 'Sowa', color: 'var(--ui-color-income)' },
  { key: 'rocket', label: 'Rakieta', color: 'var(--ui-color-expense)' },
  { key: 'robot', label: 'Robot', color: 'var(--ui-color-secondary-text)' },
  { key: 'planet', label: 'Planeta', color: 'var(--ui-color-primary-blue)' },
  { key: 'coffee', label: 'Kawa', color: 'var(--ui-color-warning)' },
  { key: 'pixel', label: 'Pixel', color: 'var(--ui-color-income)' },
  { key: 'spark', label: 'Iskra', color: 'var(--ui-color-warning)' },
  { key: 'aura', label: 'Aura', color: 'var(--ui-color-primary-blue)' },
  { key: 'mint', label: 'Mięta', color: 'var(--ui-color-income)' },
  { key: 'rose', label: 'Róża', color: 'var(--ui-color-expense)' },
  { key: 'sun', label: 'Słońce', color: 'var(--ui-color-warning)' },
  { key: 'violet', label: 'Violet', color: 'var(--ui-color-primary-navy)' },
  { key: 'graphite', label: 'Grafit', color: 'var(--ui-color-secondary-text)' },
]

export type UiColorKey =
  | 'blue'
  | 'sky'
  | 'navy'
  | 'cyan'
  | 'yellow'
  | 'amber'
  | 'orange'
  | 'peach'
  | 'green'
  | 'mint'
  | 'lime'
  | 'olive'
  | 'violet'
  | 'purple'
  | 'indigo'
  | 'pink'
  | 'rose'
  | 'red'
  | 'brown'
  | 'graphite'
  | 'neutral'

export const UI_COLOR_OPTIONS: Array<{ tone: UiColorKey; label: string }> = [
  { tone: 'blue', label: 'Niebieski' },
  { tone: 'sky', label: 'Błękitny' },
  { tone: 'navy', label: 'Granatowy' },
  { tone: 'cyan', label: 'Turkusowy' },
  { tone: 'yellow', label: 'Żółty' },
  { tone: 'amber', label: 'Bursztynowy' },
  { tone: 'orange', label: 'Pomarańczowy' },
  { tone: 'peach', label: 'Brzoskwiniowy' },
  { tone: 'green', label: 'Zielony' },
  { tone: 'mint', label: 'Miętowy' },
  { tone: 'lime', label: 'Limonkowy' },
  { tone: 'olive', label: 'Oliwkowy' },
  { tone: 'violet', label: 'Fioletowy' },
  { tone: 'purple', label: 'Purpurowy' },
  { tone: 'indigo', label: 'Indygo' },
  { tone: 'pink', label: 'Różowy' },
  { tone: 'rose', label: 'Różany' },
  { tone: 'red', label: 'Czerwony' },
  { tone: 'brown', label: 'Brązowy' },
  { tone: 'graphite', label: 'Grafitowy' },
  { tone: 'neutral', label: 'Szary' },
]

export type UiIconKey =
  | 'note'
  | 'exchange'
  | 'exchange_2'
  | 'exchange_3'
  | 'exchange_4'
  | 'exchange_5'
  | 'exchange_6'
  | 'exchange_7'
  | 'exchange_8'
  | 'exchange_9'
  | 'exchange_10'
  | 'home'
  | 'food'
  | 'shopping'
  | 'basket'
  | 'car'
  | 'transport'
  | 'plane'
  | 'holiday'
  | 'sun'
  | 'sun_2'
  | 'sun_3'
  | 'sun_4'
  | 'sun_5'
  | 'sun_6'
  | 'sun_7'
  | 'sun_8'
  | 'sun_9'
  | 'sun_10'
  | 'health'
  | 'doctor'
  | 'pharmacy'
  | 'work'
  | 'salary'
  | 'bills'
  | 'bill'
  | 'electricity'
  | 'internet'
  | 'phone'
  | 'education'
  | 'books'
  | 'sport'
  | 'gym'
  | 'gaming'
  | 'gaming_2'
  | 'gaming_3'
  | 'gaming_4'
  | 'gaming_5'
  | 'gaming_6'
  | 'gaming_7'
  | 'gaming_8'
  | 'gaming_9'
  | 'gaming_10'
  | 'entertainment'
  | 'cinema'
  | 'gift'
  | 'clothes'
  | 'pets'
  | 'child'
  | 'child_2'
  | 'child_3'
  | 'child_4'
  | 'child_5'
  | 'child_6'
  | 'child_7'
  | 'child_8'
  | 'child_9'
  | 'child_10'
  | 'savings'
  | 'cash'
  | 'card'
  | 'bank'
  | 'bank_2'
  | 'bank_3'
  | 'bank_4'
  | 'bank_5'
  | 'bank_6'
  | 'bank_7'
  | 'bank_8'
  | 'bank_9'
  | 'bank_10'
  | 'investments'
  | 'investments_2'
  | 'investments_3'
  | 'investments_4'
  | 'investments_5'
  | 'investments_6'
  | 'investments_7'
  | 'investments_8'
  | 'investments_9'
  | 'investments_10'
  | 'restaurant'
  | 'coffee'
  | 'fuel'
  | 'travel'
  | 'warning'
  | 'warning_2'
  | 'warning_3'
  | 'warning_4'
  | 'warning_5'
  | 'warning_6'
  | 'warning_7'
  | 'warning_8'
  | 'warning_9'
  | 'warning_10'
  | 'idea'
  | 'idea_2'
  | 'idea_3'
  | 'idea_4'
  | 'idea_5'
  | 'idea_6'
  | 'idea_7'
  | 'idea_8'
  | 'idea_9'
  | 'idea_10'
  | 'heart'
  | 'heart_2'
  | 'heart_3'
  | 'heart_4'
  | 'heart_5'
  | 'heart_6'
  | 'heart_7'
  | 'heart_8'
  | 'heart_9'
  | 'heart_10'
  | 'calendar'
  | 'calendar_2'
  | 'calendar_3'
  | 'calendar_4'
  | 'calendar_5'
  | 'calendar_6'
  | 'calendar_7'
  | 'calendar_8'
  | 'calendar_9'
  | 'calendar_10'
  | 'more'
  | 'more_2'
  | 'more_3'
  | 'more_4'
  | 'more_5'
  | 'more_6'
  | 'more_7'
  | 'more_8'
  | 'more_9'
  | 'more_10'
  | 'plus'
  | 'edit'
  | 'trash'
  | 'close'
  | 'expand'
  | 'info'

export type ModuleActionIconKey =
  | 'user'
  | 'settings'
  | 'dashboard'
  | 'bell'
  | 'search'
  | 'star'
  | 'goals'
  | 'payments'
  | 'backup'
  | 'import'
  | 'drafts'

const USER_ICON_REGISTRY_V1: UiIconKey[] = [
  'note',
  'home',
  'shopping',
  'food',
  'coffee',
  'car',
  'transport',
  'plane',
  'fuel',
  'health',

  'pharmacy',
  'work',
  'salary',
  'bills',
  'electricity',
  'internet',
  'phone',
  'education',
  'books',
  'sport',
  'gym',
  'gaming',
  'gaming_2',
  'gaming_3',
  'gaming_4',
  'gaming_5',
  'gaming_6',
  'gaming_7',
  'gaming_8',
  'gaming_9',
  'gaming_10',
  'cinema',
  'gift',
  'clothes',
  'child',
  'child_2',
  'child_3',
  'child_4',
  'child_5',
  'child_6',
  'child_7',
  'child_8',
  'child_9',
  'child_10',
  'pets',
  'cash',
  'card',
  'bank',
  'bank_2',
  'bank_3',
  'bank_4',
  'bank_5',
  'bank_6',
  'bank_7',
  'bank_8',
  'bank_9',
  'bank_10',
  'investments',
  'investments_2',
  'investments_3',
  'investments_4',
  'investments_5',
  'investments_6',
  'investments_7',
  'investments_8',
  'investments_9',
  'investments_10',
  'calendar',
  'calendar_2',
  'calendar_3',
  'calendar_4',
  'calendar_5',
  'calendar_6',
  'calendar_7',
  'calendar_8',
  'calendar_9',
  'calendar_10',
  'warning',
  'warning_2',
  'warning_3',
  'warning_4',
  'warning_5',
  'warning_6',
  'warning_7',
  'warning_8',
  'warning_9',
  'warning_10',
  'idea',
  'idea_2',
  'idea_3',
  'idea_4',
  'idea_5',
  'idea_6',
  'idea_7',
  'idea_8',
  'idea_9',
  'idea_10',
  'heart',
  'heart_2',
  'heart_3',
  'heart_4',
  'heart_5',
  'heart_6',
  'heart_7',
  'heart_8',
  'heart_9',
  'heart_10',
  'sun',
  'sun_2',
  'sun_3',
  'sun_4',
  'sun_5',
  'sun_6',
  'sun_7',
  'sun_8',
  'sun_9',
  'sun_10',
  'exchange',
  'exchange_2',
  'exchange_3',
  'exchange_4',
  'exchange_5',
  'exchange_6',
  'exchange_7',
  'exchange_8',
  'exchange_9',
  'exchange_10',
  'more',
  'more_2',
  'more_3',
  'more_4',
  'more_5',
  'more_6',
  'more_7',
  'more_8',
  'more_9',
  'more_10',
  'plus',
  'edit',
  'trash',
  'close',
  'expand',
  'info',
]

const INTERNAL_ICON_OPTIONS: Array<{ key: UiIconKey; label: string }> = [
  { key: 'note', label: 'Notatka' },
  { key: 'exchange', label: 'Wymiana' },
  { key: 'exchange_2', label: 'Wymiana 2' },
  { key: 'exchange_3', label: 'Wymiana 3' },
  { key: 'exchange_4', label: 'Wymiana 4' },
  { key: 'exchange_5', label: 'Wymiana 5' },
  { key: 'exchange_6', label: 'Wymiana 6' },
  { key: 'exchange_7', label: 'Wymiana 7' },
  { key: 'exchange_8', label: 'Wymiana 8' },
  { key: 'exchange_9', label: 'Wymiana 9' },
  { key: 'exchange_10', label: 'Wymiana 10' },
  { key: 'home', label: 'Dom' },
  { key: 'food', label: 'Jedzenie' },
  { key: 'shopping', label: 'Zakupy' },
  { key: 'basket', label: 'Koszyk' },
  { key: 'car', label: 'Auto' },
  { key: 'transport', label: 'Transport' },
  { key: 'plane', label: 'Samolot' },
  { key: 'holiday', label: 'Wakacje' },
  { key: 'sun', label: 'Słońce' },
  { key: 'sun_2', label: 'Słońce 2' },
  { key: 'sun_3', label: 'Słońce 3' },
  { key: 'sun_4', label: 'Słońce 4' },
  { key: 'sun_5', label: 'Słońce 5' },
  { key: 'sun_6', label: 'Słońce 6' },
  { key: 'sun_7', label: 'Słońce 7' },
  { key: 'sun_8', label: 'Słońce 8' },
  { key: 'sun_9', label: 'Słońce 9' },
  { key: 'sun_10', label: 'Słońce 10' },
  { key: 'health', label: 'Zdrowie' },
  { key: 'doctor', label: 'Lekarz' },
  { key: 'pharmacy', label: 'Apteka' },
  { key: 'work', label: 'Praca' },
  { key: 'salary', label: 'Pensja' },
  { key: 'bills', label: 'Rachunki' },
  { key: 'bill', label: 'Paragon' },
  { key: 'electricity', label: 'Prąd' },
  { key: 'internet', label: 'Internet' },
  { key: 'phone', label: 'Telefon' },
  { key: 'education', label: 'Edukacja' },
  { key: 'books', label: 'Książki' },
  { key: 'sport', label: 'Sport' },
  { key: 'gym', label: 'Siłownia' },
  { key: 'gaming', label: 'Gaming' },
  { key: 'gaming_2', label: 'Gaming 2' },
  { key: 'gaming_3', label: 'Gaming 3' },
  { key: 'gaming_4', label: 'Gaming 4' },
  { key: 'gaming_5', label: 'Gaming 5' },
  { key: 'gaming_6', label: 'Gaming 6' },
  { key: 'gaming_7', label: 'Gaming 7' },
  { key: 'gaming_8', label: 'Gaming 8' },
  { key: 'gaming_9', label: 'Gaming 9' },
  { key: 'gaming_10', label: 'Gaming 10' },
  { key: 'entertainment', label: 'Rozrywka' },
  { key: 'cinema', label: 'Kino' },
  { key: 'gift', label: 'Prezent' },
  { key: 'clothes', label: 'Ubrania' },
  { key: 'pets', label: 'Zwierzęta' },
  { key: 'child', label: 'Dziecko' },
  { key: 'child_2', label: 'Dziecko 2' },
  { key: 'child_3', label: 'Dziecko 3' },
  { key: 'child_4', label: 'Dziecko 4' },
  { key: 'child_5', label: 'Dziecko 5' },
  { key: 'child_6', label: 'Dziecko 6' },
  { key: 'child_7', label: 'Dziecko 7' },
  { key: 'child_8', label: 'Dziecko 8' },
  { key: 'child_9', label: 'Dziecko 9' },
  { key: 'child_10', label: 'Dziecko 10' },
  { key: 'savings', label: 'Oszczędności' },
  { key: 'cash', label: 'Gotówka' },
  { key: 'card', label: 'Karta' },
  { key: 'bank', label: 'Bank' },
  { key: 'bank_2', label: 'Bank 2' },
  { key: 'bank_3', label: 'Bank 3' },
  { key: 'bank_4', label: 'Bank 4' },
  { key: 'bank_5', label: 'Bank 5' },
  { key: 'bank_6', label: 'Bank 6' },
  { key: 'bank_7', label: 'Bank 7' },
  { key: 'bank_8', label: 'Bank 8' },
  { key: 'bank_9', label: 'Bank 9' },
  { key: 'bank_10', label: 'Bank 10' },
  { key: 'investments', label: 'Inwestycje' },
  { key: 'investments_2', label: 'Inwestycje 2' },
  { key: 'investments_3', label: 'Inwestycje 3' },
  { key: 'investments_4', label: 'Inwestycje 4' },
  { key: 'investments_5', label: 'Inwestycje 5' },
  { key: 'investments_6', label: 'Inwestycje 6' },
  { key: 'investments_7', label: 'Inwestycje 7' },
  { key: 'investments_8', label: 'Inwestycje 8' },
  { key: 'investments_9', label: 'Inwestycje 9' },
  { key: 'investments_10', label: 'Inwestycje 10' },
  { key: 'restaurant', label: 'Restauracja' },
  { key: 'coffee', label: 'Kawa' },
  { key: 'fuel', label: 'Paliwo' },
  { key: 'travel', label: 'Podróże' },
  { key: 'warning', label: 'Ważne' },
  { key: 'warning_2', label: 'Ważne 2' },
  { key: 'warning_3', label: 'Ważne 3' },
  { key: 'warning_4', label: 'Ważne 4' },
  { key: 'warning_5', label: 'Ważne 5' },
  { key: 'warning_6', label: 'Ważne 6' },
  { key: 'warning_7', label: 'Ważne 7' },
  { key: 'warning_8', label: 'Ważne 8' },
  { key: 'warning_9', label: 'Ważne 9' },
  { key: 'warning_10', label: 'Ważne 10' },
  { key: 'idea', label: 'Pomysł' },
  { key: 'idea_2', label: 'Pomysł 2' },
  { key: 'idea_3', label: 'Pomysł 3' },
  { key: 'idea_4', label: 'Pomysł 4' },
  { key: 'idea_5', label: 'Pomysł 5' },
  { key: 'idea_6', label: 'Pomysł 6' },
  { key: 'idea_7', label: 'Pomysł 7' },
  { key: 'idea_8', label: 'Pomysł 8' },
  { key: 'idea_9', label: 'Pomysł 9' },
  { key: 'idea_10', label: 'Pomysł 10' },
  { key: 'heart', label: 'Osobiste' },
  { key: 'heart_2', label: 'Osobiste 2' },
  { key: 'heart_3', label: 'Osobiste 3' },
  { key: 'heart_4', label: 'Osobiste 4' },
  { key: 'heart_5', label: 'Osobiste 5' },
  { key: 'heart_6', label: 'Osobiste 6' },
  { key: 'heart_7', label: 'Osobiste 7' },
  { key: 'heart_8', label: 'Osobiste 8' },
  { key: 'heart_9', label: 'Osobiste 9' },
  { key: 'heart_10', label: 'Osobiste 10' },
  { key: 'calendar', label: 'Kalendarz' },
  { key: 'calendar_2', label: 'Kalendarz 2' },
  { key: 'calendar_3', label: 'Kalendarz 3' },
  { key: 'calendar_4', label: 'Kalendarz 4' },
  { key: 'calendar_5', label: 'Kalendarz 5' },
  { key: 'calendar_6', label: 'Kalendarz 6' },
  { key: 'calendar_7', label: 'Kalendarz 7' },
  { key: 'calendar_8', label: 'Kalendarz 8' },
  { key: 'calendar_9', label: 'Kalendarz 9' },
  { key: 'calendar_10', label: 'Kalendarz 10' },
  { key: 'more', label: 'Pozostałe' },
  { key: 'more_2', label: 'Pozostałe 2' },
  { key: 'more_3', label: 'Pozostałe 3' },
  { key: 'more_4', label: 'Pozostałe 4' },
  { key: 'more_5', label: 'Pozostałe 5' },
  { key: 'more_6', label: 'Pozostałe 6' },
  { key: 'more_7', label: 'Pozostałe 7' },
  { key: 'more_8', label: 'Pozostałe 8' },
  { key: 'more_9', label: 'Pozostałe 9' },
  { key: 'more_10', label: 'Pozostałe 10' },
  { key: 'plus', label: 'Dodaj' },
  { key: 'edit', label: 'Edytuj' },
  { key: 'trash', label: 'Usu\u0144' },
  { key: 'close', label: 'Zamknij' },
  { key: 'expand', label: 'Rozwi\u0144' },
  { key: 'info', label: 'Informacja' },
]

export type CategoryIconKey = UiIconKey

// APP_ICONS = ikony wybierane przez użytkownika.
export const APP_ICONS: Array<{ key: UiIconKey; label: string }> = USER_ICON_REGISTRY_V1.map(
  (key) => INTERNAL_ICON_OPTIONS.find((icon) => icon.key === key)
).filter((icon): icon is { key: UiIconKey; label: string } => Boolean(icon))

export const CATEGORY_ICONS = APP_ICONS

export const APP_ICON_ALIASES: Record<UiIconKey, string[]> = {
  note: ['notatka', 'notatki', 'nota', 'zapis', 'zapiski', 'uwagi', 'tekst', 'opis'],
  exchange: ['wymiana', 'transfer', 'przelew', 'zamiana', 'kurs', 'waluty', 'przewalutowanie', 'rotacja', 'synchronizacja'],
  exchange_2: [],
  exchange_3: [],
  exchange_4: [],
  exchange_5: [],
  exchange_6: [],
  exchange_7: [],
  exchange_8: [],
  exchange_9: [],
  exchange_10: [],
  home: ['dom', 'mieszkanie', 'nieruchomość', 'czynsz', 'mieszkalne', 'domowe'],
  food: ['jedzenie', 'restauracja', 'gastronomia', 'widelec', 'nóż', 'posiłek', 'śniadanie', 'obiad', 'kolacja', 'lunch'],
  shopping: ['zakupy', 'koszyk', 'sklep', 'market', 'supermarket', 'galeria handlowa', 'zakupy spożywcze'],
  basket: ['koszyk', 'zakupy', 'sklep', 'market', 'supermarket'],
  car: ['auto', 'samochód', 'samochod', 'pojazd', 'motoryzacja', 'suv'],
  transport: ['transport', 'komunikacja', 'komunikacja miejska', 'tramwaj', 'autobus', 'metro', 'pociąg', 'kolej'],
  plane: ['samolot', 'lot', 'loty', 'lotnisko', 'podróż', 'podróże', 'wakacje', 'urlop', 'wyjazd', 'wyjazdy', 'lotniczy'],
  holiday: ['wakacje', 'urlop', 'podróż', 'podróże', 'samolot', 'wyjazd', 'lot'],
  sun: ['słońce', 'pogoda', 'lato', 'wakacje', 'słoneczny', 'jasne'],
  sun_2: [],
  sun_3: [],
  sun_4: [],
  sun_5: [],
  sun_6: [],
  sun_7: [],
  sun_8: [],
  sun_9: [],
  sun_10: [],
  health: ['apteka', 'farmacja', 'leki', 'lekarstwa', 'leczenie', 'zdrowie', 'medycyna', 'medyczne', 'lekarz', 'doktor', 'recepta', 'przychodnia', 'szpital', 'opieka zdrowotna', 'choroba', 'badania', 'terapia', 'badanie', 'wizyta', 'ratunek'],
  doctor: ['lekarz', 'doktor', 'wizyta', 'medycyna', 'zdrowie', 'przychodnia', 'szpital'],
  pharmacy: ['apteka', 'farmacja', 'leki', 'lekarstwa', 'leczenie', 'zdrowie', 'medycyna', 'medyczne', 'lekarz', 'doktor', 'recepta', 'przychodnia', 'szpital', 'opieka zdrowotna', 'choroba', 'badania', 'terapia', 'badanie', 'wizyta', 'ratunek'],
  work: ['praca', 'firma', 'biuro', 'zatrudnienie', 'etat', 'zawód'],
  salary: ['pensja', 'wynagrodzenie', 'płaca', 'wypłata', 'portfel', 'zarobki', 'dochód'],
  bills: ['rachunki', 'rachunek', 'paragon', 'faktura', 'faktury', 'opłaty', 'opłata', 'rozliczenie'],
  bill: ['paragon', 'rachunki', 'rachunek', 'faktura', 'opłaty'],
  electricity: ['prąd', 'energia', 'elektryczność', 'elektryka', 'rachunek za prąd'],
  internet: ['internet', 'wifi', 'wi-fi', 'sieć', 'router', 'online', 'łącze'],
  phone: ['telefon', 'smartfon', 'komórka', 'telefon komórkowy', 'rozmowy', 'abonament'],
  education: ['edukacja', 'nauka', 'szkoła', 'studia', 'kurs', 'kursy', 'szkolenie'],
  books: ['książka', 'książki', 'czytanie', 'biblioteka', 'księgarnia', 'lektura', 'powieść', 'podręcznik', 'literatura'],
  sport: ['sport', 'aktywność', 'piłka', 'piłka nożna', 'koszykówka', 'piłka do kosza', 'trening', 'zawody'],
  gym: ['siłownia', 'sztanga', 'hantle', 'fitness', 'ćwiczenia', 'trening', 'trening siłowy', 'gym'],
  gaming: ['gaming', 'komputer', 'gry', 'gracz', 'granie', 'gra', 'pc', 'konsola', 'e-sport', 'esport', 'monitor', 'laptop', 'klawiatura', 'mysz', 'headset', 'słuchawki'],
  gaming_2: [],
  gaming_3: [],
  gaming_4: [],
  gaming_5: [],
  gaming_6: [],
  gaming_7: [],
  gaming_8: [],
  gaming_9: [],
  gaming_10: [],
  entertainment: ['rozrywka', 'kino', 'film', 'filmy', 'seriale', 'telewizja'],
  cinema: ['kino', 'film', 'filmy', 'serial', 'seriale', 'telewizja', 'seans', 'ekran', 'projekcja'],
  gift: ['prezent', 'upominek', 'podarunek', 'niespodzianka'],
  clothes: ['ubrania', 'odzież', 'ciuchy', 'moda', 'garderoba'],
  pets: ['zwierzęta', 'zwierzę', 'pupil', 'pies', 'kot', 'weterynarz', 'karma', 'łapka'],
  child: ['dziecko', 'dzieci', 'niemowlę', 'rodzicielstwo', 'syn', 'córka', 'dziecięce', 'maluch', 'bobas', 'niemowlak'],
  child_2: [],
  child_3: [],
  child_4: [],
  child_5: [],
  child_6: [],
  child_7: [],
  child_8: [],
  child_9: [],
  child_10: [],
  savings: ['oszczędności', 'oszczędzanie', 'bank', 'konto', 'konto oszczędnościowe', 'lokata', 'skarbonka', 'fundusz'],
  cash: ['gotówka', 'pieniądze', 'banknot', 'banknoty', 'kasa', 'cash'],
  card: ['karta', 'płatność', 'płatności', 'karta płatnicza', 'debetowa', 'kredytowa'],
  bank: ['bank', 'oszczędności', 'oszczędzanie', 'konto', 'konto oszczędnościowe', 'lokata', 'skarbonka', 'fundusz', 'finanse', 'sejf', 'skarbiec'],
  bank_2: [],
  bank_3: [],
  bank_4: [],
  bank_5: [],
  bank_6: [],
  bank_7: [],
  bank_8: [],
  bank_9: [],
  bank_10: [],
  investments: ['inwestycje', 'inwestycja', 'inwestowanie', 'giełda', 'akcje', 'etf', 'ETF', 'obligacje', 'kapitał', 'wzrost', 'zysk', 'wykres', 'trend', 'portfel inwestycyjny'],
  investments_2: [],
  investments_3: [],
  investments_4: [],
  investments_5: [],
  investments_6: [],
  investments_7: [],
  investments_8: [],
  investments_9: [],
  investments_10: [],
  restaurant: ['restauracja', 'jedzenie', 'posiłek', 'gastronomia', 'widelec', 'nóż'],
  coffee: ['kawa', 'herbata', 'kawiarnia', 'napój'],
  fuel: ['paliwo', 'benzyna', 'diesel', 'tankowanie', 'stacja paliw'],
  travel: ['podróż', 'podróże', 'wakacje', 'urlop', 'samolot', 'wyjazd', 'lot'],
  warning: ['ważne', 'istotne', 'priorytet', 'alert', 'uwaga', 'ostrzeżenie', 'pilne', 'flaga', 'alarm'],
  warning_2: [],
  warning_3: [],
  warning_4: [],
  warning_5: [],
  warning_6: [],
  warning_7: [],
  warning_8: [],
  warning_9: [],
  warning_10: [],
  idea: ['pomysł', 'idea', 'żarówka', 'inspiracja', 'projekt', 'koncepcja', 'myśl'],
  idea_2: [],
  idea_3: [],
  idea_4: [],
  idea_5: [],
  idea_6: [],
  idea_7: [],
  idea_8: [],
  idea_9: [],
  idea_10: [],
  heart: ['osobiste', 'prywatne', 'życie prywatne', 'dla mnie', 'serce', 'ważne dla mnie'],
  heart_2: [],
  heart_3: [],
  heart_4: [],
  heart_5: [],
  heart_6: [],
  heart_7: [],
  heart_8: [],
  heart_9: [],
  heart_10: [],
  calendar: ['kalendarz', 'termin', 'data', 'wydarzenie', 'harmonogram', 'plan', 'deadline', 'spotkanie'],
  calendar_2: [],
  calendar_3: [],
  calendar_4: [],
  calendar_5: [],
  calendar_6: [],
  calendar_7: [],
  calendar_8: [],
  calendar_9: [],
  calendar_10: [],
  more: ['pozostałe', 'inne', 'różne', 'reszta', 'wszystko', 'nieskończoność', 'dodatkowe', 'więcej'],
  more_2: [],
  more_3: [],
  more_4: [],
  more_5: [],
  more_6: [],
  more_7: [],
  more_8: [],
  more_9: [],
  more_10: [],
  plus: ['dodaj', 'plus', 'nowe'],
  edit: ['edytuj', 'zmień', 'ołówek', 'edycja'],
  trash: ['usuń', 'kosz', 'śmieci'],
  close: ['zamknij', 'x'],
  expand: ['rozwiń', 'więcej', 'pokaż więcej'],
  info: ['informacja', 'info', 'pomoc', 'szczegóły'],
}

export const getUiIconSearchText = (icon: { key: UiIconKey; label: string }) =>
  [icon.label, icon.key, ...(APP_ICON_ALIASES[icon.key] || [])].join(' ').toLocaleLowerCase('pl-PL')

// MODULE_ACTION_ICONS = ikony systemowe/modułowe, nie do pickerów użytkownika.
export const MODULE_ACTION_ICONS: Array<{ key: ModuleActionIconKey; label: string }> = [
  { key: 'user', label: 'U\u017cytkownik' },
  { key: 'settings', label: 'Ustawienia' },
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'bell', label: 'Przypomnienia' },
  { key: 'search', label: 'Szukaj' },
  { key: 'star', label: 'Przypi\u0119te' },
  { key: 'goals', label: 'Cele' },
  { key: 'payments', label: 'P\u0142atno\u015bci' },
  { key: 'backup', label: 'Backup' },
  { key: 'import', label: 'Import' },
  { key: 'drafts', label: 'Szkice' },
]

export const getAvatar = (avatarKey?: string | null) =>
  USER_AVATARS.find((avatar) => avatar.key === avatarKey) || USER_AVATARS[0]

export const getUiIcon = (iconKey?: string | null) =>
  INTERNAL_ICON_OPTIONS.find((icon) => icon.key === iconKey) || null

export const getCategoryIcon = getUiIcon

export const getUiColor = (tone?: string | null) =>
  UI_COLOR_OPTIONS.find((color) => color.tone === tone) || UI_COLOR_OPTIONS[0]

export const isUiIconKey = (value: string | null | undefined): value is UiIconKey =>
  Boolean(value && INTERNAL_ICON_OPTIONS.some((icon) => icon.key === value))

export const isUiColorKey = (value: string | null | undefined): value is UiColorKey =>
  Boolean(value && UI_COLOR_OPTIONS.some((color) => color.tone === value))

export const getUserDisplayName = (
  profile: UserPublicProfile | null | undefined,
  fallbackEmail?: string,
  fallbackLabel?: string
) => profile?.display_name?.trim() || fallbackEmail || fallbackLabel || 'Użytkownik'
