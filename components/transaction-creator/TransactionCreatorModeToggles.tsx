import { CSSProperties } from "react";
import { serialToggleStyle } from "./transactionCreatorModalStyles";

type Props = {
  selectedLevel1Id: string | null;
  effectiveCategoryId: string | null;
  isSerialModeEnabled: boolean;
  setIsSerialModeEnabled: (value: boolean) => void;
  styles: Record<string, CSSProperties>;
};

const HelpHint = ({ label }: { label: string }) => (
  <span
    data-ui-help="true"
    tabIndex={0}
    aria-label={label}
    data-tooltip={label}
  />
);

export default function TransactionCreatorModeToggles({
  selectedLevel1Id,
  effectiveCategoryId,
  isSerialModeEnabled,
  setIsSerialModeEnabled,
  styles,
}: Props) {
  return (
    <div data-transaction-mode-panel="true">
      <label style={serialToggleStyle} data-transaction-entry-toggle="true">
        <input
          type="checkbox"
          checked={isSerialModeEnabled}
          onChange={(event) => setIsSerialModeEnabled(event.target.checked)}
        />
        dodawaj seryjnie
        <HelpHint label="Po zapisie kreator zostanie otwarty, żeby szybko dodać kolejny wpis w tej samej kategorii." />
      </label>

      {(!selectedLevel1Id || !effectiveCategoryId) && (
        <div style={styles.emptyText} data-transaction-save-hint="true">
          Aby zapisać wpis, wybierz typ oraz najniższą dostępną kategorię.
        </div>
      )}
    </div>
  );
}
