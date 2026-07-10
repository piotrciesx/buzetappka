"use client";

import {
  CSSProperties,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import DescriptionSuggestionDeleteMenu from "./DescriptionSuggestionDeleteMenu";
import PaymentSplitEditor from "./PaymentSplitEditor";
import CategoryIcon from "./CategoryIcon";
import TransactionCreatorCategorySection from "./transaction-creator/TransactionCreatorCategorySection";
import TransactionCreatorHeader from "./transaction-creator/TransactionCreatorHeader";
import TransactionCreatorModeToggles from "./transaction-creator/TransactionCreatorModeToggles";
import {
  FoundationCheckbox,
  FoundationChoiceCard,
  FoundationChoiceGrid,
  FoundationLiveSummary,
  FoundationStepTracker,
  FoundationWizardFooter,
  FoundationWizardShell,
} from "./ui/FoundationPrimitives";
import { getDayInputFromDate, normalizeDayInput } from "../lib/dateUtils";
import { uiInputApi } from "../lib/uiFoundation";
import { useDescriptionSuggestions } from "../lib/useDescriptionSuggestions";
import { splitTagInput } from "../lib/tagUtils";
import {
  activeSuggestionButtonStyle,
  dateLabelStyle,
  descriptionInputWrapStyle,
  overlayStyle,
  suggestionButtonStyle,
  suggestionsDropdownStyle,
  tagBadgeStyle,
  tagBadgesWrapStyle,
  tagRemoveButtonStyle,
} from "./transaction-creator/transactionCreatorModalStyles";
import {
  Category,
  TransactionCreatorModalProps,
} from "./transaction-creator/transactionCreatorTypes";
import {
  getCategoryPathLabel,
  normalizeAmountInput,
} from "./transaction-creator/transactionCreatorUtils";

const entrySectionStyle = {
  display: "grid",
  gap: "var(--ui-space-6)",
} as const;

const entryCardStyle = {
  display: "grid",
  gap: "var(--ui-space-5)",
  padding: 0,
} as const;

const entryHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--ui-space-6)",
} as const;

const entryTitleStyle = {
  color: "var(--ui-color-primary-navy)",
  fontSize: "var(--ui-type-t3)",
  fontWeight: "var(--ui-font-weight-bold)",
  lineHeight: "var(--ui-line-height-heading)",
} as const;

const entryGridStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(82px, 104px) minmax(0, 1fr)",
  gridTemplateAreas: `"day description" "amount amount"`,
  alignItems: "end",
  gap: "var(--ui-space-5)",
} as const;

const fieldShellStyle = {
  minWidth: 0,
  display: "grid",
  gap: "var(--ui-space-2)",
} as const;

const dayFieldShellStyle = {
  minWidth: 0,
  display: "grid",
  gridArea: "day",
  gap: "var(--ui-space-2)",
} as const;

const extraGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr",
  alignItems: "start",
  gap: "var(--ui-space-5)",
} as const;

const actionsStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--ui-space-5)",
  flexWrap: "wrap",
  marginTop: "var(--ui-space-7)",
} as const;

type TransactionWizardStep = "type" | "category" | "details" | "summary";

const getLevel1Kind = (category?: Category | null) => {
  const normalizedName = category?.name.toLocaleLowerCase("pl-PL") || "";

  if (normalizedName.includes("przych") || normalizedName.includes("income")) {
    return "income";
  }

  if (normalizedName.includes("wydat") || normalizedName.includes("expense")) {
    return "expense";
  }

  return "neutral";
};

