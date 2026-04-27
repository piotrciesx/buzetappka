import { Category, Transaction } from './budgetPageTypes'
import { PaymentSplitInput, buildPaymentSplitPayload } from './paymentSplitUtils'

export type ParsedImportFile = {
  delimiter: string
  headers: string[]
  rows: string[][]
}

export type ImportColumnMapping = {
  amount: string
  description: string
  date: string
  categoryPath: string
}

export type ImportPreviewRow = {
  id: string
  rowNumber: number
  raw: Record<string, string>
  amount: number | null
  description: string
  date: string | null
  categoryPath: string
  categoryId: string | null
  paymentSourceId: string
  paymentSplitItems: PaymentSplitInput[]
  isApproved: boolean
  errors: string[]
}

export type FinalImportRow = {
  amount: number
  description: string
  date: string
  day_is_null: boolean
  category_id: string
  payment_source_id?: string | null
  payment_splits?: Array<{
    payment_source_id: string
    amount: number
  }>
  tag_names?: string[]
}

const DEFAULT_TEMPLATE_ROWS = [
  ['amount', 'description', 'date', 'category_path'],
  ['12.50', 'Kawa', '2026-04-19', 'Wydatki > codzienne > kawa'],
  ['1500', 'Wypłata', '2026-04-10', 'Przychody > pensja'],
]

const normalizeText = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

const escapeCsvValue = (value: unknown) => {
  const text = String(value ?? '')
  const escaped = text.replace(/"/g, '""')

  if (/[",;\n]/.test(text)) {
    return `"${escaped}"`
  }

  return escaped
}

const joinCsvRows = (rows: Array<Array<unknown>>, delimiter: string) => {
  return rows.map((row) => row.map((cell) => escapeCsvValue(cell)).join(delimiter)).join('\n')
}

const parseDelimitedLine = (line: string, delimiter: string) => {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    const nextCharacter = line[index + 1]

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        current += '"'
        index += 1
        continue
      }

      inQuotes = !inQuotes
      continue
    }

    if (character === delimiter && !inQuotes) {
      values.push(current.trim())
      current = ''
      continue
    }

    current += character
  }

  values.push(current.trim())
  return values
}

const HEADER_DATE_TOKENS = ['data', 'date', 'transaction_date', 'booking date', 'operation date']
const HEADER_AMOUNT_TOKENS = ['kwota', 'amount', 'value', 'suma', 'saldo', 'payment amount']
const HEADER_DESCRIPTION_TOKENS = [
  'opis',
  'description',
  'details',
  'title',
  'nazwa',
  'transakcja',
  'transaction',
]

const rowContainsHeaderToken = (value: string, tokens: string[]) => {
  return tokens.some((token) => value === token || value.includes(token))
}

const looksLikeHeaderRow = (values: string[]) => {
  const normalizedValues = values.map((value) => normalizeText(value))

  const hasDate = normalizedValues.some((value) => rowContainsHeaderToken(value, HEADER_DATE_TOKENS))
  const hasAmount = normalizedValues.some((value) =>
    rowContainsHeaderToken(value, HEADER_AMOUNT_TOKENS)
  )
  const hasDescription = normalizedValues.some((value) =>
    rowContainsHeaderToken(value, HEADER_DESCRIPTION_TOKENS)
  )

  return hasDate && hasAmount && hasDescription
}

const detectDelimiter = (text: string) => {
  const firstNonEmptyLine =
    text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line.length > 0) || ''

  const semicolonCount = (firstNonEmptyLine.match(/;/g) || []).length
  const commaCount = (firstNonEmptyLine.match(/,/g) || []).length
  const tabCount = (firstNonEmptyLine.match(/\t/g) || []).length

  if (tabCount >= semicolonCount && tabCount >= commaCount && tabCount > 0) {
    return '\t'
  }

  if (semicolonCount >= commaCount && semicolonCount > 0) {
    return ';'
  }

  return ','
}

export const parseImportFile = (text: string): ParsedImportFile => {
  const normalizedText = text.replace(/^\uFEFF/, '')
  const delimiter = detectDelimiter(normalizedText)
  const lines = normalizedText
    .split(/\r?\n/)
    .map((line) => line.replace(/\r/g, ''))
    .filter((line) => line.trim().length > 0)

  if (lines.length === 0) {
    return {
      delimiter,
      headers: [],
      rows: [],
    }
  }

  const parsedRows = lines.map((line) => parseDelimitedLine(line, delimiter))
  const headerIndex = parsedRows.findIndex((row) => looksLikeHeaderRow(row))
  const effectiveRows = headerIndex >= 0 ? parsedRows.slice(headerIndex) : parsedRows
  const headers = (effectiveRows[0] || []).map((header, index) =>
    header?.trim() ? header.trim() : `column_${index + 1}`
  )

  return {
    delimiter,
    headers,
    rows: effectiveRows.slice(1),
  }
}

