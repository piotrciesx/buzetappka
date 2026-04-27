'use client'

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Category, Transaction, TransactionPaymentSplit } from '../lib/budgetPageTypes'
import PaymentSplitEditor from './PaymentSplitEditor'
import {
  buildFinalImportRows,
  buildImportPreview,
  createBudgetBackupJson,
  createImportTemplateCsv,
  createTransactionsExportCsv,
  FinalImportRow,
  getImportCategoryLabelMap,
  getSuggestedImportMapping,
  ImportColumnMapping,
  ImportPreviewRow,
  parseAmountValue,
  parseImportFile,
  recalculateImportPreviewRow,
  triggerTextDownload,
} from '../lib/importExportUtils'
import { getCategoryPathLabel } from '../lib/budgetPageHelpers'
import { splitTagInput } from '../lib/tagUtils'

type ImportExportPanelProps = {
  selectedMonth: string
  categories: Category[]
  categoriesById: Record<string, Category>
  transactions: Transaction[]
  trashedTransactions: Transaction[]
  transactionPaymentSplitsMap: Record<string, TransactionPaymentSplit[]>
  importableCategoryIds: string[] | Set<string>
  categoryPathLabels: Record<string, string>
  defaultCategoryId: string | null
  isSelectedMonthLocked: boolean
  canCreateTransactions: boolean
  getPaymentSourceOptionsForCategoryId?: (
    categoryId: string
  ) => Array<{
    id: string
    name: string
    type: string
    optionLabel?: string
  }>
  onImportRows: (rows: FinalImportRow[]) => Promise<void>
  styles: Record<string, React.CSSProperties>
}

const normalizeFileNameMonth = (month: string) => month.replace('-', '_')

