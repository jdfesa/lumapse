import type {
  EntityId,
  HexColor,
  ISODateString,
  ISODateTimeString,
} from './primitives'

const OPAQUE_ID_FORMAT = /^[A-Za-z0-9][A-Za-z0-9._:-]*$/u
const HEX_COLOR_FORMAT = /^#[0-9A-Fa-f]{6}$/u
const ISO_DATE_FORMAT = /^(\d{4})-(\d{2})-(\d{2})$/u
const RFC3339_FORMAT = /^(\d{4})-(\d{2})-(\d{2})[Tt](\d{2}):(\d{2}):(\d{2})(\.\d+)?([Zz]|[+-](\d{2}):(\d{2}))$/u

export class PrimitiveValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PrimitiveValidationError'
  }
}

export interface BoundedOneLineTextOptions {
  maxCodePoints: number
  trim?: boolean
  allowEmpty?: boolean
}

function invalid(message: string): never {
  throw new PrimitiveValidationError(message)
}

function assertLimit(limit: number, unit: string): void {
  if (!Number.isSafeInteger(limit) || limit < 0) {
    throw new RangeError(`El limite de ${unit} debe ser un entero no negativo.`)
  }
}

function exceedsCodePointLimit(value: string, limit: number): boolean {
  let count = 0
  for (let index = 0; index < value.length;) {
    const codePoint = value.codePointAt(index) || 0
    index += codePoint > 0xffff ? 2 : 1
    count += 1
    if (count > limit) return true
  }
  return false
}

function hasOneLineControl(value: string): boolean {
  for (const character of value) {
    const codePoint = character.codePointAt(0) || 0
    if (
      codePoint <= 0x1f ||
      (codePoint >= 0x7f && codePoint <= 0x9f) ||
      codePoint === 0x2028 || codePoint === 0x2029
    ) return true
  }
  return false
}

function hasContentControl(value: string): boolean {
  for (const character of value) {
    const codePoint = character.codePointAt(0) || 0
    const forbiddenC0 = codePoint <= 0x08 ||
      (codePoint >= 0x0b && codePoint <= 0x0c) ||
      (codePoint >= 0x0e && codePoint <= 0x1f)
    if (forbiddenC0 || (codePoint >= 0x7f && codePoint <= 0x9f)) return true
  }
  return false
}

function utf8Width(character: string): number {
  const codePoint = character.codePointAt(0) || 0
  if (codePoint <= 0x7f) return 1
  if (codePoint <= 0x7ff) return 2
  if (codePoint <= 0xffff) return 3
  return 4
}

function exceedsUtf8ByteLimit(value: string, limit: number): boolean {
  let bytes = 0
  for (const character of value) {
    bytes += utf8Width(character)
    if (bytes > limit) return true
  }
  return false
}

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
}

function isRealCalendarDate(year: number, month: number, day: number): boolean {
  if (year < 1 || month < 1 || month > 12 || day < 1) return false
  const daysByMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return day <= daysByMonth[month - 1]
}

export function parseOpaqueId(value: unknown, maxAsciiCharacters: number): EntityId {
  assertLimit(maxAsciiCharacters, 'caracteres ASCII')
  if (typeof value !== 'string') return invalid('debe ser un ID string')
  if (hasOneLineControl(value)) return invalid('no puede contener caracteres de control')

  const normalized = value.trim()
  if (
    !normalized ||
    normalized.length > maxAsciiCharacters ||
    !OPAQUE_ID_FORMAT.test(normalized)
  ) {
    return invalid('debe ser un ID ASCII opaco valido')
  }
  return normalized
}

export function parseHexColor(value: unknown): HexColor | null {
  if (value === null) return null
  if (typeof value !== 'string' || !HEX_COLOR_FORMAT.test(value)) {
    return invalid('debe ser null o un color hexadecimal de seis digitos')
  }
  return value.toLowerCase()
}

export function parseISODate(value: unknown): ISODateString {
  if (typeof value !== 'string') return invalid('debe ser una fecha YYYY-MM-DD')
  const match = ISO_DATE_FORMAT.exec(value)
  if (!match) return invalid('debe ser una fecha YYYY-MM-DD')

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (!isRealCalendarDate(year, month, day)) {
    return invalid('debe ser una fecha de calendario real')
  }
  return value
}

export function parseRFC3339Timestamp(value: unknown): ISODateTimeString {
  if (typeof value !== 'string') return invalid('debe ser un timestamp RFC 3339 con zona')
  const match = RFC3339_FORMAT.exec(value)
  if (!match) return invalid('debe ser un timestamp RFC 3339 con zona')

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const hour = Number(match[4])
  const minute = Number(match[5])
  const second = Number(match[6])
  const offsetHour = Number(match[9] || 0)
  const offsetMinute = Number(match[10] || 0)

  if (
    !isRealCalendarDate(year, month, day) ||
    hour > 23 || minute > 59 || second > 59 ||
    offsetHour > 23 || offsetMinute > 59
  ) {
    return invalid('contiene componentes de fecha, hora o zona invalidos')
  }

  const canonical = `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}`
    + `${match[7] || ''}${match[8].toUpperCase()}`
  const instant = Date.parse(canonical)
  if (!Number.isFinite(instant)) return invalid('no representa un instante finito')
  return new Date(instant).toISOString()
}

export function parseBoundedOneLineText(
  value: unknown,
  options: BoundedOneLineTextOptions,
): string {
  assertLimit(options.maxCodePoints, 'code points')
  if (typeof value !== 'string') return invalid('debe ser texto de una linea')

  if (hasOneLineControl(value)) {
    return invalid('no puede contener controles ni saltos de linea')
  }
  if (exceedsCodePointLimit(value, options.maxCodePoints)) {
    return invalid('supera el limite de code points')
  }
  const normalized = options.trim ? value.trim() : value
  if (options.allowEmpty === false && normalized.length === 0) {
    return invalid('no puede estar vacio')
  }
  return normalized
}

export function parseUtf8ByteBoundedContent(value: unknown, maxBytes: number): string {
  assertLimit(maxBytes, 'bytes UTF-8')
  if (typeof value !== 'string') return invalid('debe ser contenido de texto')
  if (hasContentControl(value)) {
    return invalid('contiene caracteres de control no permitidos')
  }
  if (exceedsUtf8ByteLimit(value, maxBytes)) {
    return invalid('supera el limite de bytes UTF-8')
  }
  return value
}

export function parseLegacyBoolean(value: unknown): boolean {
  if (value === true || value === 1 || value === 'true' || value === '1') return true
  if (value === false || value === 0 || value === 'false' || value === '0') return false
  return invalid('debe ser un boolean legacy exacto')
}
