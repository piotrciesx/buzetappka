import type { Metadata } from "next";
import LetterIconPreview from "../../components/LetterIconPreview";

export const metadata: Metadata = {
  title: "LetterIcon Preview | BudżAppka",
  description: "Porównanie tekstowych ikon liter o grubości 700 i 900.",
};

export default function LetterIconPreviewPage() {
  return <LetterIconPreview />;
}
