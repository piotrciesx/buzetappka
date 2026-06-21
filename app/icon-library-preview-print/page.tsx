import type { Metadata } from "next";
import IconLibraryPrintPreview from "../../components/IconLibraryPrintPreview";

export const metadata: Metadata = {
  title: "Icon Library Preview — druk | BudżAppka",
  description: "Pionowy widok porównania bibliotek ikon zoptymalizowany do eksportu PDF.",
};

export default function IconLibraryPreviewPrintPage() {
  return <IconLibraryPrintPreview />;
}
