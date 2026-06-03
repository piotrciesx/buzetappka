'use client'

import type { CSSProperties } from 'react'
import { GREEN, MUTED, RED, SOFT_TEXT } from './dashboardWidgetTileStyles'
import { clampPercent, formatMoney } from './dashboardWidgetTileUtils'

import type { StabilityLeaksWidgetProps } from './dashboardWidgetTypes'
import { buildMetrics, formatLeakPercent, getLeakColor, getLeakCountText, type CategoryLeak, type LeakMetrics } from './StabilityLeaksWidgetData'

const NEUTRAL_BAR = 'var(--ui-chart-neutral)'

const FONT =
  'var(--font-app-sans)'

const rootStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  minWidth: 0,
  minHeight: 0,
  boxSizing: 'border-box',
  padding: '12px 12px 8px',
  overflow: 'hidden',
  fontFamily: FONT,
}

const compactRootStyle: CSSProperties = {
  ...rootStyle,
  display: 'grid',
  alignContent: 'center',
  gap: 18,
  padding: '24px 18px 22px',
}

const wideRootStyle: CSSProperties = {
  ...rootStyle,
  display: 'grid',
  gridTemplateColumns: '0.86fr 1.34fr',
  gap: 16,
}

const panelStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  gridTemplateRows: 'auto minmax(0, 1fr)',
  gap: 10,
  overflow: 'hidden',
}

const borderedPanelStyle: CSSProperties = {
  ...panelStyle,
  borderRight: '1px solid var(--ui-chart-grid)',
  paddingRight: 15,
}

const panelHeaderStyle: CSSProperties = {
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  overflow: 'hidden',
}

const titleStyle: CSSProperties = {
  minWidth: 0,
  color: 'var(--ui-text-primary)',
  fontSize: 11,
  lineHeight: 1.2,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  overflow: 'visible',
  textOverflow: 'ellipsis',
}

const metaStyle: CSSProperties = {
  flexShrink: 0,
  color: MUTED,
  fontSize: 9.8,
  lineHeight: 1.2,
  fontWeight: 500,
  whiteSpace: 'nowrap',
}

const heroStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  alignContent: 'center',
  gap: 16,
  overflow: 'hidden',
}

const compactHeroStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: 12,
  alignItems: 'center',
  overflow: 'hidden',
}

const statusTextStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gap: 5,
  overflow: 'visible',
}

const statusLabelStyle: CSSProperties = {
  minWidth: 0,
  fontSize: 24,
  lineHeight: 1.2,
  fontWeight: 600,
  letterSpacing: -0.45,
  whiteSpace: 'nowrap',
  overflow: 'visible',
  textOverflow: 'ellipsis',
}

const compactStatusLabelStyle: CSSProperties = {
  ...statusLabelStyle,
  fontSize: 20,
}

const statusDescriptionStyle: CSSProperties = {
  minWidth: 0,
  color: SOFT_TEXT,
  fontSize: 10.8,
  lineHeight: 1.3,
  fontWeight: 400,
  overflow: 'visible',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
}

const countBlockStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gap: 4,
  overflow: 'visible',
}

const compactCountBlockStyle: CSSProperties = {
  ...countBlockStyle,
  justifyItems: 'end',
  textAlign: 'right',
}

const countValueStyle: CSSProperties = {
  minWidth: 0,
  fontSize: 27,
  lineHeight: 1.2,
  fontWeight: 600,
  letterSpacing: -0.5,
  whiteSpace: 'nowrap',
  overflow: 'visible',
  textOverflow: 'ellipsis',
}

const compactCountValueStyle: CSSProperties = {
  ...countValueStyle,
  fontSize: 21,
}

const countLabelStyle: CSSProperties = {
  minWidth: 0,
  color: SOFT_TEXT,
  fontSize: 10,
  lineHeight: 1.2,
  fontWeight: 400,
  overflow: 'visible',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
}

const numbersStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gap: 12,
  overflow: 'hidden',
}

const numberRowStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: 12,
  alignItems: 'baseline',
  overflow: 'hidden',
}

const numberLabelStyle: CSSProperties = {
  minWidth: 0,
  color: SOFT_TEXT,
  fontSize: 10.4,
  lineHeight: 1.2,
  fontWeight: 400,
  whiteSpace: 'nowrap',
  overflow: 'visible',
  textOverflow: 'ellipsis',
}

const numberValueStyle: CSSProperties = {
  minWidth: 0,
  color: 'var(--ui-text-primary)',
  fontSize: 13,
  lineHeight: 1.2,
  fontWeight: 600,
  textAlign: 'right',
  whiteSpace: 'nowrap',
  overflow: 'visible',
  textOverflow: 'ellipsis',
}

const compactListStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gap: 10,
  overflow: 'hidden',
}

const wideListStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  gridTemplateRows: 'repeat(5, minmax(0, 1fr))',
  gap: 8,
  overflow: 'hidden',
}

const leakRowStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: 12,
  alignItems: 'start',
  overflow: 'hidden',
}

const wideLeakRowStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 0.78fr) minmax(0, 1fr)',
  gap: 14,
  alignItems: 'center',
  overflow: 'hidden',
}

const leakTextStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gap: 4,
  overflow: 'hidden',
}

const leakNameStyle: CSSProperties = {
  minWidth: 0,
  color: 'var(--ui-text-primary)',
  fontSize: 11,
  lineHeight: 1.2,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  overflow: 'visible',
  textOverflow: 'ellipsis',
}

const leakMetaStyle: CSSProperties = {
  minWidth: 0,
  color: SOFT_TEXT,
  fontSize: 10,
  lineHeight: 1.2,
  fontWeight: 400,
  overflow: 'visible',
  display: '-webkit-box',
  WebkitLineClamp: 1,
  WebkitBoxOrient: 'vertical',
}

const leakValueStyle: CSSProperties = {
  minWidth: 0,
  fontSize: 12,
  lineHeight: 1.2,
  fontWeight: 600,
  textAlign: 'right',
  whiteSpace: 'nowrap',
  overflow: 'visible',
  textOverflow: 'ellipsis',
}

const barsStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gap: 7,
  overflow: 'hidden',
}

const barRowStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gap: 4,
  overflow: 'hidden',
}

const barHeaderStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: 8,
  alignItems: 'center',
  overflow: 'hidden',
}

const barLabelStyle: CSSProperties = {
  minWidth: 0,
  color: SOFT_TEXT,
  fontSize: 9.8,
  lineHeight: 1.2,
  fontWeight: 400,
  whiteSpace: 'nowrap',
  overflow: 'visible',
  textOverflow: 'ellipsis',
}

const barValueStyle: CSSProperties = {
  flexShrink: 0,
  color: MUTED,
  fontSize: 9.8,
  lineHeight: 1.2,
  fontWeight: 500,
  whiteSpace: 'nowrap',
}

const barTrackStyle: CSSProperties = {
  width: '100%',
  height: 6,
  borderRadius: 999,
  background: 'var(--ui-chart-grid)',
  overflow: 'hidden',
}

const barFillStyle: CSSProperties = {
  height: '100%',
  minWidth: 3,
  borderRadius: 999,
  transform: 'translateZ(0)',
}

const emptyStyle: CSSProperties = {
  height: '100%',
  minHeight: 0,
  display: 'grid',
  placeItems: 'center',
  color: SOFT_TEXT,
  fontSize: 12,
  lineHeight: 1.35,
  textAlign: 'center',
  padding: 12,
  fontFamily: FONT,
}


function HeroBlock({
  metrics,
  compact,
}: {
  metrics: LeakMetrics
  compact: boolean
}) {
  const countText = metrics.leakCount > 0 ? getLeakCountText(metrics.leakCount) : 'brak wycieków'
  const countColor = metrics.leakCount > 0 ? metrics.status.color : GREEN

  return (
    <div style={compact ? compactHeroStyle : heroStyle}>
      <div style={statusTextStyle}>
        <div style={{ ...(compact ? compactStatusLabelStyle : statusLabelStyle), color: metrics.status.color }}>
          {metrics.status.label}
        </div>
        <div style={statusDescriptionStyle}>{metrics.status.description}</div>
      </div>

      <div style={compact ? compactCountBlockStyle : countBlockStyle}>
        <div style={{ ...(compact ? compactCountValueStyle : countValueStyle), color: countColor }}>
          {countText}
        </div>
        <div style={countLabelStyle}>powyżej progu 30%</div>
      </div>
    </div>
  )
}

function NumbersBlock({ metrics }: { metrics: LeakMetrics }) {
  return (
    <div style={numbersStyle}>
      <div style={numberRowStyle}>
        <div style={numberLabelStyle}>Teraz do dnia {metrics.checkedDay}</div>
        <div style={{ ...numberValueStyle, color: RED }}>{formatMoney(metrics.currentTotal)}</div>
      </div>

      <div style={numberRowStyle}>
        <div style={numberLabelStyle}>Średnio wcześniej</div>
        <div style={numberValueStyle}>{formatMoney(metrics.averageTotalToDay)}</div>
      </div>

      <div style={numberRowStyle}>
        <div style={numberLabelStyle}>Różnica</div>
        <div style={{ ...numberValueStyle, color: metrics.difference > 0 ? RED : GREEN }}>
          {formatMoney(metrics.difference)}
        </div>
      </div>
    </div>
  )
}

