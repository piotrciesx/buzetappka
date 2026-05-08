import type { HeatmapMode } from './monthCalendarTypes'

export const formatAmount = (value: number) => {
  return new Intl.NumberFormat('pl-PL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export const normalizeAmountInput = (value: string) => {
  return value.replace(',', '.')
}

export const getStoredHeatmapSettings = (
  storageKey: string | undefined,
  defaultMode: HeatmapMode,
  defaultInverted: boolean
) => {
  if (!storageKey || typeof window === 'undefined') {
    return {
      mode: defaultMode,
      inverted: defaultInverted,
    }
  }

  try {
    const raw = window.localStorage.getItem(storageKey)

    if (!raw) {
      return {
        mode: defaultMode,
        inverted: defaultInverted,
      }
    }

    const parsed = JSON.parse(raw) as {
      mode?: HeatmapMode
      inverted?: boolean
    }

    return {
      mode: parsed.mode === 'normal' || parsed.mode === 'balance' ? parsed.mode : defaultMode,
      inverted: typeof parsed.inverted === 'boolean' ? parsed.inverted : defaultInverted,
    }
  } catch {
    return {
      mode: defaultMode,
      inverted: defaultInverted,
    }
  }
}

const clamp = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value))
}

const rgbToCss = ([r, g, b]: [number, number, number]) => {
  return `rgb(${r}, ${g}, ${b})`
}

const hslToRgb = (
  hue: number,
  saturationPercent: number,
  lightnessPercent: number
): [number, number, number] => {
  const saturation = clamp(saturationPercent, 0, 100) / 100
  const lightness = clamp(lightnessPercent, 0, 100) / 100
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
  const hueSection = (((hue % 360) + 360) % 360) / 60
  const secondComponent = chroma * (1 - Math.abs((hueSection % 2) - 1))
  const match = lightness - chroma / 2

  let redPrime = 0
  let greenPrime = 0
  let bluePrime = 0

  if (hueSection >= 0 && hueSection < 1) {
    redPrime = chroma
    greenPrime = secondComponent
  } else if (hueSection < 2) {
    redPrime = secondComponent
    greenPrime = chroma
  } else if (hueSection < 3) {
    greenPrime = chroma
    bluePrime = secondComponent
  } else if (hueSection < 4) {
    greenPrime = secondComponent
    bluePrime = chroma
  } else if (hueSection < 5) {
    redPrime = secondComponent
    bluePrime = chroma
  } else {
    redPrime = chroma
    bluePrime = secondComponent
  }

  return [
    Math.round((redPrime + match) * 255),
    Math.round((greenPrime + match) * 255),
    Math.round((bluePrime + match) * 255),
  ]
}

const getLuminance = ([r, g, b]: [number, number, number]) => {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const getSortedNumbers = (values: number[]) => {
  return [...values].sort((left, right) => left - right)
}

const getQuantile = (sortedValues: number[], quantile: number) => {
  if (sortedValues.length === 0) {
    return 0
  }

  if (sortedValues.length === 1) {
    return sortedValues[0]
  }

  const clampedQuantile = clamp(quantile, 0, 1)
  const index = (sortedValues.length - 1) * clampedQuantile
  const lowerIndex = Math.floor(index)
  const upperIndex = Math.ceil(index)

  if (lowerIndex === upperIndex) {
    return sortedValues[lowerIndex]
  }

  const interpolationFactor = index - lowerIndex

  return (
    sortedValues[lowerIndex] +
    (sortedValues[upperIndex] - sortedValues[lowerIndex]) * interpolationFactor
  )
}

export const getReferenceValue = (values: number[]) => {
  if (values.length === 0) {
    return 0
  }

  const sortedValues = getSortedNumbers(values)
  const p60 = getQuantile(sortedValues, 0.6)
  const p85 = getQuantile(sortedValues, 0.85)
  const maxValue = sortedValues[sortedValues.length - 1]

  return Math.max(p85, p60 * 1.35, maxValue * 0.18, 1)
}

const getHeatmapIntensity = (absoluteValue: number, referenceValue: number) => {
  if (absoluteValue <= 0 || referenceValue <= 0) {
    return 0
  }

  const ratio = absoluteValue / referenceValue
  const compressed = Math.log1p(ratio * 6.5) / Math.log1p(7.5)
  const softened = Math.pow(clamp(compressed, 0, 1), 0.82)

  return clamp(softened, 0, 1)
}

export const getBalanceHeatmapVisual = (
  value: number,
  negativeReference: number,
  positiveReference: number,
  inverted: boolean
) => {
  const effectiveValue = inverted ? value * -1 : value

  if (effectiveValue === 0) {
    const neutralRgb = hslToRgb(42, 82, 83)

    return {
      background: rgbToCss(neutralRgb),
      textColor: '#111827',
      borderColor: rgbToCss(hslToRgb(38, 64, 74)),
    }
  }

  const isPositive = effectiveValue > 0
  const intensity = getHeatmapIntensity(
    Math.abs(effectiveValue),
    isPositive ? positiveReference : negativeReference
  )
  const hue = isPositive ? 145 : 8
  const saturation = 58 + intensity * 14
  const lightness = 90 - intensity * 20
  const borderLightness = Math.max(lightness - 12, 52)
  const backgroundRgb = hslToRgb(hue, saturation, lightness)
  const borderRgb = hslToRgb(hue, Math.min(100, saturation + 4), borderLightness)
  const luminance = getLuminance(backgroundRgb)

  return {
    background: rgbToCss(backgroundRgb),
    textColor: luminance < 132 ? '#ffffff' : '#111827',
    borderColor: rgbToCss(borderRgb),
  }
}

export const getDirectionalHeatmapVisual = (
  value: number,
  referenceValue: number,
  lowHue: number,
  highHue: number,
  inverted: boolean
) => {
  const intensity = getHeatmapIntensity(value, referenceValue)
  const startHue = inverted ? highHue : lowHue
  const endHue = inverted ? lowHue : highHue
  const hue = startHue + (endHue - startHue) * intensity
  const saturation = 58 + intensity * 14
  const lightness = 90 - intensity * 20
  const backgroundRgb = hslToRgb(hue, saturation, lightness)
  const borderRgb = hslToRgb(hue, Math.min(100, saturation + 4), Math.max(lightness - 12, 52))
  const luminance = getLuminance(backgroundRgb)

  return {
    background: rgbToCss(backgroundRgb),
    textColor: luminance < 132 ? '#ffffff' : '#111827',
    borderColor: rgbToCss(borderRgb),
  }
}
