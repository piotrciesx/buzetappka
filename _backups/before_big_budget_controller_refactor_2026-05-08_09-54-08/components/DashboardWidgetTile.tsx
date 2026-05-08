'use client'

import { ButtonHTMLAttributes, CSSProperties, HTMLAttributes, useMemo } from 'react'
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
  budgetStartDate,
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
  isMobileDashboard,
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
  const mobileDragProps = isMobileDashboard
    ? ({
        ...attributes,
        ...listeners,
      } as HTMLAttributes<HTMLDivElement>)
    : undefined

  return (
    <DashboardWidgetFrame
      wrapperRef={setNodeRef}
      wrapperStyle={wrapperStyle}
      isDragging={isDragging}
      isDropBlocked={isDropBlocked}
      dragAttributes={mobileDragProps}
      dragListeners={mobileDragProps}
      onResizePointerDown={isMobileDashboard ? undefined : (edge, event) => {
        if (isInteractionLocked) return

        event.preventDefault()
        event.stopPropagation()

        const startX = event.clientX
        const direction =
          widget.width >= 4 ? (edge === 'right' ? -1 : 1) : edge === 'right' ? 1 : -1
        let didResize = false

        const handlePointerMove = (moveEvent: PointerEvent) => {
          const deltaX = moveEvent.clientX - startX

          if (!didResize && deltaX * direction > 18) {
            didResize = true
            onToggleSize(widget.id)
            cleanup()
          }
        }

        const cleanup = () => {
          window.removeEventListener('pointermove', handlePointerMove)
          window.removeEventListener('pointerup', cleanup)
          window.removeEventListener('pointercancel', cleanup)
        }

        window.addEventListener('pointermove', handlePointerMove)
        window.addEventListener('pointerup', cleanup)
        window.addEventListener('pointercancel', cleanup)
      }}
    >
      <DashboardWidgetHeader
        widget={widget}
        safeDefinition={safeDefinition}
        dragHandleProps={isMobileDashboard ? undefined : dragHandleProps}
        isMobileDashboard={isMobileDashboard}
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
        budgetStartDate={budgetStartDate}
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
