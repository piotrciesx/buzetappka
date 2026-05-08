const fs = require('fs')
const path = require('path')

const ROOT_DIR = process.cwd()
const OUTPUT_FILE = path.join(ROOT_DIR, 'export-kodu.txt')

const ALLOWED_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.css',
  '.scss',
  '.sass',
  '.sql',
  '.json',
  '.md',
  '.mjs',
  '.cjs',
  '.html',
  '.yml',
  '.yaml',
])

const ALLOWED_FILENAMES = new Set([
  'Dockerfile',
  '.gitignore',
  'next.config.js',
  'next.config.mjs',
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'jsconfig.json',
  'README.md',
])

const IGNORED_DIRS = new Set([
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  'coverage',
  '.vercel',
  '.turbo',
])

function shouldIncludeFile(filePath) {
  const fileName = path.basename(filePath)
  const ext = path.extname(filePath)

  if (ALLOWED_FILENAMES.has(fileName)) {
    return true
  }

  if (ALLOWED_EXTENSIONS.has(ext)) {
    return true
  }

  return false
}

function shouldIgnorePath(filePath) {
  const normalizedParts = filePath.split(path.sep)

  for (const part of normalizedParts) {
    if (IGNORED_DIRS.has(part)) {
      return true
    }
  }

  return false
}

function walk(dirPath, collectedFiles = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)

    if (shouldIgnorePath(fullPath)) {
      continue
    }

    if (entry.isDirectory()) {
      walk(fullPath, collectedFiles)
      continue
    }

    if (entry.isFile() && shouldIncludeFile(fullPath)) {
      collectedFiles.push(fullPath)
    }
  }

  return collectedFiles
}

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch (error) {
    return `BŁĄD ODCZYTU: ${error.message}`
  }
}

function makeHeader(relativePath) {
  return [
    '',
    '==================================================',
    `PLIK: ${relativePath}`,
    '==================================================',
    '',
  ].join('\n')
}

function main() {
  const files = walk(ROOT_DIR).sort((a, b) => a.localeCompare(b))
  const parts = []

  parts.push('EXPORT KODU PROJEKTU')
  parts.push(`Folder główny: ${ROOT_DIR}`)
  parts.push(`Liczba plików: ${files.length}`)
  parts.push(`Data: ${new Date().toISOString()}`)
  parts.push('')

  for (const filePath of files) {
    const relativePath = path.relative(ROOT_DIR, filePath)
    const content = readFileSafe(filePath)

    parts.push(makeHeader(relativePath))
    parts.push(content)
    parts.push('')
  }

  fs.writeFileSync(OUTPUT_FILE, parts.join('\n'), 'utf8')

  console.log(`Gotowe. Zapisano plik: ${OUTPUT_FILE}`)
  console.log(`Liczba zebranych plików: ${files.length}`)
}

main()