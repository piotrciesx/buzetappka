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

export const UI_COLOR_OPTIONS = [
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
  { tone: 'emerald', label: 'Szmaragdowy' },
  { tone: 'teal', label: 'Morski' },
  { tone: 'aqua', label: 'Aqua' },
  { tone: 'azure', label: 'Lazurowy' },
  { tone: 'lavender', label: 'Lawendowy' },
  { tone: 'magenta', label: 'Magenta' },
  { tone: 'coral', label: 'Koralowy' },
  { tone: 'tomato', label: 'Pomidorowy' },
  { tone: 'apricot', label: 'Morelowy' },
  { tone: 'gold', label: 'Złoty' },
  { tone: 'lemon', label: 'Cytrynowy' },
  { tone: 'leaf', label: 'Liściasty' },
  { tone: 'sage', label: 'Szałwiowy' },
  { tone: 'seafoam', label: 'Morska pianka' },
  { tone: 'powder', label: 'Pudrowy błękit' },
  { tone: 'periwinkle', label: 'Barwinkowy' },
  { tone: 'lilac', label: 'Liliowy' },
  { tone: 'orchid', label: 'Orchidea' },
  { tone: 'blush', label: 'Rumiany' },
  { tone: 'salmon', label: 'Łososiowy' },
  { tone: 'sand', label: 'Piaskowy' },
  { tone: 'cocoa', label: 'Kakaowy' },
  { tone: 'stone', label: 'Kamienny' },
  { tone: 'slate', label: 'Łupkowy' },
] as const

export type UiColorKey = (typeof UI_COLOR_OPTIONS)[number]['tone']

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
  | 'transport'
  | 'plane'
  | 'plane_2'
  | 'plane_3'
  | 'plane_4'
  | 'plane_5'
  | 'plane_6'
  | 'holiday'
  | 'holiday_2'
  | 'holiday_3'
  | 'holiday_4'
  | 'holiday_5'
  | 'holiday_6'
  | 'sun'
  | 'health'
  | 'doctor'
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
  | 'savings'
  | 'cash'
  | 'card'
  | 'bank'
  | 'investments'
  | 'restaurant'
  | 'coffee'
  | 'fuel'
  | 'fuel_2'
  | 'fuel_3'
  | 'fuel_4'
  | 'fuel_5'
  | 'fuel_6'
  | 'travel'
  | 'travel_2'
  | 'travel_3'
  | 'travel_4'
  | 'travel_5'
  | 'travel_6'
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
  'transport',
  'plane',
  'plane_2',
  'plane_3',
  'plane_4',
  'plane_5',
  'plane_6',
  'travel',
  'travel_2',
  'travel_3',
  'travel_4',
  'travel_5',
  'travel_6',
  'holiday',
  'holiday_2',
  'holiday_3',
  'holiday_4',
  'holiday_5',
  'holiday_6',
  'fuel',
  'fuel_2',
  'fuel_3',
  'fuel_4',
  'fuel_5',
  'fuel_6',
  'health',

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
  { key: 'car_2', label: 'Auto 1' },
  { key: 'car_3', label: 'Auto 2' },
  { key: 'car_4', label: 'Auto 3' },
  { key: 'car_5', label: 'Auto 4' },
  { key: 'car_6', label: 'Auto 5' },
  { key: 'transport', label: 'Transport' },
  { key: 'plane', label: 'Samolot' },
  { key: 'plane_2', label: 'Samolot 1' },
  { key: 'plane_3', label: 'Samolot 2' },
  { key: 'plane_4', label: 'Samolot 3' },
  { key: 'plane_5', label: 'Samolot 4' },
  { key: 'plane_6', label: 'Samolot 5' },
  { key: 'holiday', label: 'Wakacje' },
  { key: 'holiday_2', label: 'Wakacje 1' },
  { key: 'holiday_3', label: 'Wakacje 2' },
  { key: 'holiday_4', label: 'Wakacje 3' },
  { key: 'holiday_5', label: 'Wakacje 4' },
  { key: 'holiday_6', label: 'Wakacje 5' },
  { key: 'sun', label: 'Słońce' },
  { key: 'health', label: 'Zdrowie' },
  { key: 'doctor', label: 'Lekarz' },
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
  { key: 'savings', label: 'Oszczędności' },
  { key: 'cash', label: 'Gotówka' },
  { key: 'card', label: 'Karta' },
  { key: 'bank', label: 'Bank' },
  { key: 'investments', label: 'Inwestycje' },
  { key: 'restaurant', label: 'Restauracja' },
  { key: 'coffee', label: 'Kawa' },
  { key: 'fuel', label: 'Paliwo' },
  { key: 'fuel_2', label: 'Paliwo 1' },
  { key: 'fuel_3', label: 'Paliwo 2' },
  { key: 'fuel_4', label: 'Paliwo 3' },
  { key: 'fuel_5', label: 'Paliwo 4' },
  { key: 'fuel_6', label: 'Paliwo 5' },
  { key: 'travel', label: 'Podróże' },
  { key: 'travel_2', label: 'Podróże 1' },
  { key: 'travel_3', label: 'Podróże 2' },
  { key: 'travel_4', label: 'Podróże 3' },
  { key: 'travel_5', label: 'Podróże 4' },
  { key: 'travel_6', label: 'Podróże 5' },
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