export default function TransactionCreatorModal(
  props: TransactionCreatorModalProps,
) {
  const {
    isOpen,
    selectedMonth,
    level1Categories,
    level2ByParentId,
    level3ByParentId,
    categoriesById,
    suggestedCategoryId,
    lockedLevel1Id,
    topShortcutCategories,
    pinnedShortcutCategories,
    pinnedCategoryIds,
    recentShortcutCategories,
    descriptionSuggestions,
    onSelectShortcutCategory,
    onTogglePinnedCategory,
    selectedLevel1Id,
    setSelectedLevel1Id,
    selectedLevel2Id,
    setSelectedLevel2Id,
    selectedCategoryId,
    setSelectedCategoryId,
    isSerialModeEnabled,
    setIsSerialModeEnabled,
    amount,
    setAmount,
    description,
    setDescription,
    transactionDate,
    setTransactionDate,
    selectedTagNames,
    setSelectedTagNames,
    selectedPaymentSourceId,
    setSelectedPaymentSourceId,
    isPaymentSourceVisible,
    paymentSourceOptions,
    paymentSplitItems,
    setPaymentSplitItems,
    selectedRecurringTransactionId,
    setSelectedRecurringTransactionId,
    recurringOptions,
    recurringSuggestions,
    isSaving,
    onClose,
    onSave,
    onSaveAndClose,
    amountInputRef,
    descriptionInputRef,
    styles,
    onDeleteDescriptionSuggestion,
  } = props;

  const [tagInputValue, setTagInputValue] = useState("");
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);
  const [wizardStepOverride, setWizardStepOverride] =
    useState<TransactionWizardStep | null>(null);
  const [hasVisitedTypeStep, setHasVisitedTypeStep] = useState(false);
  const tagInputRef = useRef<HTMLInputElement | null>(null);
  const dayInputRef = useRef<HTMLInputElement | null>(null);
  const saveButtonRef = useRef<HTMLButtonElement | null>(null);

  const availableLevel2Categories = selectedLevel1Id
    ? level2ByParentId[selectedLevel1Id] || []
    : [];
  const availableLevel3Categories = selectedLevel2Id
    ? level3ByParentId[selectedLevel2Id] || []
    : [];

  const canSaveOnLevel1 =
    Boolean(selectedLevel1Id) && availableLevel2Categories.length === 0;
  const canSaveOnLevel2 =
    Boolean(selectedLevel2Id) && availableLevel3Categories.length === 0;

  const effectiveCategoryId =
    selectedCategoryId ||
    (canSaveOnLevel2 ? selectedLevel2Id : null) ||
    (canSaveOnLevel1 ? selectedLevel1Id : null);

  const effectiveCategoryLabel = effectiveCategoryId
    ? getCategoryPathLabel(effectiveCategoryId, categoriesById)
    : "";
  const selectedLevel1Category = selectedLevel1Id
    ? categoriesById[selectedLevel1Id] || null
    : null;
  const selectedCategory = effectiveCategoryId
    ? categoriesById[effectiveCategoryId] || null
    : null;
  const selectedCategoryAppearance = selectedCategory as
    | (Category & {
        icon?: string | null;
        icon_key?: string | null;
        category_icon?: string | null;
      })
    | null;
  const selectedCategoryIconKey =
    selectedCategoryAppearance?.icon_key ||
    selectedCategoryAppearance?.category_icon ||
    selectedCategoryAppearance?.icon ||
    null;
  const entryKind = getLevel1Kind(selectedLevel1Category);
  const entryKindLabel =
    entryKind === "income"
      ? "Przychód"
      : entryKind === "expense"
        ? "Wydatek"
        : "Wpis";
  const entryKindTone =
    entryKind === "income"
      ? "success"
      : entryKind === "expense"
        ? "danger"
        : "neutral-blue";
  const shouldShowTypeStep =
    !lockedLevel1Id && (!selectedLevel1Id || hasVisitedTypeStep);
  const wizardSteps = [
    ...(shouldShowTypeStep
      ? [{ id: "type", title: "Typ", description: "Przychód lub wydatek" }]
      : []),
    { id: "category", title: "Kategoria", description: "L2 i L3" },
    { id: "details", title: "Szczegóły", description: "Kwota i opis" },
    { id: "summary", title: "Zapis", description: "Podsumowanie" },
  ];
  const baseWizardStep: TransactionWizardStep = !selectedLevel1Id
    ? "type"
    : effectiveCategoryId
      ? "details"
      : "category";
  const canUseWizardStep = (step: TransactionWizardStep) => {
    if (step === "type") {
      return shouldShowTypeStep;
    }

    if (step === "category") {
      return Boolean(selectedLevel1Id);
    }

    return Boolean(effectiveCategoryId);
  };
  const activeWizardStep =
    wizardStepOverride && canUseWizardStep(wizardStepOverride)
      ? wizardStepOverride
      : baseWizardStep;
  const wizardStepStyle = {
    "--ui-foundation-step-count": wizardSteps.length,
  } as CSSProperties;

  const focusAmountInput = () => {
    window.setTimeout(() => {
      amountInputRef.current?.focus();
    }, 0);
  };

  const handleShortcutClick = (categoryId: string) => {
    onSelectShortcutCategory(categoryId);
    setWizardStepOverride("details");
    focusAmountInput();
  };

  const handleLevel1Click = (category: Category) => {
    const level2Children = level2ByParentId[category.id] || [];
    const isFinalHere = level2Children.length === 0;

    setSelectedLevel1Id(category.id);
    setSelectedLevel2Id(null);
    setSelectedCategoryId(isFinalHere ? category.id : null);

    if (isFinalHere) {
      setWizardStepOverride("details");
      focusAmountInput();
    } else {
      setWizardStepOverride("category");
    }
  };

  const handleLevel2Click = (level2Category: Category) => {
    const level3Children = level3ByParentId[level2Category.id] || [];
    const isFinalHere = level3Children.length === 0;

    setSelectedLevel2Id(level2Category.id);
    setSelectedCategoryId(isFinalHere ? level2Category.id : null);

    if (isFinalHere) {
      setWizardStepOverride("details");
      focusAmountInput();
    } else {
      setWizardStepOverride("category");
    }
  };

  const handleLevel3Click = (level3Category: Category) => {
    setSelectedCategoryId(level3Category.id);
    setWizardStepOverride("details");
    focusAmountInput();
  };

  const applyRecurringLink = (itemId: string) => {
    setSelectedRecurringTransactionId(itemId);

    const item = [...recurringOptions, ...recurringSuggestions].find(
      (option) => option.id === itemId,
    );

    if (!item) {
      return;
    }

    if (item.description) {
      setDescription(item.description);
    }

    if (
      item.useAmountWhenCreating &&
      item.amount !== null &&
      item.amount !== undefined
    ) {
      setAmount(String(item.amount));
    }
  };

  const handleTagInputChange = (value: string) => {
    setTagInputValue(value);
    setSelectedTagNames(splitTagInput(value));
  };

  const handleRemoveTag = (tagName: string) => {
    const nextTagNames = selectedTagNames.filter((item) => item !== tagName);
    setSelectedTagNames(nextTagNames);
    setTagInputValue(nextTagNames.join(", "));
  };

  useEffect(() => {
    setTagInputValue(selectedTagNames.join(", "));
  }, [selectedTagNames]);

  const dayInputValue = getDayInputFromDate(transactionDate, selectedMonth);
  const today = new Date();
  const todayMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const todayDay = String(today.getDate()).padStart(2, "0");
  const todayDate = `${todayMonth}-${todayDay}`;
  const isTodayAvailable = selectedMonth === todayMonth;
  const isTodaySelected = transactionDate === todayDate;
  const selectedRecurringOption = [
    ...recurringOptions,
    ...recurringSuggestions,
  ].find((item) => item.id === selectedRecurringTransactionId);
  const selectedPaymentSourceLabel =
    paymentSourceOptions.find((item) => item.id === selectedPaymentSourceId)
      ?.optionLabel ||
    paymentSourceOptions.find((item) => item.id === selectedPaymentSourceId)
      ?.name ||
    "Bez źródła";
  const splitSummary =
    paymentSplitItems.length > 1
      ? paymentSplitItems
          .map((item) => {
            const sourceLabel =
              paymentSourceOptions.find(
                (option) => option.id === item.paymentSourceId,
              )?.name || "Źródło";

            return `${sourceLabel}: ${item.amount || "0"}`;
          })
          .join(", ")
      : "Bez podziału";
  const tagSummary =
    selectedTagNames.length > 0 ? selectedTagNames.join(", ") : "Brak tagów";
  const descriptionSummary = description.trim() || "Bez opisu";
  const {
    filteredSuggestions,
    activeSuggestionIndex,
    applySuggestion,
    handleKeyDown,
    handleSuggestionContextMenu,
    handleSuggestionPointerDown,
    handleSuggestionPointerUp,
    handleSuggestionPointerLeave,
    suggestionToDelete,
    deletePromptPosition,
    closeDeletePrompt,
    confirmDeleteSuggestion,
  } = useDescriptionSuggestions({
    query: description,
    setQuery: setDescription,
    categoryId: effectiveCategoryId,
    isEnabled: isDescriptionFocused,
    descriptionSuggestions,
    inputRef: descriptionInputRef,
    onDeleteSuggestion: onDeleteDescriptionSuggestion,
  });

  const handleSaveFromKeyboard = async () => {
    if (isSaving || !selectedLevel1Id || !effectiveCategoryId) {
      return;
    }

    await onSaveAndClose();
  };

  const handleDescriptionKeyDown = async (
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (handleKeyDown(event)) {
      return;
    }

    if (event.key === "Tab" && !event.shiftKey) {
      event.preventDefault();
      amountInputRef.current?.focus();
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      await handleSaveFromKeyboard();
    }
  };

  const handleTagsKeyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Tab") {
      event.preventDefault();

      if (event.shiftKey) {
        dayInputRef.current?.focus();
      } else {
        saveButtonRef.current?.focus();
      }

      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      await handleSaveFromKeyboard();
    }
  };

  const handleWizardStepClick = (stepId: string) => {
    const nextStep = stepId as TransactionWizardStep;

    if (!canUseWizardStep(nextStep)) {
      return;
    }

    setWizardStepOverride(nextStep);
  };

  const goToPreviousStep = () => {
    if (activeWizardStep === "summary") {
      setWizardStepOverride("details");
      return;
    }

    if (activeWizardStep === "details") {
      setWizardStepOverride("category");
      return;
    }

    if (activeWizardStep === "category" && shouldShowTypeStep) {
      setWizardStepOverride("type");
    }
  };

  const selectTypeFromWizard = (category: Category) => {
    const isFinalHere = (level2ByParentId[category.id] || []).length === 0;

    setHasVisitedTypeStep(true);
    handleLevel1Click(category);
    setWizardStepOverride(isFinalHere ? "details" : "category");
  };

  const renderLiveSummary = () => (
    <FoundationLiveSummary
      title="Podsumowanie wpisu"
      description="Spokojny podgląd tego, co zostanie zapisane."
      aria-label="Podsumowanie wpisu"
      data-transaction-live-summary="true"
    >
      <div data-transaction-live-summary-hero="true" data-ui-tone={entryKindTone}>
        <span data-ui-icon-tile="true" data-ui-icon-role="creator-summary" data-ui-tone={entryKindTone} aria-hidden="true">
          <CategoryIcon iconKey={selectedCategoryIconKey || "more"} size="large" />
        </span>
        <div data-transaction-live-summary-title="true">
          <strong>{effectiveCategoryLabel || "Wybierz kategorię"}</strong>
          <span>{entryKindLabel}</span>
        </div>
      </div>

      <SummaryRow label="Kwota" value={amount || "0,00"} />
      <SummaryRow label="Dzień" value={dayInputValue || "Bez dnia"} />
      <SummaryRow label="Źródło płatności" value={selectedPaymentSourceLabel} />
      <SummaryRow label="Split payment" value={splitSummary} />
      <SummaryRow label="Tagi" value={tagSummary} />
      <SummaryRow label="Opis" value={descriptionSummary} />
    </FoundationLiveSummary>
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div
      data-ui-overlay="true"
      data-transaction-modal-overlay="true"
      style={overlayStyle}
      onClick={onClose}
    >
      <section
        data-ui-modal-surface="true"
        data-ui-modal-size="wide"
        data-ui-density="comfort"
        data-transaction-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <TransactionCreatorHeader
          selectedMonth={selectedMonth}
          suggestedCategoryId={suggestedCategoryId}
          lockedLevel1Id={lockedLevel1Id}
          categoriesById={categoriesById}
          styles={styles}
          onClose={onClose}
        />

        <FoundationWizardShell
          variant="modal"
          data-transaction-wizard="true"
        >
          <FoundationStepTracker
            steps={wizardSteps}
            activeStep={activeWizardStep}
            onStepClick={handleWizardStepClick}
            style={wizardStepStyle}
          />

        <div data-ui-form-shell="true" data-transaction-creator-body="true">
          {activeWizardStep === "type" && (
            <section data-transaction-wizard-step="type">
              <header data-transaction-wizard-step-header="true">
                <strong>Wybierz typ wpisu</strong>
                <span>Po wyborze przejdziesz do kategorii.</span>
              </header>

              <FoundationChoiceGrid columns={2}>
                {level1Categories.map((level1Category) => {
                  const kind = getLevel1Kind(level1Category);
                  const tone =
                    kind === "income"
                      ? "success"
                      : kind === "expense"
                        ? "danger"
                        : "neutral-blue";

                  return (
                    <FoundationChoiceCard
                      key={level1Category.id}
                      title={level1Category.name}
                      description="Wybierz i przejdź do kategorii"
                      tone={tone}
                      selected={selectedLevel1Id === level1Category.id}
                      icon={
                        <CategoryIcon
                          iconKey={kind === "expense" ? "expense_minus" : "income_plus"}
                          size="summary"
                        />
                      }
                      onClick={() => selectTypeFromWizard(level1Category)}
                    />
                  );
                })}
              </FoundationChoiceGrid>
            </section>
          )}

          {activeWizardStep === "category" && (
            <TransactionCreatorCategorySection
              level1Categories={level1Categories}
              availableLevel2Categories={availableLevel2Categories}
              availableLevel3Categories={availableLevel3Categories}
              level2ByParentId={level2ByParentId}
              level3ByParentId={level3ByParentId}
              categoriesById={categoriesById}
              lockedLevel1Id={lockedLevel1Id}
              selectedLevel1Id={selectedLevel1Id}
              selectedLevel2Id={selectedLevel2Id}
              effectiveCategoryId={null}
              effectiveCategoryLabel={effectiveCategoryLabel}
              topShortcutCategories={topShortcutCategories}
              pinnedShortcutCategories={pinnedShortcutCategories}
              pinnedCategoryIds={pinnedCategoryIds}
              recentShortcutCategories={recentShortcutCategories}
              styles={styles}
              handleShortcutClick={handleShortcutClick}
              handleLevel1Click={handleLevel1Click}
              handleLevel2Click={handleLevel2Click}
              handleLevel3Click={handleLevel3Click}
              onTogglePinnedCategory={onTogglePinnedCategory}
            />
          )}

          {effectiveCategoryId && activeWizardStep === "details" && (
            <div
              data-transaction-wizard-detail-layout="true"
              data-ui-tone={entryKindTone}
            >
              <section
                style={entrySectionStyle}
                data-ui-section="true"
                data-transaction-data-section="true"
              >
                <div
                  style={entryCardStyle}
                  data-ui-section="true"
                  data-transaction-entry-card="true"
                >
                <header style={entryHeaderStyle}>
                  <strong style={entryTitleStyle} data-ui-section-title="true">Dane wpisu</strong>
                </header>

                <div style={entryGridStyle} data-transaction-entry-form="true">
                  <div
                    style={dayFieldShellStyle}
                    data-transaction-day-field="true"
                  >
                    <FoundationCheckbox
                      data-transaction-today-toggle="true"
                      density="compact"
                      align="field"
                      checked={isTodaySelected}
                      disabled={!isTodayAvailable}
                      label="dziś"
                      onCheckedChange={(value) => {
                        setTransactionDate(value ? todayDate : "");
                      }}
                    />

                    <input
                      ref={dayInputRef}
                      data-transaction-day-input="true"
                      className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputL}`}
                      data-input-width={uiInputApi.width.full}
                      data-input-variant="entry"
                      value={dayInputValue}
                      placeholder="dzień"
                      inputMode="numeric"
                      onChange={(event) => {
                        const nextDay = normalizeDayInput(
                          event.target.value,
                          selectedMonth,
                        );
                        const nextDate = nextDay
                          ? `${selectedMonth}-${nextDay}`
                          : "";
                        setTransactionDate(nextDate);
                      }}
                      onBlur={(event) => {
                        const nextDay = normalizeDayInput(
                          event.target.value,
                          selectedMonth,
                        );
                        const nextDate = nextDay
                          ? `${selectedMonth}-${nextDay}`
                          : "";
                        setTransactionDate(nextDate);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          descriptionInputRef.current?.focus();
                        }
                      }}
                    />
                  </div>

                  <div
                    style={descriptionInputWrapStyle}
                    data-transaction-description-field="true"
                  >
                    <input
                      ref={descriptionInputRef}
                      data-transaction-description-input="true"
                      className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputL}`}
                      data-input-width={uiInputApi.width.full}
                      data-input-variant="entry"
                      placeholder="opis"
                      value={description}
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      onFocus={() => setIsDescriptionFocused(true)}
                      onBlur={() => setIsDescriptionFocused(false)}
                      onChange={(event) => setDescription(event.target.value)}
                      onKeyDown={handleDescriptionKeyDown}
                    />

                    {filteredSuggestions.length > 0 && (
                      <div
                        style={suggestionsDropdownStyle}
                        data-transaction-suggestions="true"
                      >
                        {filteredSuggestions.map((suggestion, index) => {
                          const isActive = index === activeSuggestionIndex;
                          const isLast =
                            index === filteredSuggestions.length - 1;

                          return (
                            <button
                              key={suggestion.text}
                              type="button"
                              data-transaction-suggestion-item="true"
                              data-transaction-suggestion-active={
                                isActive ? "true" : "false"
                              }
                              style={{
                                ...(isActive
                                  ? activeSuggestionButtonStyle
                                  : suggestionButtonStyle),
                                borderBottom: isLast
                                  ? "none"
                                  : suggestionButtonStyle.borderBottom,
                              }}
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => applySuggestion(suggestion.text)}
                              onContextMenu={(event) =>
                                handleSuggestionContextMenu(event, suggestion)
                              }
                              onPointerDown={(event) =>
                                handleSuggestionPointerDown(suggestion, event)
                              }
                              onPointerUp={handleSuggestionPointerUp}
                              onPointerLeave={handleSuggestionPointerLeave}
                              onPointerCancel={handleSuggestionPointerLeave}
                            >
                              {suggestion.text}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <input
                    ref={amountInputRef}
                    data-transaction-amount-input="true"
                    className={uiInputApi.classNames.amountField}
                    data-input-width={uiInputApi.width.full}
                    data-input-variant="entry"
                    placeholder="kwota"
                    inputMode="decimal"
                    value={amount}
                    onChange={(event) =>
                      setAmount(normalizeAmountInput(event.target.value))
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void handleSaveFromKeyboard();
                      }
                    }}
                  />
                </div>

                {isPaymentSourceVisible && (
                  <div
                    style={fieldShellStyle}
                    data-transaction-payment-source-field="true"
                  >
                    <label
                      style={dateLabelStyle}
                      data-transaction-field-label="true"
                    >
                      Źródło płatności
                    </label>
                    <PaymentSplitEditor
                      amount={amount}
                      isVisible={isPaymentSourceVisible}
                      selectedPaymentSourceId={selectedPaymentSourceId}
                      setSelectedPaymentSourceId={setSelectedPaymentSourceId}
                      paymentSourceOptions={paymentSourceOptions}
                      paymentSplitItems={paymentSplitItems}
                      setPaymentSplitItems={setPaymentSplitItems}
                    />
                  </div>
                )}

                <div style={extraGridStyle} data-transaction-entry-extra="true">
                  <div style={fieldShellStyle}>
                    <label
                      style={dateLabelStyle}
                      htmlFor="transaction-tags-input"
                      data-transaction-field-label="true"
                    >
                      Tagi
                    </label>
                    <input
                      ref={tagInputRef}
                      id="transaction-tags-input"
                      data-transaction-tags-input="true"
                      className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputL}`}
                      data-input-width={uiInputApi.width.full}
                      data-input-variant="entry"
                      placeholder="dodaj tag..."
                      value={tagInputValue}
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      onChange={(event) =>
                        handleTagInputChange(event.target.value)
                      }
                      onKeyDown={handleTagsKeyDown}
                    />

                    {selectedTagNames.length > 0 && (
                      <div
                        style={tagBadgesWrapStyle}
                        data-transaction-tag-list="true"
                      >
                        {selectedTagNames.map((tagName) => (
                          <span
                            key={tagName}
                            style={tagBadgeStyle}
                            data-transaction-tag-badge="true"
                          >
                            #{tagName}
                            <button
                              type="button"
                              style={tagRemoveButtonStyle}
                              data-transaction-tag-remove="true"
                              onClick={() => handleRemoveTag(tagName)}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {(recurringOptions.length > 0 ||
                    recurringSuggestions.length > 0) && (
                    <div
                      style={fieldShellStyle}
                      data-transaction-recurring-field="true"
                    >
                      <label
                        style={dateLabelStyle}
                        htmlFor="transaction-recurring-link"
                        data-transaction-field-label="true"
                      >
                        Powiąż z przypomnieniem
                      </label>

                      <span data-ui-select-shell="true">
                      <select
                        id="transaction-recurring-link"
                        data-transaction-recurring-select="true"
                        className={`${uiInputApi.classNames.select} ${uiInputApi.classNames.inputL}`}
                        data-input-width={uiInputApi.width.full}
                        data-input-variant="entry"
                        value={selectedRecurringTransactionId}
                        onChange={(event) =>
                          applyRecurringLink(event.target.value)
                        }
                      >
                        <option value="">Brak powiązania</option>
                        {recurringOptions.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.label}
                          </option>
                        ))}
                        {recurringSuggestions.map((item) => (
                          <option key={`suggestion-${item.id}`} value={item.id}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                      <span data-ui-picker-chevron="true" aria-hidden="true" />
                      </span>

                      {selectedRecurringOption?.hasTransactionInMonth && (
                        <div
                          style={{
                            ...styles.emptyText,
                            color: "var(--ui-color-warning)",
                          }}
                          data-transaction-recurring-warning="true"
                        >
                          To przypomnienie ma już wpis w tym miesiącu. Możesz
                          dodać kolejny, jeśli to celowe.
                        </div>
                      )}
                    </div>
                  )}
                </div>
                </div>

                <TransactionCreatorModeToggles
                  selectedLevel1Id={selectedLevel1Id}
                  effectiveCategoryId={effectiveCategoryId}
                  isSerialModeEnabled={isSerialModeEnabled}
                  setIsSerialModeEnabled={setIsSerialModeEnabled}
                  styles={styles}
                />

                <footer
                  style={actionsStyle}
                  data-ui-form-actions="true"
                  data-transaction-actions="true"
                >
                <button
                  type="button"
                  data-ui-button-cancel="true"
                  onClick={onClose}
                  disabled={isSaving}
                >
                  Anuluj
                </button>
                <span
                  style={{
                    display: "inline-flex",
                    gap: "var(--ui-space-4)",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    data-ui-button-cancel="true"
                    onClick={goToPreviousStep}
                    disabled={isSaving}
                  >
                    Wstecz
                  </button>
                  <button
                    type="button"
                    data-ui-button-confirm="true"
                    disabled={
                      isSaving || !selectedLevel1Id || !effectiveCategoryId
                    }
                    onClick={() => setWizardStepOverride("summary")}
                  >
                    Podsumowanie
                  </button>
                  <button
                    type="button"
                    data-ui-button-confirm="true"
                    disabled={
                      isSaving || !selectedLevel1Id || !effectiveCategoryId
                    }
                    onClick={async () => {
                      await onSave();
                    }}
                  >
                    {isSaving ? "zapisywanie..." : "Zapisz i dodaj kolejny"}
                  </button>
                  <button
                    ref={saveButtonRef}
                    type="button"
                    data-ui-button-confirm="true"
                    disabled={
                      isSaving || !selectedLevel1Id || !effectiveCategoryId
                    }
                    onClick={async () => {
                      await onSaveAndClose();
                    }}
                  >
                    {isSaving ? "zapisywanie..." : "Zapisz"}
                  </button>
                </span>
                </footer>
              </section>
              {renderLiveSummary()}
            </div>
          )}

          {effectiveCategoryId && activeWizardStep === "summary" && (
            <div data-transaction-wizard-summary-layout="true">
              <section data-ui-section="true" data-transaction-summary-step="true">
                <header data-transaction-wizard-step-header="true">
                  <strong>Gotowe do zapisu</strong>
                  <span>Sprawdź dane i zapisz wpis albo dodaj kolejny.</span>
                </header>

                {renderLiveSummary()}

                <FoundationWizardFooter data-transaction-summary-actions="true">
                  <button
                    type="button"
                    data-ui-button-cancel="true"
                    onClick={goToPreviousStep}
                    disabled={isSaving}
                  >
                    Wstecz
                  </button>
                  <button
                    type="button"
                    data-ui-button-confirm="true"
                    disabled={isSaving || !selectedLevel1Id || !effectiveCategoryId}
                    onClick={async () => {
                      await onSave();
                    }}
                  >
                    {isSaving ? "zapisywanie..." : "Zapisz i dodaj kolejny"}
                  </button>
                  <button
                    type="button"
                    data-ui-button-confirm="true"
                    disabled={isSaving || !selectedLevel1Id || !effectiveCategoryId}
                    onClick={async () => {
                      await onSaveAndClose();
                    }}
                  >
                    {isSaving ? "zapisywanie..." : "Zapisz"}
                  </button>
                </FoundationWizardFooter>
              </section>
            </div>
          )}
        </div>
        </FoundationWizardShell>
      </section>

      <DescriptionSuggestionDeleteMenu
        isOpen={Boolean(suggestionToDelete)}
        x={deletePromptPosition.x}
        y={deletePromptPosition.y}
        onConfirm={confirmDeleteSuggestion}
        onCancel={closeDeletePrompt}
      />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div data-ui-foundation-summary-row="true">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
