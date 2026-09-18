import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";

const statHighlights = [
  { label: "Monthly spend", value: "$248", tone: "primary" },
  { label: "Hidden costs", value: "4", tone: "muted" },
  { label: "Renewals soon", value: "4", tone: "soft" },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4efe9] text-zinc-800">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(196,144,77,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(125,90,67,0.12),transparent_30%)]" />
      <div className="absolute -left-16 top-10 h-64 w-64 rounded-full bg-[#d4a66d]/20 blur-3xl" />
      <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-[#b7c7d5]/30 blur-3xl" />

      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-16 lg:px-8">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d8c5af] bg-white/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#7d5635] backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-[#d49b5d]" />
              Tangerine SubTrack
            </div>

            <h1 className="text-5xl font-black tracking-[-0.07em] text-zinc-900 sm:text-6xl xl:text-7xl">
              Catch recurring waste before it grows into a surprise bill.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-zinc-600 sm:text-lg">
              SubTrack helps you spot overpriced plans, track renewals early, and understand exactly where your monthly spend is going before the money quietly disappears.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Show when="signed-out">
                <>
                  <SignUpButton>
                    <button className="rounded-full bg-[#171513] px-6 py-3 text-sm font-semibold text-[#f6f1eb] shadow-[0_16px_40px_rgba(23,21,19,0.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#2a2522]">
                      Get started
                    </button>
                  </SignUpButton>
                  <SignInButton>
                    <button className="rounded-full border border-[#d7cab8] bg-white/80 px-6 py-3 text-sm font-semibold text-zinc-800 transition duration-200 hover:-translate-y-0.5 hover:bg-[#f9f3ee]">
                      Sign in
                    </button>
                  </SignInButton>
                </>
              </Show>

              <Show when="signed-in">
                <Link
                  href="/dashboard"
                  className="rounded-full bg-[#171513] px-6 py-3 text-sm font-semibold text-[#f6f1eb] shadow-[0_16px_40px_rgba(23,21,19,0.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#2a2522]"
                >
                  Open dashboard
                </Link>
              </Show>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              {statHighlights.map(({ label, value, tone }) => (
                <div
                  key={label}
                  className={[
                    "min-w-[130px] rounded-2xl border p-4 shadow-[0_14px_30px_rgba(38,28,21,0.04)] backdrop-blur-sm",
                    tone === "primary"
                      ? "border-[#dfc7aa] bg-[#1d1a17] text-[#f7f1eb]"
                      : tone === "muted"
                        ? "border-[#e7ddd2] bg-[#f8f4f1] text-zinc-800"
                        : "border-[#e7ddd2] bg-[#f2e9e2] text-zinc-800",
                  ].join(" ")}
                >
                  <p className="text-[11px] uppercase tracking-[0.2em] opacity-75">{label}</p>
                  <p className="mt-3 text-2xl font-bold tracking-[-0.05em]">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="float-slow relative w-full max-w-md rounded-[2rem] border border-[#e7ddd2] bg-white/80 p-5 shadow-[0_30px_80px_rgba(34,25,18,0.12)] backdrop-blur-xl">
              <div className="rounded-[1.5rem] bg-[#201d1b] p-4 text-[#f6f1eb] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-[#d9c8bb]">Overview</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em]">June spend</h2>
                  </div>
                  <div className="rounded-full bg-[#f4d4aa] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2d211a]">
                    +8.4%
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#d9c8bb]">Total</p>
                      <p className="mt-2 text-4xl font-black tracking-[-0.08em]">$248</p>
                    </div>
                    <div className="rounded-xl bg-[#f3c790]/12 px-3 py-2 text-right">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#f3c790]">This month</p>
                      <p className="mt-1 text-base font-semibold text-[#f7e7d3]">12 active</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    ["Netflix", "$18.99", "12 Jul"],
                    ["Spotify", "$11.99", "22 Jul"],
                    ["Figma", "$15", "4 Aug"],
                  ].map(([name, price, due]) => (
                    <div key={name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
                      <div>
                        <p className="font-medium text-[#f5efe9]">{name}</p>
                        <p className="text-xs text-[#d8c6b6]">Renews {due}</p>
                      </div>
                      <span className="text-sm font-semibold text-[#f6d6a0]">{price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="float-delay absolute -bottom-4 -left-4 rounded-2xl border border-[#e7ddd2] bg-[#f7f1ea] p-4 shadow-[0_18px_36px_rgba(35,27,21,0.08)]">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#7d5635]">Renewals</p>
              <p className="mt-2 text-xl font-bold tracking-[-0.05em] text-zinc-900">4 due soon</p>
            </div>
          </div>
        </div>
      </main>

      <section className="relative mx-auto w-full max-w-6xl px-6 pb-20 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Renewal radar",
              body: "See what renews soon and which subscriptions are silently draining the budget.",
            },
            {
              title: "Spending clarity",
              body: "Break recurring costs down by category so you can spot patterns at a glance.",
            },
            {
              title: "Smarter decisions",
              body: "Know when a plan is expensive, duplicated, or worth cutting before the bill hits.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-[1.75rem] border border-[#e7ddd2] bg-white/70 p-6 shadow-[0_18px_40px_rgba(41,31,23,0.04)] backdrop-blur-sm"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f0e1ca] text-lg font-bold text-[#4a3427]">
                •
              </div>
              <h3 className="text-xl font-bold tracking-[-0.05em] text-zinc-900">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-600">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
