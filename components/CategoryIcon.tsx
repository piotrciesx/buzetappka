import { getUiIcon, type UiIconKey } from '../lib/userAppearance'

type CategoryIconProps = {
  iconKey?: string | null
  level?: 2 | 3
}

const iconPaths: Record<UiIconKey, string[]> = {
  note: ['M4 4h12l4 4v12H4z', 'M16 4v5h5', 'M8 13h8', 'M8 17h6'],
  exchange: ['M7 7h11l-3-3', 'M17 17H6l3 3', 'M18 7l-3 3', 'M6 17l3-3'],
  home: ['M3 11.5 12 4l9 7.5', 'M5.5 10.5V20h13v-9.5', 'M9.5 20v-5h5v5'],
  food: ['M7 3v18', 'M4 3v6a3 3 0 0 0 6 0V3', 'M16 3v18', 'M16 3c2.4 1.6 3.8 4 3.8 7v2H16'],
  shopping: ['M6 8h12l-1 12H7z', 'M9 8a3 3 0 0 1 6 0'],
  basket: ['M6 9h12l-1.5 11h-9z', 'M9 9l3-5 3 5', 'M9 13h6', 'M10 17h4'],
  car: ['M5 16h14', 'M6.5 16 8 9h8l1.5 7', 'M7 19h.01', 'M17 19h.01', 'M4 13h16'],
  transport: ['M6 17h12', 'M7 17V6h10v11', 'M9 20h.01', 'M15 20h.01', 'M8.5 10h7', 'M8.5 14h7'],
  plane: ['M3 12h18', 'M12 3l4 9-4 9', 'M8 12 5 8', 'M8 12l-3 4'],
  holiday: ['M4 20h16', 'M7 20c1-5.5 4-10 8-14', 'M6 9c4-3 8-3.5 12-1.5', 'M10 7c1.5 1 2.5 2.3 3.2 4'],
  sun: ['M12 4v-2', 'M12 22v-2', 'M4.9 4.9 3.5 3.5', 'M19.1 19.1l-1.5-1.5', 'M2 12h2', 'M20 12h2', 'M4.9 19.1l1.5-1.5', 'M19.1 4.9l-1.5 1.5', 'M8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0'],
  health: ['M12 21s-8-4.8-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6.2-8 11-8 11Z', 'M12 8v6', 'M9 11h6'],
  doctor: ['M8 4h8v4H8z', 'M6 8h12v12H6z', 'M12 11v5', 'M9.5 13.5h5'],
  pharmacy: ['M4 11h16v9H4z', 'M8 11V7a4 4 0 0 1 8 0v4', 'M12 13v5', 'M9.5 15.5h5'],
  work: ['M4 8h16v11H4z', 'M9 8V5h6v3', 'M4 12h16', 'M10 12v2h4v-2'],
  salary: ['M4 7h16v12H4z', 'M7 10h4', 'M16 16h.01', 'M12 13a3 3 0 1 0 0 .01'],
  bills: ['M6 3h12v18l-3-2-3 2-3-2-3 2z', 'M9 8h6', 'M9 12h6', 'M9 16h4'],
  bill: ['M7 3h10v18l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2z', 'M9.5 8h5', 'M9.5 12h5', 'M9.5 16h3'],
  electricity: ['M13 2 6 13h5l-1 9 8-13h-5z'],
  internet: ['M4 8a12 12 0 0 1 16 0', 'M7 12a7 7 0 0 1 10 0', 'M10 16a3 3 0 0 1 4 0', 'M12 20h.01'],
  phone: ['M8 3h8v18H8z', 'M11 18h2'],
  education: ['M3 9 12 5l9 4-9 4z', 'M6 11v5c2.8 2 9.2 2 12 0v-5'],
  books: ['M5 5h6v15H5z', 'M13 4h6v16h-6z', 'M7 8h2', 'M15 8h2'],
  sport: ['M5 19 19 5', 'M7 7a8.5 8.5 0 0 0 10 10', 'M5 12a7 7 0 0 0 7 7', 'M12 5a7 7 0 0 1 7 7'],
  gym: ['M4 10v4', 'M8 8v8', 'M16 8v8', 'M20 10v4', 'M8 12h8'],
  gaming: ['M7 10h10a4 4 0 0 1 3.6 5.8l-.6 1.2a2 2 0 0 1-3.2.5L15 16H9l-1.8 1.5A2 2 0 0 1 4 17l-.6-1.2A4 4 0 0 1 7 10Z', 'M8 13h3', 'M9.5 11.5v3', 'M15 13h.01', 'M17 14h.01'],
  entertainment: ['M6 8h12l2 10H4z', 'M8 12h4', 'M10 10v4', 'M16 13h.01', 'M18 11h.01'],
  cinema: ['M4 6h16v12H4z', 'M8 6v12', 'M16 6v12', 'M4 10h4', 'M16 10h4', 'M4 14h4', 'M16 14h4'],
  gift: ['M4 10h16v10H4z', 'M12 10v10', 'M4 14h16', 'M8 10a2.5 2.5 0 1 1 4 0', 'M12 10a2.5 2.5 0 1 1 4 0'],
  clothes: ['M8 4 5 7v4l3-1v10h8V10l3 1V7l-3-3', 'M8 4c1 2 7 2 8 0'],
  pets: ['M6 10h.01', 'M10 7h.01', 'M14 7h.01', 'M18 10h.01', 'M7 18c1-4 9-4 10 0 1.2 4-11.2 4-10 0Z'],
  child: ['M9 8a3 3 0 1 0 6 0 3 3 0 0 0-6 0', 'M5 21a7 7 0 0 1 14 0', 'M8 14l-3 3', 'M16 14l3 3'],
  savings: ['M5 11c0-3 3.4-5.5 7.5-5.5 3.8 0 6.5 2.2 6.5 5.5 0 3.9-3.2 7-7 7H8l-2 3v-4.2A6.8 6.8 0 0 1 5 11Z', 'M9 11h.01', 'M16 10h2'],
  cash: ['M4 7h16v10H4z', 'M8 10h.01', 'M16 14h.01', 'M12 13a2 2 0 1 0 0-2 2 2 0 0 0 0 2Z'],
  card: ['M3.5 6h17v12h-17z', 'M3.5 10h17', 'M7 15h4'],
  bank: ['M3 10h18', 'M5 10l7-5 7 5', 'M6 10v8', 'M10 10v8', 'M14 10v8', 'M18 10v8', 'M4 18h16'],
  investments: ['M4 19V5', 'M4 19h16', 'M7 15l4-4 3 3 5-7', 'M16 7h3v3'],
  restaurant: ['M7 3v8', 'M10 3v8', 'M7 7h3', 'M8.5 11v10', 'M16 3c2 2.4 2 6.6 0 9v9'],
  coffee: ['M5 8h12v6a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5z', 'M17 10h1.5a2.5 2.5 0 0 1 0 5H17', 'M8 3v2', 'M12 3v2', 'M16 3v2'],
  fuel: ['M4 3h10v18H4z', 'M14 8h2.5L19 11v7a2 2 0 0 0 4 0v-4', 'M7 7h4'],
  travel: ['M4 16l16-8', 'M14 5l6 3-4 2', 'M8 14 5 9l3-1 4 4', 'M6 19h12'],
  warning: ['M12 3 3 20h18z', 'M12 9v5', 'M12 17h.01'],
  idea: ['M9 18h6', 'M10 21h4', 'M8 11a4 4 0 1 1 8 0c0 2-1.2 3-2.2 4H10.2C9.2 14 8 13 8 11Z'],
  heart: ['M20 8.5c0 5-8 10.5-8 10.5S4 13.5 4 8.5A4.2 4.2 0 0 1 12 6a4.2 4.2 0 0 1 8 2.5Z'],
  calendar: ['M4 5h16v15H4z', 'M8 3v4', 'M16 3v4', 'M4 10h16'],
  more: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M8 12h.01', 'M12 12h.01', 'M16 12h.01'],
  plus: ['M12 5v14', 'M5 12h14'],
  edit: ['M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16z', 'M13 6l5 5'],
  trash: ['M4 7h16', 'M9 7V4h6v3', 'M7 7l1 14h8l1-14', 'M10 11v6', 'M14 11v6'],
  close: ['M6 6l12 12', 'M18 6 6 18'],
  expand: ['M8 9l4 4 4-4'],
  info: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 11v5', 'M12 8h.01'],
}

export default function CategoryIcon({ iconKey, level = 2 }: CategoryIconProps) {
  const icon = getUiIcon(iconKey)
  const resolvedKey = icon?.key || 'more'
  const paths = iconPaths[resolvedKey] || iconPaths.more
  const strokeWidth = level === 3 ? 1.7 : 1.8

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths.map((path, index) => (
        <path key={`${resolvedKey}-${index}`} d={path} />
      ))}
    </svg>
  )
}
