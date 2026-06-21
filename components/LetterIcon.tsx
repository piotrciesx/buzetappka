import {
  LETTER_ICON_OPTIONS,
  type LetterIconCharacter,
} from "../lib/iconRegistry";

export const LETTER_ICON_CHARACTERS = LETTER_ICON_OPTIONS.map((option) => option.character);
export type { LetterIconCharacter } from "../lib/iconRegistry";

type LetterIconProps = {
  character: LetterIconCharacter;
};

export default function LetterIcon({ character }: LetterIconProps) {
  return (
    <span data-letter-icon="true" aria-hidden="true">
      {character}
    </span>
  );
}
