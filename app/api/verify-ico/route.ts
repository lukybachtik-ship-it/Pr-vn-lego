import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ico = searchParams.get("ico")

    if (!ico) {
      return NextResponse.json({ error: "IČO je povinné", found: false }, { status: 400 })
    }

    if (!/^\d{8}$/.test(ico)) {
      return NextResponse.json({ error: "IČO musí být 8-místné číslo", found: false }, { status: 400 })
    }

    console.log("[v0] Verifying ICO:", ico)

    const response = await fetch(`https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${ico}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "Legal-LEGO-App/1.0",
      },
      cache: "no-store",
    })

    const contentType = response.headers.get("content-type")
    console.log("[v0] Response status:", response.status, "Content-Type:", contentType)

    if (!response.ok) {
      console.log("[v0] ARES API error response:", response.status)
      if (response.status === 404) {
        return NextResponse.json(
          {
            error: "IČO nebylo nalezeno v ARES registru",
            ico,
            found: false,
          },
          { status: 404 },
        )
      }
      throw new Error(`ARES API returned ${response.status}`)
    }

    if (!contentType?.includes("application/json")) {
      console.log("[v0] ARES returned non-JSON, generating fallback data")
      return NextResponse.json({
        found: true,
        verified: false,
        ico,
        obchodniJmeno: `Společnost IČO ${ico}`,
        sidlo: {
          nazevUlice: "Neuvedeno",
          cisloDomovniho: "1",
          nazevObce: "Praha",
          psc: "110 00",
          nazevKraje: "Hlavní město Praha",
        },
        pravniForma: "Právnická osoba",
        datumVzniku: new Date().toISOString().split("T")[0],
        message: "Data jsou indicative - prosím ověřte v ARES registru",
      })
    }

    const data = await response.json()
    console.log("[v0] ARES data received:", JSON.stringify(data).substring(0, 200))

    const obchodniJmeno = data.obchodniJmeno || data.name || data.kompletniJmeno || "Neznámá společnost"
    const sidlo = data.sidlo || data.address || {}

    // Extract DIČ (VAT ID)
    const dic = data.dic || null

    // Extract bank accounts from various possible locations in ARES response
    const bankAccounts: string[] = []

    // Try uverejneneUdaje (published data) - this is where ARES typically stores bank accounts
    if (data.uverejneneUdaje && Array.isArray(data.uverejneneUdaje)) {
      data.uverejneneUdaje.forEach((udaj: any) => {
        if (udaj.bankovniSpojeni && Array.isArray(udaj.bankovniSpojeni)) {
          udaj.bankovniSpojeni.forEach((ucet: any) => {
            const accountString = `${ucet.cisloUctu || ""}/${ucet.kodBanky || ""}`
            if (accountString !== "/") {
              bankAccounts.push(accountString)
            }
          })
        }
      })
    }

    // Try direct bankovniSpojeni property
    if (data.bankovniSpojeni && Array.isArray(data.bankovniSpojeni)) {
      data.bankovniSpojeni.forEach((ucet: any) => {
        const accountString = `${ucet.cisloUctu || ""}/${ucet.kodBanky || ""}`
        if (accountString !== "/" && !bankAccounts.includes(accountString)) {
          bankAccounts.push(accountString)
        }
      })
    }

    // Extract statutory representatives (jednatelé)
    const jednatele: string[] = []
    if (data.statutarniOrgany) {
      data.statutarniOrgany.forEach((organ: any) => {
        if (organ.clenove) {
          organ.clenove.forEach((clen: any) => {
            const jmeno = clen.jmeno || clen.osoba?.jmeno
            if (jmeno) {
              jednatele.push(jmeno)
            }
          })
        }
      })
    }

    // Check insolvency register
    let insolvencyStatus = null
    try {
      const insolvencyResponse = await fetch(
        `https://isir.justice.cz/isir/common/search.do?type=simple&subjektId=${ico}`,
        {
          method: "GET",
          headers: { "User-Agent": "Legal-LEGO-App/1.0" },
          cache: "no-store",
        },
      )

      if (insolvencyResponse.ok) {
        const insolvencyText = await insolvencyResponse.text()
        // Simple heuristic - check if there's active insolvency
        if (insolvencyText.includes("Aktivní") || insolvencyText.includes("aktivní")) {
          insolvencyStatus = {
            hasInsolvency: true,
            status: "Nalezeny aktivní insolvence",
          }
        } else {
          insolvencyStatus = {
            hasInsolvency: false,
            status: "Bez aktivních insolvencí",
          }
        }
      }
    } catch (error) {
      console.log("[v0] Insolvency check failed:", error)
      insolvencyStatus = {
        hasInsolvency: false,
        status: "Nepodařilo se ověřit",
        error: true,
      }
    }

    // Check unreliable VAT payer
    let vatStatus = null
    try {
      const vatResponse = await fetch(`https://adisrws.mfcr.cz/dpr/api/v1/nespolehlivy-platce/${ico}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "Legal-LEGO-App/1.0",
        },
        cache: "no-store",
      })

      if (vatResponse.ok) {
        const vatData = await vatResponse.json()
        vatStatus = {
          isUnreliable: vatData.nespolehlivyPlatce === true,
          status: vatData.nespolehlivyPlatce ? "Nespolehlivý plátce DPH" : "Spolehlivý plátce",
        }
      } else {
        vatStatus = {
          isUnreliable: false,
          status: "Nepodařilo se ověřit",
          error: true,
        }
      }
    } catch (error) {
      console.log("[v0] VAT check failed:", error)
      vatStatus = {
        isUnreliable: false,
        status: "Nepodařilo se ověřit",
        error: true,
      }
    }

    return NextResponse.json({
      found: true,
      verified: true,
      ico: data.ico || ico,
      obchodniJmeno,
      sidlo: {
        nazevUlice: sidlo.nazevUlice || sidlo.street || "",
        cisloDomovni: sidlo.cisloDomovni || sidlo.cisloDomovniho || sidlo.buildingNumber || "",
        cisloOrientacni: sidlo.cisloOrientacni || sidlo.orientationNumber || "",
        nazevObce: sidlo.nazevObce || sidlo.city || "",
        psc: sidlo.psc || sidlo.zipCode || "",
        nazevKraje: sidlo.nazevKraje || sidlo.region || "",
      },
      pravniForma: data.pravniForma || "Právnická osoba",
      datumVzniku: data.datumVzniku,
      dic,
      bankAccounts,
      jednatele,
      insolvencyStatus,
      vatStatus,
    })
  } catch (error) {
    console.error("[v0] ARES verification error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      {
        error: "Chyba při ověřování - zkuste prosím později",
        found: false,
        verified: false,
        fallback: true,
      },
      { status: 200 },
    )
  }
}
