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
 * Generate SPD (Short Payment Descriptor) string
 * Format: SPD*1.0*ACC:{IBAN}*AM:{amount}*CC:{currency}*MSG:{message}*X-VS:{vs}
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

  // Amount
  if (data.amount > 0) {
    parts.push(`AM:${data.amount.toFixed(2)}`)
  }

  // Currency
  parts.push(`CC:${data.currency}`)

  // Variable symbol
  if (data.vs) {
    parts.push(`X-VS:${data.vs}`)
  }

  // Constant symbol
  if (data.ks) {
    parts.push(`X-KS:${data.ks}`)
  }

  // Specific symbol
  if (data.ss) {
    parts.push(`X-SS:${data.ss}`)
  }

  // Message
  if (data.message) {
    // Sanitize message (remove special characters that could break QR)
    const sanitized = data.message.replace(/[*\n\r]/g, " ").substring(0, 60)
    parts.push(`MSG:${sanitized}`)
  }

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
