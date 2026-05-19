'use client'

import type { CSSProperties } from 'react'
import { getExistingDaysInMonth } from '../../lib/dateUtils'
import { BLUE, GREEN, MUTED, RED, SOFT_TEXT } from './dashboardWidgetTileStyles'
import { clampPercent, formatMoney, formatPercent } from './dashboardWidgetTileUtils'

import type { BudgetControlWidgetProps } from './dashboardWidgetTypes'
import { buildMetrics, formatSignedPercent, getComparisonNote, getPaceNote, type BudgetMetrics } from './BudgetControlWidgetData'

const WARNING = '#ca8a04'

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
  gap: 28,
  padding: '34px 24px 34px',
}

const wideRootStyle: CSSProperties = {
  ...rootStyle,
  display: 'grid',
  gridTemplateColumns: '0.9fr 1.12fr 0.98fr',
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
  borderRight: '1px solid rgba(203,213,225,0.48)',
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
  color: '#172033',
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

const compactHeroStyle: CSSProperties = {
  minWidth: 0,
  overflow: 'hidden',
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: 12,
  alignItems: 'center',
}

const heroStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  overflow: 'hidden',
  display: 'grid',
  alignContent: 'center',
  gap: 12,
  padding: '14px 4px 6px',
}

const statusLineStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gap: 5,
  overflow: 'visible',
}

const statusLabelStyle: CSSProperties = {
  minWidth: 0,
  fontSize: 25,
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

const percentBlockStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gap: 4,
  overflow: 'visible',
}

const compactPercentBlockStyle: CSSProperties = {
  ...percentBlockStyle,
  justifyItems: 'end',
  textAlign: 'right',
}

const percentValueStyle: CSSProperties = {
  minWidth: 0,
  fontSize: 28,
  lineHeight: 1.2,
  fontWeight: 600,
  letterSpacing: -0.5,
  whiteSpace: 'nowrap',
  overflow: 'visible',
  textOverflow: 'ellipsis',
}

const compactPercentValueStyle: CSSProperties = {
  ...percentValueStyle,
  fontSize: 22,
}

const percentLabelStyle: CSSProperties = {
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

const barsContentStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  alignContent: 'center',
  gap: 18,
  overflow: 'hidden',
}

const compactBarsContentStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  gap: 16,
  overflow: 'hidden',
}

const progressBlockStyle: CSSProperties = {
  minWidth: 0,
  overflow: 'hidden',
}

const progressHeaderStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: 10,
  alignItems: 'center',
  overflow: 'hidden',
}

const progressLabelStyle: CSSProperties = {
  minWidth: 0,
  color: '#172033',
  fontSize: 10.5,
  lineHeight: 1.2,
  fontWeight: 500,
  whiteSpace: 'nowrap',
  overflow: 'visible',
  textOverflow: 'ellipsis',
}

const progressValueStyle: CSSProperties = {
  flexShrink: 0,
  color: MUTED,
  fontSize: 10.4,
  lineHeight: 1.2,
  fontWeight: 600,
  whiteSpace: 'nowrap',
}

const progressTrackStyle: CSSProperties = {
  width: '100%',
  height: 7,
  borderRadius: 999,
  background: 'rgba(203,213,225,0.44)',
  overflow: 'hidden',
  marginTop: 7,
}

const progressFillStyle: CSSProperties = {
  height: '100%',
  minWidth: 3,
  borderRadius: 999,
  transform: 'translateZ(0)',
}

const paceTextStyle: CSSProperties = {
  minWidth: 0,
  color: SOFT_TEXT,
  fontSize: 10.5,
  lineHeight: 1.3,
  fontWeight: 400,
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
}

const paceValueStyle: CSSProperties = {
  minWidth: 0,
  fontSize: 14,
  lineHeight: 1.2,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  overflow: 'visible',
  textOverflow: 'ellipsis',
}

const paceSummaryStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gap: 5,
  overflow: 'hidden',
  paddingTop: 2,
}

const comparisonContentStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  alignContent: 'center',
  gap: 15,
  overflow: 'hidden',
}

const comparisonRowStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: 12,
  alignItems: 'baseline',
  overflow: 'hidden',
}

const comparisonLabelStyle: CSSProperties = {
  minWidth: 0,
  color: SOFT_TEXT,
  fontSize: 10.4,
  lineHeight: 1.2,
  fontWeight: 400,
  whiteSpace: 'nowrap',
  overflow: 'visible',
  textOverflow: 'ellipsis',
}

const comparisonValueStyle: CSSProperties = {
  minWidth: 0,
  color: '#172033',
  fontSize: 13,
  lineHeight: 1.2,
  fontWeight: 600,
  textAlign: 'right',
  whiteSpace: 'nowrap',
  overflow: 'visible',
  textOverflow: 'ellipsis',
}

