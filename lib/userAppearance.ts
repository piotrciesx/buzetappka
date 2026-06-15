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
  | 'note_2'
  | 'note_3'
  | 'note_4'
  | 'note_5'
  | 'note_6'
  | 'note_7'
  | 'note_8'
  | 'note_9'
  | 'note_10'
  | 'exchange'
  | 'home'
  | 'home_2'
  | 'home_3'
  | 'home_4'
  | 'home_5'
  | 'home_6'
  | 'home_7'
  | 'home_8'
  | 'home_9'
  | 'home_10'
  | 'food'
  | 'food_2'
  | 'food_3'
  | 'food_4'
  | 'food_5'
  | 'food_6'
  | 'food_7'
  | 'food_8'
  | 'food_9'
  | 'food_10'
  | 'shopping'
  | 'shopping_2'
  | 'shopping_3'
  | 'shopping_4'
  | 'shopping_5'
  | 'shopping_6'
  | 'shopping_7'
  | 'shopping_8'
  | 'shopping_9'
  | 'shopping_10'
  | 'basket'
  | 'car'
  | 'transport'
  | 'transport_2'
  | 'transport_3'
  | 'transport_4'
  | 'transport_5'
  | 'transport_6'
  | 'transport_7'
  | 'transport_8'
  | 'transport_9'
  | 'transport_10'
  | 'plane'
  | 'holiday'
  | 'sun'
  | 'health'
  | 'health_2'
  | 'health_3'
  | 'health_4'
  | 'health_5'
  | 'health_6'
  | 'health_7'
  | 'health_8'
  | 'health_9'
  | 'health_10'
  | 'doctor'
  | 'pharmacy'
  | 'pharmacy_2'
  | 'pharmacy_3'
  | 'pharmacy_4'
  | 'pharmacy_5'
  | 'pharmacy_6'
  | 'pharmacy_7'
  | 'pharmacy_8'
  | 'pharmacy_9'
  | 'pharmacy_10'
  | 'work'
  | 'work_2'
  | 'work_3'
  | 'work_4'
  | 'work_5'
  | 'work_6'
  | 'work_7'
  | 'work_8'
  | 'work_9'
  | 'work_10'
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
  | 'entertainment'
  | 'cinema'
  | 'gift'
  | 'clothes'
  | 'pets'
  | 'child'
  | 'savings'
  | 'cash'
  | 'card'
  | 'bank'
  | 'investments'
  | 'restaurant'
  | 'coffee'
  | 'coffee_2'
  | 'coffee_3'
  | 'coffee_4'
  | 'coffee_5'
  | 'coffee_6'
  | 'coffee_7'
  | 'coffee_8'
  | 'coffee_9'
  | 'coffee_10'
  | 'fuel'
  | 'fuel_2'
  | 'fuel_3'
  | 'fuel_4'
  | 'fuel_5'
  | 'fuel_6'
  | 'fuel_7'
  | 'fuel_8'
  | 'fuel_9'
  | 'fuel_10'
  | 'travel'
  | 'warning'
  | 'idea'
  | 'heart'
  | 'calendar'
  | 'more'
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
  'note_2',
  'note_3',
  'note_4',
  'note_5',
  'note_6',
  'note_7',
  'note_8',
  'note_9',
  'note_10',
  'home',
  'home_2',
  'home_3',
  'home_4',
  'home_5',
  'home_6',
  'home_7',
  'home_8',
  'home_9',
  'home_10',
  'shopping',
  'shopping_2',
  'shopping_3',
  'shopping_4',
  'shopping_5',
  'shopping_6',
  'shopping_7',
  'shopping_8',
  'shopping_9',
  'shopping_10',
  'food',
  'food_2',
  'food_3',
  'food_4',
  'food_5',
  'food_6',
  'food_7',
  'food_8',
  'food_9',
  'food_10',
  'coffee',
  'coffee_2',
  'coffee_3',
  'coffee_4',
  'coffee_5',
  'coffee_6',
  'coffee_7',
  'coffee_8',
  'coffee_9',
  'coffee_10',
  'car',
  'transport',
  'transport_2',
  'transport_3',
  'transport_4',
  'transport_5',
  'transport_6',
  'transport_7',
  'transport_8',
  'transport_9',
  'transport_10',
  'plane',
  'fuel',
  'fuel_2',
  'fuel_3',
  'fuel_4',
  'fuel_5',
  'fuel_6',
  'fuel_7',
  'fuel_8',
  'fuel_9',
  'fuel_10',
  'health',
  'health_2',
  'health_3',
  'health_4',
  'health_5',
  'health_6',
  'health_7',
  'health_8',
  'health_9',
  'health_10',

  'pharmacy',
  'pharmacy_2',
  'pharmacy_3',
  'pharmacy_4',
  'pharmacy_5',
  'pharmacy_6',
  'pharmacy_7',
  'pharmacy_8',
  'pharmacy_9',
  'pharmacy_10',
  'work',
  'work_2',
  'work_3',
  'work_4',
  'work_5',
  'work_6',
  'work_7',
  'work_8',
  'work_9',
  'work_10',
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
  'cinema',
  'gift',
  'clothes',
  'child',
  'pets',
  'cash',
  'card',
  'bank',
  'investments',
  'calendar',
  'warning',
  'idea',
  'heart',
  'sun',
  'exchange',
  'more',
  'plus',
  'edit',
  'trash',
  'close',
  'expand',
  'info',
]

