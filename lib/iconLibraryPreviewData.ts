export const PREVIEW_LIBRARIES = [
  { key: "material", label: "Material Symbols Filled" },
  { key: "phosphor", label: "Phosphor Fill" },
  { key: "fontawesome", label: "Font Awesome Solid" },
  { key: "fluent", label: "Fluent UI Icons Filled" },
  { key: "solar", label: "Solar Bold" },
  { key: "hugeicons", label: "HugeIcons" },
] as const;

export type PreviewLibraryKey = (typeof PREVIEW_LIBRARIES)[number]["key"];
export type PreviewSection =
  | "Użytkownika"
  | "shopping-cart-test"
  | "Litery"
  | "Systemowe"
  | "Brakujace systemowe"
  | "Kompatybilność";
export type PreviewIconSet = Record<PreviewLibraryKey, string | null>;

export type IconLibraryPreviewEntry = {
  key: string;
  section: PreviewSection;
  icons: PreviewIconSet;
  recommended?: PreviewLibraryKey;
  label?: string;
  meaning?: string;
  picker?: boolean;
  technical?: boolean;
  aliases?: string[];
};

const row = (
  key: string,
  section: PreviewSection,
  icons: [string | null, string | null, string | null, string | null, string | null, string | null],
  recommended?: PreviewLibraryKey,
): IconLibraryPreviewEntry => ({
  key,
  section,
  icons: Object.fromEntries(PREVIEW_LIBRARIES.map((library, index) => [library.key, icons[index]])) as PreviewIconSet,
  recommended,
});

const user = (key: string, icons: Parameters<typeof row>[2], recommended?: PreviewLibraryKey) =>
  row(key, "Użytkownika", icons, recommended);
const system = (key: string, icons: Parameters<typeof row>[2], recommended?: PreviewLibraryKey) =>
  row(key, "Systemowe", icons, recommended);
const missingSystem = (
  key: string,
  label: string,
  meaning: string,
  icons: Parameters<typeof row>[2],
  recommended: PreviewLibraryKey,
  picker: boolean,
  technical: boolean,
  aliases: string[],
): IconLibraryPreviewEntry => ({
  ...row(key, "Brakujace systemowe", icons, recommended),
  label,
  meaning,
  picker,
  technical,
  aliases,
});

