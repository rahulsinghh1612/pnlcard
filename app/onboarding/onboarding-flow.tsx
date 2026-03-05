"use client";

import { useState, useEffect } from "react";
import { OnboardingSlides } from "./onboarding-slides";
import { OnboardingForm } from "./onboarding-form";
import { OnboardingComplete } from "./onboarding-complete";

type Step = "slides" | "form" | "complete";

interface OnboardingFlowProps {
  userId: string;
}

export function OnboardingFlow({ userId }: OnboardingFlowProps) {
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
    return <OnboardingComplete />;
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
      <OnboardingForm userId={userId} onComplete={() => setStep("complete")} />
    </>
  );
}
