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
  note: { paths: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6', 'M9 13h6', 'M9 17h4'] },
  exchange: { paths: ['M7 7h10l-3-3', 'M17 17H7l3 3', 'M17 7l-3 3', 'M7 17l3-3'] },
  home: { paths: ['M3 11 12 3l9 8', 'M5 10v10h14V10', 'M9 20v-6h6v6'] },
  food: { paths: ['M7 4v16', 'M4.5 4v5a2.5 2.5 0 0 0 5 0V4', 'M16.5 4v16', 'M16.5 4c2 1.5 3 3.5 3 6v2h-3'] },
  shopping: { paths: ['M4 6h2l2 9h8.5l2-6H7', 'M9 19h.01', 'M16 19h.01'] },
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






























  car_2: { paths: ['M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-2-2.4-3.2c-.4-.5-1-.8-1.6-.8H5.5c-.6 0-1.1.4-1.4.9L2.7 9.8A3.7 3.7 0 0 0 2 11.5V15c0 .6.4 1 1 1h2', 'M7 17h10'], circles: [{ cx: 7, cy: 17, r: 2 }, { cx: 17, cy: 17, r: 2 }] },
  car_3: { paths: ['M7 17h-3v-6l2-5h8l4 5v6h-3', 'M6 11h12', 'M6 8h8'], circles: [{ cx: 7, cy: 17, r: 2 }, { cx: 15, cy: 17, r: 2 }] },
  car_4: { paths: ['M5 17h-2v-6l2-5h12l4 5v6h-2', 'M5.5 11h13', 'M7 8h8.5'], circles: [{ cx: 7.5, cy: 17, r: 2 }, { cx: 17.5, cy: 17, r: 2 }] },
  car_5: { paths: ['M3 13h18l-2-5H5z', 'M5 13v4h14v-4', 'M7 17h.01', 'M17 17h.01', 'M7 10h10'] },
  car_6: { paths: ['M4 16h16', 'M6 16l1.5-5h9L18 16', 'M9 11l1.5-3h3L15 11'], circles: [{ cx: 8, cy: 18, r: 1.5 }, { cx: 16, cy: 18, r: 1.5 }] },
  car_7: { paths: ['M5 17H3v-4l2-4h14l2 4v4h-2', 'M6.5 12h11', 'M8 9h8'], circles: [{ cx: 7, cy: 17, r: 2 }, { cx: 17, cy: 17, r: 2 }] },
  car_8: { paths: ['M4 15h16l-1.5-4.5A2 2 0 0 0 16.6 9H7.4a2 2 0 0 0-1.9 1.5z', 'M6 15v3h12v-3'], circles: [{ cx: 8, cy: 18, r: 1.5 }, { cx: 16, cy: 18, r: 1.5 }] },
  car_9: { paths: ['M3 12h18v5H3z', 'M6 12l2-4h8l2 4', 'M8 17h.01', 'M16 17h.01'] },
  car_10: { paths: ['M4 14h16', 'M6 14l2-4h8l2 4', 'M6 14v3h12v-3'], circles: [{ cx: 8, cy: 17, r: 1.5 }, { cx: 16, cy: 17, r: 1.5 }] },
  transport: { paths: ['M6.5 5.5h11A1.5 1.5 0 0 1 19 7v10.5H5V7a1.5 1.5 0 0 1 1.5-1.5Z', 'M7.5 9h9', 'M7.5 13h9', 'M8.5 20h.01', 'M15.5 20h.01', 'M9 3.5h6'] },
  plane: { paths: ['M12 3.5c.6 0 1 .45 1 1.05v5.25l6.1 3.05c.35.18.55.55.55.95v1.2l-6.65-1.75v3.8l2.35 1.45v1.05L12 18.75l-3.35.8V18.5L11 17.05v-3.8L4.35 15v-1.2c0-.4.2-.77.55-.95L11 9.8V4.55c0-.6.4-1.05 1-1.05Z'] },










  plane_2: { paths: ['M4 16.5 20 7.5', 'M20 7.5l-2.2 8.2-4.1-3.4-3.4 4.1-1.6-.9 2.8-5.2-5.8-2.4z'] },
  plane_3: { paths: ['M2 16 22 8', 'M22 8l-3 10-5-4-4 5-2-1 3-6-7-3z'] },
  plane_4: { paths: ['M12 3.5c.6 0 1 .45 1 1.05v5.25l6.1 3.05c.35.18.55.55.55.95v1.2l-6.65-1.75v3.8l2.35 1.45v1.05L12 18.75l-3.35.8V18.5L11 17.05v-3.8L4.35 15v-1.2c0-.4.2-.77.55-.95L11 9.8V4.55c0-.6.4-1.05 1-1.05Z'] },
  plane_5: { paths: ['M2 21 23 12 2 3v7l15 2-15 2z'] },
  plane_6: { paths: ['M10.5 13.5 3 11l18-8-8 18-2.5-7.5Z', 'M21 3 10.5 13.5'] },
  plane_7: { paths: ['M22 2 11 13', 'M22 2l-7 20-4-9-9-4z'] },
  plane_8: { paths: ['M12 2 4 20l8-4 8 4z', 'M12 2v14'] },
  plane_9: { paths: ['M3 21h18', 'M5 17l14-9', 'M7 6l12 2-3 8'] },
  plane_10: { paths: ['M2 12h20', 'M15 5l7 7-7 7', 'M7 5l-5 7 5 7'] },
  holiday: { paths: ['M4 16.5 20 7.5', 'M20 7.5l-2.2 8.2-4.1-3.4-3.4 4.1-1.6-.9 2.8-5.2-5.8-2.4z'] },
  sun: { paths: ['M12 5V3', 'M12 21v-2', 'M5 12H3', 'M21 12h-2', 'M6.3 6.3 4.9 4.9', 'M19.1 19.1l-1.4-1.4', 'M17.7 6.3l1.4-1.4', 'M4.9 19.1l1.4-1.4'], circles: [{cx:12, cy:12, r:4}] },
  health: { paths: ['M9 3h6v6h6v6h-6v6H9v-6H3V9h6z'] },
  doctor: { paths: ['M5 11h14v9H5z', 'M8 11V8a4 4 0 0 1 8 0v3', 'M12 13v5', 'M9.5 15.5h5'] },
  pharmacy: { paths: ['M9 3h6v6h6v6h-6v6H9v-6H3V9h6z'] },
  work: { paths: ['M4 8h16v11H4z', 'M9 8V5h6v3', 'M4 12h16'] },
  salary: { paths: ['M4.5 7h13.5a2 2 0 0 1 2 2v9H4.5z', 'M4.5 7V5.5h12', 'M15.5 12.5H20v4h-4.5a2 2 0 0 1 0-4Z', 'M17.2 14.5h.01'] },

  salary_2: { paths: ['M4 7h16v11H4z', 'M4 7V5h14', 'M15 12h5v4h-5a2 2 0 0 1 0-4Z'] },
  salary_3: { paths: ['M3 7h18v10H3z', 'M7 10h.01', 'M17 14h.01'], circles: [{ cx: 12, cy: 12, r: 2.5 }] },
  salary_4: { paths: ['M12 6c-3 0-5 1-5 2.5S9 11 12 11s5-1 5-2.5S15 6 12 6Z', 'M7 8.5v5C7 15 9 16 12 16s5-1 5-2.5v-5', 'M7 13.5v2C7 17 9 18 12 18s5-1 5-2.5v-2'] },
  salary_5: { paths: ['M4 15h4l3 3h5l4-4', 'M4 11h4l2 2h4a2 2 0 0 1 0 4h-3', 'M15 8h5v5h-5z'] },
  salary_6: { paths: ['M12 3 5 6v6c0 5 7 9 7 9s7-4 7-9V6z', 'M12 8v8', 'M9.5 10.5c.5-1 4.5-1 5 0s-.5 2-2.5 2-3 .9-2.5 2 4.5 1 5 0'] },
  salary_7: { paths: ['M5 8h14v10H5z', 'M7 6h10', 'M9 4h6', 'M8 12h.01', 'M16 14h.01'], circles: [{ cx: 12, cy: 13, r: 2 }] },
  salary_8: { paths: ['M8 7h8l-2-3h-4z', 'M6 11a6 6 0 0 1 12 0v3a6 6 0 0 1-12 0z', 'M12 11v5', 'M10 13h4'] },
  salary_9: { paths: ['M4 6h16v12H4z', 'M4 10h16', 'M7 15h5', 'M16 14h.01'] },
  salary_10: { paths: ['M7 4h10v16l-2-1.3-3 1.3-3-1.3L7 20z', 'M10 9h4', 'M10 13h4', 'M12 8v7'] },
  bills: { paths: ['M7 4h10v16l-2-1.3-3 1.3-3-1.3L7 20z', 'M9.5 8h5', 'M9.5 12h5', 'M9.5 16h3'] },
  bills_2: { paths: ['M7 4h10v16l-2-1.3-3 1.3-3-1.3L7 20z', 'M9.5 8h5', 'M9.5 12h5', 'M9.5 16h3'] },
  bills_3: { paths: ['M6 3h12v18l-3-2-3 2-3-2-3 2z', 'M9 8h6', 'M9 12h6', 'M9 16h3'] },
  bills_4: { paths: ['M6 4h9l3 3v13H6z', 'M15 4v3h3', 'M9 11h6', 'M9 15h5'] },
  bills_5: { paths: ['M8 5h8v15H8z', 'M9.5 3.5h5L16 5H8z', 'M10 10h4', 'M10 14h4'] },
  bills_6: { paths: ['M7 4h10v16l-2-1-3 1-3-1-2 1z', 'M9 12l2 2 4-5'] },
  bills_7: { paths: ['M6 4h12v16H6z', 'M9 8h6', 'M9 12h4', 'M12 16v-4', 'M10 14h4'] },
  bills_8: { paths: ['M8 4h9a2 2 0 0 1 0 4H8', 'M8 4v16h9a2 2 0 0 0 0-4H8'] },
  bills_9: { paths: ['M5 4h14v16H5z', 'M8 8h8', 'M8 12h8', 'M8 16h5'] },
  bills_10: { paths: ['M6 4h12v16H6z', 'M9 9h6', 'M9 13h4', 'M15 15l2 2 3-4'] },
  bill: { paths: ['M7 4h10v16l-2-1.3-3 1.3-3-1.3L7 20z', 'M9.5 8h5', 'M9.5 12h5', 'M9.5 16h3'] },
  electricity: { paths: ['M13 3 6.5 13h5L10 21l7.5-11h-5z'] },
  electricity_2: { paths: ['M13 2 4 14h7l-1 8 10-13h-7z'] },
  electricity_3: { paths: ['M13 3 6.5 13h5L10 21l7.5-11h-5z'] },
  electricity_4: { paths: ['M7 2v8', 'M17 2v8', 'M6 10h12v4a6 6 0 0 1-12 0z', 'M12 20v2'] },
  electricity_5: { paths: ['M8 7h8v10H8z', 'M10 3v4', 'M14 3v4', 'M10 17v4', 'M14 17v4'] },
  electricity_6: { paths: ['M12 2v8', 'M8 6a6 6 0 1 0 8 0'] },
  electricity_7: { paths: ['M7 7h10v10H7z', 'M17 10h2v4h-2', 'M10 12h4', 'M12 10v4'] },
  electricity_8: { paths: ['M9 18h6', 'M10 22h4', 'M8 10a4 4 0 1 1 8 0c0 2-1.5 3-2.5 4H10.5C9.5 13 8 12 8 10Z', 'M12 2v2'] },
  electricity_9: { paths: ['M4 20c5-7 11-9 16-16', 'M8 16l-2 4', 'M16 8l4-2'] },
  electricity_10: { paths: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M13 7l-4 6h4l-2 4 5-7h-4z'] },
  internet: { paths: ['M4.5 8a11 11 0 0 1 15 0', 'M7.5 12a7 7 0 0 1 9 0', 'M10.2 16a3 3 0 0 1 3.6 0', 'M12 20h.01'] },
  internet_2: { paths: ['M4.5 8a11 11 0 0 1 15 0', 'M7.5 12a7 7 0 0 1 9 0', 'M10.2 16a3 3 0 0 1 3.6 0', 'M12 20h.01'] },
  internet_3: { paths: ['M6 13h12v6H6z', 'M8 13V9a4 4 0 0 1 8 0v4', 'M9 16h.01', 'M15 16h.01'] },
  internet_4: { paths: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M3 12h18', 'M12 3c3 3 3 15 0 18', 'M12 3c-3 3-3 15 0 18'] },
  internet_5: { paths: ['M6 6h12v12H6z', 'M12 6v12', 'M6 12h12', 'M4 4h4', 'M16 4h4', 'M4 16h4', 'M16 16h4'] },
  internet_6: { paths: ['M4 18h3V9H4z', 'M10.5 18h3V5h-3z', 'M17 18h3V12h-3z'] },
  internet_7: { paths: ['M12 18h.01', 'M8 14a6 6 0 0 1 8 0', 'M5 11a10 10 0 0 1 14 0', 'M12 18V8'] },
  internet_8: { paths: ['M7 4h10v8H7z', 'M9 12v8', 'M15 12v8', 'M7 20h10'] },
  internet_9: { paths: ['M4 5h16v14H4z', 'M4 9h16', 'M8 7h.01', 'M12 7h.01'] },
  internet_10: { paths: ['M6 18h12a4 4 0 0 0 0-8 6 6 0 0 0-11.5 2A3 3 0 0 0 6 18Z'] },
  phone: { paths: ['M8 4h8v16H8z', 'M11 17.5h2'] },
  phone_2: { paths: ['M8 4h8v16H8z', 'M11 17.5h2'] },
  phone_3: { paths: ['M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8L7.8 9.7a16 16 0 0 0 6.5 6.5l1.2-1.2a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 2Z'] },
  phone_4: { paths: ['M7 2h10v20H7z', 'M11 18h2', 'M10 5h4'] },
  phone_5: { paths: ['M15 5a5 5 0 0 1 4 4', 'M15 9a1 1 0 0 1 1 1', 'M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8L7.8 9.7a16 16 0 0 0 6.5 6.5l1.2-1.2a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 2Z'] },
  phone_6: { paths: ['M8 3h8l3 3v15H8z', 'M16 3v3h3', 'M11 11h4', 'M11 15h2'] },
  phone_7: { paths: ['M6 3h12v18H6z', 'M10 18h4'] },
  phone_8: { paths: ['M8 3h8v18H8z', 'M11 18h2', 'M18 8h2v5h-2'] },
  phone_9: { paths: ['M8 4h8v16H8z', 'M6 8h12v7H6z', 'M9 11h6'] },
  phone_10: { paths: ['M8 4h8v16H8z', 'M10 9a2 2 0 1 0 4 0 2 2 0 0 0-4 0', 'M9 16c1-2 5-2 6 0'] },
  education: { paths: ['M3.5 9 12 5l8.5 4-8.5 4z', 'M6.5 11.5v4.5c2.8 2 8.2 2 11 0v-4.5'] },
  education_2: { paths: ['M3.5 9 12 5l8.5 4-8.5 4z', 'M6.5 11.5v4.5c2.8 2 8.2 2 11 0v-4.5'] },
  education_3: { paths: ['M5 20V9l7-5 7 5v11', 'M9 20v-6h6v6', 'M4 20h16'] },
  education_4: { paths: ['M7 4h10v12H7z', 'M9 8h6', 'M9 12h4', 'M10 16l-2 5 4-2 4 2-2-5'] },
  education_5: { paths: ['M6 4h12v16H6z', 'M9 8h6', 'M9 12h6', 'M9 16h4'] },
  education_6: { paths: ['M4 20l4-1 10-10-3-3L5 16z', 'M14 6l3 3', 'M12 20h8'] },
  education_7: { paths: ['M4 5h16v11H4z', 'M8 20h8', 'M12 16v4', 'M8 9h8'] },
  education_8: { paths: ['M6 4h12v14H6z', 'M9 8h6', 'M9 12h6', 'M10 18l-2 4 4-2 4 2-2-4'] },
  education_9: { paths: ['M12 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z', 'M6 21c1.2-4 10.8-4 12 0', 'M4 9l8-4 8 4'] },
  education_10: { paths: ['M3.5 9 12 4.5 20.5 9', 'M5 10h14', 'M6 10v8', 'M10 10v8', 'M14 10v8', 'M18 10v8', 'M4.5 20h15'] },
  books: { paths: ['M5.5 5h5.5v15H5.5z', 'M13 4.5h5.5V20H13z', 'M7.5 8h1.5', 'M15 8h1.5'] },
  books_2: { paths: ['M4 6.5A2.5 2.5 0 0 1 6.5 4H12v16H6.5A2.5 2.5 0 0 1 4 17.5z', 'M12 4h5.5A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5H12'] },
  books_3: { paths: ['M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z', 'M7 4v16'] },
  books_4: { paths: ['M3.5 9 12 4.5 20.5 9', 'M5 10h14', 'M6 10v8', 'M10 10v8', 'M14 10v8', 'M18 10v8', 'M4.5 20h15'] },
  books_5: { paths: ['M5 5h4v15H5z', 'M10 4h4v16h-4z', 'M15 6h4v14h-4z', 'M6 8h2', 'M11 8h2', 'M16 10h2'] },
  books_6: { paths: ['M6 4h12v16l-6-3-6 3z'] },
  books_7: { paths: ['M6 4h12v16H6z', 'M8 4v16', 'M10 8h5', 'M10 12h5'] },
  books_8: { paths: ['M6 4h12v16H6z', 'M9 8h6', 'M9 12h6', 'M9 16h4'] },
  books_9: { paths: ['M4 7a3 3 0 0 1 3-3h5v16H7a3 3 0 0 1-3-3z', 'M12 4h5a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-5'] },
  books_10: { paths: ['M4 5h4v15H4z', 'M10 5h4v15h-4z', 'M16 5h4v15h-4z', 'M4 20h16'] },
  sport: { paths: ['M5 19 19 5', 'M7 7a8 8 0 0 0 10 10', 'M5 12a7 7 0 0 0 7 7', 'M12 5a7 7 0 0 1 7 7'] },
  sport_2: { paths: ['M5 19 19 5', 'M7 7a8 8 0 0 0 10 10', 'M5 12a7 7 0 0 0 7 7', 'M12 5a7 7 0 0 1 7 7'] },
  sport_3: { paths: ['M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z', 'M12 4v16', 'M4 12h16', 'M7 7c2 1.5 8 1.5 10 0', 'M7 17c2-1.5 8-1.5 10 0'] },
  sport_4: { paths: ['M4 10v4', 'M6.5 9v6', 'M9 12h6', 'M17.5 9v6', 'M20 10v4'] },
  sport_5: { paths: ['M7 6h10v5a5 5 0 0 1-10 0z', 'M9 21h6', 'M12 16v5', 'M5 8h2', 'M17 8h2'] },
  sport_6: { paths: ['M8 3h8v5a4 4 0 0 1-8 0z', 'M12 12v9', 'M9 21h6', 'M8 3 6 7', 'M16 3l2 4'] },
  sport_7: { paths: ['M13 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z', 'M6 21l3-6 3-2 2 3 4 1', 'M10 13l2-4 4 2', 'M7 11l3 2'] },
  sport_8: { paths: ['M6 18a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M18 18a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M6 14h4l3-6h3l2 6', 'M10 14h4'] },
  sport_9: { paths: ['M4 13h4l2-5 4 10 2-5h4'] },
  sport_10: { paths: ['M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z', 'M8 7c3 2 5 2 8 0', 'M8 17c3-2 5-2 8 0', 'M6 12h12'] },
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
  fuel: { paths: ['M6 4h9v17H6z', 'M8 8h5', 'M15 9l4 4v5a2 2 0 0 1-4 0v-3h2'] },
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
