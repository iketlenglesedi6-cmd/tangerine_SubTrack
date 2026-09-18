const featureGroups = [
  {
    title: "Renewal radar",
    text: "See which subscriptions are approaching renewal and plan ahead before your budget gets hit.",
    metric: "4 renewals" ,
  },
  {
    title: "Spend forecasting",
    text: "Translate recurring charges into monthly totals and understand the real cost of your subscriptions.",
    metric: "$248 / month",
  },
  {
    title: "Category control",
    text: "Track where your money is going across entertainment, work tools, health, and lifestyle spending.",
    metric: "4 categories",
  },
];

const workflow = [
  "Connect your subscriptions and track recurring charges",
  "Review calendar reminders and upcoming renewal dates",
  "Cut unnecessary spend before it becomes a surprise bill",
];

export default function FeaturesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-12 md:px-8 md:py-16">
      <section className="rounded-[2rem] border border-[#e7ddd2] bg-[#fbf8f4] p-8 shadow-[0_20px_50px_rgba(33,26,20,0.05)] md:p-12">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[#7a5b3a]">
          Features
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-black tracking-[-0.07em] text-zinc-900 md:text-5xl">
          Built to surface the subscriptions you actually need to watch.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600">
          SubTrack focuses on clarity, not clutter. It turns a stream of recurring charges into useful signals you can act on.
        </p>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-3">
        {featureGroups.map((feature) => (
          <div
            key={feature.title}
            className="rounded-[1.75rem] border border-[#e7ddd2] bg-white p-6 shadow-[0_16px_32px_rgba(38,28,21,0.04)]"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f0dfbf] text-lg font-black text-[#3d2c20]">
              +
            </div>
            <h2 className="text-xl font-bold tracking-[-0.05em] text-zinc-900">{feature.title}</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">{feature.text}</p>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#7a5b3a]">{feature.metric}</p>
          </div>
        ))}
      </section>

      <section className="mt-10 rounded-[2rem] border border-[#e7ddd2] bg-[#f6f1ea] p-8 md:p-10">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#7a5b3a]">
              Product flow
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] text-zinc-900">
              Stay ahead without checking every bill manually.
            </h2>
          </div>

          <div className="space-y-4">
            {workflow.map((step, index) => (
              <div key={step} className="flex items-start gap-4 rounded-2xl border border-[#e9dccd] bg-white p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1d1a17] text-xs font-bold text-[#f7f1ea]">
                  {index + 1}
                </div>
                <p className="text-sm leading-6 text-zinc-700">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