const USER_ICONS: IconLibraryPreviewEntry[] = [
  user("note", ["material-symbols:note", "ph:note-fill", "fa6-solid:note-sticky", "fluent:note-24-filled", "solar:notes-bold", "hugeicons:note"], "phosphor"),
  user("exchange", ["material-symbols:swap-horiz", "ph:arrows-left-right-fill", "fa6-solid:right-left", "fluent:arrow-swap-24-filled", "solar:transfer-horizontal-bold", "hugeicons:exchange-01"], "material"),
  user("home", ["material-symbols:home", "ph:house-fill", "fa6-solid:house", "fluent:home-24-filled", "solar:home-2-bold", "hugeicons:home-01"], "phosphor"),
  user("food", ["material-symbols:fastfood", "ph:hamburger-fill", "fa6-solid:burger", "fluent:food-24-filled", "solar:chef-hat-bold", "hugeicons:hamburger-01"], "fluent"),
  user("restaurant", ["material-symbols:restaurant", "ph:fork-knife-fill", "fa6-solid:utensils", "fluent:food-24-filled", "solar:chef-hat-bold", "hugeicons:restaurant-01"], "material"),
  user("coffee", ["material-symbols:coffee", "ph:coffee-fill", "fa6-solid:mug-hot", "fluent:drink-coffee-24-filled", "solar:cup-hot-bold", "hugeicons:coffee-02"], "phosphor"),
  user("shopping", ["material-symbols:shopping-bag", "ph:shopping-bag-fill", "fa6-solid:bag-shopping", "fluent:shopping-bag-24-filled", "solar:bag-4-bold", "hugeicons:shopping-bag-01"], "solar"),
  user("car", ["material-symbols:directions-car", "ph:car-fill", "fa6-solid:car-side", "fluent:vehicle-car-24-filled", "solar:wheel-bold", "hugeicons:car-01"], "fluent"),
  user("transport", ["material-symbols:directions-bus", "ph:bus-fill", "fa6-solid:bus-simple", "fluent:vehicle-bus-24-filled", "solar:bus-bold", "hugeicons:bus-01"], "material"),
  user("fuel", ["material-symbols:local-gas-station", "ph:gas-pump-fill", "fa6-solid:gas-pump", "fluent:gas-pump-24-filled", "solar:gas-station-bold", "hugeicons:fuel-station"], "phosphor"),
  user("parking", ["material-symbols:local-parking", null, "fa6-solid:square-parking", "fluent:vehicle-car-parking-24-filled", null, "hugeicons:parking-area-square"], "fontawesome"),
  user("taxi", ["material-symbols:local-taxi", "ph:taxi-fill", "fa6-solid:taxi", "fluent:vehicle-cab-24-filled", null, "hugeicons:taxi"], "phosphor"),
  user("plane", ["material-symbols:flight", "ph:airplane-fill", "fa6-solid:plane", "fluent:airplane-24-filled", null, "hugeicons:airplane-01"], "phosphor"),
  user("travel", ["material-symbols:luggage", "ph:suitcase-rolling-fill", "fa6-solid:suitcase-rolling", "fluent:luggage-24-filled", "solar:suitcase-bold", "hugeicons:luggage-01"], "solar"),
  user("holiday", ["material-symbols:beach-access", "ph:beach-ball-fill", "fa6-solid:umbrella-beach", "fluent:beach-24-filled", "solar:pallete-2-bold", "hugeicons:beach"], "fontawesome"),
  user("health", ["material-symbols:medical-services", "ph:first-aid-kit-fill", "fa6-solid:kit-medical", "fluent:briefcase-medical-24-filled", "solar:medical-kit-bold", "hugeicons:health"], "phosphor"),
  user("doctor", ["material-symbols:stethoscope", "ph:stethoscope-fill", "fa6-solid:user-doctor", "fluent:doctor-24-filled", "solar:stethoscope-bold", "hugeicons:doctor-01"], "fontawesome"),
  user("work", ["material-symbols:work", "ph:briefcase-fill", "fa6-solid:briefcase", "fluent:briefcase-24-filled", "solar:case-round-bold", "hugeicons:briefcase-01"], "material"),
  user("company", ["material-symbols:apartment", "ph:buildings-fill", "fa6-solid:building", "fluent:building-24-filled", "solar:buildings-2-bold", "hugeicons:building-03"], "phosphor"),
  user("salary", ["material-symbols:payments", "ph:money-fill", "fa6-solid:money-check-dollar", "fluent:money-24-filled", "solar:wad-of-money-bold", "hugeicons:money-03"], "solar"),
  user("bills", ["material-symbols:receipt-long", "ph:receipt-fill", "fa6-solid:receipt", "fluent:receipt-24-filled", "solar:bill-list-bold", "hugeicons:invoice-03"], "solar"),
  user("electricity", ["material-symbols:bolt", "ph:lightning-fill", "fa6-solid:bolt", "fluent:flash-24-filled", "solar:bolt-bold", "hugeicons:zap"], "phosphor"),
  user("water", ["material-symbols:water-drop", "ph:drop-fill", "fa6-solid:droplet", "fluent:drop-24-filled", "solar:waterdrops-bold", "hugeicons:droplet"], "material"),
  user("gas", ["material-symbols:mode-heat", "ph:flame-fill", "fa6-solid:fire-flame-simple", "fluent:fire-24-filled", "solar:flame-bold", "hugeicons:fire"], "phosphor"),
  user("internet", ["material-symbols:wifi", "ph:wifi-high-fill", "fa6-solid:wifi", "fluent:wifi-1-24-filled", "solar:wi-fi-router-bold", "hugeicons:wifi-01"], "material"),
  user("phone", ["material-symbols:smartphone", "ph:device-mobile-fill", "fa6-solid:mobile-screen-button", "fluent:phone-24-filled", "solar:smartphone-bold", "hugeicons:smart-phone-01"], "solar"),
  user("tv", ["material-symbols:tv", "ph:television-fill", "fa6-solid:tv", "fluent:tv-24-filled", "solar:tv-bold", "hugeicons:tv-01"], "phosphor"),
  user("subscription", ["material-symbols:subscriptions", "ph:arrows-clockwise-fill", "fa6-solid:repeat", "fluent:arrow-sync-24-filled", "solar:refresh-bold", "hugeicons:repeat"], "material"),
  user("education", ["material-symbols:school", "ph:graduation-cap-fill", "fa6-solid:graduation-cap", "fluent:hat-graduation-24-filled", "solar:square-academic-cap-bold", "hugeicons:graduation-scroll"], "phosphor"),
  user("books", ["material-symbols:menu-book", "ph:books-fill", "fa6-solid:book-open", "fluent:book-open-24-filled", "solar:notebook-bookmark-bold", "hugeicons:books-01"], "phosphor"),
  user("sport", ["material-symbols:sports-soccer", "ph:soccer-ball-fill", "fa6-solid:futbol", "fluent:sport-soccer-24-filled", "solar:football-bold", "hugeicons:football"], "fluent"),
  user("gym", ["material-symbols:fitness-center", "ph:barbell-fill", "fa6-solid:dumbbell", "fluent:dumbbell-24-filled", "solar:dumbbell-large-bold", "hugeicons:dumbbell-01"], "phosphor"),
  user("gaming", ["material-symbols:sports-esports", "ph:game-controller-fill", "fa6-solid:gamepad", "fluent:games-24-filled", "solar:gamepad-bold", "hugeicons:game-controller-03"], "material"),
  user("entertainment", ["material-symbols:celebration", "ph:confetti-fill", "fa6-solid:masks-theater", "fluent:games-24-filled", "solar:confetti-minimalistic-bold", "hugeicons:party"], "phosphor"),
  user("cinema", ["material-symbols:movie", "ph:film-strip-fill", "fa6-solid:film", "fluent:movies-and-tv-24-filled", "solar:clapperboard-play-bold", "hugeicons:film-01"], "solar"),
  user("music", ["material-symbols:music-note", "ph:music-note-fill", "fa6-solid:music", "fluent:music-note-2-24-filled", "solar:music-note-bold", "hugeicons:music-note-01"], "phosphor"),
  user("camera", ["material-symbols:photo-camera", "ph:camera-fill", "fa6-solid:camera", "fluent:camera-24-filled", "solar:camera-bold", "hugeicons:camera-01"], "phosphor"),
  user("microphone", ["material-symbols:mic", "ph:microphone-fill", "fa6-solid:microphone", "fluent:mic-24-filled", "solar:microphone-2-bold", "hugeicons:mic-01"], "phosphor"),
  user("headphones", ["material-symbols:headphones", "ph:headphones-fill", "fa6-solid:headphones", "fluent:headphones-24-filled", "solar:headphones-round-bold", "hugeicons:headphones"], "material"),
  user("gift", ["material-symbols:redeem", "ph:gift-fill", "fa6-solid:gift", "fluent:gift-24-filled", "solar:gift-bold", "hugeicons:gift"], "phosphor"),
  user("clothes", ["material-symbols:checkroom", "ph:t-shirt-fill", "fa6-solid:shirt", "fluent:clothes-hanger-24-filled", "solar:t-shirt-bold", "hugeicons:t-shirt"], "phosphor"),
  user("beauty", ["material-symbols:styler", "ph:sparkle-fill", "fa6-solid:wand-magic-sparkles", "fluent:sparkle-24-filled", "solar:magic-stick-3-bold", "hugeicons:magic-wand-01"], "fluent"),
  user("pets", ["material-symbols:pets", "ph:paw-print-fill", "fa6-solid:paw", "fluent:animal-paw-print-24-filled", "solar:paw-bold", null], "material"),
  user("child", ["material-symbols:child-care", "ph:baby-fill", "fa6-solid:baby", "fluent:person-24-filled", "solar:smile-circle-bold", "hugeicons:baby-01"], "phosphor"),
  user("cash", ["material-symbols:payments", "ph:money-fill", "fa6-solid:money-bill-wave", "fluent:money-24-filled", "solar:wad-of-money-bold", "hugeicons:money-02"], "phosphor"),
  user("card", ["material-symbols:credit-card", "ph:credit-card-fill", "fa6-solid:credit-card", "fluent:payment-24-filled", "solar:card-bold", "hugeicons:credit-card"], "solar"),
  user("bank", ["material-symbols:account-balance", "ph:bank-fill", "fa6-solid:building-columns", "fluent:building-bank-24-filled", null, "hugeicons:bank"], "phosphor"),
  user("wallet", ["material-symbols:account-balance-wallet", "ph:wallet-fill", "fa6-solid:wallet", "fluent:wallet-24-filled", "solar:wallet-bold", "hugeicons:wallet-01"], "solar"),
  user("savings", ["material-symbols:savings", "ph:piggy-bank-fill", "fa6-solid:piggy-bank", "fluent:money-24-filled", null, "hugeicons:piggy-bank"], "material"),
  user("investments", ["material-symbols:trending-up", "ph:chart-line-up-fill", "fa6-solid:chart-line", "fluent:data-trending-24-filled", "solar:chart-2-bold", "hugeicons:chart-line-data-01"], "phosphor"),
  user("insurance", ["material-symbols:shield", "ph:shield-check-fill", "fa6-solid:shield-halved", "fluent:shield-checkmark-24-filled", "solar:shield-check-bold", "hugeicons:shield-01"], "solar"),
  user("tax", ["material-symbols:request-quote", "ph:percent-fill", "fa6-solid:percent", "fluent:receipt-money-24-filled", "solar:bill-check-bold", "hugeicons:taxes"], "fluent"),
  user("documents", ["material-symbols:folder", "ph:files-fill", "fa6-solid:folder", "fluent:folder-24-filled", "solar:folder-bold", "hugeicons:folder-01"], "solar"),
  user("repair", ["material-symbols:home-repair-service", "ph:hammer-fill", "fa6-solid:hammer", "fluent:toolbox-24-filled", "solar:sledgehammer-bold", "hugeicons:repair"], "material"),
  user("tools", ["material-symbols:construction", "ph:wrench-fill", "fa6-solid:screwdriver-wrench", "fluent:wrench-24-filled", "solar:sledgehammer-bold", "hugeicons:tools"], "fontawesome"),
  user("warning", ["material-symbols:warning", "ph:warning-fill", "fa6-solid:triangle-exclamation", "fluent:warning-24-filled", "solar:danger-triangle-bold", "hugeicons:alert-02"], "material"),
  user("idea", ["material-symbols:lightbulb", "ph:lightbulb-fill", "fa6-solid:lightbulb", "fluent:lightbulb-24-filled", "solar:lightbulb-bold", "hugeicons:bulb"], "phosphor"),
  user("heart", ["material-symbols:favorite", "ph:heart-fill", "fa6-solid:heart", "fluent:heart-24-filled", "solar:heart-bold", "hugeicons:favourite"], "phosphor"),
  user("calendar", ["material-symbols:calendar-month", "ph:calendar-fill", "fa6-solid:calendar-days", "fluent:calendar-24-filled", "solar:calendar-bold", "hugeicons:calendar-03"], "fluent"),
  user("sun", ["material-symbols:sunny", "ph:sun-fill", "fa6-solid:sun", "fluent:weather-sunny-24-filled", "solar:sun-bold", "hugeicons:sun-03"], "phosphor"),
  user("more", ["material-symbols:more-horiz", "ph:dots-three-fill", "fa6-solid:ellipsis", "fluent:more-horizontal-24-filled", "solar:menu-dots-bold", "hugeicons:more-horizontal"], "material"),
  user("info", ["material-symbols:info", "ph:info-fill", "fa6-solid:circle-info", "fluent:info-24-filled", "solar:info-circle-bold", "hugeicons:information-circle"], "phosphor"),
  user("pen", ["material-symbols:ink-pen", "ph:pen-nib-fill", "fa6-solid:pen-nib", "fluent:pen-24-filled", "solar:pen-new-square-bold", "hugeicons:pen-01"], "phosphor"),
  user("keyboard", ["material-symbols:keyboard", "ph:keyboard-fill", "fa6-solid:keyboard", "fluent:keyboard-24-filled", "solar:keyboard-bold", "hugeicons:keyboard"], "material"),
  user("other", ["material-symbols:category", "ph:shapes-fill", "fa6-solid:shapes", "fluent:shapes-24-filled", "solar:widget-4-bold", "hugeicons:shapes"], "solar"),
];

