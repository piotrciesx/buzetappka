import type { CSSProperties } from "react";
import {
  ICON_LIBRARY_PREVIEW_DATA,
  PREVIEW_LIBRARIES,
  type PreviewLibraryKey,
  type PreviewSection,
} from "../lib/iconLibraryPreviewData";
import styles from "./IconLibraryPreview.module.css";

const sections: PreviewSection[] = [
  "Użytkownika",
  "shopping-cart-test",
  "Litery",
  "Systemowe",
  "Kompatybilność",
];

function iconUrl(icon: string) {
  const [prefix, ...name] = icon.split(":");
  return `url("https://api.iconify.design/${prefix}/${name.join(":")}.svg")`;
}

function Proposal({ icon, recommended }: { icon: string | null; recommended: boolean }) {
  if (!icon) return <span className={styles.missing}>BRAK DOBREGO ODPOWIEDNIKA</span>;
  const [, name] = icon.split(":");
  return (
    <div className={styles.proposal}>
      <span className={styles.sizeVariants} aria-hidden="true">
        {[22, 20, 18].map((size) => (
          <span className={styles.sizeVariant} key={size}>
            <span className={styles.tile}>
              <span
                className={styles.icon}
                style={{
                  "--icon-url": iconUrl(icon),
                  "--icon-size": `${size}px`,
                } as CSSProperties}
              />
            </span>
            <span className={styles.sizeLabel}>24/{size}</span>
          </span>
        ))}
      </span>
      <span className={styles.name}>
        {name}
        {recommended ? <span className={styles.badge}>szczególnie dobra</span> : null}
      </span>
    </div>
  );
}

export default function IconLibraryPreview() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>BudżAppka / laboratorium ikon</span>
          <h1 className={styles.title}>Icon Library Preview</h1>
          <p className={styles.intro}>
            Niezależny raport porównawczy. Każdy kafelek ma 24 × 24 px, glif 22 × 22 px i dziedziczy
            kolor przez currentColor. Ten ekran nie zapisuje wyborów i nie korzysta z finalnego registry.
          </p>
          <div className={styles.summary}>
            <span>{ICON_LIBRARY_PREVIEW_DATA.length} kluczy</span>
            <span>6 bibliotek</span>
            <span>{ICON_LIBRARY_PREVIEW_DATA.length * 6} pól porównawczych</span>
            <span>Iconify API</span>
          </div>
          <a
            className={styles.exportButton}
            href="/icon-library-preview-print"
            target="_blank"
            rel="noreferrer"
          >
            Eksport PDF
          </a>
        </header>

        {sections.map((section) => {
          const entries = ICON_LIBRARY_PREVIEW_DATA.filter((entry) => entry.section === section);
          return (
            <section className={styles.section} key={section}>
              <h2 className={styles.sectionTitle}>{section} ({entries.length})</h2>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>key</th>
                      {PREVIEW_LIBRARIES.map((library) => <th key={library.key}>{library.label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr key={entry.key}>
                        <td className={styles.key}>{entry.key}</td>
                        {PREVIEW_LIBRARIES.map((library) => {
                          const recommended = entry.recommended === (library.key as PreviewLibraryKey);
                          return (
                            <td className={recommended ? styles.recommended : undefined} key={library.key}>
                              <Proposal icon={entry.icons[library.key]} recommended={recommended} />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
