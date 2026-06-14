import { getUiIcon, type UiIconKey } from '../lib/userAppearance'

type CategoryIconProps = {
  iconKey?: string | null
  level?: 2 | 3
}

type IconShape = {
  paths?: string[]
  circles?: Array<{ cx: number; cy: number; r: number }>
}

const iconShapes: Record<UiIconKey, IconShape> = {
  note: { paths: ['M6 4.5h8.5l3.5 3.5v11.5H6z', 'M14.5 4.5V8h3.5', 'M8.5 11.5h7', 'M8.5 15h5'] },
  exchange: { paths: ['M7 7h10l-3-3', 'M17 17H7l3 3', 'M17 7l-3 3', 'M7 17l3-3'] },
  home: { paths: ['M4 11.5 12 5l8 6.5', 'M6.5 10v9h11v-9', 'M10 19v-5h4v5'] },
  food: { paths: ['M7 4v16', 'M4.5 4v5a2.5 2.5 0 0 0 5 0V4', 'M16.5 4v16', 'M16.5 4c2 1.5 3 3.5 3 6v2h-3'] },
  shopping: { paths: ['M6.5 8.5h11l-1 11h-9z', 'M9 8.5a3 3 0 0 1 6 0'] },
  basket: { paths: ['M6.5 8.5h11l-1 11h-9z', 'M9 8.5a3 3 0 0 1 6 0'] },
  car: { paths: ['M3.5 15h1.7l1.5-3.8A2.2 2.2 0 0 1 8.7 10h6.6a2.2 2.2 0 0 1 2 1.2L18.8 15h1.7', 'M6.2 15h11.6', 'M7.8 18.5h.01', 'M16.2 18.5h.01', 'M8.4 12.2h7.2', 'M9.2 10l-.8 2.2', 'M14.8 10l.8 2.2'] },
  transport: { paths: ['M6.5 5.5h11A1.5 1.5 0 0 1 19 7v10.5H5V7a1.5 1.5 0 0 1 1.5-1.5Z', 'M7.5 9h9', 'M7.5 13h9', 'M8.5 20h.01', 'M15.5 20h.01', 'M9 3.5h6'] },
  plane: { paths: ['M4 16.5 20 7.5', 'M20 7.5l-2.2 8.2-4.1-3.4-3.4 4.1-1.6-.9 2.8-5.2-5.8-2.4z'] },
  holiday: { paths: ['M4 16.5 20 7.5', 'M20 7.5l-2.2 8.2-4.1-3.4-3.4 4.1-1.6-.9 2.8-5.2-5.8-2.4z'] },
  sun: { paths: ['M12 5V3', 'M12 21v-2', 'M5 12H3', 'M21 12h-2', 'M6.3 6.3 4.9 4.9', 'M19.1 19.1l-1.4-1.4', 'M17.7 6.3l1.4-1.4', 'M4.9 19.1l1.4-1.4'], circles: [{cx:12, cy:12, r:4}] },
  health: { paths: ['M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z'] },
  doctor: { paths: ['M5 11h14v9H5z', 'M8 11V8a4 4 0 0 1 8 0v3', 'M12 13v5', 'M9.5 15.5h5'] },
  pharmacy: { paths: ['M5 11h14v9H5z', 'M8 11V8a4 4 0 0 1 8 0v3', 'M12 13v5', 'M9.5 15.5h5'] },
  work: { paths: ['M4.5 8h15v11h-15z', 'M9 8V5.5h6V8', 'M4.5 12h15'] },
  salary: { paths: ['M4.5 7h13.5a2 2 0 0 1 2 2v9H4.5z', 'M4.5 7V5.5h12', 'M15.5 12.5H20v4h-4.5a2 2 0 0 1 0-4Z', 'M17.2 14.5h.01'] },
  bills: { paths: ['M7 4h10v16l-2-1.3-3 1.3-3-1.3L7 20z', 'M9.5 8h5', 'M9.5 12h5', 'M9.5 16h3'] },
  bill: { paths: ['M7 4h10v16l-2-1.3-3 1.3-3-1.3L7 20z', 'M9.5 8h5', 'M9.5 12h5', 'M9.5 16h3'] },
  electricity: { paths: ['M13 3 6.5 13h5L10 21l7.5-11h-5z'] },
  internet: { paths: ['M4.5 8a11 11 0 0 1 15 0', 'M7.5 12a7 7 0 0 1 9 0', 'M10.2 16a3 3 0 0 1 3.6 0', 'M12 20h.01'] },
  phone: { paths: ['M8 4h8v16H8z', 'M11 17.5h2'] },
  education: { paths: ['M3.5 9 12 5l8.5 4-8.5 4z', 'M6.5 11.5v4.5c2.8 2 8.2 2 11 0v-4.5'] },
  books: { paths: ['M5.5 5h5.5v15H5.5z', 'M13 4.5h5.5V20H13z', 'M7.5 8h1.5', 'M15 8h1.5'] },
  sport: { paths: ['M5 19 19 5', 'M7 7a8 8 0 0 0 10 10', 'M5 12a7 7 0 0 0 7 7', 'M12 5a7 7 0 0 1 7 7'] },
  gym: { paths: ['M4 10.5v3', 'M6.5 9v6', 'M9 12h6', 'M17.5 9v6', 'M20 10.5v3'] },
  gaming: { paths: ['M5 6h10v8H5z', 'M8 18h4', 'M10 14v4', 'M17 8h2v10h-2', 'M18 5.5h.01'] },
  entertainment: { paths: ['M5 8h14l1 10H4z', 'M8 12h4', 'M10 10v4', 'M16 13h.01', 'M18 11h.01'] },
  cinema: { paths: ['M5 7.5h14v10H5z', 'M8 7.5l2 3', 'M12 7.5l2 3', 'M16 7.5l2 3', 'M8.5 14.5h7'] },
  gift: { paths: ['M4.5 10h15v10h-15z', 'M12 10v10', 'M4.5 14h15', 'M8.5 10a2.5 2.5 0 1 1 3.5 0', 'M15.5 10a2.5 2.5 0 1 0-3.5 0'] },
  clothes: { paths: ['M8 5 5.5 7.5v4l2.5-1V20h8v-9.5l2.5 1v-4L16 5', 'M8 5c1 2 7 2 8 0'] },
  pets: { paths: ['M6.5 10h.01', 'M10 7.5h.01', 'M14 7.5h.01', 'M17.5 10h.01', 'M7.5 18c.8-4 8.2-4 9 0 1 3-10 3-9 0Z'] },
  child: { paths: ['M9.5 9a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0', 'M7.5 18.5c1-2.2 2.5-3.3 4.5-3.3s3.5 1.1 4.5 3.3', 'M8 12.5c1.2 1 2.5 1.5 4 1.5s2.8-.5 4-1.5'] },
  savings: { paths: ['M3.5 9 12 4.5 20.5 9', 'M5 10h14', 'M6 10v8', 'M10 10v8', 'M14 10v8', 'M18 10v8', 'M4.5 20h15'] },
  cash: { paths: ['M4.5 7.5h15v9h-15z', 'M8 10.5h.01', 'M16 13.5h.01'], circles: [{cx:12, cy:12, r:2.2}] },
  card: { paths: ['M4.5 6.5h15v11h-15z', 'M4.5 10h15', 'M7.5 14.5h4'] },
  bank: { paths: ['M3.5 9 12 4.5 20.5 9', 'M5 10h14', 'M6 10v8', 'M10 10v8', 'M14 10v8', 'M18 10v8', 'M4.5 20h15'] },
  investments: { paths: ['M5 16.5l4.2-4.2 3 3L19 8.5', 'M15.5 8.5H19V12'] },
  restaurant: { paths: ['M7 4v16', 'M4.5 4v5a2.5 2.5 0 0 0 5 0V4', 'M16.5 4v16', 'M16.5 4c2 1.5 3 3.5 3 6v2h-3'] },
  coffee: { paths: ['M5.5 8.5h11v5.5a4 4 0 0 1-4 4h-3a4 4 0 0 1-4-4z', 'M16.5 10h1a3 3 0 0 1 0 6h-1', 'M8 5v1', 'M12 5v1'] },
  fuel: { paths: ['M6.5 4.5h8.5v16h-8.5z', 'M8.5 8.5h4.5', 'M15 9l4 4v4a2 2 0 0 1-4 0v-2.5h2'] },
  travel: { paths: ['M4 16.5 20 7.5', 'M20 7.5l-2.2 8.2-4.1-3.4-3.4 4.1-1.6-.9 2.8-5.2-5.8-2.4z'] },
  warning: { paths: ['M12 4 3.5 19h17z', 'M12 9v5', 'M12 17h.01'] },
  idea: {
  circles: [{ cx: 12, cy: 10.2, r: 4.6 }],
  paths: ['M11.2 15.5h1.6'],
},
  heart: { paths: ['M20 8.7c0 5-8 10.3-8 10.3S4 13.7 4 8.7A4.1 4.1 0 0 1 12 6a4.1 4.1 0 0 1 8 2.7Z'] },
  calendar: { paths: ['M4.5 5.5h15v14h-15z', 'M8 3.5v4', 'M16 3.5v4', 'M4.5 10h15'] },
  more: { paths: ['M7.2 9.2c-2.2 0-3.7 1.6-3.7 3.3s1.5 3.3 3.7 3.3c3 0 4.3-6.6 7.6-6.6 2.2 0 3.7 1.6 3.7 3.3s-1.5 3.3-3.7 3.3c-3.3 0-4.6-6.6-7.6-6.6Z'] },
  plus: { paths: ['M12 5v14', 'M5 12h14'] },
  edit: { paths: ['M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16z', 'M13 6l5 5'] },
  trash: { paths: ['M4 7h16', 'M9 7V4h6v3', 'M7 7l1 14h8l1-14', 'M10 11v6', 'M14 11v6'] },
  close: { paths: ['M6 6l12 12', 'M18 6 6 18'] },
  expand: { paths: ['M8 9l4 4 4-4'] },
  info: { paths: ['M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Z', 'M12 11v5', 'M12 8h.01'] },
}
export default function CategoryIcon({ iconKey, level = 2 }: CategoryIconProps) {
  const resolvedIconKey =
    iconKey && Object.prototype.hasOwnProperty.call(iconShapes, iconKey)
      ? (iconKey as UiIconKey)
      : null

  if (!resolvedIconKey) {
    return null
  }

  const icon = getUiIcon(resolvedIconKey)
  const shape = iconShapes[resolvedIconKey]

  return (
    <span
      data-category-icon="true"
      data-category-icon-level={level}
      aria-hidden="true"
      title={icon?.label || resolvedIconKey}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" focusable="false">
        {shape.paths?.map((path) => (
          <path
            key={path}
            d={path}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
          />
        ))}
        {shape.circles?.map((circle) => (
          <circle
            key={`${circle.cx}-${circle.cy}-${circle.r}`}
            cx={circle.cx}
            cy={circle.cy}
            r={circle.r}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
          />
        ))}
      </svg>
    </span>
  )
}
