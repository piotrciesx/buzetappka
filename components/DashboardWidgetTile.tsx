'use client'

import { ButtonHTMLAttributes, CSSProperties, useMemo } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
  DASHBOARD_WIDGET_DEFINITION_BY_TYPE,
  DASHBOARD_WIDGET_DEFINITIONS,
} from '../lib/dashboardWidgetConfig'
import DashboardWidgetFrame from './dashboard-widget/DashboardWidgetFrame'
import DashboardWidgetHeader from './dashboard-widget/DashboardWidgetHeader'
import DashboardWidgetContent from './dashboard-widget/DashboardWidgetContent'
import DashboardTileConfigPanel from './dashboard-widget/DashboardTileConfigPanel'

import type { DashboardWidgetTileProps } from './dashboard-widget/dashboardWidgetTileTypes'

export default function DashboardWidgetTile({
  widget,
  rect,
  transactions,
  selectedMonth,
  excludedMonthsSet,
  transactionTagsMap,
  dashboardStats,
  topExpenseCategories,
  latestTransactions,
  categoriesById,
  getSignedAmountForTransaction,
  onWidgetConfigChange,
  isDragging,
  isDropBlocked,
  isInteractionLocked,
  isConfigOpen,
  onToggleConfig,
  onToggleSize,
  onRemove,
}: DashboardWidgetTileProps) {
  const definition = DASHBOARD_WIDGET_DEFINITION_BY_TYPE[widget.containerType]

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: widget.id,
    disabled: isInteractionLocked,
  })

  const wrapperStyle = useMemo<CSSProperties>(() => {
    const dragTransform = isDragging ? transform : null

    return {
      position: 'absolute',
      left: 0,
      top: 0,
      width: rect.width,
      height: rect.height,
      minWidth: 0,
      minHeight: 0,
      maxWidth: '100%',
      maxHeight: '100%',
      overflow: 'hidden',
      boxSizing: 'border-box',
      transform: CSS.Translate.toString({
        x: rect.left + (dragTransform?.x ?? 0),
        y: rect.top + (dragTransform?.y ?? 0),
        scaleX: 1,
        scaleY: 1,
      }),
      transition: isDragging ? 'none' : 'transform 180ms ease, width 180ms ease, height 180ms ease',
      zIndex: isDragging ? 8 : isConfigOpen ? 7 : 2,
      pointerEvents: 'auto',
    }
  }, [isConfigOpen, isDragging, rect.height, rect.left, rect.top, rect.width, transform])

  const safeDefinition =
    definition ??
    DASHBOARD_WIDGET_DEFINITIONS.find((item) => item.type === 'month-finance') ??
    DASHBOARD_WIDGET_DEFINITIONS[0]

  const dragHandleProps = {
    ...attributes,
    ...listeners,
  } as ButtonHTMLAttributes<HTMLButtonElement>

  return (
    <DashboardWidgetFrame
      wrapperRef={setNodeRef}
      wrapperStyle={wrapperStyle}
      isDragging={isDragging}
      isDropBlocked={isDropBlocked}
    >
      <DashboardWidgetHeader
        widget={widget}
        safeDefinition={safeDefinition}
        dragHandleProps={dragHandleProps}
        onConfigOpen={() => onToggleConfig(widget.id)}
        onToggleSize={() => onToggleSize(widget.id)}
        onRemove={() => onRemove(widget.id)}
      />

      {isConfigOpen && (
        <DashboardTileConfigPanel
          widget={widget}
          onChange={(update) => onWidgetConfigChange(widget.id, update)}
        />
      )}

      <DashboardWidgetContent
        widget={widget}
        rect={rect}
        transactions={transactions}
        selectedMonth={selectedMonth}
        excludedMonthsSet={excludedMonthsSet}
        transactionTagsMap={transactionTagsMap}
        dashboardStats={dashboardStats}
        topExpenseCategories={topExpenseCategories}
        latestTransactions={latestTransactions}
        categoriesById={categoriesById}
        getSignedAmountForTransaction={getSignedAmountForTransaction}
      />
    </DashboardWidgetFrame>
  )
}