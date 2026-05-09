import { CATEGORY_ICONS } from '../lib/userAppearance'
import CategoryIcon from './CategoryIcon'

type CategoryIconPickerProps = {
  value?: string | null
  onChange: (value: string | null) => void
}

export default function CategoryIconPicker({ value, onChange }: CategoryIconPickerProps) {
  return (
    <div data-category-icon-picker="true" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        data-category-icon-option="clear"
        data-active={!value ? 'true' : 'false'}
        onClick={() => onChange(null)}
      >
        bez ikony
      </button>
      {CATEGORY_ICONS.map((icon) => (
        <button
          key={icon.key}
          type="button"
          data-category-icon-option="true"
          data-active={value === icon.key ? 'true' : 'false'}
          title={icon.label}
          onClick={() => onChange(icon.key)}
        >
          <CategoryIcon iconKey={icon.key} level={2} />
          <span>{icon.label}</span>
        </button>
      ))}
    </div>
  )
}
