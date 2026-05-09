import { getCategoryIcon } from '../lib/userAppearance'

type CategoryIconProps = {
  iconKey?: string | null
  level?: 2 | 3
}

export default function CategoryIcon({ iconKey, level = 2 }: CategoryIconProps) {
  const icon = getCategoryIcon(iconKey)

  if (!icon) {
    return null
  }

  return (
    <span
      data-category-icon="true"
      data-category-icon-level={level}
      aria-hidden="true"
      title={icon.label}
    >
      {icon.symbol}
    </span>
  )
}