export const APP_ICON_ALIASES: Partial<Record<UiIconKey, string[]>> = {
  note: ['notatka', 'notatki', 'nota', 'zapis', 'zapiski', 'uwagi', 'tekst', 'opis', 'komentarz', 'przypomnienie', 'memo', 'ważne info', 'adnotacja'],
  exchange: ['wymiana', 'transfer', 'przelew', 'zamiana', 'kurs', 'waluty', 'przewalutowanie', 'rotacja', 'synchronizacja'],
  home: ['dom', 'mieszkanie', 'czynsz', 'najem', 'wynajem', 'lokal', 'nieruchomość', 'remont', 'wyposażenie domu', 'domowe', 'meble', 'rachunki domowe', 'opłaty domowe', 'mieszkalne'],
  food: ['jedzenie', 'posiłek', 'śniadanie', 'obiad', 'kolacja', 'lunch', 'restauracja', 'bar', 'knajpa', 'gastronomia', 'fast food', 'jedzenie na mieście', 'zamówienie', 'dostawa', 'catering', 'przekąski', 'widelec', 'nóż'],
  shopping: ['zakupy', 'sklep', 'market', 'supermarket', 'hipermarket', 'dyskont', 'galeria', 'centrum handlowe', 'koszyk', 'spożywcze', 'zakupy spożywcze', 'chemia', 'drogeria', 'codzienne zakupy', 'galeria handlowa'],
  basket: ['koszyk', 'zakupy', 'sklep', 'market', 'supermarket'],
  car: ['auto', 'samochód', 'samochod', 'pojazd', 'motoryzacja', 'paliwo', 'mechanik', 'serwis', 'naprawa auta', 'części', 'opony', 'ubezpieczenie auta', 'OC', 'AC', 'przegląd', 'parking', 'myjnia', 'suv'],
  transport: ['transport', 'komunikacja', 'autobus', 'tramwaj', 'metro', 'pociąg', 'kolej', 'bilet', 'bilety', 'przejazd', 'dojazd', 'komunikacja miejska', 'taxi', 'uber', 'bolt', 'przewóz'],
  plane: ['samolot', 'lot', 'loty', 'lotnisko', 'bilet lotniczy', 'podróż', 'podróże', 'wakacje', 'urlop', 'wyjazd', 'wyjazdy', 'boarding', 'bagaż', 'odprawa', 'linie lotnicze', 'lotniczy'],
  holiday: ['wakacje', 'urlop', 'podróż', 'podróże', 'samolot', 'wyjazd', 'lot'],
  sun: ['słońce', 'pogoda', 'lato', 'wakacje', 'słoneczny', 'jasne'],
  health: ['zdrowie', 'medycyna', 'medyczne', 'lekarz', 'doktor', 'wizyta', 'przychodnia', 'szpital', 'klinika', 'apteka', 'farmacja', 'farmaceuta', 'leki', 'lek', 'lekarstwa', 'tabletki', 'kapsułki', 'recepta', 'recepty', 'leczenie', 'terapia', 'badania', 'badanie', 'diagnostyka', 'choroba', 'choroby', 'objawy', 'infekcja', 'przeziębienie', 'grypa', 'antybiotyk', 'suplementy', 'witaminy', 'opieka zdrowotna', 'ratunek', 'SOR', 'pogotowie', 'dentysta', 'stomatolog', 'okulista', 'specjalista', 'konsultacja', 'kontrola', 'zabieg', 'operacja', 'rehabilitacja', 'fizjoterapia', 'ubezpieczenie zdrowotne', 'NFZ', 'prywatna opieka', 'Luxmed', 'Medicover'],
  doctor: ['lekarz', 'doktor', 'wizyta', 'medycyna', 'zdrowie', 'przychodnia', 'szpital'],
  work: ['praca', 'firma', 'biuro', 'zatrudnienie', 'etat', 'zawód', 'działalność', 'biznes', 'delegacja', 'służbowe', 'narzędzia pracy', 'coworking', 'szkolenie służbowe'],
  salary: ['pensja', 'wynagrodzenie', 'wypłata', 'płaca', 'zarobki', 'dochód', 'przychód', 'przelew', 'premia', 'bonus', 'prowizja', 'nagroda', 'wynagrodzenie miesięczne', 'portfel'],
  bills: ['rachunki', 'rachunek', 'faktura', 'faktury', 'opłata', 'opłaty', 'paragon', 'paragony', 'rozliczenie', 'czynsz', 'media', 'abonament', 'subskrypcja', 'płatność cykliczna'],
  bill: ['paragon', 'rachunki', 'rachunek', 'faktura', 'opłaty'],
  electricity: ['prąd', 'energia', 'elektryczność', 'elektryka', 'rachunek za prąd', 'energia elektryczna', 'Tauron', 'PGE', 'Enea', 'Energa', 'Innogy', 'licznik', 'zużycie prądu'],
  internet: ['internet', 'wifi', 'wi-fi', 'sieć', 'router', 'światłowód', 'modem', 'online', 'łącze', 'abonament internetowy', 'operator', 'Play', 'Orange', 'T-Mobile', 'Plus', 'Netia', 'UPC'],
  phone: ['telefon', 'smartfon', 'komórka', 'komorka', 'telefon komórkowy', 'abonament', 'rozmowy', 'SMS', 'internet mobilny', 'karta SIM', 'SIM', 'urządzenie', 'iPhone', 'Android'],
  education: ['edukacja', 'nauka', 'szkoła', 'studia', 'uczelnia', 'kurs', 'kursy', 'szkolenie', 'warsztaty', 'lekcje', 'korepetycje', 'egzamin', 'certyfikat', 'dyplom'],
  books: ['książka', 'książki', 'czytanie', 'biblioteka', 'księgarnia', 'lektura', 'powieść', 'podręcznik', 'literatura', 'ebook', 'e-book', 'audiobook', 'komiks', 'manga'],
  sport: ['sport', 'aktywność', 'trening', 'ćwiczenia', 'fitness', 'piłka', 'piłka nożna', 'koszykówka', 'piłka do kosza', 'siatkówka', 'bieganie', 'rower', 'basen', 'zawody', 'mecz', 'siłownia'],
  gym: ['siłownia', 'fitness', 'trening', 'ćwiczenia', 'hantle', 'sztanga', 'karnet', 'trener', 'trening siłowy', 'masa', 'redukcja', 'cardio', 'crossfit', 'gym'],
  gaming: ['gaming', 'gry', 'gra', 'granie', 'gracz', 'komputer', 'PC', 'pc', 'laptop', 'konsola', 'PlayStation', 'Xbox', 'Nintendo', 'Steam', 'Epic', 'monitor', 'klawiatura', 'mysz', 'headset', 'słuchawki', 'e-sport', 'esport'],
  entertainment: ['rozrywka', 'kino', 'film', 'filmy', 'seriale', 'telewizja'],
  cinema: ['kino', 'film', 'filmy', 'serial', 'seriale', 'seans', 'ekran', 'projekcja', 'bilet do kina', 'Netflix', 'HBO', 'Disney', 'Prime Video', 'Player', 'telewizja', 'rozrywka'],
  gift: ['prezent', 'upominek', 'podarunek', 'niespodzianka', 'urodziny', 'święta', 'rocznica', 'okazja', 'dla kogoś', 'paczka', 'podarunki'],
  clothes: ['ubrania', 'odzież', 'ciuchy', 'moda', 'garderoba', 'buty', 'spodnie', 'koszulka', 'kurtka', 'bluza', 'bielizna', 'dodatki', 'akcesoria', 'zakupy odzieżowe'],
  pets: ['zwierzęta', 'zwierze', 'zwierzę', 'pupil', 'pies', 'kot', 'karma', 'weterynarz', 'lecznica', 'akcesoria dla zwierząt', 'smycz', 'kuweta', 'żwirek', 'zabawki dla zwierząt', 'opieka nad zwierzęciem', 'łapka'],
  child: ['dziecko', 'dzieci', 'niemowlę', 'niemowle', 'maluch', 'bobas', 'syn', 'córka', 'corka', 'rodzicielstwo', 'zabawki', 'przedszkole', 'szkoła', 'wyprawka', 'pieluchy', 'opieka nad dzieckiem', 'dziecięce', 'główka dziecka', 'twarz dziecka', 'niemowlak'],
  savings: ['oszczędności', 'oszczędzanie', 'bank', 'konto', 'konto oszczędnościowe', 'lokata', 'skarbonka', 'fundusz'],
  cash: ['gotówka', 'gotowka', 'pieniądze', 'pieniadze', 'banknot', 'banknoty', 'monety', 'kasa', 'cash', 'wypłata z bankomatu', 'bankomat', 'portfel', 'gotówkowe'],
  card: ['karta', 'karta płatnicza', 'karta platnicza', 'debetowa', 'kredytowa', 'płatność kartą', 'platnosc karta', 'Visa', 'Mastercard', 'terminal', 'zbliżeniowo', 'płatność', 'płatności'],
  bank: ['bank', 'konto', 'konto bankowe', 'oszczędności', 'oszczednosci', 'oszczędzanie', 'lokata', 'przelew', 'bankowość', 'bankowosc', 'finanse', 'sejf', 'skarbiec', 'fundusz', 'konto oszczędnościowe', 'skarbonka'],
  investments: ['inwestycje', 'inwestycja', 'inwestowanie', 'giełda', 'gielda', 'akcje', 'ETF', 'etf', 'obligacje', 'fundusze', 'kapitał', 'kapital', 'zysk', 'strata', 'wykres', 'trend', 'portfel inwestycyjny', 'dywidenda', 'krypto', 'kryptowaluty', 'wzrost'],
  restaurant: ['restauracja', 'jedzenie', 'posiłek', 'gastronomia', 'widelec', 'nóż'],
  coffee: ['kawa', 'herbata', 'kawiarnia', 'napój'],
  fuel: ['paliwo', 'benzyna', 'diesel', 'ropa', 'tankowanie', 'stacja paliw', 'Orlen', 'BP', 'Shell', 'Circle K', 'LPG', 'gaz', 'paliwowe'],
  travel: ['podróż', 'podróże', 'wakacje', 'urlop', 'samolot', 'wyjazd', 'lot'],
  warning: ['ważne', 'wazne', 'istotne', 'priorytet', 'alert', 'uwaga', 'ostrzeżenie', 'ostrzezenie', 'pilne', 'alarm', 'flaga', 'ryzyko', 'problem', 'krytyczne'],
  idea: ['pomysł', 'idea', 'żarówka', 'inspiracja', 'projekt', 'koncepcja', 'myśl'],
  heart: ['osobiste', 'prywatne', 'życie prywatne', 'dla mnie', 'serce', 'ważne dla mnie'],
  calendar: ['kalendarz', 'termin', 'data', 'wydarzenie', 'harmonogram', 'plan', 'deadline', 'spotkanie', 'miesiąc', 'miesiac', 'dzień', 'dzien', 'przypomnienie', 'agenda'],
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
