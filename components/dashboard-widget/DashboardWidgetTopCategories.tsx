import type { TopCategory } from '../../lib/dashboardStats'
import { uiTypographyTokens } from '../../lib/uiFoundation'
import { RED, listRowStyle, listStyle, progressTrackStyle, smallTextStyle, labelStyle } from './dashboardWidgetTileStyles'
import { clampPercent, formatMoney, formatPercent } from './dashboardWidgetTileUtils'
import { ProgressBar as ProgressBarPrimitive, RankingRow } from './dashboardWidgetPrimitives'

type DashboardWidgetTopCategoriesProps = {
  categories: TopCategory[]
  total: number
  limit: number
  showBars: boolean
}

export default function DashboardWidgetTopCategories({
  categories,
  total,
  limit,
  showBars,
}: DashboardWidgetTopCategoriesProps) {
  const visibleItems = categories.slice(0, limit)

  if (visibleItems.length === 0) {
    return <div style={smallTextStyle}>Brak wydatków</div>
  }

  return (
    <div style={listStyle}>
      {visibleItems.map((category, index) => {
        const percent = total > 0 ? (category.total / total) * 100 : 0

        return (
          <div key={category.categoryId}>
            <RankingRow style={listRowStyle}>
              <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {index + 1}. {category.name}
              </span>
              <strong style={{ fontWeight: uiTypographyTokens.weight.semibold }}>{formatMoney(category.total)}</strong>
            </RankingRow>
            {showBars && (
              <>
                <ProgressBarPrimitive value={clampPercent(percent)} color={RED} style={progressTrackStyle} />
                <div style={{ ...labelStyle, marginTop: 2 }}>{formatPercent(percent)}</div>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