export const getSuggestedImportMapping = (headers: string[]): ImportColumnMapping => {
  const normalizedHeaders = headers.map((header) => normalizeText(header))

  const findHeader = (candidates: string[]) => {
    const index = normalizedHeaders.findIndex((header) => candidates.includes(header))
    return index >= 0 ? headers[index] : ''
  }

  return {
    amount: findHeader(['amount', 'kwota', 'value', 'suma']),
    description: findHeader(['description', 'opis', 'title', 'note', 'details', 'nazwa']),
    date: findHeader(['date', 'data', 'transaction_date']),
    categoryPath: findHeader([
      'category_path',
      'kategoria',
      'kategoria_sciezka',
      'category',
      'ścieżka kategorii',
      'sciezka kategorii',
    ]),
  }
}

export const parseAmountValue = (value: string) => {
  const cleaned = value
    .trim()
    .replace(/\s/g, '')
    .replace(/[+-]/g, '')
    .replace(/zł/gi, '')
    .replace(/pln/gi, '')
    .replace(',', '.')

  if (!cleaned) {
    return null
  }

  const parsed = Number(cleaned)

  if (Number.isNaN(parsed)) {
    return null
  }

  return Math.abs(parsed)
}

export const normalizeImportDate = (value: string) => {
  const trimmed = value.trim()

  if (!trimmed) {
    return null
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed
  }

  if (/^\d{4}\/\d{2}\/\d{2}$/.test(trimmed)) {
    return trimmed.replaceAll('/', '-')
  }

  if (/^\d{2}\.\d{2}\.\d{4}$/.test(trimmed)) {
    const [day, month, year] = trimmed.split('.')
    return `${year}-${month}-${day}`
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    const [day, month, year] = trimmed.split('/')
    return `${year}-${month}-${day}`
  }

  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    return `${trimmed}-01`
  }

  return null
}

export const getImportCategoryLabelMap = (
  categoryPathLabels: Record<string, string>,
  categoriesById: Record<string, Category>
) => {
  const labelMap: Record<string, string> = {}
  const plainNameMap: Record<string, string[]> = {}

  Object.entries(categoryPathLabels).forEach(([categoryId, label]) => {
    labelMap[normalizeText(label)] = categoryId

    const category = categoriesById[categoryId]

    if (category) {
      const key = normalizeText(category.name)

      if (!plainNameMap[key]) {
        plainNameMap[key] = []
      }

      plainNameMap[key].push(categoryId)
    }
  })

  Object.entries(plainNameMap).forEach(([plainName, ids]) => {
    if (ids.length === 1) {
      labelMap[plainName] = ids[0]
    }
  })

  return labelMap
}

const validatePreviewRow = (
  row: Pick<
    ImportPreviewRow,
    'amount' | 'date' | 'categoryId' | 'paymentSourceId' | 'paymentSplitItems'
  >
): string[] => {
  const errors: string[] = []

  if (row.amount === null || row.amount <= 0) {
    errors.push('Nieprawidłowa kwota')
  }

  if (!row.date) {
    errors.push('Nieprawidłowa data')
  }

  if (!row.categoryId) {
    errors.push('Brak dopasowanej kategorii')
  }

  const paymentSplitState = buildPaymentSplitPayload({
    totalAmountText: row.amount === null ? '' : String(row.amount),
    selectedPaymentSourceId: row.paymentSourceId,
    splitItems: row.paymentSplitItems,
  })

  errors.push(...paymentSplitState.errors)

  return errors
}

export const buildImportPreview = ({
  rows,
  headers,
  mapping,
  defaultCategoryId,
  categoryLookup,
}: {
  rows: string[][]
  headers: string[]
  mapping: ImportColumnMapping
  defaultCategoryId: string | null
  categoryLookup: Record<string, string>
}): ImportPreviewRow[] => {
  const amountIndex = headers.indexOf(mapping.amount)
  const descriptionIndex = headers.indexOf(mapping.description)
  const dateIndex = headers.indexOf(mapping.date)
  const categoryIndex = headers.indexOf(mapping.categoryPath)

  return rows.map((row, index) => {
    const raw = headers.reduce<Record<string, string>>((acc, header, headerIndex) => {
      acc[header] = row[headerIndex] || ''
      return acc
    }, {})

    const amount = amountIndex >= 0 ? parseAmountValue(row[amountIndex] || '') : null
    const description = descriptionIndex >= 0 ? (row[descriptionIndex] || '').trim() : ''
    const normalizedDate = dateIndex >= 0 ? normalizeImportDate(row[dateIndex] || '') : null
    const categoryPath = categoryIndex >= 0 ? (row[categoryIndex] || '').trim() : ''

    const resolvedCategoryId =
      (categoryPath ? categoryLookup[normalizeText(categoryPath)] : null) || defaultCategoryId || null

    const previewRow: ImportPreviewRow = {
      id: `import-row-${index + 1}`,
      rowNumber: index + 2,
      raw,
      amount,
      description,
      date: normalizedDate,
      categoryPath,
      categoryId: resolvedCategoryId,
      paymentSourceId: '',
      paymentSplitItems: [],
      isApproved: true,
      errors: [],
    }

    return {
      ...previewRow,
      errors: validatePreviewRow(previewRow),
    }
  })
}

