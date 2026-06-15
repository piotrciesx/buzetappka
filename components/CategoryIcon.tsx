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
  note_2: { paths: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6', 'M9 13h6', 'M9 17h4'] },
  note_3: { paths: ['M5 3h14v18H5z', 'M9 7h6', 'M9 11h6', 'M9 15h4'] },
  note_4: { paths: ['M4 5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z', 'M15 3v5h5'] },
  note_5: { paths: ['M6 4h12v16H6z', 'M8 4v16', 'M4 8h4', 'M4 12h4', 'M4 16h4'] },
  note_6: { paths: ['M8 5h9a2 2 0 0 1 2 2v12H8a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z', 'M8 5v14'] },
  note_7: { paths: ['M9 3h6l1 2h3v16H5V5h3z', 'M9 11h6', 'M9 15h4'] },
  note_8: { paths: ['M7 3h10a2 2 0 0 1 2 2v16l-7-3-7 3V5a2 2 0 0 1 2-2Z'] },
  note_9: { paths: ['M4 6.5A2.5 2.5 0 0 1 6.5 4H12v16H6.5A2.5 2.5 0 0 1 4 17.5z', 'M12 4h5.5A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5H12'] },
  note_10: { paths: ['M6 4h12v16H6z', 'M12 3v5', 'M9 12h6', 'M9 16h4'] },
  exchange: { paths: ['M7 7h10l-3-3', 'M17 17H7l3 3', 'M17 7l-3 3', 'M7 17l3-3'] },
  home: { paths: ['M4 11.5 12 5l8 6.5', 'M6.5 10v9h11v-9', 'M10 19v-5h4v5'] },
  home_2: { paths: ['M3 11 12 3l9 8', 'M5 10v10h14V10', 'M9 20v-6h6v6'] },
  home_3: { paths: ['M4 12 12 5l8 7', 'M6 10.5V20h12v-9.5', 'M15 6.5V4h3v5'] },
  home_4: { paths: ['M5 12h14', 'M6 12v8h12v-8', 'M4 12l8-7 8 7'] },
  home_5: { paths: ['M4 10.5 12 4l8 6.5', 'M7 9.5V20h10V9.5'] },
  home_6: { paths: ['M3.5 11.5 12 4l8.5 7.5', 'M6.5 10.5V20h11v-9.5', 'M10 14h4', 'M10 17h4'] },
  home_7: { paths: ['M4 11 12 5l8 6', 'M7 10v10h10V10', 'M9.5 20v-5h5V20'] },
  home_8: { paths: ['M4 12.5 12 6l8 6.5', 'M6 12v8h12v-8', 'M9 20v-4h6v4'] },
  home_9: { paths: ['M3 11.5 12 4l9 7.5', 'M5.5 10.5v9h13v-9'] },
  home_10: { paths: ['M5 11.5 12 6l7 5.5', 'M7 12h10v8H7z'] },
  food: { paths: ['M7 4v16', 'M4.5 4v5a2.5 2.5 0 0 0 5 0V4', 'M16.5 4v16', 'M16.5 4c2 1.5 3 3.5 3 6v2h-3'] },
  food_2: { paths: ['M7 3v18', 'M4 3v6a3 3 0 0 0 6 0V3', 'M17 3v18', 'M14 7a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z'] },
  food_3: { paths: ['M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z', 'M7 3v8', 'M5 3v5a2 2 0 0 0 4 0V3'] },
  food_4: { paths: ['M7 11a3 3 0 0 1 5-3 3 3 0 0 1 5 3', 'M7 11h10v7H7z', 'M9 21h6'] },
  food_5: { paths: ['M6 13h12a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5Z', 'M8 10h8', 'M16 4l3 6', 'M13 4l3 6'] },
  food_6: { paths: ['M5 12a7 4 0 0 1 14 0', 'M5 12h14', 'M6.5 15h11', 'M7 18h10'] },
  food_7: { paths: ['M5 19 19 5l-3.5 14z', 'M10 14h.01', 'M13 11h.01', 'M14 16h.01'] },
  food_8: { paths: ['M6 10h12v6a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4z', 'M8 10V7', 'M16 10V7', 'M7 7h10'] },
  food_9: { paths: ['M5 14h14', 'M7 14a5 5 0 0 1 10 0', 'M12 8V6', 'M6 18h12'] },
  food_10: { paths: ['M7 3v18', 'M4 3v6a3 3 0 0 0 6 0V3', 'M18 4 12 21', 'M20 5 14 21'] },
  shopping: { paths: ['M4 6h2l2 9h8.5l2-6H7', 'M9 19h.01', 'M16 19h.01'] },
  shopping_2: { paths: ['M6 8h12l-1 12H7z', 'M9 8a3 3 0 0 1 6 0'] },
  shopping_3: { paths: ['M4 6h2l2 9h9l2-6H7', 'M9 20h.01', 'M17 20h.01'] },
  shopping_4: { paths: ['M6 8h12v12H6z', 'M9 8a3 3 0 0 1 6 0'] },
  shopping_5: { paths: ['M7 9h10l-1 10H8z', 'M10 9a2 2 0 0 1 4 0'] },
  shopping_6: { paths: ['M7 7h10v13H7z', 'M9.5 7V5h5v2'] },
  shopping_7: { paths: ['M5 9h14l-1.5 10h-11z', 'M8 9l4-4 4 4'] },
  shopping_8: { paths: ['M3 5h2l2.5 10h9L20 8H7', 'M9 20h.01', 'M17 20h.01'] },
  shopping_9: { paths: ['M6 10h12l-1 9H7z', 'M8.5 10 12 6l3.5 4'] },
  shopping_10: { paths: ['M6 8h12l-1 12H7z', 'M12 12v4', 'M10 14h4', 'M9 8a3 3 0 0 1 6 0'] },
  basket: { paths: ['M4 6h2l2 9h8.5l2-6H7', 'M9 19h.01', 'M16 19h.01'] },
  car: {
    paths: [
      'M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-2-2.4-3.2c-.4-.5-1-.8-1.6-.8H5.5c-.6 0-1.1.4-1.4.9L2.7 9.8A3.7 3.7 0 0 0 2 11.5V15c0 .6.4 1 1 1h2',
      'M7 17h10',
    ],
    circles: [
      { cx: 7, cy: 17, r: 2 },
      { cx: 17, cy: 17, r: 2 },
    ],
  },






























  transport: { paths: ['M6.5 5.5h11A1.5 1.5 0 0 1 19 7v10.5H5V7a1.5 1.5 0 0 1 1.5-1.5Z', 'M7.5 9h9', 'M7.5 13h9', 'M8.5 20h.01', 'M15.5 20h.01', 'M9 3.5h6'] },
  transport_2: { paths: ['M6 6h12v11H6z', 'M8 9h8', 'M8 12.5h8', 'M8.5 19.5h.01', 'M15.5 19.5h.01'] },
  transport_3: { paths: ['M6 5h12a2 2 0 0 1 2 2v10H4V7a2 2 0 0 1 2-2Z', 'M7.5 9h9', 'M7.5 13h9', 'M8.5 20h.01', 'M15.5 20h.01'] },
  transport_4: { paths: ['M7 5h10a2 2 0 0 1 2 2v10H5V7a2 2 0 0 1 2-2Z', 'M8 9h8', 'M8 12h8', 'M9 20h.01', 'M15 20h.01'] },
  transport_5: { paths: ['M4.5 15h15', 'M6 7h12v8H6z', 'M8 10h8', 'M8.5 18.5h.01', 'M15.5 18.5h.01'] },
  transport_6: { paths: ['M4.5 15.5h15', 'M6 6.5h12v9H6z', 'M8 9.5h8', 'M8 13h8', 'M9 19h.01', 'M15 19h.01'] },
  transport_7: { paths: ['M5.5 7h13v9.5h-13z', 'M8 10h8', 'M8 13.5h8', 'M8.5 19h.01', 'M15.5 19h.01'] },
  transport_8: { paths: ['M6.5 5.5h11v13h-11z', 'M8.5 9h7', 'M8.5 13h7', 'M9 18.5l-1 2', 'M15 18.5l1 2'] },
  transport_9: { paths: ['M7 19V6a3 3 0 0 1 3-3h5', 'M7 9h9a3 3 0 0 1 0 6H7', 'M11 19h6'] },
  transport_10: { paths: ['M5.5 8h13v8h-13z', 'M7.5 11h9', 'M8 18.5h.01', 'M16 18.5h.01'] },
  plane: { paths: ['M12 3.5c.6 0 1 .45 1 1.05v5.25l6.1 3.05c.35.18.55.55.55.95v1.2l-6.65-1.75v3.8l2.35 1.45v1.05L12 18.75l-3.35.8V18.5L11 17.05v-3.8L4.35 15v-1.2c0-.4.2-.77.55-.95L11 9.8V4.55c0-.6.4-1.05 1-1.05Z'] },










  holiday: { paths: ['M4 16.5 20 7.5', 'M20 7.5l-2.2 8.2-4.1-3.4-3.4 4.1-1.6-.9 2.8-5.2-5.8-2.4z'] },
  sun: { paths: ['M12 5V3', 'M12 21v-2', 'M5 12H3', 'M21 12h-2', 'M6.3 6.3 4.9 4.9', 'M19.1 19.1l-1.4-1.4', 'M17.7 6.3l1.4-1.4', 'M4.9 19.1l1.4-1.4'], circles: [{cx:12, cy:12, r:4}] },
  health: { paths: ['M6 11h4V7h4v4h4v4h-4v4h-4v-4H6z'] },
  health_2: { paths: ['M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z'] },
  health_3: { paths: ['M6 11h4V7h4v4h4v4h-4v4h-4v-4H6z'] },
  health_4: { paths: ['M4 13h4l2-5 4 10 2-5h4'] },
  health_5: { paths: ['M12 21C8 17.5 5 15 5 10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5-3 7.5-7 11Z', 'M8 12h3l1-2 2 4 1-2h2'] },
  health_6: { paths: ['M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z'] },
  health_7: { paths: ['M6 12h3l2-5 4 10 2-5h3'] },
  health_8: { paths: ['M12 20s-6-3.8-6-9a3.5 3.5 0 0 1 6-2.3A3.5 3.5 0 0 1 18 11c0 5.2-6 9-6 9Z'] },
  health_9: { paths: ['M8 5h8v14H8z', 'M12 8v8', 'M9 12h6'] },
  health_10: { paths: ['M4 12h4l2-4 4 8 2-4h4'] },
  doctor: { paths: ['M5 11h14v9H5z', 'M8 11V8a4 4 0 0 1 8 0v3', 'M12 13v5', 'M9.5 15.5h5'] },
  pharmacy: { paths: ['M5 11h14v9H5z', 'M8 11V8a4 4 0 0 1 8 0v3', 'M12 13v5', 'M9.5 15.5h5'] },
  pharmacy_2: { paths: ['M5 11h14v9H5z', 'M8 11V8a4 4 0 0 1 8 0v3', 'M12 13v5', 'M9.5 15.5h5'] },
  pharmacy_3: { paths: ['M6 7h12v13H6z', 'M9 7V5h6v2', 'M12 10v7', 'M8.5 13.5h7'] },
  pharmacy_4: { paths: ['M9 3h6v6h6v6h-6v6H9v-6H3V9h6z'] },
  pharmacy_5: { paths: ['M10 4h4v4h4v4h-4v4h-4v-4H6V8h4z', 'M7 20h10'] },
  pharmacy_6: { paths: ['M8 4h8l2 4v12H6V8z', 'M10 12h4', 'M12 10v4'] },
  pharmacy_7: { paths: ['M7 11h10v9H7z', 'M9 11V8a3 3 0 0 1 6 0v3', 'M12 13v5', 'M9.5 15.5h5'] },
  pharmacy_8: { paths: ['M7 5h10v14H7z', 'M10 12h4', 'M12 10v4', 'M9 5V3h6v2'] },
  pharmacy_9: { paths: ['M6 6h12v12H6z', 'M12 8v8', 'M8 12h8'] },
  pharmacy_10: { paths: ['M5 12h14v8H5z', 'M8 12V8a4 4 0 0 1 8 0v4', 'M12 14v4', 'M10 16h4'] },
  work: { paths: ['M4.5 8h15v11h-15z', 'M9 8V5.5h6V8', 'M4.5 12h15'] },
  work_2: { paths: ['M4 8h16v11H4z', 'M9 8V5h6v3', 'M4 12h16'] },
  work_3: { paths: ['M5 7h14v12H5z', 'M9 7V5h6v2', 'M8 12h8'] },
  work_4: { paths: ['M4 10h16v9H4z', 'M7 10V7h10v3', 'M9 14h6'] },
  work_5: { paths: ['M7 8h10v11H7z', 'M9 8V5h6v3', 'M5 12h14'] },
  work_6: { paths: ['M5 5h14v14H5z', 'M8 9h8', 'M8 13h8', 'M8 17h5'] },
  work_7: { paths: ['M4 8h16v10H4z', 'M8 8V6h8v2', 'M12 12v2'] },
  work_8: { paths: ['M6 6h12v13H6z', 'M9 6V4h6v2', 'M8 11h8', 'M8 15h5'] },
  work_9: { paths: ['M4 9h16v10H4z', 'M9 9V6h6v3', 'M4 13h16', 'M11 13v2h2v-2'] },
  work_10: { paths: ['M6 7h12v12H6z', 'M10 7V5h4v2', 'M9 12h6'] },
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
  coffee_2: { paths: ['M6 9h10v6a4 4 0 0 1-4 4h-2a4 4 0 0 1-4-4z', 'M16 10h1a3 3 0 0 1 0 6h-1'] },
  coffee_3: { paths: ['M5 9h11v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z', 'M16 10h1a3 3 0 0 1 0 6h-1', 'M7 20h10'] },
  coffee_4: { paths: ['M8 5h8v14H8z', 'M10 7h4', 'M16 9h1a2.5 2.5 0 0 1 0 5h-1', 'M10 21h4'] },
  coffee_5: { paths: ['M5.5 9h11v6a4 4 0 0 1-4 4h-3a4 4 0 0 1-4-4z', 'M16.5 10h1a3 3 0 0 1 0 6h-1', 'M8 5v1', 'M12 5v1', 'M15 5v1'] },
  coffee_6: { paths: ['M8 12c0-4 3-7 8-7 1.5 5-1.5 10-6 10-1.2 0-2-.8-2-3Z', 'M8 12c2 0 4-2 6-5'] },
  coffee_7: { paths: ['M6.5 10h9v4a3.5 3.5 0 0 1-3.5 3.5h-2A3.5 3.5 0 0 1 6.5 14z', 'M15.5 11h1a2.2 2.2 0 0 1 0 4.4h-1'] },
  coffee_8: { paths: ['M5.5 9h11v6a4 4 0 0 1-4 4h-3a4 4 0 0 1-4-4z', 'M16.5 10h1a3 3 0 0 1 0 6h-1', 'M12 15s-2-1.2-2-2.5a1.2 1.2 0 0 1 2-.8 1.2 1.2 0 0 1 2 .8c0 1.3-2 2.5-2 2.5Z'] },
  coffee_9: { paths: ['M6.5 8.5h10v8a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3z', 'M16.5 10h1a2.7 2.7 0 0 1 0 5.4h-1'] },
  coffee_10: { paths: ['M8 5h8l-1 15H9z', 'M8.5 9h7', 'M9 13h6'] },
  fuel: { paths: ['M6.5 4.5h8.5v16h-8.5z', 'M8.5 8.5h4.5', 'M15 9l4 4v4a2 2 0 0 1-4 0v-2.5h2'] },
  fuel_2: { paths: ['M6 4h9v17H6z', 'M8 8h5', 'M15 9l4 4v5a2 2 0 0 1-4 0v-3h2'] },
  fuel_3: { paths: ['M7 3h8v18H7z', 'M9 7h4', 'M15 8l4 4v6a2 2 0 0 1-4 0v-4h2'] },
  fuel_4: { paths: ['M6.5 4.5h8.5v16h-8.5z', 'M8.5 8.5h4.5', 'M15 9l4 4v4a2 2 0 0 1-4 0v-2.5h2'] },
  fuel_5: { paths: ['M6 4h9v17H6z', 'M8 8h5', 'M15 6l4 4v8a2 2 0 0 1-4 0v-5'] },
  fuel_6: { paths: ['M7 5h8v15H7z', 'M9 9h4', 'M15 10h2a2 2 0 0 1 2 2v5a2 2 0 0 1-4 0v-2'] },
  fuel_7: { paths: ['M8 4h8v17H8z', 'M10 8h4', 'M16 9l3 3v5a2 2 0 0 1-3 1.7'] },
  fuel_8: { paths: ['M6.5 5h8v16h-8z', 'M8.5 9h4', 'M14.5 8.5 19 13v5a2 2 0 0 1-4 0v-3'] },
  fuel_9: { paths: ['M6 4h9v17H6z', 'M8 8h5', 'M15 11h2v6a2 2 0 0 0 4 0v-4l-4-4'] },
  fuel_10: { paths: ['M7 4h8v17H7z', 'M9 8h4', 'M15 9.5l4 3.5v4.5a2 2 0 0 1-4 0V15h2'] },
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
