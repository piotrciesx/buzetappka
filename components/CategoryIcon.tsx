import type { CSSProperties } from "react";
import { getFinalIconId } from "../lib/iconRegistry";
import { getUiIcon } from "../lib/userAppearance";

type CategoryIconProps = {
  iconKey?: string | null;
  level?: 2 | 3;
  size?: "a" | "b" | "c";
};

const getIconMaskUrl = (iconId: string) => {
  const [prefix, ...name] = iconId.split(":");
  return `url("https://api.iconify.design/${prefix}/${name.join(":")}.svg")`;
};

export default function CategoryIcon({
  iconKey,
  level = 2,
  size = "a",
}: CategoryIconProps) {
  const iconId = getFinalIconId(iconKey);

  if (!iconId) {
    return null;
  }

  const icon = getUiIcon(iconKey);

  return (
    <span
      data-category-icon="true"
      data-category-icon-level={level}
      data-category-icon-size={size}
      aria-hidden="true"
      title={icon?.label || iconKey || undefined}
    >
      <span
        data-category-icon-svg="true"
        data-category-icon-glyph="true"
        style={{ "--category-icon-url": getIconMaskUrl(iconId) } as CSSProperties}
      />
    </span>
  );
}
