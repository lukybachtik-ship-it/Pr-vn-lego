// Onboarding state management
export interface OnboardingState {
  completed: boolean
  currentStep: number
  skipped: boolean
  completedSteps: string[]
  lastSeenAt: string | null
}

const ONBOARDING_KEY = "businesshub_onboarding"

const DEFAULT_STATE: OnboardingState = {
  completed: false,
  currentStep: 0,
  skipped: false,
  completedSteps: [],
  lastSeenAt: null,
}

export function getOnboardingState(): OnboardingState {
  if (typeof window === "undefined") return DEFAULT_STATE

  try {
    const stored = localStorage.getItem(ONBOARDING_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error("Failed to load onboarding state:", error)
  }

  return DEFAULT_STATE
}

export function saveOnboardingState(state: Partial<OnboardingState>): void {
  if (typeof window === "undefined") return

  try {
    const current = getOnboardingState()
    const updated = { ...current, ...state, lastSeenAt: new Date().toISOString() }
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error("Failed to save onboarding state:", error)
  }
}

export function completeOnboarding(): void {
  saveOnboardingState({ completed: true })
}

export function skipOnboarding(): void {
  saveOnboardingState({ completed: true, skipped: true })
}

export function resetOnboarding(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(ONBOARDING_KEY)
}

export function completeStep(stepId: string): void {
  const state = getOnboardingState()
  if (!state.completedSteps.includes(stepId)) {
    saveOnboardingState({
      completedSteps: [...state.completedSteps, stepId],
    })
  }
}

export function setCurrentStep(step: number): void {
  saveOnboardingState({ currentStep: step })
}

export interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Vítejte v BusinessHub",
    description: "Váš pomocník pro správu zakázek, smluv a financí. Provedeme vás základním nastavením.",
    icon: "sparkles",
  },
  {
    id: "profile",
    title: "Nastavte svůj profil",
    description: "Vyplňte své firemní údaje, které se budou zobrazovat na fakturách a smlouvách.",
    icon: "user",
    action: {
      label: "Nastavit profil",
      href: "/settings/profile",
    },
  },
  {
    id: "tax",
    title: "Daňové nastavení",
    description: "Nastavte své daňové parametry pro přesný výpočet čistého zisku z zakázek.",
    icon: "calculator",
    action: {
      label: "Nastavit daně",
      href: "/settings/tax",
    },
  },
  {
    id: "bank",
    title: "Přidejte bankovní účet",
    description: "Přidejte bankovní účet pro zobrazování na fakturách.",
    icon: "landmark",
    action: {
      label: "Přidat účet",
      href: "/settings/bank-accounts",
    },
  },
  {
    id: "first-contract",
    title: "Vytvořte první smlouvu",
    description: "Vyzkoušejte si vytvořit první smlouvu pomocí našeho průvodce.",
    icon: "file-text",
    action: {
      label: "Vytvořit smlouvu",
      href: "/builder",
    },
  },
  {
    id: "complete",
    title: "Vše je připraveno!",
    description: "Gratulujeme! Nyní máte aplikaci nastavenou a můžete začít pracovat.",
    icon: "check-circle",
  },
]