export default function ImportExportPanel({
  selectedMonth,
  categories,
  categoriesById,
  transactions,
  trashedTransactions,
  transactionPaymentSplitsMap,
  importableCategoryIds,
  categoryPathLabels,
  defaultCategoryId,
  isSelectedMonthLocked,
  canCreateTransactions,
  getPaymentSourceOptionsForCategoryId,
  onImportRows,
  styles,
}: ImportExportPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [fileName, setFileName] = useState('')
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<string[][]>([])
  const [mapping, setMapping] = useState<ImportColumnMapping>({
    amount: '',
    description: '',
    date: '',
    categoryPath: '',
  })
  const [selectedDefaultCategoryId, setSelectedDefaultCategoryId] = useState(defaultCategoryId || '')
  const [importStatusText, setImportStatusText] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [editablePreviewRows, setEditablePreviewRows] = useState<ImportPreviewRow[]>([])
  const [importTagsInput, setImportTagsInput] = useState('')

  const importableCategoryIdsArray = useMemo(() => {
    return Array.isArray(importableCategoryIds)
      ? importableCategoryIds
      : Array.from(importableCategoryIds)
  }, [importableCategoryIds])

  const categoryLookup = useMemo(() => {
    return getImportCategoryLabelMap(categoryPathLabels, categoriesById)
  }, [categoryPathLabels, categoriesById])

  const importableCategories = useMemo(() => {
    return importableCategoryIdsArray
      .filter((categoryId) => categoriesById[categoryId])
      .map((categoryId) => ({
        id: categoryId,
        label: categoryPathLabels[categoryId] || categoriesById[categoryId].name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'pl'))
  }, [categoriesById, categoryPathLabels, importableCategoryIdsArray])

  const generatedPreviewRows = useMemo(() => {
    if (rows.length === 0 || headers.length === 0 || !mapping.amount || !mapping.date) {
      return []
    }

    return buildImportPreview({
      rows,
      headers,
      mapping,
      defaultCategoryId: selectedDefaultCategoryId || null,
      categoryLookup,
    })
  }, [rows, headers, mapping, selectedDefaultCategoryId, categoryLookup])

  useEffect(() => {
    setEditablePreviewRows(generatedPreviewRows)
  }, [generatedPreviewRows])

  useEffect(() => {
    if (defaultCategoryId && !selectedDefaultCategoryId) {
      setSelectedDefaultCategoryId(defaultCategoryId)
    }
  }, [defaultCategoryId, selectedDefaultCategoryId])

  const validRows = useMemo(() => {
    return buildFinalImportRows(editablePreviewRows, splitTagInput(importTagsInput))
  }, [editablePreviewRows, importTagsInput])

  const invalidRowsCount = editablePreviewRows.filter((row) => row.errors.length > 0).length
  const approvedRowsCount = editablePreviewRows.filter((row) => row.isApproved).length

  const resetImportState = () => {
    setFileName('')
    setHeaders([])
    setRows([])
    setMapping({
      amount: '',
      description: '',
      date: '',
      categoryPath: '',
    })
    setEditablePreviewRows([])
    setImportStatusText('')
    setIsImporting(false)
    setSelectedDefaultCategoryId(defaultCategoryId || '')
    setImportTagsInput('')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleExportCsv = () => {
    const csv = createTransactionsExportCsv({
      transactions,
      transactionPaymentSplitsMap,
      categoriesById,
      getCategoryPathLabel,
    })

    triggerTextDownload({
      filename: `budget_transactions_${normalizeFileNameMonth(selectedMonth)}.csv`,
      content: csv,
      mimeType: 'text/csv;charset=utf-8',
      includeBom: true,
    })
  }

  const handleExportJson = () => {
    const json = createBudgetBackupJson({
      selectedMonth,
      categories,
      transactions,
      trashedTransactions,
      transactionPaymentSplitsMap,
    })

    triggerTextDownload({
      filename: `budget_backup_${normalizeFileNameMonth(selectedMonth)}.json`,
      content: json,
      mimeType: 'application/json;charset=utf-8',
    })
  }

  const handleDownloadTemplate = () => {
    triggerTextDownload({
      filename: 'budget_import_template.csv',
      content: createImportTemplateCsv(),
      mimeType: 'text/csv;charset=utf-8',
      includeBom: true,
    })
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!canCreateTransactions || isSelectedMonthLocked) {
      resetImportState()
      return
    }

    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const text = await file.text()
    const parsed = parseImportFile(text)
    const suggestedMapping = getSuggestedImportMapping(parsed.headers)

    setFileName(file.name)
    setHeaders(parsed.headers)
    setRows(parsed.rows)
    setMapping(suggestedMapping)
    setImportStatusText('')
  }

  const updatePreviewRow = (rowId: string, patch: Partial<ImportPreviewRow>) => {
    setEditablePreviewRows((prev) =>
      prev.map((row) => (row.id === rowId ? recalculateImportPreviewRow(row, patch) : row))
    )
  }

  const handleApproveAllValid = () => {
    setEditablePreviewRows((prev) =>
      prev.map((row) =>
        recalculateImportPreviewRow(row, {
          isApproved: row.errors.length === 0,
        })
      )
    )
  }

  const handleUncheckAll = () => {
    setEditablePreviewRows((prev) =>
      prev.map((row) =>
        recalculateImportPreviewRow(row, {
          isApproved: false,
        })
      )
    )
  }

  const handleImport = async () => {
    if (!canCreateTransactions || isSelectedMonthLocked) {
      return
    }

    if (validRows.length === 0) {
      setImportStatusText('Brak zatwierdzonych i poprawnych wierszy do importu.')
      return
    }

    setIsImporting(true)
    setImportStatusText('')

    try {
      await onImportRows(validRows)
      setImportStatusText(`Zaimportowano ${validRows.length} wpisów.`)
      resetImportState()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nie udało się zaimportować danych.'
      setImportStatusText(message)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <section style={styles.card}>
      <div style={styles.sectionTitle}>Import / eksport danych</div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <button style={styles.secondaryButton} onClick={handleExportCsv} type="button">
          Eksport CSV aktywnych wpisów
        </button>

        <button style={styles.secondaryButton} onClick={handleExportJson} type="button">
          Backup JSON
        </button>

        <button style={styles.secondaryButton} onClick={handleDownloadTemplate} type="button">
          Pobierz template CSV
        </button>
      </div>

      <div style={{ ...styles.infoBox, marginBottom: 16 }}>
        Wybierasz plik, mapujesz kolumny, sprawdzasz podgląd, poprawiasz opis i kategorię,
        zaznaczasz tylko te rekordy, które mają wejść, i dopiero wtedy importujesz.
      </div>

      {canCreateTransactions ? (
        <>
          <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              <button
                type="button"
                style={styles.primaryButton}
                onClick={() => fileInputRef.current?.click()}
              >
                Wybierz plik CSV
              </button>

              <button
                type="button"
                style={styles.secondaryButton}
                onClick={resetImportState}
                disabled={isImporting && !fileName}
              >
                Wyczyść import
              </button>
            </div>

            {fileName && (
              <div style={styles.smallMutedText}>
                Wczytany plik: <strong>{fileName}</strong>
              </div>
            )}
          </div>

          {headers.length > 0 && (
            <>
              <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={styles.sortLabel}>Kolumna kwoty</label>
                  <select
                    style={styles.input}
                    value={mapping.amount}
                    onChange={(event) =>
                      setMapping((prev) => ({
                        ...prev,
                        amount: event.target.value,
                      }))
                    }
                  >
                    <option value="">-- wybierz --</option>
                    {headers.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={styles.sortLabel}>Kolumna opisu / nazwy</label>
                  <select
                    style={styles.input}
                    value={mapping.description}
                    onChange={(event) =>
                      setMapping((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                  >
                    <option value="">-- opcjonalnie --</option>
                    {headers.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={styles.sortLabel}>Kolumna daty</label>
                  <select
                    style={styles.input}
                    value={mapping.date}
                    onChange={(event) =>
                      setMapping((prev) => ({
                        ...prev,
                        date: event.target.value,
                      }))
                    }
                  >
                    <option value="">-- wybierz --</option>
                    {headers.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={styles.sortLabel}>Kolumna ścieżki kategorii</label>
                  <select
                    style={styles.input}
                    value={mapping.categoryPath}
                    onChange={(event) =>
                      setMapping((prev) => ({
                        ...prev,
                        categoryPath: event.target.value,
                      }))
                    }
                  >
                    <option value="">-- opcjonalnie --</option>
                    {headers.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={styles.sortLabel}>Domyślna kategoria fallback</label>
                  <select
                    style={styles.input}
                    value={selectedDefaultCategoryId}
                    onChange={(event) => setSelectedDefaultCategoryId(event.target.value)}
                  >
                    <option value="">-- brak --</option>
                    {importableCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={styles.sortLabel}>Tagi dla importu</label>
                  <input
                    style={styles.input}
                    value={importTagsInput}
                    onChange={(event) => setImportTagsInput(event.target.value)}
                    placeholder="np. bank, import, karta"
                  />
                </div>
              </div>

              <div style={{ ...styles.infoBox, marginBottom: 16 }}>
                Wiersze w pliku: <strong>{rows.length}</strong> | zaznaczone do importu:{' '}
                <strong>{approvedRowsCount}</strong> | poprawne i zaznaczone:{' '}
                <strong>{validRows.length}</strong> | z błędem: <strong>{invalidRowsCount}</strong>
              </div>

              <div style={{ ...styles.smallMutedText, marginBottom: 12 }}>
                Jeśli chcesz zaimportować tylko kilka wpisów, po prostu odznacz checkbox przy tych,
                których nie chcesz wrzucać.
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
                <button type="button" style={styles.secondaryButton} onClick={handleApproveAllValid}>
                  Zaznacz wszystkie poprawne
                </button>

                <button type="button" style={styles.secondaryButton} onClick={handleUncheckAll}>
                  Odznacz wszystko
                </button>

                <button type="button" style={styles.secondaryButton} onClick={resetImportState}>
                  Anuluj import
                </button>

                <button
                  type="button"
                  style={styles.primaryButton}
                  onClick={() => {
                    void handleImport()
                  }}
                  disabled={isImporting}
                >
                  {isImporting ? 'Importowanie...' : 'Importuj zaznaczone'}
                </button>
              </div>

              <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
                {editablePreviewRows.slice(0, 30).map((row) => (
                  <div
                    key={row.id}
                    style={{
                      border: '1px solid #d1d5db',
                      borderRadius: 12,
                      padding: 12,
                      background: row.errors.length === 0 ? '#f8fafc' : '#fef2f2',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        gap: 10,
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        marginBottom: 10,
                      }}
                    >
                      <label style={{ fontWeight: 700 }}>
                        <input
                          type="checkbox"
                          checked={row.isApproved}
                          onChange={(event) =>
                            updatePreviewRow(row.id, {
                              isApproved: event.target.checked,
                            })
                          }
                          style={{ marginRight: 8 }}
                        />
                        Importuj wiersz {row.rowNumber}
                      </label>

                      {row.errors.length === 0 ? (
                        <span style={{ color: '#166534', fontWeight: 700 }}>OK</span>
                      ) : (
                        <span style={{ color: '#b91c1c', fontWeight: 700 }}>
                          {row.errors.join(' | ')}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'grid', gap: 10 }}>
                      <div>
                        <label style={styles.sortLabel}>Kwota</label>
                        <input
                          style={styles.input}
                          value={row.amount ?? ''}
                          onChange={(event) => {
                            const nextAmount = parseAmountValue(event.target.value)
                            updatePreviewRow(row.id, {
                              amount: nextAmount,
                            })
                          }}
                        />
                      </div>

                      <div>
                        <label style={styles.sortLabel}>Opis / nazwa</label>
                        <input
                          style={styles.input}
                          value={row.description}
                          onChange={(event) =>
                            updatePreviewRow(row.id, {
                              description: event.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label style={styles.sortLabel}>Data</label>
                        <input
                          style={styles.input}
                          value={row.date || ''}
                          onChange={(event) =>
                            updatePreviewRow(row.id, {
                              date: event.target.value.trim() || null,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label style={styles.sortLabel}>Kategoria</label>
                        <select
                          style={styles.input}
                          value={row.categoryId || ''}
                          onChange={(event) =>
                            updatePreviewRow(row.id, {
                              categoryId: event.target.value || null,
                            })
                          }
                        >
                          <option value="">-- wybierz --</option>
                          {importableCategories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {row.categoryId &&
                        (getPaymentSourceOptionsForCategoryId?.(row.categoryId) || []).length > 0 && (
                          <div>
                            <label style={styles.sortLabel}>Źródło płatności / split</label>
                            <PaymentSplitEditor
                              amount={row.amount === null ? '' : String(row.amount)}
                              isVisible
                              selectedPaymentSourceId={row.paymentSourceId}
                              setSelectedPaymentSourceId={(value) =>
                                updatePreviewRow(row.id, {
                                  paymentSourceId: value,
                                })
                              }
                              paymentSourceOptions={
                                getPaymentSourceOptionsForCategoryId?.(row.categoryId) || []
                              }
                              paymentSplitItems={row.paymentSplitItems}
                              setPaymentSplitItems={(value) =>
                                updatePreviewRow(row.id, {
                                  paymentSplitItems:
                                    typeof value === 'function' ? value(row.paymentSplitItems) : value,
                                })
                              }
                              styles={styles}
                            />
                          </div>
                        )}

                      {row.categoryPath && (
                        <div style={styles.smallMutedText}>
                          Ścieżka z pliku: <strong>{row.categoryPath}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <div style={{ ...styles.smallMutedText, marginBottom: 8 }}>
          Miesiąc <b>{selectedMonth}</b> jest zamknięty, więc import wpisów jest całkowicie ukryty.
        </div>
      )}

      {importStatusText && (
        <div
          style={{
            ...styles.infoBox,
            borderColor: importStatusText.includes('Zaimportowano') ? '#bbf7d0' : '#fecaca',
            background: importStatusText.includes('Zaimportowano') ? '#f0fdf4' : '#fef2f2',
          }}
        >
          {importStatusText}
        </div>
      )}
    </section>
  )
}
