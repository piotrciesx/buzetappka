'use client'

import type { ComponentProps } from 'react'
import BudgetPageOverlays from '../BudgetPageOverlays'

type BudgetAppOverlaySectionProps = {
  overlayProps: ComponentProps<typeof BudgetPageOverlays>
}

export default function BudgetAppOverlaySection({
  overlayProps,
}: BudgetAppOverlaySectionProps) {
  return <BudgetPageOverlays {...overlayProps} />
}
