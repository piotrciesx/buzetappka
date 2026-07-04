"use client";

import {
  UI_COLOR_OPTIONS,
  getUiColor,
  type UiColorKey,
} from "../../lib/userAppearance";

type FoundationColorPickerProps = {
  value: UiColorKey;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onChange: (color: UiColorKey) => void;
};

export default function FoundationColorPicker({
  value,
  isOpen,
  onOpenChange,
  onChange,
}: FoundationColorPickerProps) {
  const selectedColor = getUiColor(value);

  return (
    <div
      data-ui-picker-control="true"
      data-ui-picker-variant="color"
      data-open={isOpen ? "true" : "false"}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        data-ui-picker-trigger="true"
        aria-expanded={isOpen}
        onClick={() => onOpenChange(!isOpen)}
      >
        <span data-ui-picker-value="true">
          <span data-ui-color-swatch="true" data-ui-tone={selectedColor.tone} />
          {selectedColor.label}
        </span>
        <span data-ui-picker-chevron="true" aria-hidden="true" />
      </button>

      {isOpen && (
        <div data-ui-picker-menu="true" data-layout="colors">
          {UI_COLOR_OPTIONS.map((option) => (
            <button
              key={option.tone}
              type="button"
              data-ui-color-option="true"
              data-ui-tone={option.tone}
              data-active={value === option.tone}
              aria-label={`Wybierz kolor: ${option.label}`}
              title={option.label}
              onClick={() => {
                onChange(option.tone);
                onOpenChange(false);
              }}
            >
              <span data-ui-color-swatch="true" data-ui-tone={option.tone} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
