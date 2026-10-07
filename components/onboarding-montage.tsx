"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const slides = [
  {
    eyebrow: "A little less surprise",
    title: "Meet your subscription sidekick.",
    copy: "SubTrack brings your recurring payments into one calm, clear place, so renewals don't catch you off guard.",
    note: "Your money, neatly unzipped.",
    bubble: "Psst! I’ve got your back.",
  },
  {
    eyebrow: "See the whole picture",
    title: "Know what’s coming up.",
    copy: "See what you spend each month, what renews soon, and how your subscriptions add up across currencies.",
    note: "No more mental maths in the checkout queue.",
    bubble: "See that? Nice and tidy!",
  },
  {
    eyebrow: "You’re in charge",
    title: "Start with the list you have.",
    copy: "Add subscriptions yourself or import a bank CSV. We’ll help spot recurring charges; you choose what to keep track of.",
    note: "SubTrack never cancels a service for you.",
    bubble: "Your call, always.",
  },
];

export function OnboardingMontage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  const [error, setError] = useState("");

  async function finish() {
    if (isFinishing) return;
    setIsFinishing(true);
    setError("");
    try {
      const response = await fetch("/api/onboarding/complete", { method: "POST" });
      if (!response.ok) throw new Error("We couldn't save that just now. Please try again.");
      router.refresh();
    } catch (finishError) {
      setError(finishError instanceof Error ? finishError.message : "Please try again.");
      setIsFinishing(false);
    }
  }

  const slide = slides[step];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-[#211811]/45 p-4 backdrop-blur-md sm:p-6">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        aria-describedby="onboarding-copy"
        className="onboarding-card relative my-auto w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/70 bg-[#fffaf4] shadow-[0_30px_100px_rgba(57,31,16,0.28)]"
      >
        <div className="absolute inset-x-0 top-0 h-1.5 bg-[#ffedd5]">
          <div className="h-full rounded-r-full bg-[#ea7530] transition-[width] duration-500" style={{ width: `${((step + 1) / slides.length) * 100}%` }} />
        </div>
        <button
          type="button"
          onClick={() => void finish()}
          disabled={isFinishing}
          className="absolute right-5 top-5 z-10 rounded-full px-3 py-2 text-sm font-medium text-[#57534E] transition hover:bg-[#f4ece3] hover:text-[#1c1917] disabled:opacity-50"
        >
          Skip intro
        </button>

        <div key={step} className="onboarding-slide grid items-center gap-5 px-6 pb-7 pt-16 sm:grid-cols-[0.9fr_1.1fr] sm:gap-8 sm:px-10 sm:pb-9 sm:pt-14">
          <div className="relative mx-auto flex aspect-square w-full max-w-[250px] items-center justify-center rounded-full bg-[radial-gradient(circle_at_50%_45%,#fff1d6_0%,#ffe0b5_56%,#ffd09b_100%)] sm:max-w-none">
            <span className="absolute h-[78%] w-[78%] rounded-full border border-white/70" />
            <svg className="onboarding-arrow absolute inset-0 h-full w-full" viewBox="0 0 300 300" fill="none" aria-hidden="true">
              <path d="M44 106C20 58 71 28 116 42" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="7 8" />
              <path d="m104 31 16 12-18 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M253 191c18 39-10 75-48 74" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="7 8" />
              <path d="m217 253-15 12 18 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <Image
              src="/tangerine-icon.png"
              alt="Tangerine, your SubTrack sidekick"
              width={470}
              height={360}
              priority
              className="onboarding-mascot relative z-10 h-[78%] w-[78%] object-contain drop-shadow-[0_16px_14px_rgba(154,52,18,0.16)]"
            />
            <span className="onboarding-speech absolute -right-1 top-3 z-20 max-w-[145px] rounded-2xl rounded-bl-sm border border-[#f6c49d] bg-[#fffaf4] px-3 py-2 text-center text-xs font-semibold text-[#8a3a18] shadow-md sm:-right-3 sm:top-5">
              {slide.bubble}
            </span>
            <span className="onboarding-spark absolute right-[13%] top-[18%] text-2xl text-[#ea7530]" aria-hidden="true">✦</span>
            <span className="onboarding-spark onboarding-spark-late absolute bottom-[19%] left-[12%] text-lg text-[#c2410c]" aria-hidden="true">✦</span>
          </div>

          <div className="text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c2410c]">{slide.eyebrow}</p>
            <h1 id="onboarding-title" className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-[#29211c] sm:text-4xl">{slide.title}</h1>
            <p id="onboarding-copy" className="mt-4 text-base leading-7 text-[#65584f]">{slide.copy}</p>
            <p className="mt-4 inline-flex rounded-full bg-[#fff0dc] px-3.5 py-2 text-sm font-medium text-[#8a3a18]">{slide.note}</p>

            <div className="mt-7 flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-2" aria-label={`Step ${step + 1} of ${slides.length}`}>
                {slides.map((item, index) => (
                  <span key={item.eyebrow} className={`h-2 rounded-full transition-all duration-300 ${index === step ? "w-7 bg-[#c2410c]" : "w-2 bg-[#e7cbb4]"}`} />
                ))}
              </div>
              {step < slides.length - 1 ? (
                <button type="button" onClick={() => setStep((current) => current + 1)} className="w-full rounded-xl bg-[#9a3412] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#7c2d12] sm:w-auto">
                  Next little tip <span aria-hidden="true">→</span>
                </button>
              ) : (
                <button type="button" onClick={() => void finish()} disabled={isFinishing} className="w-full rounded-xl bg-[#9a3412] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#7c2d12] disabled:cursor-wait disabled:opacity-70 sm:w-auto">
                  {isFinishing ? "Getting your dashboard ready…" : "Let’s go to the dashboard"}
                </button>
              )}
            </div>
            {error && <p role="alert" className="mt-3 text-sm text-[#9a3412]">{error}</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
