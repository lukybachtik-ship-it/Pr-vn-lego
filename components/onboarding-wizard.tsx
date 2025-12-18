"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Sparkles,
  User,
  Calculator,
  Landmark,
  FileText,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react"
import {
  getOnboardingState,
  saveOnboardingState,
  completeOnboarding,
  skipOnboarding,
  ONBOARDING_STEPS,
  type OnboardingStep,
} from "@/lib/onboarding"

const STEP_ICONS: Record<string, React.ReactNode> = {
  sparkles: <Sparkles className="w-8 h-8" strokeWidth={1.5} />,
  user: <User className="w-8 h-8" strokeWidth={1.5} />,
  calculator: <Calculator className="w-8 h-8" strokeWidth={1.5} />,
  landmark: <Landmark className="w-8 h-8" strokeWidth={1.5} />,
  "file-text": <FileText className="w-8 h-8" strokeWidth={1.5} />,
  "check-circle": <CheckCircle className="w-8 h-8" strokeWidth={1.5} />,
}

interface OnboardingWizardProps {
  onComplete?: () => void
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const state = getOnboardingState()
    if (!state.completed) {
      setIsVisible(true)
      setCurrentStep(state.currentStep)
    }
  }, [])

  const step = ONBOARDING_STEPS[currentStep]
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1
  const isFirstStep = currentStep === 0

  const handleNext = () => {
    if (isLastStep) {
      completeOnboarding()
      setIsVisible(false)
      onComplete?.()
    } else {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      saveOnboardingState({ currentStep: nextStep })
    }
  }

  const handlePrev = () => {
    if (!isFirstStep) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
      saveOnboardingState({ currentStep: prevStep })
    }
  }

  const handleSkip = () => {
    skipOnboarding()
    setIsVisible(false)
    onComplete?.()
  }

  const handleAction = () => {
    if (step.action?.href) {
      router.push(step.action.href)
    }
    step.action?.onClick?.()
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 fade-in">
      <div className="bg-card border border-border rounded-lg max-w-md w-full shadow-xl scale-in overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-sm font-medium">Průvodce nastavením</span>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress */}
        <div className="px-4 pt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Krok {currentStep + 1} z {ONBOARDING_STEPS.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center ${
            isLastStep
              ? "bg-success/10 text-success"
              : "bg-primary/10 text-primary"
          }`}>
            {STEP_ICONS[step.icon]}
          </div>

          <h2 className="text-lg font-semibold mb-2">{step.title}</h2>
          <p className="text-sm text-muted-foreground mb-6">{step.description}</p>

          {step.action && !isLastStep && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAction}
              className="mb-4"
            >
              {step.action.label}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center gap-1.5 pb-4">
          {ONBOARDING_STEPS.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep
                  ? "bg-primary"
                  : index < currentStep
                    ? "bg-primary/40"
                    : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            disabled={isFirstStep}
            className="text-muted-foreground"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Zpět
          </Button>

          <div className="flex gap-2">
            {!isLastStep && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-muted-foreground"
              >
                Přeskočit
              </Button>
            )}
            <Button size="sm" onClick={handleNext}>
              {isLastStep ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                  Dokončit
                </>
              ) : (
                <>
                  Další
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
