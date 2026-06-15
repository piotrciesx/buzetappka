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
  exchange: { paths: ['M7 7a7 7 0 0 1 10 0l2 2', 'M19 4v5h-5', 'M17 17a7 7 0 0 1-10 0l-2-2', 'M5 20v-5h5'] },
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
  plane: { paths: ['M10.8 4.2h2.4l1.2 6.1 5.4 3.1v1.8l-5.9-1.6-.9 4.1 2.1 1.4v1.2l-3.1-.8-3.1.8v-1.2l2.1-1.4-.9-4.1-5.9 1.6v-1.8l5.4-3.1z'] },
  holiday: { paths: ['M4 16.5 20 7.5', 'M20 7.5l-2.2 8.2-4.1-3.4-3.4 4.1-1.6-.9 2.8-5.2-5.8-2.4z'] },
  sun: { paths: ['M12 4V2', 'M12 22v-2', 'M4 12H2', 'M22 12h-2', 'M5.6 5.6 4.2 4.2', 'M19.8 19.8l-1.4-1.4', 'M18.4 5.6l1.4-1.4', 'M4.2 19.8l1.4-1.4'], circles: [{ cx: 12, cy: 12, r: 5 }] },
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
  gaming: { paths: ['M6 5h12v10H6z', 'M4 19h16', 'M8 15l-2 4', 'M16 15l2 4'] },
  entertainment: { paths: ['M5 8h14l1 10H4z', 'M8 12h4', 'M10 10v4', 'M16 13h.01', 'M18 11h.01'] },
  cinema: { paths: ['M4 6h16v12H4z', 'M4 10h16', 'M8 6l2 4', 'M12 6l2 4', 'M16 6l2 4'] },
  gift: { paths: ['M4 8h16v4H4z', 'M6 12h12v8H6z', 'M12 8v12', 'M8 8c-2 0-2-3 0-3 1.5 0 3 3 4 3', 'M16 8c2 0 2-3 0-3-1.5 0-3 3-4 3'] },
  clothes: { paths: ['M8 5 5.5 7.5v4l2.5-1V20h8v-9.5l2.5 1v-4L16 5', 'M8 5c1 2 7 2 8 0'] },
  pets: { paths: ['M7 17c1-5 9-5 10 0 1 4-11 4-10 0Z', 'M6 10h.01', 'M10 7h.01', 'M14 7h.01', 'M18 10h.01'] },
  child: { paths: ['M12 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z', 'M8 14h8l1 6H7z'] },
  child_2: { paths: ['M6.5 11.2c0-4 2.5-7 5.5-7s5.5 3 5.5 7c0 4.7-3 7.3-5.5 7.3s-5.5-2.6-5.5-7.3Z', 'M9 8.2c1-2.2 5-2.2 6 0', 'M10 11.5h.01', 'M14 11.5h.01', 'M9.8 14.7c1.4 1.1 3 1.1 4.4 0'] },
  child_3: { paths: ['M7 11a5 5 0 1 0 10 0 5 5 0 0 0-10 0Z', 'M12 6c-.6-1.5 1.4-2.4 2.8-1.2', 'M10 11.5h.01', 'M14 11.5h.01', 'M10 14.5c1.2 1 2.8 1 4 0'] },
  child_4: { paths: ['M6.8 11.4a5.2 5.2 0 1 0 10.4 0 5.2 5.2 0 0 0-10.4 0Z', 'M8.8 8.2c.8-1.4 2-2.1 3.2-2.1s2.4.7 3.2 2.1', 'M10 11.5h.01', 'M14 11.5h.01', 'M10.2 15c1 .8 2.6 .8 3.6 0'] },
  child_5: { paths: ['M6.5 11.3a5.5 5.5 0 1 0 11 0 5.5 5.5 0 0 0-11 0Z', 'M9 8c1-2 5-2 6 0', 'M8 10.5c-1.6 0-2.5 1-2.5 2.3s.9 2.2 2.4 2.2', 'M16 10.5c1.6 0 2.5 1 2.5 2.3s-.9 2.2-2.4 2.2', 'M10 11.5h.01', 'M14 11.5h.01', 'M10 15c1.3 1 2.7 1 4 0'] },
  child_6: { paths: ['M7 11a5 5 0 1 0 10 0 5 5 0 0 0-10 0Z', 'M9 7.5l1.5-2L12 7.4l1.5-1.9L15 7.5', 'M10 11.5h.01', 'M14 11.5h.01', 'M10 14.8h4'] },
  child_7: { paths: ['M7 11a5 5 0 1 0 10 0 5 5 0 0 0-10 0Z', 'M8.5 7.5c1-2 6-2 7 0', 'M7 7l2-2 2 2', 'M13 7l2-2 2 2', 'M10 11.5h.01', 'M14 11.5h.01', 'M10 15c1.3.9 2.7.9 4 0'] },
  child_8: { paths: ['M7 11a5 5 0 1 0 10 0 5 5 0 0 0-10 0Z', 'M8 8h8', 'M9 5.8h6l1 2.2H8z', 'M10 11.5h.01', 'M14 11.5h.01', 'M10 15c1.3.9 2.7.9 4 0'] },
  child_9: { paths: ['M6.8 11a5.2 5.2 0 1 0 10.4 0 5.2 5.2 0 0 0-10.4 0Z', 'M9 7.5c.8-1 1.8-1.5 3-1.5s2.2.5 3 1.5', 'M10 11.2h.01', 'M14 11.2h.01', 'M9.8 14.5c1.4 1.3 3 1.3 4.4 0', 'M12 5.7c-.5-1 1-2 2-1'] },
  child_10: { paths: ['M6.5 11a5.5 5.5 0 1 0 11 0 5.5 5.5 0 0 0-11 0Z', 'M8 10.5c-1.5 0-2.4 1-2.4 2.2s.9 2.1 2.3 2.1', 'M16 10.5c1.5 0 2.4 1 2.4 2.2s-.9 2.1-2.3 2.1', 'M9 8c1-2.2 5-2.2 6 0', 'M10 11.5h.01', 'M14 11.5h.01', 'M10 15c1.2 1 2.8 1 4 0'] },
  savings: { paths: ['M3.5 9 12 4.5 20.5 9', 'M5 10h14', 'M6 10v8', 'M10 10v8', 'M14 10v8', 'M18 10v8', 'M4.5 20h15'] },
  cash: { paths: ['M3 7h18v10H3z', 'M7 10h.01', 'M17 14h.01'], circles: [{ cx: 12, cy: 12, r: 2.5 }] },
  card: { paths: ['M4 6h16v12H4z', 'M4 10h16', 'M7 14h4', 'M15 14h3'] },
  bank: { paths: ['M3.5 9 12 4.5 20.5 9', 'M5 10h14', 'M6 10v8', 'M10 10v8', 'M14 10v8', 'M18 10v8', 'M4.5 20h15'] },
  investments: { paths: ['M5 16.5l4.2-4.2 3 3L19 8.5', 'M15.5 8.5H19V12'] },
  restaurant: { paths: ['M7 4v16', 'M4.5 4v5a2.5 2.5 0 0 0 5 0V4', 'M16.5 4v16', 'M16.5 4c2 1.5 3 3.5 3 6v2h-3'] },
  coffee: { paths: ['M6.5 8.5h10v8a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3z', 'M16.5 10h1a2.7 2.7 0 0 1 0 5.4h-1'] },
  fuel: { paths: ['M6 4h9v17H6z', 'M8 8h5', 'M15 9l4 4v5a2 2 0 0 1-4 0v-3h2'] },
  travel: { paths: ['M4 16.5 20 7.5', 'M20 7.5l-2.2 8.2-4.1-3.4-3.4 4.1-1.6-.9 2.8-5.2-5.8-2.4z'] },
  warning: { paths: ['M12 3 5 6v6c0 5 7 9 7 9s7-4 7-9V6z', 'M12 8v5', 'M12 16h.01'] },
  idea: { paths: ['M7 10a5 5 0 1 1 10 0c0 2-1.1 3.1-2.2 4.1-.7.6-1.3 1.2-1.3 1.9h-3c0-.7-.6-1.3-1.3-1.9C8.1 13.1 7 12 7 10Z', 'M10 19h4', 'M19 5l1-1', 'M4 4l1 1'] },
  heart: { paths: ['M20 8.7c0 5-8 10.3-8 10.3S4 13.7 4 8.7A4.1 4.1 0 0 1 12 6a4.1 4.1 0 0 1 8 2.7Z'] },
  calendar: { paths: ['M4.5 5.5h15v14h-15z', 'M8 3.5v4', 'M16 3.5v4', 'M4.5 10h15'] },
  more: { paths: ['M7.2 9.2c-2.2 0-3.7 1.6-3.7 3.3s1.5 3.3 3.7 3.3c3 0 4.3-6.6 7.6-6.6 2.2 0 3.7 1.6 3.7 3.3s-1.5 3.3-3.7 3.3c-3.3 0-4.6-6.6-7.6-6.6Z'] },
  plus: { paths: ['M12 5v14', 'M5 12h14'] },
  plus_2: { paths: ['M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Z', 'M12 8v8', 'M8 12h8'] },
  plus_3: { paths: ['M5 5h14v14H5z', 'M12 8v8', 'M8 12h8'] },
  plus_4: { paths: ['M12 5v14', 'M5 12h14'] },
  plus_5: { paths: ['M12 4.5v15', 'M4.5 12h15'] },
  plus_6: { paths: ['M12 6v12', 'M6 12h12'] },
  plus_7: { paths: ['M12 7v10', 'M7 12h10'] },
  plus_8: { paths: ['M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z'] },
  plus_9: { paths: ['M12 3 5 6v6c0 5 7 9 7 9s7-4 7-9V6z', 'M12 8v8', 'M8 12h8'] },
  plus_10: { paths: ['M12 5.5v13', 'M5.5 12h13'] },
  edit: { paths: ['M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16z', 'M13 6l5 5'] },
  edit_2: { paths: ['M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16z', 'M13 6l5 5'] },
  edit_3: { paths: ['M5 19l4-.8L19 8.2a2.5 2.5 0 0 0-3.5-3.5L5.5 14.7z', 'M13.5 6.7l3.8 3.8'] },
  edit_4: { paths: ['M4 20l3.5-1 11-11a2.5 2.5 0 0 0-3.5-3.5l-11 11z', 'M12 7l5 5', 'M5 16l3 3'] },
  edit_5: { paths: ['M6 4h9l3 3v13H6z', 'M15 4v3h3', 'M9 16l1-3 6-6 2 2-6 6z'] },
  edit_6: { paths: ['M5 19h3l9.5-9.5a2 2 0 0 0-3-3L5 16z'] },
  edit_7: { paths: ['M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Z', 'M9 15l1-3 4.5-4.5 2 2L12 14z'] },
  edit_8: { paths: ['M5 5h14v14H5z', 'M9 15l1-3 4.5-4.5 2 2L12 14z'] },
  edit_9: { paths: ['M6 18l2.5-.5 9-9a2 2 0 0 0-3-3l-9 9z', 'M13 7l4 4'] },
  edit_10: { paths: ['M4.5 19.5h4l10-10a2.2 2.2 0 0 0-3-3l-10 10z', 'M12.5 7.5l4 4'] },
  trash: { paths: ['M4 7h16', 'M9 7V4h6v3', 'M7 7l1 14h8l1-14', 'M10 11v6', 'M14 11v6'] },
  trash_2: { paths: ['M4 7h16', 'M9 7V4h6v3', 'M7 7l1 14h8l1-14', 'M10 11v6', 'M14 11v6'] },
  trash_3: { paths: ['M5 7h14', 'M10 4h4l1 3', 'M8 7v13h8V7', 'M10 11v5', 'M14 11v5'] },
  trash_4: { paths: ['M6 7h12', 'M9 7V5h6v2', 'M8 7l.7 13h6.6L16 7'] },
  trash_5: { paths: ['M5.5 7.5h13', 'M9 7.5V5h6v2.5', 'M8 7.5v11A1.5 1.5 0 0 0 9.5 20h5A1.5 1.5 0 0 0 16 18.5v-11', 'M10.5 11v5', 'M13.5 11v5'] },
  trash_6: { paths: ['M4 7h16', 'M9 7V4h6v3', 'M7 10h10', 'M8 10l.5 10h7l.5-10', 'M11 13v4', 'M13 13v4'] },
  trash_7: { paths: ['M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Z', 'M8.5 9.5h7', 'M10 9.5V8h4v1.5', 'M10 11v5h4v-5'] },
  trash_8: { paths: ['M5 7h14', 'M9 7V4.5h6V7', 'M8 7l1 13h6l1-13', 'M11 11v5', 'M13 11v5'] },
  trash_9: { paths: ['M7 8h10v12H7z', 'M5 8h14', 'M10 5h4v3', 'M10 12v4', 'M14 12v4'] },
  trash_10: { paths: ['M4.5 7h15', 'M9 7V5h6v2', 'M7.5 7l.8 13h7.4l.8-13', 'M10 11.5v5', 'M14 11.5v5'] },
  close: { paths: ['M6 6l12 12', 'M18 6 6 18'] },
  close_2: { paths: ['M6 6l12 12', 'M18 6 6 18'] },
  close_3: { paths: ['M7 7l10 10', 'M17 7 7 17'] },
  close_4: { paths: ['M5.5 5.5l13 13', 'M18.5 5.5l-13 13'] },
  close_5: { paths: ['M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Z', 'M9 9l6 6', 'M15 9l-6 6'] },
  close_6: { paths: ['M5 5h14v14H5z', 'M9 9l6 6', 'M15 9l-6 6'] },
  close_7: { paths: ['M8 8l8 8', 'M16 8l-8 8'] },
  close_8: { paths: ['M6.5 6.5l11 11', 'M17.5 6.5l-11 11'] },
  close_9: { paths: ['M7 6.5l10 11', 'M17 6.5l-10 11'] },
  close_10: { paths: ['M7.5 7.5l9 9', 'M16.5 7.5l-9 9'] },
  expand: { paths: ['M8 9l4 4 4-4'] },
  expand_2: { paths: ['M8 9l4 4 4-4'] },
  expand_3: { paths: ['M8 15l4-4 4 4'] },
  expand_4: { paths: ['M12 5v14', 'M7 14l5 5 5-5'] },
  expand_5: { paths: ['M12 19V5', 'M7 10l5-5 5 5'] },
  expand_6: { paths: ['M7 8l5 5 5-5', 'M7 13l5 5 5-5'] },
  expand_7: { paths: ['M6 10l6 6 6-6', 'M12 4v12'] },
  expand_8: { paths: ['M5 9h14', 'M8 13l4 4 4-4'] },
  expand_9: { paths: ['M7.5 9.5 12 14l4.5-4.5'] },
  expand_10: { paths: ['M9 10.5l3 3 3-3'] },
  info: { paths: ['M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Z', 'M12 11v5', 'M12 8h.01'] },
  info_2: { paths: ['M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Z', 'M12 11v5', 'M12 8h.01'] },
  info_3: { paths: ['M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z', 'M12 10.5v5', 'M12 8h.01'] },
  info_4: { paths: ['M5 5h14v14H5z', 'M12 10.5v5', 'M12 8h.01'] },
  info_5: { paths: ['M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Z', 'M12 10v6', 'M12 7.5h.01'] },
  info_6: { paths: ['M12 11v6', 'M12 7h.01'] },
  info_7: { paths: ['M12 3 5 6v6c0 5 7 9 7 9s7-4 7-9V6z', 'M12 10.5v5', 'M12 8h.01'] },
  info_8: { paths: ['M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Z', 'M11 10h2v6h-2z', 'M11 7h2v1.5h-2z'] },
  info_9: { paths: ['M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z', 'M12 11v5', 'M12 8h.01'] },
  info_10: { paths: ['M12 4.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Z', 'M12 11v4.5', 'M12 8.5h.01'] },
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
