import type { ContractBlock } from "@/types/contract"

export interface MissingBlockRecommendation {
  blockId: string
  name: string
  icon: string
  reason: string
  severity: "critical" | "recommended" | "optional"
  category: string
}

export interface ContractAnalysisResult {
  missingBlocks: MissingBlockRecommendation[]
  completenessScore: number
  warnings: string[]
}

// Pravidla pro doporučené bloky podle typu smlouvy
const RECOMMENDATION_RULES: Record<
  string,
  {
    required: string[]
    highlyRecommended: string[]
    recommended: string[]
    reasons: Record<string, string>
  }
> = {
  "work-contract": {
    required: ["parties", "scope", "payment"],
    highlyRecommended: ["timeline", "deliverables", "warranty"],
    recommended: ["confidentiality", "termination", "penalties"],
    reasons: {
      timeline:
        "Bez časového plánu není jasné, kdy má být dílo dokončeno. To může vést ke sporům o zpoždění.",
      deliverables:
        "Není definováno, jak a kdy bude dílo předáno. Doporučujeme tento blok přidat, abyste předešli sporům o dokončení.",
      warranty:
        "Záruka chrání obě strany - objednatele před vadným dílem a dodavatele před neopodstatněnými reklamacemi.",
      confidentiality:
        "Pokud dílo obsahuje citlivé informace, důvěrnost je důležitá pro ochranu obchodního tajemství.",
      termination: "Definuje, jak může kterákoli strana ukončit spolupráci v případě problémů.",
      penalties:
        "Smluvní pokuty motivují k dodržení termínů, ale nastavte je rozumně podle hodnoty díla.",
    },
  },
  "rental-contract": {
    required: ["parties", "property", "rental-period", "rental-price"],
    highlyRecommended: ["deposit", "utilities", "maintenance"],
    recommended: ["rules", "insurance", "termination-rental"],
    reasons: {
      deposit: "Kauce chrání pronajímatele před případnými škodami na majetku.",
      utilities: "Jasně definuje, kdo platí za elektřinu, plyn, vodu a internet. Předchází sporům.",
      maintenance: "Vymezuje, kdo je zodpovědný za běžnou údržbu a kdo za velké opravy.",
      rules: "Domácí řád stanovuje základní pravidla (klid, domácí zvířata, kouření).",
      insurance: "Pojištění chrání obě strany před nepředvídatelnými událostmi.",
      "termination-rental": "Definuje výpovědní lhůtu a proces předání nemovitosti zpět.",
    },
  },
  "trade-contract": {
    required: ["parties", "goods", "pricing", "payment-terms"],
    highlyRecommended: ["delivery", "quality", "returns"],
    recommended: ["liability", "privacy", "dispute", "intellectual"],
    reasons: {
      delivery: "Stanovuje, kde a kdy bude zboží dodáno a kdo platí za dopravu.",
      quality: "Definuje standardy kvality a lhůty pro reklamaci. Chrání kupującího.",
      returns: "Podmínky vrácení zboží jsou důležité zejména pro spotřebitelské smlouvy.",
      liability: "Omezuje odpovědnost prodávajícího a definuje, co není zahrnuto v záručních podmínkách.",
      privacy:
        "GDPR compliance - pokud zpracováváte osobní údaje zákazníků, tento blok je povinný.",
      dispute: "Mimosoudní řešení sporů může ušetřit čas a peníze oproti soudnímu řízení.",
      intellectual:
        "Pokud prodáváte kreativní práci nebo software, definuje práva k duševnímu vlastnictví.",
    },
  },
  "other-contract": {
    required: ["parties", "scope"],
    highlyRecommended: ["payment", "duration"],
    recommended: [],
    reasons: {
      payment: "I když smlouva není primárně o penězích, jasné finanční podmínky předchází sporům.",
      duration: "Definuje, jak dlouho smlouva trvá a jak může být prodloužena nebo ukončena.",
    },
  },
}

