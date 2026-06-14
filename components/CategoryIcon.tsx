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
  shopping: { paths: ['M4 6h2l2 9h8.5l2-6H7', 'M9 19h.01', 'M16 19h.01'] },
  basket: { paths: ['M4 6h2l2 9h8.5l2-6H7', 'M9 19h.01', 'M16 19h.01'] },
  car: { paths: ['M3.2 15.2h2.1l1.45-3.55A2.5 2.5 0 0 1 9.05 10.1h5.9a2.5 2.5 0 0 1 2.3 1.55l1.45 3.55h2.1', 'M6.1 15.2h11.8', 'M7.95 18.3h.01', 'M16.05 18.3h.01', 'M8.6 12.4h6.8'] },
  car_2: { paths: ['M3.4 15.3h2.2l1.65-3.8a2.45 2.45 0 0 1 2.25-1.45h5a2.45 2.45 0 0 1 2.25 1.45l1.65 3.8h2.2', 'M6.3 15.3h11.4', 'M8.05 18.35h.01', 'M15.95 18.35h.01', 'M8.95 12.15h6.1'] },
  car_3: { paths: ['M3.5 15.1h2l1.35-3.35a2.35 2.35 0 0 1 2.2-1.5h6.4a2.35 2.35 0 0 1 2.15 1.4l1.55 3.45h1.35', 'M6.3 15.1h11.4', 'M8 18.25h.01', 'M16 18.25h.01', 'M8.7 12.35h6.9'] },
  car_4: { paths: ['M3.7 15.4h2.1l1.55-3.9A2.25 2.25 0 0 1 9.45 10h5.1a2.25 2.25 0 0 1 2.1 1.5l1.55 3.9h2.1', 'M6.4 15.4h11.2', 'M8.15 18.35h.01', 'M15.85 18.35h.01', 'M9.1 12.2h5.8'] },
  car_5: { paths: ['M3.5 15.2h2l1.2-3.25a2.35 2.35 0 0 1 2.2-1.55h6.2a2.35 2.35 0 0 1 2.2 1.55l1.2 3.25h2', 'M6.3 15.2h11.4', 'M8.1 18.25h.01', 'M15.9 18.25h.01', 'M8.55 12.65h6.9'] },
  car_6: { paths: ['M3.4 15.1h2.15l1.55-3.45A2.55 2.55 0 0 1 9.4 10.2h5.2a2.55 2.55 0 0 1 2.3 1.45l1.55 3.45h2.15', 'M6.2 15.1h11.6', 'M8.05 18.3h.01', 'M15.95 18.3h.01', 'M8.85 12.45h6.3'] },
  car_7: { paths: ['M3.6 15.35h1.9l1.35-3.55a2.4 2.4 0 0 1 2.25-1.55h5.8a2.4 2.4 0 0 1 2.25 1.55l1.35 3.55h1.9', 'M6.25 15.35h11.5', 'M8.15 18.35h.01', 'M15.85 18.35h.01', 'M8.75 12.45h6.5'] },
  car_8: { paths: ['M3.5 15.2h1.8l1.55-3.35a2.3 2.3 0 0 1 2.1-1.35h6.1a2.3 2.3 0 0 1 2.1 1.35l1.55 3.35h1.8', 'M6.2 15.2h11.6', 'M8.15 18.2h.01', 'M15.85 18.2h.01', 'M8.8 12.55h6.4'] },
  car_9: { paths: ['M3.8 15.25h1.8l1.25-3.1a2.35 2.35 0 0 1 2.2-1.5h5.9a2.35 2.35 0 0 1 2.2 1.5l1.25 3.1h1.8', 'M6.4 15.25h11.2', 'M8.2 18.25h.01', 'M15.8 18.25h.01', 'M9 12.6h6'] },
  car_10: { paths: ['M3.6 15.3h1.9l1.6-3.65a2.25 2.25 0 0 1 2.05-1.35h5.7a2.25 2.25 0 0 1 2.05 1.35l1.6 3.65h1.9', 'M6.3 15.3h11.4', 'M8.1 18.3h.01', 'M15.9 18.3h.01', 'M8.9 12.45h6.2'] },
  transport: { paths: ['M6.5 5.5h11A1.5 1.5 0 0 1 19 7v10.5H5V7a1.5 1.5 0 0 1 1.5-1.5Z', 'M7.5 9h9', 'M7.5 13h9', 'M8.5 20h.01', 'M15.5 20h.01', 'M9 3.5h6'] },
  plane: { paths: ['M12 3.5v17', 'M4.5 13.2 12 10l7.5 3.2', 'M8.8 18.2 12 16.4l3.2 1.8', 'M9.3 6.6 12 4.8l2.7 1.8'] },
  plane_2: { paths: ['M12 3.2v17.6', 'M5 12.8l7-3.2 7 3.2', 'M8.7 18.3l3.3-1.7 3.3 1.7', 'M9 6.8l3-2 3 2'] },
  plane_3: { paths: ['M5 18.5 18.8 6.2', 'M7.6 12.5l5.9.7 2.7-2.4-6.4-1.1', 'M12.8 16.4l2.7-1.7', 'M8.5 15.4l1.8-2.7'] },
  plane_4: { paths: ['M4.8 17.8 18.5 5.8', 'M7.5 12.1l5.8.6 2.6-2.3-6.2-1', 'M12.8 15.8l2.8-1.5', 'M8.6 14.9l1.9-2.6'] },
  plane_5: { paths: ['M12 3.8v16.4', 'M4.8 12.7 12 9.8l7.2 2.9', 'M8.9 18l3.1-1.5L15.1 18', 'M9.4 6.8 12 5.1l2.6 1.7'] },
  plane_6: { paths: ['M5.2 17.7 18.7 6.3', 'M7.8 12.3l5.7.4 2.4-2.2-6-.8', 'M12.8 16l2.7-1.4', 'M8.8 15.2l1.8-2.6'] },
  plane_7: { paths: ['M12 3.5v17', 'M5.1 13.1 12 10.2l6.9 2.9', 'M9 18.1l3-1.6 3 1.6', 'M9.4 6.7 12 5l2.6 1.7'] },
  plane_8: { paths: ['M4.6 17.4 18.6 6.1', 'M7.6 12l5.9.5 2.6-2.1-6.2-.9', 'M12.9 15.7l2.7-1.5', 'M8.7 14.9l1.9-2.5'] },
  plane_9: { paths: ['M12 3.3v17.4', 'M4.7 12.9 12 9.7l7.3 3.2', 'M8.8 18.2l3.2-1.7 3.2 1.7', 'M9.2 6.7 12 4.9l2.8 1.8'] },
  plane_10: { paths: ['M5.1 18.1 18.9 6', 'M7.7 12.2l5.8.6 2.7-2.3-6.3-1', 'M12.8 16.2l2.9-1.6', 'M8.7 15.2l1.9-2.7'] },
  holiday: { paths: ['M4 16.5 20 7.5', 'M20 7.5l-2.2 8.2-4.1-3.4-3.4 4.1-1.6-.9 2.8-5.2-5.8-2.4z'] },
  sun: { paths: ['M12 5V3', 'M12 21v-2', 'M5 12H3', 'M21 12h-2', 'M6.3 6.3 4.9 4.9', 'M19.1 19.1l-1.4-1.4', 'M17.7 6.3l1.4-1.4', 'M4.9 19.1l1.4-1.4'], circles: [{cx:12, cy:12, r:4}] },
  health: { paths: ['M6 11h4V7h4v4h4v4h-4v4h-4v-4H6z'] },
  doctor: { paths: ['M5 11h14v9H5z', 'M8 11V8a4 4 0 0 1 8 0v3', 'M12 13v5', 'M9.5 15.5h5'] },
  pharmacy: { paths: ['M5 11h14v9H5z', 'M8 11V8a4 4 0 0 1 8 0v3', 'M12 13v5', 'M9.5 15.5h5'] },
  pharmacy_2: { paths: ['M6 11h4V7h4v4h4v4h-4v4h-4v-4H6z'] },
  pharmacy_3: { paths: ['M8 13.5 13.5 8a3 3 0 0 1 4.2 4.2L12.2 17.7A3 3 0 0 1 8 13.5Z', 'M10.7 10.8l4.5 4.5'] },
  pharmacy_4: { paths: ['M9 6h6', 'M10 6v4l-3.5 5.5a3 3 0 0 0 2.5 4.5h6a3 3 0 0 0 2.5-4.5L14 10V6', 'M9 16h6'] },
  pharmacy_5: { paths: ['M7 4.5h10v15H7z', 'M9.5 8h5', 'M12 11v5', 'M9.7 13.5h4.6'] },
  pharmacy_6: { paths: ['M7 10h10', 'M8 10l1.2 8h5.6L16 10', 'M9.5 7.5h5', 'M12 5v5'] },
  pharmacy_7: { paths: ['M5.5 8h13v10h-13z', 'M8.5 8v10', 'M11.5 8v10', 'M14.5 8v10', 'M5.5 13h13'] },
  pharmacy_8: { paths: ['M8 5h8v15H8z', 'M10 8h4', 'M12 11v5', 'M10 13.5h4'] },
  pharmacy_9: { paths: ['M8 13.5 13.5 8a3 3 0 0 1 4.2 4.2L12.2 17.7A3 3 0 0 1 8 13.5Z', 'M12.7 8.8l4.1 4.1', 'M7.5 6.5h4', 'M9.5 4.5v4'] },
  pharmacy_10: { paths: ['M6.5 11.5h4v-4h3v4h4v3h-4v4h-3v-4h-4z', 'M5 5h14v14H5z'] },
  work: { paths: ['M4.5 8h15v11h-15z', 'M9 8V5.5h6V8', 'M4.5 12h15'] },
  work_2: { paths: ['M4.5 8h15v11h-15z', 'M9 8V5.5h6V8', 'M4.5 12h15'] },
  work_3: { paths: ['M6 20V6h12v14', 'M8.5 9h2', 'M13.5 9h2', 'M8.5 12h2', 'M13.5 12h2', 'M8.5 15h2', 'M13.5 15h2'] },
  work_4: { paths: ['M7 5h10v14H7z', 'M9.5 9h5', 'M9.5 12h5', 'M10 16h4'] },
  work_5: { paths: ['M5 6h14v9H5z', 'M8 19h8', 'M12 15v4', 'M8.5 11.5l2-2 2 2 3-4'] },
  work_6: { paths: ['M4.5 8.5h15v10h-15z', 'M9 8.5V6h6v2.5', 'M7.5 12h9', 'M12 8.5v10'] },
  work_7: { paths: ['M5 7h14v10H5z', 'M3.5 19.5h17', 'M8 17v2.5', 'M16 17v2.5'] },
  work_8: { paths: ['M6 7h12v11H6z', 'M8.5 10h7', 'M8.5 13h5', 'M10 18v2', 'M14 18v2'] },
  work_9: { paths: ['M5 5.5h14v14H5z', 'M8 3.5v4', 'M16 3.5v4', 'M5 10h14', 'M8.5 15l2 2 4.5-5'] },
  work_10: { paths: ['M5 8h14v11H5z', 'M9 8V5.5h6V8', 'M7.5 12h9', 'M8 16h8'] },
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
  coffee: { paths: ['M6.5 8.5h10v8a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3z', 'M16.5 10h1a2.7 2.7 0 0 1 0 5.4h-1'] },
  fuel: { paths: ['M6.5 4.5h8.5v16h-8.5z', 'M8.5 8.5h4.5', 'M15 9l4 4v4a2 2 0 0 1-4 0v-2.5h2'] },
  travel: { paths: ['M4 16.5 20 7.5', 'M20 7.5l-2.2 8.2-4.1-3.4-3.4 4.1-1.6-.9 2.8-5.2-5.8-2.4z'] },
  warning: { paths: ['M12 4 3.5 19h17z', 'M12 9v5', 'M12 17h.01'] },
  idea: { paths: ['M6.9 9.1a5.1 5.1 0 1 1 10.2 0c0 2.05-1.1 3.1-2.2 4.05-.75.65-1.35 1.15-1.35 1.75h-3.1c0-.6-.6-1.1-1.35-1.75-1.1-.95-2.2-2-2.2-4.05Z', 'M10.9 17.2h2.2'] },
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
