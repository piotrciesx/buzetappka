"use client";

import { useEffect, useId, useRef, useState } from "react";

export type ManagementSelectOption<T extends string> = {
  value: T;
  label: string;
};

type ManagementSelectProps<T extends string> = {
  value: T;
  options: readonly ManagementSelectOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  disabled?: boolean;
};

export default function ManagementSelect<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  disabled = false,
}: ManagementSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    window.addEventListener("pointerdown", closeOnOutsideClick);
    return () => window.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  const moveSelection = (direction: 1 | -1) => {
    const currentIndex = Math.max(0, options.findIndex((option) => option.value === value));
    const nextIndex = (currentIndex + direction + options.length) % options.length;
    onChange(options[nextIndex].value);
  };

  return (
    <div ref={rootRef} data-ui-management-select="true" data-open={isOpen ? "true" : "false"}>
      <button
        type="button"
        data-ui-management-select-trigger="true"
        role="combobox"
        aria-label={ariaLabel}
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setIsOpen(false);
            return;
          }
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (!isOpen) setIsOpen(true);
            else moveSelection(event.key === "ArrowDown" ? 1 : -1);
          }
        }}
      >
        <span>{selected?.label}</span>
        <span data-ui-picker-chevron="true" aria-hidden="true" />
      </button>

      {isOpen && (
        <div id={listboxId} data-ui-management-select-menu="true" role="listbox" aria-label={ariaLabel}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              data-active={option.value === value ? "true" : undefined}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              <span>{option.label}</span>
              <span data-ui-management-select-check="true" aria-hidden="true">✓</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
