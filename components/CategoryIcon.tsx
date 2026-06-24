import type { CSSProperties } from "react";
import { getFinalIconId, getLetterIconCharacter } from "../lib/iconRegistry";
import { getUiIcon } from "../lib/userAppearance";
import LetterIcon from "./LetterIcon";

type CategoryIconSize = "small" | "a" | "b" | "c" | "summary" | "large";

type CategoryIconProps = {
  iconKey?: string | null;
  level?: 2 | 3;
  size?: CategoryIconSize;
};

const CATEGORY_ICON_SIZE_VARS: Record<CategoryIconSize, string> = {
  small: "var(--ui-icon-glyph-size-small, 14px)",
  a: "var(--ui-icon-glyph-size-a, 18px)",
  b: "var(--ui-icon-glyph-size-b, 20px)",
  c: "var(--ui-icon-glyph-size-c, 24px)",
  summary: "var(--ui-icon-glyph-size-summary, 24px)",
  large: "var(--ui-icon-glyph-size-goal, 28px)",
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
  const letterCharacter = getLetterIconCharacter(iconKey);

  if (!iconId && !letterCharacter) {
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
      style={{ "--category-icon-glyph-size": CATEGORY_ICON_SIZE_VARS[size] } as CSSProperties}
    >
      {letterCharacter ? (
        <LetterIcon character={letterCharacter} />
      ) : (
        <span
          data-category-icon-svg="true"
          data-category-icon-glyph="true"
          style={{ "--category-icon-url": getIconMaskUrl(iconId as string) } as CSSProperties}
        />
      )}
    </span>
  );
}
