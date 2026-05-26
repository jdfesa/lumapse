#!/usr/bin/env node

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const projectRoot = path.resolve(path.dirname(__filename), "..")
const sourceRoot = path.join(projectRoot, "src")
const excludedRelativePaths = new Set([
  path.join("src", "utils", "seeder.js"),
])

const dialogCallPattern = /\b(alert|confirm|prompt)\s*\(/g
const targetExtensions = new Set([".js", ".jsx", ".ts", ".tsx", ".html"])

function relativePath(filePath) {
  return path.relative(projectRoot, filePath)
}

function collectFiles(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      files.push(...collectFiles(entryPath))
      continue
    }

    if (entry.isFile() && targetExtensions.has(path.extname(entry.name))) {
      files.push(entryPath)
    }
  }

  return files
}

function scanFile(filePath) {
  const source = fs.readFileSync(filePath, "utf8")
  const lines = source.split(/\r?\n/)
  const violations = []

  lines.forEach((line, index) => {
    dialogCallPattern.lastIndex = 0

    for (const match of line.matchAll(dialogCallPattern)) {
      violations.push({
        filePath,
        line: index + 1,
        call: match[1],
        source: line.trim(),
      })
    }
  })

  return violations
}

function main() {
  console.log("Lumapse -- Check de dialogos nativos")
  console.log("==================================================")

  if (!fs.existsSync(sourceRoot)) {
    console.error("No se encontro la carpeta src/.")
    return 1
  }

  const violations = collectFiles(sourceRoot)
    .filter((filePath) => !excludedRelativePaths.has(relativePath(filePath)))
    .flatMap(scanFile)

  if (violations.length === 0) {
    console.log("OK: no se encontraron alert(), confirm() ni prompt() fuera del seeder.")
    console.log("==================================================")
    return 0
  }

  console.log("FALLO: se encontraron dialogos nativos no permitidos:")

  for (const violation of violations) {
    console.log(
      `- ${relativePath(violation.filePath)}:${violation.line} -> ${violation.call}()`
    )
    console.log(`  ${violation.source}`)
  }

  console.log("==================================================")
  return 1
}

process.exitCode = main()
