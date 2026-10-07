"use client";

import dynamic from "next/dynamic";

const OnboardingMontage = dynamic(
  () => import("@/components/onboarding-montage").then((module) => module.OnboardingMontage),
);

export function OnboardingGate() {
  return <OnboardingMontage />;
}
