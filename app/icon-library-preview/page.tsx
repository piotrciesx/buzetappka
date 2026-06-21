import type { Metadata } from "next";
import IconLibraryPreview from "../../components/IconLibraryPreview";

export const metadata: Metadata = {
  title: "Icon Library Preview | BudżAppka",
  description: "Testowe porównanie istniejących bibliotek ikon bez zmiany finalnego registry.",
};

export default function IconLibraryPreviewPage() {
  return <IconLibraryPreview />;
}
