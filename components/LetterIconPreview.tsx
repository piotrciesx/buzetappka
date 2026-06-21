import LetterIcon, { LETTER_ICON_CHARACTERS } from "./LetterIcon";
import styles from "./LetterIconPreview.module.css";

export default function LetterIconPreview() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>BudżAppka / test liter</span>
          <h1 className={styles.title}>LetterIcon — 700 vs 900</h1>
          <p className={styles.intro}>
            Zwykłe znaki tekstowe bez SVG i bibliotek ikon. Oba warianty dziedziczą currentColor
            i są pokazane w kafelkach 24×24 px używanych przez picker.
          </p>
        </header>

        <div className={styles.legend} aria-hidden="true">
          <span>Znak</span>
          <span>700</span>
          <span>900</span>
        </div>

        <div className={styles.list}>
          {LETTER_ICON_CHARACTERS.map((character) => (
            <div className={styles.row} key={character}>
              <span className={styles.character}>{character}</span>
              <span className={styles.variant}>
                <span className={styles.tile} title={`${character}, font-weight 700`}>
                  <LetterIcon character={character} />
                </span>
              </span>
              <span className={styles.variant}>
                <span className={`${styles.tile} ${styles.weight900}`} title={`${character}, font-weight 900`}>
                  <LetterIcon character={character} />
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
