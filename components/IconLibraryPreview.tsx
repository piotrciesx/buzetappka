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
  "Brakujace systemowe",
  "Kompatybilność",
];

function iconUrl(icon: string) {
  const [prefix, ...name] = icon.split(":");
  return `url("https://api.iconify.design/${prefix}/${name.join(":")}.svg")`;
}

function Proposal({ icon, recommended, exactSize }: { icon: string | null; recommended: boolean; exactSize?: boolean }) {
  if (!icon) return <span className={styles.missing}>BRAK DOBREGO ODPOWIEDNIKA</span>;
  const [, name] = icon.split(":");
  if (exactSize) {
    return (
      <div className={styles.proposal}>
        <span className={styles.tile} aria-hidden="true">
          <span
            className={styles.icon}
            style={{
              "--icon-url": iconUrl(icon),
              "--icon-size": "18px",
            } as CSSProperties}
          />
        </span>
        <span className={styles.name}>
          {icon}
          {recommended ? <span className={styles.badge}>szczegolnie dobra</span> : null}
        </span>
      </div>
    );
  }
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

function KeyCell({ entry }: { entry: (typeof ICON_LIBRARY_PREVIEW_DATA)[number] }) {
  return (
    <td className={styles.key}>
      <span>{entry.key}</span>
      {entry.label ? <span className={styles.keyLabel}>{entry.label}</span> : null}
      {entry.meaning ? <span className={styles.keyMeta}>{entry.meaning}</span> : null}
      {typeof entry.picker === "boolean" ? (
        <span className={styles.keyMeta}>picker: {entry.picker ? "TAK" : "NIE"}</span>
      ) : null}
      {typeof entry.technical === "boolean" ? (
        <span className={styles.keyMeta}>techniczna: {entry.technical ? "TAK" : "NIE"}</span>
      ) : null}
      {entry.aliases?.length ? <span className={styles.keyMeta}>aliasy: {entry.aliases.join(", ")}</span> : null}
    </td>
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
                        <KeyCell entry={entry} />
                        {PREVIEW_LIBRARIES.map((library) => {
                          const recommended = entry.recommended === (library.key as PreviewLibraryKey);
                          return (
                            <td className={recommended ? styles.recommended : undefined} key={library.key}>
                              <Proposal
                                exactSize={section === "Brakujace systemowe"}
                                icon={entry.icons[library.key]}
                                recommended={recommended}
                              />
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
