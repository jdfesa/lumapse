// =============================================================
// backup/BackupImportService
//
// Responsabilidad: orquestar el flujo de importacion ZIP sin
// acoplar UI, lectura ZIP, preview y escritura transaccional.
// =============================================================

import { applyBackupImportPlan } from './BackupImportDataSource'
import { createCurrentBackupImportPlan } from './BackupImportPlanService'
import { parseBackupImportZip } from './BackupImportZipService'
import type {
  BackupImportApplyResult,
  BackupImportFlowResult,
  BackupImportPlan,
  BackupImportSource,
  ParsedBackupImport,
} from '../../domain/backupImport'

type ParseBackupImportZip = typeof parseBackupImportZip
type CreateBackupImportPlan = (parsed: ParsedBackupImport) => Promise<BackupImportPlan>
type ApplyBackupImportPlan = typeof applyBackupImportPlan

interface PrepareBackupImportOptions {
  parseZip?: ParseBackupImportZip
  createPlan?: CreateBackupImportPlan
}

interface ConfirmBackupImportOptions {
  applyPlan?: ApplyBackupImportPlan
}

type ImportBackupZipOptions = PrepareBackupImportOptions & ConfirmBackupImportOptions

/**
 * Prepara el preview de importacion desde un archivo ZIP.
 * No escribe datos: solo parsea el ZIP y calcula el plan contra datos locales.
 */
export async function prepareBackupImport(
  source: BackupImportSource | Blob | ArrayBuffer | Uint8Array | string,
  options: PrepareBackupImportOptions = {},
): Promise<BackupImportPlan> {
  const parseZip = options.parseZip || parseBackupImportZip
  const createPlan = options.createPlan || createCurrentBackupImportPlan
  const parsed = await parseZip(source)

  return createPlan(parsed)
}

/**
 * Aplica un plan de importacion ya revisado/confirmado por la UI.
 */
export async function confirmBackupImport(
  plan: BackupImportPlan,
  options: ConfirmBackupImportOptions = {},
): Promise<BackupImportApplyResult> {
  const applyPlan = options.applyPlan || applyBackupImportPlan

  return applyPlan(plan)
}

/**
 * Atajo para flujos programaticos: prepara y aplica en secuencia.
 * La UI principal deberia usar prepare + confirm para mostrar preview.
 */
export async function importBackupZip(
  source: BackupImportSource | Blob | ArrayBuffer | Uint8Array | string,
  options: ImportBackupZipOptions = {},
): Promise<BackupImportFlowResult> {
  const plan = await prepareBackupImport(source, options)
  const result = await confirmBackupImport(plan, options)

  return {
    plan,
    result,
  }
}
