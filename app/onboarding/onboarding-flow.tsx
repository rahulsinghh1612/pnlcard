"use client";

import { useState, useEffect } from "react";
import { OnboardingSlides } from "./onboarding-slides";
import { OnboardingForm } from "./onboarding-form";
import { OnboardingComplete } from "./onboarding-complete";

type Step = "slides" | "form" | "complete";

interface OnboardingFlowProps {
  userId: string;
  selectedPlan?: "monthly" | "yearly" | null;
  hasUsedYearlyTrial?: boolean;
}

export function OnboardingFlow({
  userId,
  selectedPlan = null,
  hasUsedYearlyTrial = false,
}: OnboardingFlowProps) {
  const [step, setStep] = useState<Step>("slides");

  useEffect(() => {
    try {
      if (localStorage.getItem("pnlcard_onboarding_slides_done") === "true") {
        setStep("form");
      }
    } catch {}
  }, []);

  if (step === "slides") {
    return <OnboardingSlides onComplete={() => setStep("form")} />;
  }

  if (step === "complete") {
    return (
      <OnboardingComplete
        selectedPlan={selectedPlan}
        hasUsedYearlyTrial={hasUsedYearlyTrial}
      />
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">
          Set up your profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Just a few details and you&apos;re good to go
        </p>
      </div>
      <OnboardingForm
        userId={userId}
        hasUsedYearlyTrial={hasUsedYearlyTrial}
        onComplete={() => setStep("complete")}
      />
    </>
  );
}