export const recalculateImportPreviewRow = (
  row: ImportPreviewRow,
  patch: Partial<ImportPreviewRow>
): ImportPreviewRow => {
  const nextRow: ImportPreviewRow = {
    ...row,
    ...patch,
  }

  return {
    ...nextRow,
    errors: validatePreviewRow(nextRow),
  }
}

export const buildFinalImportRows = (
  previewRows: ImportPreviewRow[],
  tagNames: string[] = []
): FinalImportRow[] => {
  return previewRows
    .filter(
      (row) =>
        row.isApproved &&
        row.errors.length === 0 &&
        row.amount !== null &&
        row.date &&
        row.categoryId
    )
    .map((row) => ({
      ...(() => {
        const paymentSplitState = buildPaymentSplitPayload({
          totalAmountText: String(row.amount),
          selectedPaymentSourceId: row.paymentSourceId,
          splitItems: row.paymentSplitItems,
        })

        return {
          payment_source_id: paymentSplitState.paymentSourceId,
          payment_splits: paymentSplitState.splitRows,
        }
      })(),
      amount: row.amount as number,
      description: row.description,
      date: row.date as string,
      day_is_null: false,
      category_id: row.categoryId as string,
      tag_names: tagNames,
    }))
}

export const createTransactionsExportCsv = ({
  transactions,
  transactionPaymentSplitsMap = {},
  categoriesById,
  getCategoryPathLabel,
}: {
  transactions: Transaction[]
  transactionPaymentSplitsMap?: Record<
    string,
    Array<{ payment_source_id: string; amount: number }>
  >
  categoriesById: Record<string, Category>
  getCategoryPathLabel: (categoryId: string, categoriesById: Record<string, Category>) => string
}) => {
  const rows: Array<Array<unknown>> = [
    [
      'amount',
      'description',
      'date',
      'day_is_null',
      'category_id',
      'category_path',
      'payment_source_id',
      'payment_splits_json',
    ],
  ]

  transactions.forEach((transaction) => {
    const paymentSplits = transactionPaymentSplitsMap[transaction.id] || []

    rows.push([
      transaction.amount,
      transaction.description || '',
      transaction.date,
      transaction.day_is_null ? 'true' : 'false',
      transaction.category_id,
      categoriesById[transaction.category_id]
        ? getCategoryPathLabel(transaction.category_id, categoriesById)
        : '',
      transaction.payment_source_id || '',
      paymentSplits.length > 0 ? JSON.stringify(paymentSplits) : '',
    ])
  })

  return joinCsvRows(rows, ';')
}

export const createImportTemplateCsv = () => {
  return joinCsvRows(DEFAULT_TEMPLATE_ROWS, ';')
}

export const createBudgetBackupJson = ({
  selectedMonth,
  categories,
  transactions,
  trashedTransactions,
  transactionPaymentSplitsMap = {},
}: {
  selectedMonth: string
  categories: Category[]
  transactions: Transaction[]
  trashedTransactions: Transaction[]
  transactionPaymentSplitsMap?: Record<string, Array<{ payment_source_id: string; amount: number }>>
}) => {
  return JSON.stringify(
    {
      exported_at: new Date().toISOString(),
      selected_month: selectedMonth,
      categories,
      transactions,
      trashed_transactions: trashedTransactions,
      transaction_payment_splits: transactionPaymentSplitsMap,
    },
    null,
    2
  )
}

export const triggerTextDownload = ({
  filename,
  content,
  mimeType = 'text/plain;charset=utf-8',
  includeBom = false,
}: {
  filename: string
  content: string
  mimeType?: string
  includeBom?: boolean
}) => {
  const payload = includeBom ? `\uFEFF${content}` : content
  const blob = new Blob([payload], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  link.click()

  window.URL.revokeObjectURL(url)
}
