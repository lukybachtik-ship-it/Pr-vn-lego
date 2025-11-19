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
  const iban = data.iban || formatToIBAN(data.accountNumber!, data.bankCode!)
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
 * Format: CZ{check digits}{bank code}{prefix(6)}{account(10)}
 */
function formatToIBAN(accountNumber: string, bankCode: string): string {
  // Split account number by dash (format: prefix-number or just number)
  let prefix = ""
  let number = accountNumber

  if (accountNumber.includes("-")) {
    const parts = accountNumber.split("-")
    prefix = parts[0]
    number = parts[1]
  }

  // Pad prefix to 6 digits, number to 10 digits
  const paddedPrefix = prefix.padStart(6, "0")
  const paddedNumber = number.padStart(10, "0")

  // Calculate check digits using MOD 97-10 algorithm for IBAN
  const bban = `${bankCode}${paddedPrefix}${paddedNumber}`
  const numericIban = `${bban}123500` // CZ = 1235, add 00 for check calculation

  // Convert to BigInt for modulo calculation
  const remainder = BigInt(numericIban) % BigInt(97)
  const checkDigits = String(BigInt(98) - remainder).padStart(2, "0")

  return `CZ${checkDigits}${bankCode}${paddedPrefix}${paddedNumber}`
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
 */
export function generateInvoiceNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const timestamp = now.getTime().toString().slice(-4)

  return `${year}${month}${day}${timestamp}`
}
