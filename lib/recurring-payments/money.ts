declare const groszeBrand: unique symbol

export type Grosze = number & { readonly [groszeBrand]: 'Grosze' }

const assertSafeInteger = (value: number, label: string) => {
  if (!Number.isSafeInteger(value)) {
    throw new Error(`${label} must be a safe integer number of grosze.`)
  }
}

export const grosze = (value: number): Grosze => {
  assertSafeInteger(value, 'Money value')
  return value as Grosze
}

export const zeroGrosze = grosze(0)

export const parseGrosze = (value: string | number): Grosze => {
  const normalized = String(value).trim().replace(',', '.')
  const match = normalized.match(/^(-?)(\d+)(?:\.(\d{1,2}))?$/)

  if (!match) {
    throw new Error(`Invalid money value: ${value}`)
  }

  const sign = match[1] === '-' ? -1 : 1
  const whole = Number(match[2])
  const fraction = Number((match[3] || '').padEnd(2, '0'))
  const result = sign * (whole * 100 + fraction)

  return grosze(result)
}

export const addGrosze = (...values: Grosze[]): Grosze => {
  const result = values.reduce<number>((sum, value) => sum + value, 0)
  return grosze(result)
}

export const subtractGrosze = (left: Grosze, right: Grosze): Grosze => {
  return grosze(left - right)
}

export const compareGrosze = (left: Grosze, right: Grosze): -1 | 0 | 1 => {
  if (left === right) return 0
  return left < right ? -1 : 1
}

export const sumGrosze = (values: readonly Grosze[]): Grosze => addGrosze(...values)

export const formatGrosze = (value: Grosze, locale = 'pl-PL', currency = 'PLN') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100)
}