export function analyzeContract(contractType: string, blocks: ContractBlock[]): ContractAnalysisResult {
  const rules = RECOMMENDATION_RULES[contractType] || RECOMMENDATION_RULES["other-contract"]
  const existingBlockIds = new Set(blocks.map((b) => b.templateId))

  const missingBlocks: MissingBlockRecommendation[] = []
  const warnings: string[] = []

  // Kontrola povinných bloků
  rules.required.forEach((blockId) => {
    if (!existingBlockIds.has(blockId)) {
      missingBlocks.push({
        blockId,
        name: getBlockName(blockId),
        icon: getBlockIcon(blockId),
        reason: `Toto pole je povinné pro ${getContractTypeName(contractType)}.`,
        severity: "critical",
        category: "required",
      })
    }
  })

  // Kontrola velmi doporučených bloků
  rules.highlyRecommended.forEach((blockId) => {
    if (!existingBlockIds.has(blockId)) {
      missingBlocks.push({
        blockId,
        name: getBlockName(blockId),
        icon: getBlockIcon(blockId),
        reason: rules.reasons[blockId] || "Tento blok je velmi doporučený pro vaši smlouvu.",
        severity: "recommended",
        category: "highlyRecommended",
      })
    }
  })

  // Kontrola doporučených bloků
  rules.recommended.forEach((blockId) => {
    if (!existingBlockIds.has(blockId)) {
      missingBlocks.push({
        blockId,
        name: getBlockName(blockId),
        icon: getBlockIcon(blockId),
        reason: rules.reasons[blockId] || "Tento blok může být užitečný pro vaši smlouvu.",
        severity: "optional",
        category: "recommended",
      })
    }
  })

  // Kontrola neúplných bloků
  blocks.forEach((block) => {
    if (!block.isComplete) {
      warnings.push(`Blok "${block.name}" není kompletně vyplněný.`)
    }
  })

  // Specifické kontroly podle typu smlouvy
  if (contractType === "work-contract") {
    const hasPayment = blocks.find((b) => b.templateId === "payment" && b.isComplete)
    const hasPenalties = blocks.find((b) => b.templateId === "penalties" && b.isComplete)

    if (hasPayment && hasPenalties) {
      const amount = parseFloat(hasPayment.data.amount || "0")
      const penaltyAmount = parseFloat(hasPenalties.data.penaltyAmount || "0")

      if (penaltyAmount > amount * 0.1) {
        warnings.push(
          "Pozor: Smluvní pokuta je vyšší než 10% z celkové částky. To může být považováno za nepřiměřené.",
        )
      }
    }
  }

  // Výpočet skóre kompletnosti
  const totalPossibleBlocks = rules.required.length + rules.highlyRecommended.length
  const completedImportantBlocks = [...rules.required, ...rules.highlyRecommended].filter((id) =>
    blocks.find((b) => b.templateId === id && b.isComplete),
  ).length

  const completenessScore = Math.round((completedImportantBlocks / totalPossibleBlocks) * 100)

  return {
    missingBlocks,
    completenessScore,
    warnings,
  }
}

function getBlockName(blockId: string): string {
  const names: Record<string, string> = {
    parties: "Smluvní strany",
    scope: "Předmět díla",
    payment: "Cena a splatnost",
    timeline: "Časový plán",
    deliverables: "Předání díla",
    warranty: "Záruka",
    confidentiality: "Důvěrnost",
    termination: "Ukončení smlouvy",
    penalties: "Smluvní pokuty",
    property: "Popis předmětu pronájmu",
    "rental-period": "Doba pronájmu",
    "rental-price": "Nájemné a poplatky",
    deposit: "Kauce",
    utilities: "Vedlejší náklady",
    maintenance: "Údržba a opravy",
    rules: "Domácí řád",
    insurance: "Pojištění",
    "termination-rental": "Ukončení pronájmu",
    goods: "Popis zboží/služeb",
    pricing: "Ceny a podmínky",
    "payment-terms": "Podmínky platby",
    delivery: "Dodání",
    quality: "Kvalita a reklamace",
    returns: "Vrácení zboží",
    liability: "Odpovědnost za škodu",
    privacy: "Ochrana osobních údajů",
    dispute: "Řešení sporů",
    intellectual: "Duševní vlastnictví",
    duration: "Trvání smlouvy",
  }
  return names[blockId] || blockId
}

function getBlockIcon(blockId: string): string {
  const icons: Record<string, string> = {
    parties: "👥",
    scope: "📦",
    payment: "💰",
    timeline: "📅",
    deliverables: "✅",
    warranty: "🛡️",
    confidentiality: "🔒",
    termination: "🔚",
    penalties: "⚠️",
    property: "🏠",
    "rental-period": "📅",
    "rental-price": "💰",
    deposit: "💵",
    utilities: "⚡",
    maintenance: "🔧",
    rules: "📋",
    insurance: "📄",
    "termination-rental": "🔚",
    goods: "📦",
    pricing: "💰",
    "payment-terms": "💳",
    delivery: "🚚",
    quality: "✅",
    returns: "↩️",
    liability: "⚖️",
    privacy: "🔐",
    dispute: "⚔️",
    intellectual: "🧠",
    duration: "⏱️",
  }
  return icons[blockId] || "📄"
}

function getContractTypeName(contractType: string): string {
  const names: Record<string, string> = {
    "work-contract": "smlouvu o dílo",
    "rental-contract": "nájemní smlouvu",
    "trade-contract": "obchodní podmínky",
    "other-contract": "tuto smlouvu",
  }
  return names[contractType] || "tuto smlouvu"
}
