export const getMonthNumber = (monthText: string) => {
  const [year, month] = monthText.split('-').map(Number)
  return year * 100 + month
}

export const getNextMonthText = (monthText: string) => {
  const [year, month] = monthText.split('-').map(Number)
  const date = new Date(year, month, 1)
  const newYear = date.getFullYear()
  const newMonth = String(date.getMonth() + 1).padStart(2, '0')
  return `${newYear}-${newMonth}`
}

export const getPrevMonthText = (monthText: string) => {
  const [year, month] = monthText.split('-').map(Number)
  const date = new Date(year, month - 2, 1)
  const newYear = date.getFullYear()
  const newMonth = String(date.getMonth() + 1).padStart(2, '0')
  return `${newYear}-${newMonth}`
}

export const getMonthStartIso = (monthText: string) => {
  const [year, month] = monthText.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0))
  return date.toISOString()
}

export const getActiveToForMonth = (monthText: string) => {
  return getMonthStartIso(monthText)
}