const comparisonNoteStyle: CSSProperties = {
  minWidth: 0,
  color: SOFT_TEXT,
  fontSize: 10.2,
  lineHeight: 1.3,
  fontWeight: 400,
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  paddingTop: 3,
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
  metrics: BudgetMetrics
  compact: boolean
}) {
  if (compact) {
    return (
      <div style={compactHeroStyle}>
        <div style={statusLineStyle}>
          <div style={{ ...compactStatusLabelStyle, color: metrics.status.color }}>
            {metrics.status.label}
          </div>
          <div style={statusDescriptionStyle}>{metrics.status.description}</div>
        </div>

        <div style={compactPercentBlockStyle}>
          <div style={{ ...compactPercentValueStyle, color: metrics.status.color }}>
            {formatPercent(metrics.expenseToIncomePercent)}
          </div>
          <div style={percentLabelStyle}>wydatków / przychodów</div>
        </div>
      </div>
    )
  }

  return (
    <div style={heroStyle}>
      <div style={statusLineStyle}>
        <div style={{ ...statusLabelStyle, color: metrics.status.color }}>
          {metrics.status.label}
        </div>
        <div style={statusDescriptionStyle}>{metrics.status.description}</div>
      </div>

      <div style={percentBlockStyle}>
        <div style={{ ...percentValueStyle, color: metrics.status.color }}>
          {formatPercent(metrics.expenseToIncomePercent)}
        </div>
        <div style={percentLabelStyle}>wydatków względem przychodów</div>
      </div>
    </div>
  )
}

function ProgressRow({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div style={progressBlockStyle}>
      <div style={progressHeaderStyle}>
        <div style={progressLabelStyle}>{label}</div>
        <div style={progressValueStyle}>{formatPercent(value)}</div>
      </div>

      <div style={progressTrackStyle}>
        <div
          style={{
            ...progressFillStyle,
            width: `${clampPercent(value)}%`,
            background: color,
          }}
        />
      </div>
    </div>
  )
}

function PaceBlock({
  metrics,
  compact,
}: {
  metrics: BudgetMetrics
  compact?: boolean
}) {
  return (
    <div style={compact ? compactBarsContentStyle : barsContentStyle}>
      <ProgressRow label="Czas miesiąca" value={metrics.timePercent} color={BLUE} />
      <ProgressRow
        label="Wydatki / przychody"
        value={metrics.expenseToIncomePercent}
        color={metrics.status.color}
      />

      {!compact && (
        <div style={paceSummaryStyle}>
          <div style={{ ...paceValueStyle, color: metrics.paceDifference > 8 ? WARNING : GREEN }}>
            {formatSignedPercent(metrics.paceDifference)} względem czasu
          </div>
          <div style={paceTextStyle}>{getPaceNote(metrics)}</div>
        </div>
      )}
    </div>
  )
}

function ComparisonBlock({ metrics }: { metrics: BudgetMetrics }) {
  return (
    <div style={comparisonContentStyle}>
      <div style={comparisonRowStyle}>
        <div style={comparisonLabelStyle}>Przychody</div>
        <div style={{ ...comparisonValueStyle, color: GREEN }}>{formatMoney(metrics.income)}</div>
      </div>

      <div style={comparisonRowStyle}>
        <div style={comparisonLabelStyle}>Wydatki</div>
        <div style={{ ...comparisonValueStyle, color: RED }}>{formatMoney(metrics.expense)}</div>
      </div>

      <div style={comparisonRowStyle}>
        <div style={comparisonLabelStyle}>Zostaje</div>
        <div style={{ ...comparisonValueStyle, color: metrics.balance >= 0 ? GREEN : RED }}>
          {formatMoney(metrics.balance)}
        </div>
      </div>

      <div style={comparisonNoteStyle}>{getComparisonNote(metrics)}</div>
    </div>
  )
}

export default function BudgetControlWidget({
  rect,
  transactions,
  selectedMonth,
  excludedMonthsSet,
  getSignedAmountForTransaction,
}: BudgetControlWidgetProps) {
  const existingDays = getExistingDaysInMonth(selectedMonth)
  const isCompact = rect.width < 520

  if (excludedMonthsSet.has(selectedMonth)) {
    return <div style={emptyStyle}>Ten miesiąc jest wyłączony ze statystyk.</div>
  }

  if (existingDays === 0) {
    return <div style={emptyStyle}>Przyszły miesiąc — brak istniejących wpisów do pokazania.</div>
  }

  const metrics = buildMetrics({
    transactions,
    selectedMonth,
    existingDays,
    getSignedAmountForTransaction,
  })

  if (metrics.income === 0 && metrics.expense === 0) {
    return <div style={emptyStyle}>Brak wpisów w tym miesiącu.</div>
  }

  if (isCompact) {
    return (
      <div style={compactRootStyle}>
        <HeroBlock metrics={metrics} compact />
        <PaceBlock metrics={metrics} compact />
      </div>
    )
  }

  return (
    <div style={wideRootStyle}>
      <section style={borderedPanelStyle}>
        <div style={panelHeaderStyle}>
          <div style={{ ...titleStyle, color: metrics.status.color }}>Status</div>
          <div style={metaStyle}>{metrics.status.tone}</div>
        </div>

        <HeroBlock metrics={metrics} compact={false} />
      </section>

      <section style={borderedPanelStyle}>
        <div style={panelHeaderStyle}>
          <div style={titleStyle}>Tempo miesiąca</div>
          <div style={metaStyle}>czas vs wydatki</div>
        </div>

        <PaceBlock metrics={metrics} />
      </section>

      <section style={panelStyle}>
        <div style={panelHeaderStyle}>
          <div style={titleStyle}>Porównanie</div>
          <div style={metaStyle}>miesiąc</div>
        </div>

        <ComparisonBlock metrics={metrics} />
      </section>
    </div>
  )
}
