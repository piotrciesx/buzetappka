import { getCategoryIcon, type CategoryIconKey } from '../lib/userAppearance'

type CategoryIconProps = {
  iconKey?: string | null
  level?: 2 | 3
}

const iconPaths: Record<CategoryIconKey, string[]> = {
  home: ['M3 11.5 12 4l9 7.5', 'M5.5 10.5V20h13v-9.5', 'M9.5 20v-5h5v5'],
  food: ['M7 3v18', 'M4 3v5a3 3 0 0 0 6 0V3', 'M16 3v18', 'M16 3c2.2 1.3 3.5 3.4 3.5 6v2.5H16'],
  shopping: ['M6.5 8h11l-1 12h-9z', 'M9 8a3 3 0 0 1 6 0'],
  car: ['M5 16h14', 'M6.5 16 8 9h8l1.5 7', 'M7 19h.01M17 19h.01', 'M4 13h16'],
  transport: ['M6 17h12', 'M7 17V6h10v11', 'M9 20h.01M15 20h.01', 'M8 10h8M8 14h8'],
  plane: ['M3 12h18', 'M12 3l4 9-4 9', 'M8 12 5 8M8 12l-3 4'],
  holiday: ['M4 20h16', 'M7 20c1.2-5.2 3.7-9.4 8-13', 'M6 9c4-3.1 8-3.8 12-2', 'M10 7c1.7.9 2.9 2.1 3.7 3.8'],
  sun: ['M12 6v-3M12 21v-3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M3 12h3M18 12h3M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1', 'M8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0'],
  health: ['M12 21s-8-4.8-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6.2-8 11-8 11Z', 'M12 8v6M9 11h6'],
  doctor: ['M8 4h8v4H8z', 'M6 8h12v12H6z', 'M12 11v5M9.5 13.5h5'],
  pharmacy: ['M4 11h16v9H4z', 'M8 11V7a4 4 0 0 1 8 0v4', 'M12 13v5M9.5 15.5h5'],
  work: ['M4 8h16v11H4z', 'M9 8V5h6v3', 'M4 12h16', 'M10 12v2h4v-2'],
  salary: ['M4 7h16v12H4z', 'M7 10h4', 'M16 16h.01', 'M12 13a3 3 0 1 0 0 .01'],
  bills: ['M6 3h12v18l-3-2-3 2-3-2-3 2z', 'M9 8h6M9 12h6M9 16h4'],
  electricity: ['M13 2 6 13h5l-1 9 8-13h-5z'],
  internet: ['M4 8a12 12 0 0 1 16 0', 'M7 12a7 7 0 0 1 10 0', 'M10 16a3 3 0 0 1 4 0', 'M12 20h.01'],
  phone: ['M8 3h8v18H8z', 'M11 18h2'],
  education: ['M3 9 12 5l9 4-9 4z', 'M6 11v5c2.8 2 9.2 2 12 0v-5'],
  books: ['M5 5h6v15H5z', 'M13 4h6v16h-6z', 'M7 8h2M15 8h2'],
  sport: ['M5 19 19 5', 'M7 7a8.5 8.5 0 0 0 10 10', 'M5 12a7 7 0 0 0 7 7', 'M12 5a7 7 0 0 1 7 7'],
  gym: ['M4 10v4M8 8v8M16 8v8M20 10v4M8 12h8'],
  gaming: ['M7 10h10a4 4 0 0 1 3.6 5.8l-.6 1.2a2 2 0 0 1-3.2.5L15 16H9l-1.8 1.5A2 2 0 0 1 4 17l-.6-1.2A4 4 0 0 1 7 10Z', 'M8 13h3M9.5 11.5v3M15 13h.01M17 14h.01'],
  entertainment: ['M6 8h12l2 10H4z', 'M8 12h4M10 10v4', 'M16 13h.01M18 11h.01'],
  cinema: ['M4 6h16v12H4z', 'M8 6v12M16 6v12', 'M4 10h4M16 10h4M4 14h4M16 14h4'],
  gift: ['M4 10h16v10H4z', 'M12 10v10', 'M4 14h16', 'M8 10a2.5 2.5 0 1 1 4 0 2.5 2.5 0 1 1 4 0'],
  clothes: ['M8 4 5 7v4l3-1v10h8V10l3 1V7l-3-3', 'M8 4c1 2 7 2 8 0'],
  pets: ['M6 10h.01M10 7h.01M14 7h.01M18 10h.01', 'M7 18c1-4 9-4 10 0 1.2 4-11.2 4-10 0Z'],
  child: ['M9 8a3 3 0 1 0 6 0 3 3 0 0 0-6 0', 'M5 21a7 7 0 0 1 14 0', 'M8 14l-3 3M16 14l3 3'],
  savings: ['M5 11c0-3 3.4-5.5 7.5-5.5 3.8 0 6.5 2.2 6.5 5.5 0 3.9-3.2 7-7 7H8l-2 3v-4.2A6.8 6.8 0 0 1 5 11Z', 'M9 11h.01M16 10h2'],
  cash: ['M4 7h16v10H4z', 'M8 10h.01M16 14h.01', 'M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z'],
  card: ['M4 6h16v12H4z', 'M4 10h16', 'M7 15h4'],
  bank: ['M3 9 12 4l9 5', 'M5 10h14', 'M6 10v8M10 10v8M14 10v8M18 10v8', 'M4 20h16'],
  investments: ['M4 18h16', 'M6 15l4-4 3 3 5-7', 'M16 7h2v2', 'M7 18V9M12 18v-4M17 18v-7'],
  restaurant: ['M7 3v18', 'M4 3v5a3 3 0 0 0 6 0V3', 'M15 3h4v18', 'M15 3v8h4'],
  coffee: ['M5 8h12v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z', 'M17 10h1a3 3 0 0 1 0 6h-1', 'M8 4v1M12 4v1'],
  fuel: ['M6 4h9v17H6z', 'M8 8h5', 'M15 9l4 4v5a2 2 0 0 1-4 0v-3h2'],
  travel: ['M4 7h16v12H4z', 'M9 7V5h6v2', 'M8 19V7M16 19V7', 'M4 12h16'],
}

export default function CategoryIcon({ iconKey, level = 2 }: CategoryIconProps) {
  const icon = getCategoryIcon(iconKey)

  if (!icon) {
    return null
  }

  return (
    <span
      data-category-icon="true"
      data-category-icon-level={level}
      aria-hidden="true"
      title={icon.label}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" focusable="false">
        {iconPaths[icon.key].map((path) => (
          <path
            key={path}
            d={path}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        ))}
      </svg>
    </span>
  )
}