const LETTER_ICONS: IconLibraryPreviewEntry[] = "abcdefghijklmnopqrstuvwxyz".split("").map((letter) =>
  row(
    `letter-${letter}`,
    "Litery",
    [null, `ph:letter-${letter}-fill`, `fa6-solid:${letter}`, null, null, null],
    "phosphor",
  ),
);

const SYSTEM_ICONS: IconLibraryPreviewEntry[] = [
  system("system-dashboard", ["material-symbols:dashboard", "ph:squares-four-fill", "fa6-solid:table-columns", "fluent:grid-24-filled", "solar:widget-4-bold", "hugeicons:dashboard-square-01"], "phosphor"),
  system("system-calendar", ["material-symbols:calendar-month", "ph:calendar-fill", "fa6-solid:calendar-days", "fluent:calendar-24-filled", "solar:calendar-bold", "hugeicons:calendar-03"], "fluent"),
  system("system-goals", ["material-symbols:track-changes", "ph:target-fill", "fa6-solid:bullseye", "fluent:target-24-filled", "solar:target-bold", "hugeicons:target-02"], "phosphor"),
  system("system-alert", ["material-symbols:warning", "ph:warning-fill", "fa6-solid:triangle-exclamation", "fluent:warning-24-filled", "solar:danger-triangle-bold", "hugeicons:alert-02"], "material"),
  system("system-reminder", ["material-symbols:notifications", "ph:bell-fill", "fa6-solid:bell", "fluent:alert-24-filled", "solar:bell-bold", "hugeicons:notification-02"], "phosphor"),
  system("system-payment-sources", ["material-symbols:account-balance-wallet", "ph:wallet-fill", "fa6-solid:wallet", "fluent:wallet-24-filled", "solar:wallet-money-bold", "hugeicons:wallet-01"], "solar"),
  system("system-recurring-payments", ["material-symbols:autorenew", "ph:arrows-clockwise-fill", "fa6-solid:arrows-rotate", "fluent:arrow-sync-24-filled", "solar:refresh-circle-bold", "hugeicons:repeat-one-01"], "solar"),
  system("system-profile", ["material-symbols:account-circle", "ph:user-circle-fill", "fa6-solid:circle-user", "fluent:person-circle-24-filled", "solar:user-circle-bold", "hugeicons:user-circle"], "phosphor"),
  system("system-settings", ["material-symbols:settings", "ph:gear-fill", "fa6-solid:gear", "fluent:settings-24-filled", "solar:settings-bold", "hugeicons:settings-01"], "fluent"),
  system("system-search", ["material-symbols:search", "ph:magnifying-glass", "fa6-solid:magnifying-glass", "fluent:search-24-filled", "solar:magnifer-bold", "hugeicons:search-01"], "material"),
  system("system-filter", ["material-symbols:filter-alt", "ph:funnel-fill", "fa6-solid:filter", "fluent:filter-24-filled", "solar:filter-bold", "hugeicons:filter"], "phosphor"),
  system("system-sort", ["material-symbols:sort", "ph:sort-ascending-fill", "fa6-solid:sort", "fluent:arrow-sort-24-filled", "solar:sort-bold", "hugeicons:sorting-01"], "fluent"),
  system("system-add", ["material-symbols:add-circle", "ph:plus-circle-fill", "fa6-solid:circle-plus", "fluent:add-circle-24-filled", "solar:add-circle-bold", "hugeicons:add-circle"], "phosphor"),
  system("system-edit", ["material-symbols:edit", "ph:pencil-simple-fill", "fa6-solid:pen", "fluent:edit-24-filled", "solar:pen-2-bold", "hugeicons:pencil-edit-01"], "fluent"),
  system("system-delete", ["material-symbols:delete", "ph:trash-fill", "fa6-solid:trash-can", "fluent:delete-24-filled", "solar:trash-bin-trash-bold", "hugeicons:delete-02"], "material"),
  system("system-copy", ["material-symbols:content-copy", "ph:copy-fill", "fa6-solid:copy", "fluent:copy-24-filled", "solar:copy-bold", "hugeicons:copy-01"], "phosphor"),
  system("system-save", ["material-symbols:save", "ph:floppy-disk-fill", "fa6-solid:floppy-disk", "fluent:save-24-filled", "solar:diskette-bold", "hugeicons:floppy-disk"], "material"),
  system("system-undo", ["material-symbols:undo", "ph:arrow-u-up-left-fill", "fa6-solid:rotate-left", "fluent:arrow-undo-24-filled", "solar:undo-left-bold", "hugeicons:undo"], "fluent"),
  system("system-pin", ["material-symbols:push-pin", "ph:push-pin-fill", "fa6-solid:thumbtack", "fluent:pin-24-filled", "solar:pin-bold", "hugeicons:pin"], "phosphor"),
  system("system-expand", ["material-symbols:expand-more", "ph:caret-down-bold", "fa6-solid:chevron-down", "fluent:chevron-down-24-filled", "solar:alt-arrow-down-bold", "hugeicons:arrow-down-01"], "fluent"),
  system("system-collapse", ["material-symbols:expand-less", "ph:caret-up-bold", "fa6-solid:chevron-up", "fluent:chevron-up-24-filled", "solar:alt-arrow-up-bold", "hugeicons:arrow-up-01"], "fluent"),
  system("system-close", ["material-symbols:close", "ph:x-bold", "fa6-solid:xmark", "fluent:dismiss-24-filled", "solar:close-circle-bold", "hugeicons:cancel-01"], "material"),
  system("system-more", ["material-symbols:more-horiz", "ph:dots-three-bold", "fa6-solid:ellipsis", "fluent:more-horizontal-24-filled", "solar:menu-dots-bold", "hugeicons:more-horizontal"], "material"),
  system("system-info", ["material-symbols:info", "ph:info-fill", "fa6-solid:circle-info", "fluent:info-24-filled", "solar:info-circle-bold", "hugeicons:information-circle"], "phosphor"),
  system("system-drafts", ["material-symbols:drafts", "ph:envelope-open-fill", "fa6-solid:envelope-open", "fluent:mail-open-person-24-filled", "solar:letter-opened-bold", "hugeicons:mail-open"], "material"),
  system("system-import", ["material-symbols:download", "ph:download-simple-fill", "fa6-solid:file-import", "fluent:arrow-download-24-filled", "solar:download-bold", "hugeicons:download-01"], "fluent"),
  system("system-export", ["material-symbols:upload", "ph:upload-simple-fill", "fa6-solid:file-export", "fluent:arrow-upload-24-filled", "solar:upload-bold", "hugeicons:upload-01"], "fluent"),
  system("system-trash", ["material-symbols:delete", "ph:trash-fill", "fa6-solid:trash-can", "fluent:delete-24-filled", "solar:trash-bin-trash-bold", "hugeicons:delete-02"], "material"),
  system("system-lock", ["material-symbols:lock", "ph:lock-fill", "fa6-solid:lock", "fluent:lock-closed-24-filled", "solar:lock-bold", "hugeicons:square-lock-01"], "phosphor"),
];