function LeakCompactRow({ leak }: { leak: CategoryLeak }) {
  const color = getLeakColor(leak)

  return (
    <div style={leakRowStyle}>
      <div style={leakTextStyle}>
        <div style={leakNameStyle}>{leak.categoryName}</div>
        <div style={leakMetaStyle}>
          teraz {formatMoney(leak.currentTotal)} · średnio {formatMoney(leak.averageToDay)}
        </div>
      </div>

      <div style={{ ...leakValueStyle, color }}>{formatLeakPercent(leak.percent)}</div>
    </div>
  )
}

function CompareBar({
  label,
  value,
  max,
  color,
}: {
  label: string
  value: number
  max: number
  color: string
}) {
  const percent = max > 0 ? (value / max) * 100 : 0

  return (
    <div style={barRowStyle}>
      <div style={barHeaderStyle}>
        <div style={barLabelStyle}>{label}</div>
        <div style={barValueStyle}>{formatMoney(value)}</div>
      </div>

      <div style={barTrackStyle}>
        <div
          style={{
            ...barFillStyle,
            width: `${clampPercent(percent)}%`,
            background: color,
          }}
        />
      </div>
    </div>
  )
}

function LeakWideRow({ leak }: { leak: CategoryLeak }) {
  const max = Math.max(leak.currentTotal, leak.averageToDay, 1)
  const color = getLeakColor(leak)

  return (
    <div style={wideLeakRowStyle}>
      <div style={leakTextStyle}>
        <div style={leakNameStyle}>{leak.categoryName}</div>
        <div style={leakMetaStyle}>
          {formatLeakPercent(leak.percent)} · różnica {formatMoney(leak.difference)}
        </div>
      </div>

      <div style={barsStyle}>
        <CompareBar label="średnia" value={leak.averageToDay} max={max} color={NEUTRAL_BAR} />
        <CompareBar label="teraz" value={leak.currentTotal} max={max} color={color} />
      </div>
    </div>
  )
}

export default function StabilityLeaksWidget({
  rect,
  transactions,
  selectedMonth,
  excludedMonthsSet,
  categoriesById,
  getSignedAmountForTransaction,
}: StabilityLeaksWidgetProps) {
  const isCompact = rect.width < 520

  if (excludedMonthsSet.has(selectedMonth)) {
    return <div style={emptyStyle}>Ten miesiąc jest wyłączony ze statystyk.</div>
  }

  const metrics = buildMetrics({
    transactions,
    selectedMonth,
    excludedMonthsSet,
    categoriesById,
    getSignedAmountForTransaction,
  })

  if (metrics.currentTotal === 0 && metrics.averageTotalToDay === 0) {
    return <div style={emptyStyle}>Brak wydatków do porównania.</div>
  }

  if (metrics.monthsCompared === 0) {
    return <div style={emptyStyle}>Za mało wcześniejszych miesięcy do porównania.</div>
  }

  if (isCompact) {
    const compactCategories = metrics.categories.slice(0, 3)

    return (
      <div style={compactRootStyle}>
        <HeroBlock metrics={metrics} compact />

        <div style={compactListStyle}>
          {compactCategories.map((leak) => (
            <LeakCompactRow key={leak.categoryId} leak={leak} />
          ))}
        </div>
      </div>
    )
  }

  const wideCategories = metrics.categories.slice(0, 5)

  return (
    <div style={wideRootStyle}>
      <section style={borderedPanelStyle}>
        <div style={panelHeaderStyle}>
          <div style={{ ...titleStyle, color: metrics.status.color }}>Sygnał</div>
          <div style={metaStyle}>{metrics.status.tone}</div>
        </div>

        <div style={heroStyle}>
          <HeroBlock metrics={metrics} compact={false} />
          <NumbersBlock metrics={metrics} />
        </div>
      </section>

      <section style={panelStyle}>
        <div style={panelHeaderStyle}>
          <div style={titleStyle}>Największe odchylenia</div>
          <div style={metaStyle}>{metrics.monthsCompared} mies. historii</div>
        </div>

        <div style={wideListStyle}>
          {wideCategories.map((leak) => (
            <LeakWideRow key={leak.categoryId} leak={leak} />
          ))}
        </div>
      </section>
    </div>
  )
}
