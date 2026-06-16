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
  | 'transport'
  | 'plane'
  | 'holiday'
  | 'sun'
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
  { key: 'transport', label: 'Transport' },
  { key: 'plane', label: 'Samolot' },
  { key: 'holiday', label: 'Wakacje' },
  { key: 'sun', label: 'Słońce' },
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
  exchange: ['wymiana', 'transfer', 'przelew', 'zamiana', 'kurs', 'waluty', 'przewalutowanie', 'rotacja', 'synchronizacja'],
  home: ['dom', 'mieszkanie', 'nieruchomość', 'czynsz', 'mieszkalne', 'domowe'],
  food: ['jedzenie', 'restauracja', 'gastronomia', 'widelec', 'nóż', 'posiłek', 'śniadanie', 'obiad', 'kolacja', 'lunch'],
  shopping: ['zakupy', 'koszyk', 'sklep', 'market', 'supermarket', 'galeria handlowa', 'zakupy spożywcze'],
  basket: ['koszyk', 'zakupy', 'sklep', 'market', 'supermarket'],
  car: ['auto', 'samochód', 'samochod', 'pojazd', 'motoryzacja', 'suv'],
  transport: ['transport', 'komunikacja', 'komunikacja miejska', 'tramwaj', 'autobus', 'metro', 'pociąg', 'kolej'],
  plane: ['samolot', 'lot', 'loty', 'lotnisko', 'podróż', 'podróże', 'wakacje', 'urlop', 'wyjazd', 'wyjazdy', 'lotniczy'],
  holiday: ['wakacje', 'urlop', 'podróż', 'podróże', 'samolot', 'wyjazd', 'lot'],
  sun: ['słońce', 'pogoda', 'lato', 'wakacje', 'słoneczny', 'jasne'],
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
  entertainment: ['rozrywka', 'kino', 'film', 'filmy', 'seriale', 'telewizja'],
  cinema: ['kino', 'film', 'filmy', 'serial', 'seriale', 'telewizja', 'seans', 'ekran', 'projekcja'],
  gift: ['prezent', 'upominek', 'podarunek', 'niespodzianka'],
  clothes: ['ubrania', 'odzież', 'ciuchy', 'moda', 'garderoba'],
  pets: ['zwierzęta', 'zwierzę', 'pupil', 'pies', 'kot', 'weterynarz', 'karma', 'łapka'],
  child: ['dziecko', 'dzieci', 'niemowlę', 'rodzicielstwo', 'syn', 'córka', 'dziecięce', 'maluch', 'bobas', 'niemowlak', 'twarz dziecka', 'główka dziecka'],
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
  investments: ['inwestycje', 'inwestycja', 'inwestowanie', 'giełda', 'akcje', 'etf', 'ETF', 'obligacje', 'kapitał', 'wzrost', 'zysk', 'wykres', 'trend', 'portfel inwestycyjny'],
  restaurant: ['restauracja', 'jedzenie', 'posiłek', 'gastronomia', 'widelec', 'nóż'],
  coffee: ['kawa', 'herbata', 'kawiarnia', 'napój'],
  fuel: ['paliwo', 'benzyna', 'diesel', 'tankowanie', 'stacja paliw'],
  travel: ['podróż', 'podróże', 'wakacje', 'urlop', 'samolot', 'wyjazd', 'lot'],
  warning: ['ważne', 'istotne', 'priorytet', 'alert', 'uwaga', 'ostrzeżenie', 'pilne', 'flaga', 'alarm'],
  idea: ['pomysł', 'idea', 'żarówka', 'inspiracja', 'projekt', 'koncepcja', 'myśl'],
  heart: ['osobiste', 'prywatne', 'życie prywatne', 'dla mnie', 'serce', 'ważne dla mnie'],
  calendar: ['kalendarz', 'termin', 'data', 'wydarzenie', 'harmonogram', 'plan', 'deadline', 'spotkanie'],
  more: ['pozostałe', 'inne', 'różne', 'reszta', 'wszystko', 'nieskończoność', 'dodatkowe', 'więcej'],
  plus: ['dodaj', 'plus', 'nowe', 'utwórz', 'dodać'],
  edit: ['edytuj', 'zmień', 'ołówek', 'edycja', 'popraw', 'modyfikuj'],
  trash: ['usuń', 'kosz', 'śmieci', 'skasuj', 'wyrzuć'],
  close: ['zamknij', 'x', 'zamknięcie', 'anuluj'],
  expand: ['rozwiń', 'więcej', 'pokaż więcej', 'chevron', 'strzałka'],
  info: ['informacja', 'info', 'pomoc', 'szczegóły', 'opis'],
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
