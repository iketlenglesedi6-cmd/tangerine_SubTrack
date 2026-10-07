"use client";

import dynamic from "next/dynamic";
import { useState, type SyntheticEvent } from "react";

const SubscriptionForm = dynamic(
  () => import("@/components/subscription-form").then((module) => module.SubscriptionForm),
  { loading: () => <p className="mt-4 text-sm text-[#57534E]">Getting the form ready…</p> },
);
const CategoryManager = dynamic(
  () => import("@/components/category-manager").then((module) => module.CategoryManager),
  { loading: () => <p className="mt-4 text-sm text-[#57534E]">Getting categories ready…</p> },
);

type Category = { id: string; name: string };
type ExistingSubscription = { name: string };

export function DashboardTools({
  categories,
  existingSubscriptions,
}: {
  categories: Category[];
  existingSubscriptions: ExistingSubscription[];
}) {
  const [formRequested, setFormRequested] = useState(false);
  const [categoriesRequested, setCategoriesRequested] = useState(false);

  function loadOnOpen(setRequested: (requested: boolean) => void) {
    return (event: SyntheticEvent<HTMLDetailsElement>) => {
      if (event.currentTarget.open) setRequested(true);
    };
  }

  return (
    <>
      <details className="group mt-8" onToggle={loadOnOpen(setFormRequested)}>
        <summary className="min-h-11 cursor-pointer rounded-lg border border-[#D6D3D1] px-4 py-3 text-sm font-semibold text-[#7C2D12] transition hover:border-[#9A3412] hover:bg-[#FFF7ED] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9A3412]">
          Add a subscription
        </summary>
        {formRequested && (
          <div className="mt-4">
            <SubscriptionForm categories={categories} existingSubscriptions={existingSubscriptions} />
          </div>
        )}
      </details>
      <details className="group mt-5" onToggle={loadOnOpen(setCategoriesRequested)}>
        <summary className="min-h-11 cursor-pointer rounded-lg border border-[#D6D3D1] px-4 py-3 text-sm font-semibold text-[#7C2D12] transition hover:border-[#9A3412] hover:bg-[#FFF7ED] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9A3412]">
          Manage categories
        </summary>
        {categoriesRequested && (
          <div className="mt-4">
            <CategoryManager categories={categories} />
          </div>
        )}
      </details>
    </>
  );
}
