const plans = [
  {
    name: "Starter",
    price: "$0",
    description: "For people watching a few recurring charges.",
    features: ["Track up to 10 subscriptions", "Renewal reminders", "Monthly spending overview"],
    popular: false,
  },
  {
    name: "Growth",
    price: "$12",
    description: "For users who want stronger visibility and smarter budgeting.",
    features: ["Unlimited subscriptions", "Category tracking", "Priority renewal alerts"],
    popular: true,
  },
  {
    name: "Pro",
    price: "$25",
    description: "For power users managing complex recurring spend.",
    features: ["Advanced insights", "Custom categories", "Team collaboration"],
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-12 md:px-8 md:py-16">
      <section className="text-center">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#7a5b3a]">
          Pricing
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.07em] text-zinc-900 md:text-5xl">
          Simple plans for smarter subscription management.
        </h1>
      </section>

      <section className="mt-10 grid gap-5 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={[
              "rounded-[1.75rem] border p-6 shadow-[0_18px_40px_rgba(38,28,21,0.04)]",
              plan.popular
                ? "border-[#d7b686] bg-[#1f1a17] text-[#f5efe9]"
                : "border-[#e7ddd2] bg-white text-zinc-900",
            ].join(" ")}
          >
            {plan.popular ? (
              <div className="mb-4 inline-flex rounded-full bg-[#f4d7a5] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#3d2b1d]">
                Most popular
              </div>
            ) : null}

            <h2 className="text-2xl font-bold tracking-[-0.05em]">{plan.name}</h2>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-4xl font-black tracking-[-0.08em]">{plan.price}</span>
              <span className={plan.popular ? "text-[#d9c6b4]" : "text-zinc-500"}>/ month</span>
            </div>
            <p className={plan.popular ? "mt-4 text-sm leading-6 text-[#eadbc6]" : "mt-4 text-sm leading-6 text-zinc-600"}>
              {plan.description}
            </p>

            <ul className={plan.popular ? "mt-6 space-y-3 text-sm text-[#f3e7dc]" : "mt-6 space-y-3 text-sm text-zinc-700"}>
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <span className={plan.popular ? "text-[#f4d7a5]" : "text-[#7a5b3a]"}>✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              className={[
                "mt-8 w-full rounded-full px-4 py-3 text-sm font-semibold transition",
                plan.popular
                  ? "bg-[#f4d7a5] text-[#1d1a17] hover:bg-[#f7dfb4]"
                  : "border border-[#d9c5af] bg-white text-zinc-800 hover:bg-[#f7f3ee]",
              ].join(" ")}
            >
              Choose {plan.name}
            </button>
          </div>
        ))}
      </section>
    </main>
  );
}
