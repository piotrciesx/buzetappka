"use client";

import { CSSProperties } from "react";
import { uiInputApi } from "../lib/uiFoundation";
import {
  buildPaymentSplitPayload,
  createPaymentSplitItemsFromSingleSource,
  PaymentSplitInput,
  rebalancePaymentSplitAmounts,
} from "../lib/paymentSplitUtils";

type PaymentSourceOption = {
  id: string;
  name: string;
  type: string;
  optionLabel?: string;
};

type Props = {
  amount: string;
  isVisible: boolean;
  selectedPaymentSourceId: string;
  setSelectedPaymentSourceId: (value: string) => void;
  paymentSourceOptions: PaymentSourceOption[];
  paymentSplitItems: PaymentSplitInput[];
  setPaymentSplitItems: (
    value:
      | PaymentSplitInput[]
      | ((prev: PaymentSplitInput[]) => PaymentSplitInput[]),
  ) => void;
  styles: Record<string, CSSProperties>;
};

const splitWrapStyle: CSSProperties = {
  display: "grid",
  gap: 8,
};

const splitRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  alignItems: "center",
};

const splitHelpStyle: CSSProperties = {
  fontSize: 12,
  color: "var(--ui-color-secondary-text)",
  lineHeight: 1.45,
};

const HelpHint = ({ label }: { label: string }) => (
  <span
    data-ui-help="true"
    tabIndex={0}
    aria-label={label}
    data-tooltip={label}
  />
);

export default function PaymentSplitEditor({
  amount,
  isVisible,
  selectedPaymentSourceId,
  setSelectedPaymentSourceId,
  paymentSourceOptions,
  paymentSplitItems,
  setPaymentSplitItems,
  styles,
}: Props) {
  if (!isVisible) {
    return null;
  }

  const splitState = buildPaymentSplitPayload({
    totalAmountText: amount,
    selectedPaymentSourceId,
    splitItems: paymentSplitItems,
  });
  const isSplitActive = paymentSplitItems.length > 1;

  const handleAddPaymentSource = () => {
    if (isSplitActive) {
      setPaymentSplitItems((prev) => [
        ...prev,
        { paymentSourceId: "", amount: "" },
      ]);
      return;
    }

    setPaymentSplitItems(
      createPaymentSplitItemsFromSingleSource(selectedPaymentSourceId, amount),
    );
  };

  const handleSplitSourceChange = (
    index: number,
    nextPaymentSourceId: string,
  ) => {
    setPaymentSplitItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, paymentSourceId: nextPaymentSourceId }
          : item,
      ),
    );

    if (index === 0) {
      setSelectedPaymentSourceId(nextPaymentSourceId);
    }
  };

  const handleSplitAmountChange = (index: number, nextAmount: string) => {
    setPaymentSplitItems((prev) =>
      rebalancePaymentSplitAmounts(prev, index, nextAmount, amount),
    );
  };

  const handleRemoveSplitRow = (index: number) => {
    const nextItems = paymentSplitItems.filter(
      (_, itemIndex) => itemIndex !== index,
    );

    if (nextItems.length <= 1) {
      setSelectedPaymentSourceId(
        nextItems[0]?.paymentSourceId || selectedPaymentSourceId,
      );
      setPaymentSplitItems([]);
      return;
    }

    const rebalanceIndex = Math.max(0, Math.min(index, nextItems.length - 1));
    setSelectedPaymentSourceId(nextItems[0]?.paymentSourceId || "");
    setPaymentSplitItems(
      rebalancePaymentSplitAmounts(
        nextItems,
        rebalanceIndex,
        nextItems[rebalanceIndex]?.amount || "",
        amount,
      ),
    );
  };

  return (
    <div style={splitWrapStyle} data-payment-split-editor="true">
      {!isSplitActive ? (
        <>
          <span data-ui-select-shell="true">
            <select
              data-payment-source-select="true"
              className={`${uiInputApi.classNames.select} ${uiInputApi.classNames.inputL}`}
              data-input-width={uiInputApi.width.full}
              data-input-variant="entry"
              value={selectedPaymentSourceId}
              onChange={(event) => setSelectedPaymentSourceId(event.target.value)}
            >
              <option value="">Brak źródła płatności</option>
              {paymentSourceOptions.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.optionLabel || `${source.name} (${source.type})`}
                </option>
              ))}
            </select>
            <span data-ui-picker-chevron="true" aria-hidden="true" />
          </span>

          <div style={splitRowStyle} data-payment-split-row="true">
            <button
              type="button"
              className="ui-button--standard"
              data-payment-split-action="true"
              onClick={handleAddPaymentSource}
            >
              + dodaj źródło
            </button>
          </div>
        </>
      ) : (
        <>
          {paymentSplitItems.map((item, index) => (
            <div
              key={`split-item-${index}`}
              style={splitRowStyle}
              data-payment-split-row="true"
            >
              <span
                data-ui-select-shell="true"
                style={{ flex: "1 1 220px", minWidth: 220 }}
              >
                <select
                  data-payment-source-select="true"
                  data-payment-split-source="true"
                  className={`${uiInputApi.classNames.select} ${uiInputApi.classNames.inputL}`}
                  data-input-width={uiInputApi.width.full}
                  data-input-variant="entry"
                  value={item.paymentSourceId}
                  onChange={(event) =>
                    handleSplitSourceChange(index, event.target.value)
                  }
                >
                  <option value="">Wybierz źródło</option>
                  {paymentSourceOptions.map((source) => (
                    <option key={source.id} value={source.id}>
                      {source.optionLabel || `${source.name} (${source.type})`}
                    </option>
                  ))}
                </select>
                <span data-ui-picker-chevron="true" aria-hidden="true" />
              </span>

              <input
                data-payment-split-amount="true"
                className={uiInputApi.classNames.amountField}
                data-input-width={uiInputApi.width.compact}
                data-input-variant="entry"
                style={{ width: 110 }}
                placeholder="kwota"
                inputMode="decimal"
                value={item.amount}
                onChange={(event) =>
                  handleSplitAmountChange(index, event.target.value)
                }
              />

              <button
                type="button"
                className="ui-button--utility"
                data-payment-split-action="true"
                onClick={() => handleRemoveSplitRow(index)}
              >
                usuń
              </button>
            </div>
          ))}

          <div style={splitRowStyle} data-payment-split-row="true">
            <button
              type="button"
              className="ui-button--standard"
              data-payment-split-action="true"
              onClick={handleAddPaymentSource}
            >
              + dodaj źródło
            </button>
          </div>
        </>
      )}

      {isSplitActive && (
        <div
          data-payment-split-help="true"
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <span style={splitHelpStyle}>Podział kwoty</span>
          <HelpHint label="Przy kilku źródłach kwoty przeliczają się automatycznie. Zapis jest blokowany, jeśli suma nie zgadza się z kwotą transakcji albo któreś pole jest puste." />
        </div>
      )}

      {splitState.errors.length > 0 && (
        <div
          style={{ ...splitHelpStyle, color: "var(--ui-color-expense)" }}
          data-payment-split-errors="true"
        >
          {splitState.errors.join(" • ")}
        </div>
      )}
    </div>
  );
}