const INTERNAL_ICON_OPTIONS: Array<{ key: UiIconKey; label: string }> = [
  { key: 'note', label: 'Notatka' },
  { key: 'note_2', label: 'Notatka 2' },
  { key: 'note_3', label: 'Notatka 3' },
  { key: 'note_4', label: 'Notatka 4' },
  { key: 'note_5', label: 'Notatka 5' },
  { key: 'note_6', label: 'Notatka 6' },
  { key: 'note_7', label: 'Notatka 7' },
  { key: 'note_8', label: 'Notatka 8' },
  { key: 'note_9', label: 'Notatka 9' },
  { key: 'note_10', label: 'Notatka 10' },
  { key: 'exchange', label: 'Wymiana' },
  { key: 'home', label: 'Dom' },
  { key: 'home_2', label: 'Dom 2' },
  { key: 'home_3', label: 'Dom 3' },
  { key: 'home_4', label: 'Dom 4' },
  { key: 'home_5', label: 'Dom 5' },
  { key: 'home_6', label: 'Dom 6' },
  { key: 'home_7', label: 'Dom 7' },
  { key: 'home_8', label: 'Dom 8' },
  { key: 'home_9', label: 'Dom 9' },
  { key: 'home_10', label: 'Dom 10' },
  { key: 'food', label: 'Jedzenie' },
  { key: 'food_2', label: 'Jedzenie 2' },
  { key: 'food_3', label: 'Jedzenie 3' },
  { key: 'food_4', label: 'Jedzenie 4' },
  { key: 'food_5', label: 'Jedzenie 5' },
  { key: 'food_6', label: 'Jedzenie 6' },
  { key: 'food_7', label: 'Jedzenie 7' },
  { key: 'food_8', label: 'Jedzenie 8' },
  { key: 'food_9', label: 'Jedzenie 9' },
  { key: 'food_10', label: 'Jedzenie 10' },
  { key: 'shopping', label: 'Zakupy' },
  { key: 'shopping_2', label: 'Zakupy 2' },
  { key: 'shopping_3', label: 'Zakupy 3' },
  { key: 'shopping_4', label: 'Zakupy 4' },
  { key: 'shopping_5', label: 'Zakupy 5' },
  { key: 'shopping_6', label: 'Zakupy 6' },
  { key: 'shopping_7', label: 'Zakupy 7' },
  { key: 'shopping_8', label: 'Zakupy 8' },
  { key: 'shopping_9', label: 'Zakupy 9' },
  { key: 'shopping_10', label: 'Zakupy 10' },
  { key: 'basket', label: 'Koszyk' },
  { key: 'car', label: 'Auto' },
  { key: 'transport', label: 'Transport' },
  { key: 'transport_2', label: 'Transport 2' },
  { key: 'transport_3', label: 'Transport 3' },
  { key: 'transport_4', label: 'Transport 4' },
  { key: 'transport_5', label: 'Transport 5' },
  { key: 'transport_6', label: 'Transport 6' },
  { key: 'transport_7', label: 'Transport 7' },
  { key: 'transport_8', label: 'Transport 8' },
  { key: 'transport_9', label: 'Transport 9' },
  { key: 'transport_10', label: 'Transport 10' },
  { key: 'plane', label: 'Samolot' },
  { key: 'holiday', label: 'Wakacje' },
  { key: 'sun', label: 'Słońce' },
  { key: 'health', label: 'Zdrowie' },
  { key: 'health_2', label: 'Zdrowie 2' },
  { key: 'health_3', label: 'Zdrowie 3' },
  { key: 'health_4', label: 'Zdrowie 4' },
  { key: 'health_5', label: 'Zdrowie 5' },
  { key: 'health_6', label: 'Zdrowie 6' },
  { key: 'health_7', label: 'Zdrowie 7' },
  { key: 'health_8', label: 'Zdrowie 8' },
  { key: 'health_9', label: 'Zdrowie 9' },
  { key: 'health_10', label: 'Zdrowie 10' },
  { key: 'doctor', label: 'Lekarz' },
  { key: 'pharmacy', label: 'Apteka' },
  { key: 'pharmacy_2', label: 'Apteka 2' },
  { key: 'pharmacy_3', label: 'Apteka 3' },
  { key: 'pharmacy_4', label: 'Apteka 4' },
  { key: 'pharmacy_5', label: 'Apteka 5' },
  { key: 'pharmacy_6', label: 'Apteka 6' },
  { key: 'pharmacy_7', label: 'Apteka 7' },
  { key: 'pharmacy_8', label: 'Apteka 8' },
  { key: 'pharmacy_9', label: 'Apteka 9' },
  { key: 'pharmacy_10', label: 'Apteka 10' },
  { key: 'work', label: 'Praca' },
  { key: 'work_2', label: 'Praca 2' },
  { key: 'work_3', label: 'Praca 3' },
  { key: 'work_4', label: 'Praca 4' },
  { key: 'work_5', label: 'Praca 5' },
  { key: 'work_6', label: 'Praca 6' },
  { key: 'work_7', label: 'Praca 7' },
  { key: 'work_8', label: 'Praca 8' },
  { key: 'work_9', label: 'Praca 9' },
  { key: 'work_10', label: 'Praca 10' },
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
  { key: 'entertainment', label: 'Rozrywka' },
  { key: 'cinema', label: 'Kino' },
  { key: 'gift', label: 'Prezent' },
  { key: 'clothes', label: 'Ubrania' },
  { key: 'pets', label: 'Zwierzęta' },
  { key: 'child', label: 'Dziecko' },
  { key: 'savings', label: 'Oszczędności' },
  { key: 'cash', label: 'Gotówka' },
  { key: 'card', label: 'Karta' },
  { key: 'bank', label: 'Bank' },
  { key: 'investments', label: 'Inwestycje' },
  { key: 'restaurant', label: 'Restauracja' },
  { key: 'coffee', label: 'Kawa' },
  { key: 'coffee_2', label: 'Kawa 2' },
  { key: 'coffee_3', label: 'Kawa 3' },
  { key: 'coffee_4', label: 'Kawa 4' },
  { key: 'coffee_5', label: 'Kawa 5' },
  { key: 'coffee_6', label: 'Kawa 6' },
  { key: 'coffee_7', label: 'Kawa 7' },
  { key: 'coffee_8', label: 'Kawa 8' },
  { key: 'coffee_9', label: 'Kawa 9' },
  { key: 'coffee_10', label: 'Kawa 10' },
  { key: 'fuel', label: 'Paliwo' },
  { key: 'fuel_2', label: 'Paliwo 2' },
  { key: 'fuel_3', label: 'Paliwo 3' },
  { key: 'fuel_4', label: 'Paliwo 4' },
  { key: 'fuel_5', label: 'Paliwo 5' },
  { key: 'fuel_6', label: 'Paliwo 6' },
  { key: 'fuel_7', label: 'Paliwo 7' },
  { key: 'fuel_8', label: 'Paliwo 8' },
  { key: 'fuel_9', label: 'Paliwo 9' },
  { key: 'fuel_10', label: 'Paliwo 10' },
  { key: 'travel', label: 'Podróże' },
  { key: 'warning', label: 'Ważne' },
  { key: 'idea', label: 'Pomysł' },
  { key: 'heart', label: 'Osobiste' },
  { key: 'calendar', label: 'Kalendarz' },
  { key: 'more', label: 'Pozostałe' },
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
  note_2: [],
  note_3: [],
  note_4: [],
  note_5: [],
  note_6: [],
  note_7: [],
  note_8: [],
  note_9: [],
  note_10: [],
  exchange: ['wymiana', 'transfer', 'przelew', 'zamiana', 'kurs', 'waluty', 'przewalutowanie'],
  home: ['dom', 'mieszkanie', 'nieruchomość', 'czynsz', 'mieszkalne', 'domowe'],
  home_2: [],
  home_3: [],
  home_4: [],
  home_5: [],
  home_6: [],
  home_7: [],
  home_8: [],
  home_9: [],
  home_10: [],
  food: ['jedzenie', 'restauracja', 'gastronomia', 'widelec', 'nóż', 'posiłek', 'śniadanie', 'obiad', 'kolacja', 'lunch'],
  food_2: [],
  food_3: [],
  food_4: [],
  food_5: [],
  food_6: [],
  food_7: [],
  food_8: [],
  food_9: [],
  food_10: [],
  shopping: ['zakupy', 'koszyk', 'sklep', 'market', 'supermarket', 'galeria handlowa', 'zakupy spożywcze'],
  shopping_2: [],
  shopping_3: [],
  shopping_4: [],
  shopping_5: [],
  shopping_6: [],
  shopping_7: [],
  shopping_8: [],
  shopping_9: [],
  shopping_10: [],
  basket: ['koszyk', 'zakupy', 'sklep', 'market', 'supermarket'],
  car: ['auto', 'samochód', 'samochod', 'pojazd', 'motoryzacja', 'suv'],
  transport: ['transport', 'komunikacja', 'komunikacja miejska', 'tramwaj', 'autobus', 'metro', 'pociąg', 'kolej'],
  transport_2: [],
  transport_3: [],
  transport_4: [],
  transport_5: [],
  transport_6: [],
  transport_7: [],
  transport_8: [],
  transport_9: [],
  transport_10: [],
  plane: ['samolot', 'lot', 'loty', 'lotnisko', 'podróż', 'podróże', 'wakacje', 'urlop', 'wyjazd', 'wyjazdy', 'lotniczy'],
  holiday: ['wakacje', 'urlop', 'podróż', 'podróże', 'samolot', 'wyjazd', 'lot'],
  sun: ['słońce', 'pogoda', 'lato', 'wakacje', 'słoneczny'],
  health: ['zdrowie', 'medycyna', 'leczenie', 'opieka zdrowotna', 'medyczne'],
  health_2: [],
  health_3: [],
  health_4: [],
  health_5: [],
  health_6: [],
  health_7: [],
  health_8: [],
  health_9: [],
  health_10: [],
  doctor: ['lekarz', 'doktor', 'wizyta', 'medycyna', 'zdrowie', 'przychodnia', 'szpital'],
  pharmacy: ['apteka', 'leki', 'farmacja', 'lekarstwa', 'lekarz', 'doktor', 'recepta', 'przychodnia', 'szpital', 'medyczne'],
  pharmacy_2: [],
  pharmacy_3: [],
  pharmacy_4: [],
  pharmacy_5: [],
  pharmacy_6: [],
  pharmacy_7: [],
  pharmacy_8: [],
  pharmacy_9: [],
  pharmacy_10: [],
  work: ['praca', 'firma', 'biuro', 'zatrudnienie', 'etat', 'zawód'],
  work_2: [],
  work_3: [],
  work_4: [],
  work_5: [],
  work_6: [],
  work_7: [],
  work_8: [],
  work_9: [],
  work_10: [],
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
  gaming: ['gaming', 'komputer', 'gry', 'gracz', 'granie', 'gra', 'pc', 'konsola', 'e-sport', 'esport'],
  entertainment: ['rozrywka', 'kino', 'film', 'filmy', 'seriale', 'telewizja'],
  cinema: ['kino', 'film', 'filmy', 'serial', 'seriale', 'telewizja', 'seans', 'ekran', 'projekcja'],
  gift: ['prezent', 'upominek', 'podarunek', 'niespodzianka'],
  clothes: ['ubrania', 'odzież', 'ciuchy', 'moda', 'garderoba'],
  pets: ['zwierzęta', 'zwierzę', 'pupil', 'pies', 'kot', 'weterynarz', 'karma', 'łapka'],
  child: ['dziecko', 'dzieci', 'niemowlę', 'rodzicielstwo', 'syn', 'córka'],
  savings: ['oszczędności', 'oszczędzanie', 'bank', 'konto', 'konto oszczędnościowe', 'lokata', 'skarbonka', 'fundusz'],
  cash: ['gotówka', 'pieniądze', 'banknot', 'banknoty', 'kasa', 'cash'],
  card: ['karta', 'płatność', 'płatności', 'karta płatnicza', 'debetowa', 'kredytowa'],
  bank: ['bank', 'oszczędności', 'oszczędzanie', 'konto', 'konto oszczędnościowe', 'lokata', 'skarbonka', 'fundusz'],
  investments: ['inwestycje', 'inwestycja', 'inwestowanie', 'giełda', 'akcje', 'etf', 'ETF', 'obligacje', 'kapitał', 'wzrost', 'zysk'],
  restaurant: ['restauracja', 'jedzenie', 'posiłek', 'gastronomia', 'widelec', 'nóż'],
  coffee: ['kawa', 'herbata', 'kawiarnia', 'napój'],
  coffee_2: [],
  coffee_3: [],
  coffee_4: [],
  coffee_5: [],
  coffee_6: [],
  coffee_7: [],
  coffee_8: [],
  coffee_9: [],
  coffee_10: [],
  fuel: ['paliwo', 'benzyna', 'diesel', 'tankowanie', 'stacja paliw'],
  fuel_2: [],
  fuel_3: [],
  fuel_4: [],
  fuel_5: [],
  fuel_6: [],
  fuel_7: [],
  fuel_8: [],
  fuel_9: [],
  fuel_10: [],
  travel: ['podróż', 'podróże', 'wakacje', 'urlop', 'samolot', 'wyjazd', 'lot'],
  warning: ['ważne', 'istotne', 'priorytet', 'alert', 'uwaga', 'ostrzeżenie', 'pilne'],
  idea: ['pomysł', 'idea', 'żarówka', 'inspiracja', 'projekt', 'koncepcja'],
  heart: ['osobiste', 'prywatne', 'życie prywatne', 'dla mnie', 'serce'],
  calendar: ['kalendarz', 'termin', 'data', 'wydarzenie', 'harmonogram', 'plan'],
  more: ['pozostałe', 'inne', 'różne', 'reszta', 'wszystko', 'nieskończoność', 'dodatkowe'],
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
