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

  transport: { paths: ['M6.5 5.5h11A1.5 1.5 0 0 1 19 7v10.5H5V7a1.5 1.5 0 0 1 1.5-1.5Z', 'M7.5 9h9', 'M7.5 13h9', 'M8.5 20h.01', 'M15.5 20h.01', 'M9 3.5h6'] },
  plane: { paths: ['M12 3.5c.6 0 1 .45 1 1.05v5.25l6.1 3.05c.35.18.55.55.55.95v1.2l-6.65-1.75v3.8l2.35 1.45v1.05L12 18.75l-3.35.8V18.5L11 17.05v-3.8L4.35 15v-1.2c0-.4.2-.77.55-.95L11 9.8V4.55c0-.6.4-1.05 1-1.05Z'] },

  plane_2: { paths: ['M12 3.5c.6 0 1 .45 1 1.05v5.25l6.1 3.05c.35.18.55.55.55.95v1.2l-6.65-1.75v3.8l2.35 1.45v1.05L12 18.75l-3.35.8V18.5L11 17.05v-3.8L4.35 15v-1.2c0-.4.2-.77.55-.95L11 9.8V4.55c0-.6.4-1.05 1-1.05Z'] },
  plane_3: { paths: ['M10.8 4.2h2.4l1.2 6.1 5.4 3.1v1.8l-5.9-1.6-.9 4.1 2.1 1.4v1.2l-3.1-.8-3.1.8v-1.2l2.1-1.4-.9-4.1-5.9 1.6v-1.8l5.4-3.1z'] },
  plane_4: { paths: ['M4 15.8 20 8.2', 'M20 8.2l-2.6 8.4-4.3-3.1-3.7 4.2-1.6-.9 3-5.2-6.1-2.1z'] },
  plane_5: { paths: ['M3.5 16.5 20.5 7.5', 'M20.5 7.5l-2 8.5-4.6-3.2-3.5 4.6-1.7-.9 2.8-5.5-6.4-2.1z'] },
  plane_6: { paths: ['M12 3.7c.6 0 1 .4 1 1v5.1l6.4 3.2c.35.18.55.55.55.95v1.1L13 13.5v3.7l2.7 1.5v1L12 18.9l-3.7.8v-1l2.7-1.5v-3.7l-6.95 1.55v-1.1c0-.4.2-.77.55-.95L11 9.8V4.7c0-.6.4-1 1-1Z'] },
  plane_7: { paths: ['M5 18.5 19.5 5.5', 'M19.5 5.5 18 15l-4.8-2.4-3.2 4.8-1.8-1 2.2-5.7-5.9-1.4z'] },
  plane_8: { paths: ['M4 14.8 20 9.2', 'M20 9.2 17.2 17l-4.2-3.5-3.6 4.2-1.5-.9 2.7-5-5.8-2.2z'] },
  plane_9: { paths: ['M12 2.8c.7 0 1.1.5 1.1 1.2v5.8l6.3 3.4c.35.2.55.55.55.95v1.25l-6.85-1.9v3.9l2.45 1.5v1.05L12 19.15l-3.55.8V18.9l2.45-1.5v-3.9l-6.85 1.9v-1.25c0-.4.2-.75.55-.95l6.3-3.4V4c0-.7.4-1.2 1.1-1.2Z'] },
  plane_10: { paths: ['M3.8 16.2 20.2 7.8', 'M20.2 7.8l-2.3 8.7-4.5-3.4-3.6 4.6-1.6-.9 2.9-5.4-6.2-2.2z'] },
  holiday: { paths: ['M4 16.5 20 7.5', 'M20 7.5l-2.2 8.2-4.1-3.4-3.4 4.1-1.6-.9 2.8-5.2-5.8-2.4z'] },
  sun: { paths: ['M12 5V3', 'M12 21v-2', 'M5 12H3', 'M21 12h-2', 'M6.3 6.3 4.9 4.9', 'M19.1 19.1l-1.4-1.4', 'M17.7 6.3l1.4-1.4', 'M4.9 19.1l1.4-1.4'], circles: [{cx:12, cy:12, r:4}] },
  health: { paths: ['M9 3h6v6h6v6h-6v6H9v-6H3V9h6z'] },
  doctor: { paths: ['M5 11h14v9H5z', 'M8 11V8a4 4 0 0 1 8 0v3', 'M12 13v5', 'M9.5 15.5h5'] },
  pharmacy: { paths: ['M9 3h6v6h6v6h-6v6H9v-6H3V9h6z'] },
  work: { paths: ['M4 8h16v11H4z', 'M9 8V5h6v3', 'M4 12h16'] },
  salary: { paths: ['M4 7h16v11H4z', 'M4 7V5h14', 'M15 12h5v4h-5a2 2 0 0 1 0-4Z'] },
  bills: { paths: ['M6 3h12v18l-3-2-3 2-3-2-3 2z', 'M9 8h6', 'M9 12h6', 'M9 16h3'] },
  bill: { paths: ['M7 4h10v16l-2-1.3-3 1.3-3-1.3L7 20z', 'M9.5 8h5', 'M9.5 12h5', 'M9.5 16h3'] },
  electricity: { paths: ['M13 3 6.5 13h5L10 21l7.5-11h-5z'] },
  internet: { paths: ['M4.5 8a11 11 0 0 1 15 0', 'M7.5 12a7 7 0 0 1 9 0', 'M10.2 16a3 3 0 0 1 3.6 0', 'M12 20h.01'] },
  phone: { paths: ['M15 5a5 5 0 0 1 4 4', 'M15 9a1 1 0 0 1 1 1', 'M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8L7.8 9.7a16 16 0 0 0 6.5 6.5l1.2-1.2a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 2Z'] },
  education: { paths: ['M3.5 9 12 5l8.5 4-8.5 4z', 'M6.5 11.5v4.5c2.8 2 8.2 2 11 0v-4.5'] },
  books: { paths: ['M5 5h4v15H5z', 'M10 4h4v16h-4z', 'M15 6h4v14h-4z', 'M6 8h2', 'M11 8h2', 'M16 10h2'] },
  sport: { paths: ['M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z', 'M8 7c3 2 5 2 8 0', 'M8 17c3-2 5-2 8 0', 'M6 12h12'] },
  gym: { paths: ['M4 10.5v3', 'M6.5 9v6', 'M9 12h6', 'M17.5 9v6', 'M20 10.5v3'] },
  gym_2: { paths: ['M4 10.5v3', 'M6.5 9v6', 'M9 12h6', 'M17.5 9v6', 'M20 10.5v3'] },
  gym_3: { paths: ['M3.5 11v2', 'M6 8.5v7', 'M8.5 12h7', 'M18 8.5v7', 'M20.5 11v2'] },
  gym_4: { paths: ['M5 9v6', 'M8 10.5v3', 'M10 12h4', 'M16 10.5v3', 'M19 9v6'] },
  gym_5: { paths: ['M4 12h16', 'M6 9v6', 'M18 9v6', 'M8 10v4', 'M16 10v4'] },
  gym_6: { paths: ['M6 8v8', 'M9 10v4', 'M11 12h2', 'M15 10v4', 'M18 8v8'] },
  gym_7: { paths: ['M4 13h16', 'M5.5 10v6', 'M8 11.5v3', 'M16 11.5v3', 'M18.5 10v6'] },
  gym_8: { paths: ['M4 11.5v1', 'M6 9v6', 'M8.5 12h7', 'M18 9v6', 'M20 11.5v1'] },
  gym_9: { paths: ['M6 7.5v9', 'M9 10v4', 'M12 12h.01', 'M15 10v4', 'M18 7.5v9'] },
  gym_10: { paths: ['M3.5 12h17', 'M5 10v4', 'M7 8.5v7', 'M17 8.5v7', 'M19 10v4'] },
  gaming: { paths: ['M5 6h10v8H5z', 'M8 18h4', 'M10 14v4', 'M17 8h2v10h-2', 'M18 5.5h.01'] },
  gaming_2: { paths: ['M6 10h12a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3l-3-3H9l-3 3a3 3 0 0 1-3-3v-3a3 3 0 0 1 3-3Z', 'M8 14h4', 'M10 12v4', 'M16 13h.01', 'M18 15h.01'] },
  gaming_3: { paths: ['M5 6h14v10H5z', 'M9 20h6', 'M12 16v4'] },
  gaming_4: { paths: ['M7 4h10v16H7z', 'M10 8h4', 'M10 16h4', 'M12 12h.01'] },
  gaming_5: { paths: ['M4 8h16v10H4z', 'M8 13h4', 'M10 11v4', 'M16 12h.01', 'M18 14h.01'] },
  gaming_6: { paths: ['M7 5h10v14H7z', 'M9 9h6', 'M9 13h6', 'M11 17h2'] },
  gaming_7: { paths: ['M6 9h12l2 4v3a3 3 0 0 1-5 2l-2-2h-2l-2 2a3 3 0 0 1-5-2v-3z', 'M8 13h4', 'M10 11v4'] },
  gaming_8: { paths: ['M5 7h10v8H5z', 'M8 19h4', 'M10 15v4', 'M17 9h2v9h-2'] },
  gaming_9: { paths: ['M5 6h14v11H5z', 'M8 20h8', 'M12 17v3', 'M8 10h3', 'M15 10h1'] },
  gaming_10: { paths: ['M6 11h12a2 2 0 0 1 2 2v3a3 3 0 0 1-5 2l-2-2h-2l-2 2a3 3 0 0 1-5-2v-3a2 2 0 0 1 2-2Z', 'M8 15h4', 'M10 13v4', 'M16 14h.01', 'M18 16h.01'] },
  entertainment: { paths: ['M5 8h14l1 10H4z', 'M8 12h4', 'M10 10v4', 'M16 13h.01', 'M18 11h.01'] },
  cinema: { paths: ['M5 7.5h14v10H5z', 'M8 7.5l2 3', 'M12 7.5l2 3', 'M16 7.5l2 3', 'M8.5 14.5h7'] },
  cinema_2: { paths: ['M5 7.5h14v10H5z', 'M8 7.5l2 3', 'M12 7.5l2 3', 'M16 7.5l2 3', 'M8.5 14.5h7'] },
  cinema_3: { paths: ['M4 6h16v12H4z', 'M4 10h16', 'M8 6l2 4', 'M12 6l2 4', 'M16 6l2 4'] },
  cinema_4: { paths: ['M6 5h12v14H6z', 'M9 5v14', 'M15 5v14', 'M6 9h12', 'M6 15h12'] },
  cinema_5: { paths: ['M5 8h14l1 10H4z', 'M8 12h4', 'M10 10v4', 'M16 13h.01', 'M18 11h.01'] },
  cinema_6: { paths: ['M6 4h12v16H6z', 'M9 8h6', 'M9 12h6', 'M9 16h4'] },
  cinema_7: { paths: ['M4 7h16v10H4z', 'M8 20h8', 'M12 17v3', 'M9 10l5 2-5 2z'] },
  cinema_8: { paths: ['M5 6h14v12H5z', 'M9 6v12', 'M15 6v12', 'M5 10h14', 'M5 14h14'] },
  cinema_9: { paths: ['M4 8h16v9H4z', 'M7 8l2 3', 'M11 8l2 3', 'M15 8l2 3', 'M8 14h8'] },
  cinema_10: { paths: ['M6 5h12v14H6z', 'M10 9l5 3-5 3z'] },
  gift: { paths: ['M4.5 10h15v10h-15z', 'M12 10v10', 'M4.5 14h15', 'M8.5 10a2.5 2.5 0 1 1 3.5 0', 'M15.5 10a2.5 2.5 0 1 0-3.5 0'] },
  gift_2: { paths: ['M4.5 10h15v10h-15z', 'M12 10v10', 'M4.5 14h15', 'M8.5 10a2.5 2.5 0 1 1 3.5 0', 'M15.5 10a2.5 2.5 0 1 0-3.5 0'] },
  gift_3: { paths: ['M5 9h14v12H5z', 'M3 9h18V6H3z', 'M12 6v15'] },
  gift_4: { paths: ['M4 8h16v4H4z', 'M6 12h12v8H6z', 'M12 8v12', 'M8 8c-2 0-2-3 0-3 1.5 0 3 3 4 3', 'M16 8c2 0 2-3 0-3-1.5 0-3 3-4 3'] },
  gift_5: { paths: ['M5 10h14v10H5z', 'M5 14h14', 'M12 10v10'] },
  gift_6: { paths: ['M4 9h16v11H4z', 'M7 9V6h10v3', 'M12 9v11'] },
  gift_7: { paths: ['M6 10h12v10H6z', 'M4 10h16V7H4z', 'M12 7v13'] },
  gift_8: { paths: ['M5 8h14v12H5z', 'M12 8v12', 'M5 12h14', 'M9 8c-2 0-2-3 0-3 1.5 0 2.5 3 3 3', 'M15 8c2 0 2-3 0-3-1.5 0-2.5 3-3 3'] },
  gift_9: { paths: ['M6 11h12v9H6z', 'M4 8h16v3H4z', 'M12 8v12'] },
  gift_10: { paths: ['M5 9h14v11H5z', 'M5 13h14', 'M12 9v11', 'M8.5 9a2 2 0 1 1 3.5 0', 'M15.5 9a2 2 0 1 0-3.5 0'] },
  clothes: { paths: ['M8 5 5.5 7.5v4l2.5-1V20h8v-9.5l2.5 1v-4L16 5', 'M8 5c1 2 7 2 8 0'] },
  clothes_2: { paths: ['M8 5 5.5 7.5v4l2.5-1V20h8v-9.5l2.5 1v-4L16 5', 'M8 5c1 2 7 2 8 0'] },
  clothes_3: { paths: ['M9 4h6l4 4-2.5 3L15 9.5V20H9V9.5L7.5 11 5 8z'] },
  clothes_4: { paths: ['M8 4h8l3 5-3 2v9H8v-9L5 9z'] },
  clothes_5: { paths: ['M7 4h10v16H7z', 'M9 4c.5 2 5.5 2 6 0'] },
  clothes_6: { paths: ['M8 5h8l3 4-2 2-1-1v10H8V10l-1 1-2-2z', 'M10 5c.5 1.5 3.5 1.5 4 0'] },
  clothes_7: { paths: ['M6 7l4-3h4l4 3v13H6z', 'M10 4c0 2 4 2 4 0'] },
  clothes_8: { paths: ['M8 4h8v16H8z', 'M8 8H5l3-4', 'M16 8h3l-3-4'] },
  clothes_9: { paths: ['M7 5h10l2 4-3 2v9H8v-9L5 9z', 'M10 5c.6 1.4 3.4 1.4 4 0'] },
  clothes_10: { paths: ['M9 4h6l4 5-2.5 2L15 9v11H9V9l-1.5 2L5 9z'] },
  pets: { paths: ['M6.5 10h.01', 'M10 7.5h.01', 'M14 7.5h.01', 'M17.5 10h.01', 'M7.5 18c.8-4 8.2-4 9 0 1 3-10 3-9 0Z'] },
  pets_2: { paths: ['M6.5 10h.01', 'M10 7.5h.01', 'M14 7.5h.01', 'M17.5 10h.01', 'M7.5 18c.8-4 8.2-4 9 0 1 3-10 3-9 0Z'] },
  pets_3: { paths: ['M4 12c0-4 3-7 8-7s8 3 8 7c0 5-4 8-8 8s-8-3-8-8Z', 'M9 11h.01', 'M15 11h.01', 'M10 15c1 1 3 1 4 0'] },
  pets_4: { paths: ['M5 12h14l-2 7H7z', 'M8 12V8a4 4 0 0 1 8 0v4', 'M9 16h.01', 'M15 16h.01'] },
  pets_5: { paths: ['M7 10c-2 0-3-2-2-3.5C6 5 8 6 8 8', 'M17 10c2 0 3-2 2-3.5C18 5 16 6 16 8', 'M8 10c0-3 8-3 8 0v5c0 3-8 3-8 0z', 'M10 13h.01', 'M14 13h.01'] },
  pets_6: { paths: ['M8 5c4-2 8 1 8 5v5c0 3-8 3-8 0v-5c0-2 1-4 4-5', 'M10 12h.01', 'M14 12h.01', 'M11 15h2'] },
  pets_7: { paths: ['M6 12c0-4 3-7 6-7s6 3 6 7-3 8-6 8-6-4-6-8Z', 'M9 11h.01', 'M15 11h.01', 'M10 15h4'] },
  pets_8: { paths: ['M7 11h10v8H7z', 'M9 11V8a3 3 0 0 1 6 0v3', 'M9 15h.01', 'M15 15h.01'] },
  pets_9: { paths: ['M8 10h8l2 4-2 5H8l-2-5z', 'M9 7l2 3', 'M15 7l-2 3', 'M10 14h.01', 'M14 14h.01'] },
  pets_10: { paths: ['M7 17c1-5 9-5 10 0 1 4-11 4-10 0Z', 'M6 10h.01', 'M10 7h.01', 'M14 7h.01', 'M18 10h.01'] },
  child: { paths: ['M9.5 9a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0', 'M7.5 18.5c1-2.2 2.5-3.3 4.5-3.3s3.5 1.1 4.5 3.3', 'M8 12.5c1.2 1 2.5 1.5 4 1.5s2.8-.5 4-1.5'] },
  child_2: { paths: ['M9.5 9a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0', 'M7.5 18.5c1-2.2 2.5-3.3 4.5-3.3s3.5 1.1 4.5 3.3', 'M8 12.5c1.2 1 2.5 1.5 4 1.5s2.8-.5 4-1.5'] },
  child_3: { paths: ['M12 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z', 'M6 21c1.2-4 10.8-4 12 0'] },
  child_4: { paths: ['M12 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z', 'M8 14h8l1 6H7z'] },
  child_5: { paths: ['M10 7a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z', 'M7 20c1-4 9-4 10 0', 'M8 12c2 2 6 2 8 0'] },
  child_6: { paths: ['M8 9a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z', 'M7 21c1-4 9-4 10 0'] },
  child_7: { paths: ['M9 8a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z', 'M6 20c1.5-3.5 10.5-3.5 12 0', 'M8 13h8'] },
  child_8: { paths: ['M12 5a3 3 0 0 0-3 3c0 2 1.5 3 3 3s3-1 3-3a3 3 0 0 0-3-3Z', 'M8 15c1.5 2 6.5 2 8 0', 'M7 21c1-3 9-3 10 0'] },
  child_9: { paths: ['M10 8a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z', 'M9 13h6v7H9z', 'M7 16h10'] },
  child_10: { paths: ['M9 7a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z', 'M6 20c1-4 11-4 12 0'] },
  savings: { paths: ['M3.5 9 12 4.5 20.5 9', 'M5 10h14', 'M6 10v8', 'M10 10v8', 'M14 10v8', 'M18 10v8', 'M4.5 20h15'] },
  cash: { paths: ['M4.5 7.5h15v9h-15z', 'M8 10.5h.01', 'M16 13.5h.01'], circles: [{cx:12, cy:12, r:2.2}] },
  cash_2: { paths: ['M4.5 7.5h15v9h-15z', 'M8 10.5h.01', 'M16 13.5h.01'], circles: [{ cx: 12, cy: 12, r: 2.2 }] },
  cash_3: { paths: ['M3 7h18v10H3z', 'M7 10h.01', 'M17 14h.01'], circles: [{ cx: 12, cy: 12, r: 2.5 }] },
  cash_4: { paths: ['M5 8h14v10H5z', 'M7 6h10', 'M9 4h6', 'M8 12h.01', 'M16 14h.01'], circles: [{ cx: 12, cy: 13, r: 2 }] },
  cash_5: { paths: ['M12 6c-3 0-5 1-5 2.5S9 11 12 11s5-1 5-2.5S15 6 12 6Z', 'M7 8.5v5C7 15 9 16 12 16s5-1 5-2.5v-5', 'M7 13.5v2C7 17 9 18 12 18s5-1 5-2.5v-2'] },
  cash_6: { paths: ['M8 7h8l-2-3h-4z', 'M6 11a6 6 0 0 1 12 0v3a6 6 0 0 1-12 0z', 'M12 11v5', 'M10 13h4'] },
  cash_7: { paths: ['M4 8h16v10H4z', 'M8 12h.01', 'M16 14h.01', 'M12 10v6', 'M10 12h4'] },
  cash_8: { paths: ['M6 7h12v10H6z', 'M4 9h16v10H4z', 'M8 13h.01', 'M16 15h.01'] },
  cash_9: { paths: ['M5 8h14v9H5z', 'M7 10h10', 'M7 15h10'], circles: [{ cx: 12, cy: 12.5, r: 2 }] },
  cash_10: { paths: ['M4 7h16v10H4z', 'M12 9v6', 'M9.5 11c.5-1 4.5-1 5 0s-.5 2-2.5 2-3 .9-2.5 2 4.5 1 5 0'] },
  card: { paths: ['M4.5 6.5h15v11h-15z', 'M4.5 10h15', 'M7.5 14.5h4'] },
  card_2: { paths: ['M4.5 6.5h15v11h-15z', 'M4.5 10h15', 'M7.5 14.5h4'] },
  card_3: { paths: ['M3 6h18v12H3z', 'M3 10h18', 'M7 15h5'] },
  card_4: { paths: ['M4 7h16v10H4z', 'M4 11h16', 'M7 14h4', 'M16 14h1'] },
  card_5: { paths: ['M5 6h14v12H5z', 'M5 10h14', 'M8 15h5'] },
  card_6: { paths: ['M4 8h16v10H4z', 'M6 11h12', 'M8 15h4'] },
  card_7: { paths: ['M6 5h12v14H6z', 'M8 9h8', 'M8 13h5'] },
  card_8: { paths: ['M4 7h16v11H4z', 'M4 11h16', 'M16 15h2', 'M7 15h5'] },
  card_9: { paths: ['M5 8h14v9H5z', 'M5 11h14', 'M8 15h4', 'M16 15h1'] },
  card_10: { paths: ['M4 6h16v12H4z', 'M4 10h16', 'M7 14h4', 'M15 14h3'] },
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
