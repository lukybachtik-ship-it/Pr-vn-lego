/**
 * QR Payment Generator for Czech Banking Standard (SPD)
 * Generates QR codes compliant with Short Payment Descriptor format
 */

export interface QRPaymentData {
  accountNumber?: string // číslo účtu (bez kódu banky)
  bankCode?: string // kód banky
  iban?: string // IBAN (pokud je k dispozici, použije se místo accountNumber+bankCode)
  amount: number
  currency: string // CZK, EUR, USD
  vs?: string // variabilní symbol
  ks?: string // konstantní symbol
  ss?: string // specifický symbol
  message?: string // zpráva pro příjemce
}

/**
 * Remove diacritics from string (convert to ASCII)
 */
function removeDiacritics(str: string): string {
  const diacriticsMap: Record<string, string> = {
    'á': 'a', 'č': 'c', 'ď': 'd', 'é': 'e', 'ě': 'e', 'í': 'i', 'ň': 'n',
    'ó': 'o', 'ř': 'r', 'š': 's', 'ť': 't', 'ú': 'u', 'ů': 'u', 'ý': 'y', 'ž': 'z',
    'Á': 'A', 'Č': 'C', 'Ď': 'D', 'É': 'E', 'Ě': 'E', 'Í': 'I', 'Ň': 'N',
    'Ó': 'O', 'Ř': 'R', 'Š': 'S', 'Ť': 'T', 'Ú': 'U', 'Ů': 'U', 'Ý': 'Y', 'Ž': 'Z'
  }
  return str.replace(/[áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/g, char => diacriticsMap[char] || char)
}

/**
 * Calculate CRC32 checksum for SPAYD string
 * Some banks require this for validation
 */
function calculateCRC32(str: string): string {
  // CRC32 lookup table
  const table: number[] = []
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    }
    table[i] = c >>> 0
  }

  let crc = 0xFFFFFFFF
  for (let i = 0; i < str.length; i++) {
    crc = table[(crc ^ str.charCodeAt(i)) & 0xFF] ^ (crc >>> 8)
  }
  crc = (crc ^ 0xFFFFFFFF) >>> 0

  // Return as uppercase hex string
  return crc.toString(16).toUpperCase().padStart(8, '0')
}

/**
 * Generate SPD (Short Payment Descriptor) string
 * Format: SPD*1.0*ACC:{IBAN}*AM:{amount}*CC:{currency}*MSG:{message}*X-VS:{vs}
 * Compliant with Czech QR Platba (SPAYD) specification
 */
export function generateSPDString(data: QRPaymentData): string {
  const parts: string[] = ["SPD*1.0"]

  // Account (use IBAN if available, otherwise format from account number)
  let iban: string
  if (data.iban && data.iban.length >= 24 && !data.iban.includes("_")) {
    // Use provided IBAN, but remove any spaces
    iban = data.iban.replace(/\s/g, "").toUpperCase()
  } else {
    // Generate IBAN from account number and bank code
    iban = formatToIBAN(data.accountNumber!, data.bankCode!)
  }
  parts.push(`ACC:${iban}`)

  // Amount - for CZK use integer (no decimal places), for other currencies use 2 decimal places
  if (data.amount > 0) {
    if (data.currency === "CZK") {
      // CZK amounts must be whole numbers
      parts.push(`AM:${Math.round(data.amount)}`)
    } else {
      parts.push(`AM:${data.amount.toFixed(2)}`)
    }
  }

  // Currency
  parts.push(`CC:${data.currency}`)

  // Variable symbol (max 10 digits)
  if (data.vs) {
    const cleanVs = data.vs.replace(/\D/g, "").substring(0, 10)
    if (cleanVs) {
      parts.push(`X-VS:${cleanVs}`)
    }
  }

  // Constant symbol (max 10 digits)
  if (data.ks) {
    const cleanKs = data.ks.replace(/\D/g, "").substring(0, 10)
    if (cleanKs) {
      parts.push(`X-KS:${cleanKs}`)
    }
  }

  // Specific symbol (max 10 digits)
  if (data.ss) {
    const cleanSs = data.ss.replace(/\D/g, "").substring(0, 10)
    if (cleanSs) {
      parts.push(`X-SS:${cleanSs}`)
    }
  }

  // Message - must be ASCII only (no diacritics), max 60 chars
  if (data.message) {
    // Remove diacritics and special characters
    let sanitized = removeDiacritics(data.message)
    // Remove any remaining non-ASCII and special SPD characters
    sanitized = sanitized.replace(/[*\n\r]/g, " ")
    // Keep only printable ASCII
    sanitized = sanitized.replace(/[^\x20-\x7E]/g, "")
    sanitized = sanitized.substring(0, 60).trim()
    if (sanitized) {
      parts.push(`MSG:${sanitized}`)
    }
  }

  // Build the string without CRC first
  const spdWithoutCRC = parts.join("*")

  // Add CRC32 checksum for better compatibility with some banks
  const crc = calculateCRC32(spdWithoutCRC)
  parts.push(`CRC32:${crc}`)

  return parts.join("*")
}

/**
 * Format Czech account number to IBAN
 * Format: CZ{check digits}{bank code 4 digits}{prefix 6 digits}{account 10 digits}
 */
function formatToIBAN(accountNumber: string, bankCode: string): string {
  // Remove any spaces or dashes that might be in the input
  const cleanAccount = accountNumber.replace(/\s/g, "")
  const cleanBankCode = bankCode.replace(/\s/g, "")

  // Split account number by dash (format: prefix-number or just number)
  let prefix = ""
  let number = cleanAccount

  if (cleanAccount.includes("-")) {
    const parts = cleanAccount.split("-")
    prefix = parts[0]
    number = parts[1]
  }

  // Pad bank code to 4 digits, prefix to 6 digits, number to 10 digits
  const paddedBankCode = cleanBankCode.padStart(4, "0")
  const paddedPrefix = prefix.padStart(6, "0")
  const paddedNumber = number.padStart(10, "0")

  // BBAN = bank code (4) + prefix (6) + account number (10) = 20 digits
  const bban = `${paddedBankCode}${paddedPrefix}${paddedNumber}`

  // For MOD 97-10 calculation:
  // 1. Move country code to end: BBAN + CZ00
  // 2. Replace letters with numbers: C=12, Z=35
  // 3. Calculate: 98 - (number mod 97)
  const numericString = `${bban}123500` // BBAN + C(12) + Z(35) + 00

  // Use string-based modulo for large numbers
  let remainder = 0
  for (let i = 0; i < numericString.length; i++) {
    remainder = (remainder * 10 + parseInt(numericString[i], 10)) % 97
  }

  const checkDigits = String(98 - remainder).padStart(2, "0")

  return `CZ${checkDigits}${bban}`
}

/**
 * Generate QR code as Data URL
 */
export async function generateQRCode(data: QRPaymentData): Promise<string> {
  const QRCode = (await import("qrcode")).default
  const spdString = generateSPDString(data)

  try {
    return await QRCode.toDataURL(spdString, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 300,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })
  } catch (error) {
    console.error("QR code generation error:", error)
    throw new Error("Nepodařilo se vygenerovat QR kód")
  }
}

/**
 * Generate invoice number from current date
 * Max 10 characters for variable symbol compatibility
 */
export function generateInvoiceNumber(): string {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2) // Last 2 digits of year
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const timestamp = now.getTime().toString().slice(-4)

  return `${year}${month}${day}${timestamp}` // Format: YYMMDDXXXX (10 chars)
}
