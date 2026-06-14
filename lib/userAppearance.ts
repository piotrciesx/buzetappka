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
  | 'home'
  | 'food'
  | 'shopping'
  | 'basket'
  | 'car'
  | 'car_2'
  | 'car_3'
  | 'car_4'
  | 'car_5'
  | 'car_6'
  | 'car_7'
  | 'car_8'
  | 'car_9'
  | 'car_10'
  | 'transport'
  | 'plane'
  | 'plane_2'
  | 'plane_3'
  | 'plane_4'
  | 'plane_5'
  | 'plane_6'
  | 'plane_7'
  | 'plane_8'
  | 'plane_9'
  | 'plane_10'
  | 'holiday'
  | 'sun'
  | 'health'
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
  | 'fuel'
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
  'home',
  'shopping',
  'food',
  'coffee',
  'car',
  'car_2',
  'car_3',
  'car_4',
  'car_5',
  'car_6',
  'car_7',
  'car_8',
  'car_9',
  'car_10',
  'transport',
  'plane',
  'plane_2',
  'plane_3',
  'plane_4',
  'plane_5',
  'plane_6',
  'plane_7',
  'plane_8',
  'plane_9',
  'plane_10',
  'fuel',
  'health',

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
  { key: 'exchange', label: 'Wymiana' },
  { key: 'home', label: 'Dom' },
  { key: 'food', label: 'Jedzenie' },
  { key: 'shopping', label: 'Zakupy' },
  { key: 'basket', label: 'Koszyk' },
  { key: 'car', label: 'Auto' },
  { key: 'car_2', label: 'Auto 2' },
  { key: 'car_3', label: 'Auto 3' },
  { key: 'car_4', label: 'Auto 4' },
  { key: 'car_5', label: 'Auto 5' },
  { key: 'car_6', label: 'Auto 6' },
  { key: 'car_7', label: 'Auto 7' },
  { key: 'car_8', label: 'Auto 8' },
  { key: 'car_9', label: 'Auto 9' },
  { key: 'car_10', label: 'Auto 10' },
  { key: 'transport', label: 'Transport' },
  { key: 'plane', label: 'Samolot' },
  { key: 'plane_2', label: 'Samolot 2' },
  { key: 'plane_3', label: 'Samolot 3' },
  { key: 'plane_4', label: 'Samolot 4' },
  { key: 'plane_5', label: 'Samolot 5' },
  { key: 'plane_6', label: 'Samolot 6' },
  { key: 'plane_7', label: 'Samolot 7' },
  { key: 'plane_8', label: 'Samolot 8' },
  { key: 'plane_9', label: 'Samolot 9' },
  { key: 'plane_10', label: 'Samolot 10' },
  { key: 'holiday', label: 'Wakacje' },
  { key: 'sun', label: 'Słońce' },
  { key: 'health', label: 'Zdrowie' },
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
  { key: 'fuel', label: 'Paliwo' },
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
  exchange: ['wymiana', 'transfer', 'przelew', 'zamiana', 'kurs', 'waluty', 'przewalutowanie'],
  home: ['dom', 'mieszkanie', 'nieruchomość', 'czynsz', 'mieszkalne', 'domowe'],
  food: ['jedzenie', 'restauracja', 'gastronomia', 'widelec', 'nóż', 'posiłek', 'śniadanie', 'obiad', 'kolacja', 'lunch'],
  shopping: ['zakupy', 'koszyk', 'sklep', 'market', 'supermarket', 'galeria handlowa', 'zakupy spożywcze'],
  basket: ['koszyk', 'zakupy', 'sklep', 'market', 'supermarket'],
  car: ['auto', 'samochód', 'samochod', 'pojazd', 'motoryzacja', 'suv'],
  car_2: [],
  car_3: [],
  car_4: [],
  car_5: [],
  car_6: [],
  car_7: [],
  car_8: [],
  car_9: [],
  car_10: [],
  transport: ['transport', 'komunikacja', 'komunikacja miejska', 'tramwaj', 'autobus', 'metro', 'pociąg', 'kolej'],
  plane: ['samolot', 'lot', 'loty', 'lotnisko', 'podróż', 'podróże', 'wakacje', 'urlop', 'wyjazd', 'wyjazdy', 'lotniczy'],
  plane_2: [],
  plane_3: [],
  plane_4: [],
  plane_5: [],
  plane_6: [],
  plane_7: [],
  plane_8: [],
  plane_9: [],
  plane_10: [],
  holiday: ['wakacje', 'urlop', 'podróż', 'podróże', 'samolot', 'wyjazd', 'lot'],
  sun: ['słońce', 'pogoda', 'lato', 'wakacje', 'słoneczny'],
  health: ['zdrowie', 'medycyna', 'leczenie', 'opieka zdrowotna', 'medyczne'],
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
  fuel: ['paliwo', 'benzyna', 'diesel', 'tankowanie', 'stacja paliw'],
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
