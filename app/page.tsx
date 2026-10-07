import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-[#FAFAF9] font-sans">
      <PageShell className="flex max-w-2xl flex-col items-center justify-center px-6 py-24 text-center">
        <Image
          src="/tangerine-subtrack-logo.png"
          alt="Tangerine SubTrack"
          width={628}
          height={434}
          priority
          unoptimized
          className="mb-4 h-auto w-64 max-w-full sm:w-72"
        />

        <h1 className="text-[2.75rem] font-semibold leading-[1.1] tracking-tight text-[#1C1917]">
          Never pay for a
          <br />
          forgotten subscription again
        </h1>

        <p className="mt-5 max-w-md text-lg leading-relaxed text-[#57534E]">
          Add what you&apos;re paying for, see it all in one place, and know
          exactly when the next charge is coming.
        </p>

        <div className="mt-10">
          <Show when="signed-out">
            <div className="flex items-center gap-3">
              <SignUpButton>
                <button className="rounded-lg bg-[#C2410C] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#9A3412]">
                  Start tracking
                </button>
              </SignUpButton>
              <SignInButton>
                <button className="rounded-lg px-6 py-3 text-sm font-medium text-[#1C1917] transition-colors hover:bg-[#1C1917]/5">
                  Sign in
                </button>
              </SignInButton>
            </div>
          </Show>

          <Show when="signed-in">
            <Link
              href="/dashboard"
              className="inline-block rounded-lg bg-[#C2410C] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#9A3412]"
            >
              Go to your dashboard
            </Link>
          </Show>
        </div>
      </PageShell>
    </div>
  );
}
