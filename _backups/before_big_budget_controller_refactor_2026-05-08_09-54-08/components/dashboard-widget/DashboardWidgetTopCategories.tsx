import type { TopCategory } from '../../lib/dashboardStats'
import { RED, listRowStyle, listStyle, progressTrackStyle, smallTextStyle, labelStyle } from './dashboardWidgetTileStyles'
import { clampPercent, formatMoney, formatPercent } from './dashboardWidgetTileUtils'

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
            <div style={listRowStyle}>
              <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {index + 1}. {category.name}
              </span>
              <strong style={{ fontWeight: 600 }}>{formatMoney(category.total)}</strong>
            </div>
            {showBars && (
              <>
                <div style={progressTrackStyle}>
                  <div
                    style={{
                      width: `${clampPercent(percent)}%`,
                      height: '100%',
                      borderRadius: 999,
                      background: RED,
                    }}
                  />
                </div>
                <div style={{ ...labelStyle, marginTop: 2 }}>{formatPercent(percent)}</div>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
