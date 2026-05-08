'use client'

import type { ComponentProps } from 'react'
import BudgetLimitEditorModal from '../BudgetLimitEditorModal'
import BudgetPageOverlays from '../BudgetPageOverlays'

type BudgetAppOverlaySectionProps = {
  overlayProps: ComponentProps<typeof BudgetPageOverlays>
  budgetLimitEditorModalProps: ComponentProps<typeof BudgetLimitEditorModal>
}

export default function BudgetAppOverlaySection({
  overlayProps,
  budgetLimitEditorModalProps,
}: BudgetAppOverlaySectionProps) {
  return (
    <>
      <BudgetPageOverlays {...overlayProps} />
      <BudgetLimitEditorModal {...budgetLimitEditorModalProps} />
    </>
  )
}
