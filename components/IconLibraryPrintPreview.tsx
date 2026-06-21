import type { CSSProperties } from "react";
import {
  ICON_LIBRARY_PREVIEW_DATA,
  PREVIEW_LIBRARIES,
  type PreviewSection,
} from "../lib/iconLibraryPreviewData";
import styles from "./IconLibraryPrintPreview.module.css";

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

function PrintProposal({ icon, recommended }: { icon: string | null; recommended: boolean }) {
  if (!icon) return <span className={styles.missing}>BRAK DOBREGO ODPOWIEDNIKA</span>;
  const [, name] = icon.split(":");

  return (
    <div className={`${styles.proposal} ${recommended ? styles.recommended : ""}`}>
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
      <span className={styles.iconName}>
        {name}
        {recommended ? <span className={styles.badge}>szczególnie dobra</span> : null}
      </span>
    </div>
  );
}

export default function IconLibraryPrintPreview() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>BudżAppka / eksport ikon</span>
          <h1 className={styles.title}>Icon Library Preview</h1>
          <p className={styles.intro}>
            Pionowy widok do druku: {ICON_LIBRARY_PREVIEW_DATA.length} kluczy, 6 bibliotek oraz warianty
            rozmiaru 24/22, 24/20 i 24/18.
          </p>
        </header>

        {sections.map((section) => {
          const entries = ICON_LIBRARY_PREVIEW_DATA.filter((entry) => entry.section === section);
          return (
            <section className={styles.section} key={section}>
              <h2 className={styles.sectionTitle}>{section} ({entries.length})</h2>
              <div className={styles.entries}>
                {entries.map((entry) => (
                  <article className={styles.entry} key={entry.key}>
                    <h3 className={styles.key}>
                      <span className={styles.keyLabel}>Key:</span>{entry.key}
                    </h3>
                    <div className={styles.libraries}>
                      {PREVIEW_LIBRARIES.map((library) => (
                        <div className={styles.library} key={library.key}>
                          <span className={styles.libraryName}>{library.label}</span>
                          <PrintProposal
                            icon={entry.icons[library.key]}
                            recommended={entry.recommended === library.key}
                          />
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
