import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { CategoryManager } from "@/components/category-manager";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { db } from "@/src/prisma/db";

export default async function CategoriesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const rows = await db.orm.public.Category.where({ userId }).all();
  const categories = rows
    .map((category) => ({
      id: String(category.id),
      name: category.name,
      createdAt: new Date(category.createdAt).toISOString(),
    }))
    .sort((left, right) => left.name.localeCompare(right.name));

  return (
    <PageShell className="max-w-3xl px-6 py-12">
      <PageHeader eyebrow="Organize recurring expenses" title="Categories" className="sm:items-start" />
      <CategoryManager categories={categories} />
    </PageShell>
  );
}