const SHOPPING_CART_TEST: IconLibraryPreviewEntry[] = [
  row(
    "shopping",
    "shopping-cart-test",
    [
      "material-symbols:shopping-cart",
      "ph:shopping-cart-fill",
      "fa6-solid:cart-shopping",
      "fluent:cart-24-filled",
      "solar:cart-large-2-bold",
      "hugeicons:shopping-cart-01",
    ],
  ),
];

const MISSING_SYSTEM_ICONS: IconLibraryPreviewEntry[] = [
  missingSystem(
    "all",
    "Wszystkie",
    "wszystko / wszystkie / calosc / kazdy / infinity",
    [
      "material-symbols:all-inclusive",
      "ph:infinity-fill",
      "fa6-solid:infinity",
      null,
      "solar:infinity-bold",
      "hugeicons:infinity-01",
    ],
    "material",
    true,
    false,
    ["wszystko", "wszystkie", "calosc", "kazdy", "kazda", "all", "everything", "infinity", "nieskonczonosc"],
  ),
  missingSystem(
    "income_plus",
    "Przychod",
    "plus dla wyboru L1 Przychody w kreatorze z kalendarza",
    [
      "material-symbols:add-circle",
      "ph:plus-circle-fill",
      "fa6-solid:circle-plus",
      "fluent:add-circle-24-filled",
      "solar:add-circle-bold",
      "hugeicons:add-money-circle",
    ],
    "hugeicons",
    false,
    true,
    [],
  ),
  missingSystem(
    "expense_minus",
    "Wydatek",
    "minus dla wyboru L1 Wydatki w kreatorze z kalendarza",
    [
      "material-symbols:remove",
      "ph:minus-circle-fill",
      "fa6-solid:circle-minus",
      "fluent:subtract-circle-24-filled",
      "solar:minus-circle-bold",
      "hugeicons:minus-sign-circle",
    ],
    "phosphor",
    false,
    true,
    [],
  ),
  missingSystem(
    "allocation",
    "Zarzadzaj alokacja",
    "suwaki / regulacja / konfiguracja podzialu procentowego",
    [
      "material-symbols:tune",
      "ph:sliders-horizontal-fill",
      "fa6-solid:sliders",
      "fluent:options-24-filled",
      "solar:slider-horizontal-bold",
      "hugeicons:sliders-horizontal",
    ],
    "material",
    false,
    true,
    [],
  ),
  missingSystem(
    "lock",
    "Blokada",
    "zablokowana alokacja",
    [
      "material-symbols:lock",
      "ph:lock-fill",
      "fa6-solid:lock",
      "fluent:lock-closed-24-filled",
      "solar:lock-bold",
      "hugeicons:square-lock-01",
    ],
    "phosphor",
    false,
    true,
    [],
  ),
  missingSystem(
    "unlock",
    "Odblokowanie",
    "odblokowana alokacja",
    [
      "material-symbols:lock-open",
      "ph:lock-open-fill",
      "fa6-solid:unlock",
      "fluent:lock-open-24-filled",
      "solar:lock-unlocked-bold",
      "hugeicons:square-unlock-01",
    ],
    "phosphor",
    false,
    true,
    [],
  ),
];

const compatibilityAliases: Array<[string, string]> = [
  ["basket", "shopping"],
  ["bill", "bills"],
  ["plus", "system-add"],
  ["edit", "system-edit"],
  ["trash", "system-trash"],
  ["close", "system-close"],
  ["expand", "system-expand"],
];

const ALL_PRIMARY_ICONS = [...USER_ICONS, ...SHOPPING_CART_TEST, ...LETTER_ICONS, ...SYSTEM_ICONS, ...MISSING_SYSTEM_ICONS];
const COMPATIBILITY_ICONS = compatibilityAliases.map(([key, sourceKey]) => {
  const source = ALL_PRIMARY_ICONS.find((entry) => entry.key === sourceKey);
  if (!source) throw new Error(`Missing compatibility source: ${sourceKey}`);
  return { ...source, key, section: "Kompatybilność" as const };
});

export const ICON_LIBRARY_PREVIEW_DATA = [...ALL_PRIMARY_ICONS, ...COMPATIBILITY_ICONS];
