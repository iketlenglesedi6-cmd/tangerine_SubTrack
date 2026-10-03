import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { CategoryManager } from "@/components/category-manager";
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
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <header className="mb-8 border-b border-[#1C1917]/10 pb-5">
        <p className="text-sm text-[#78716C]">Organize recurring expenses</p>
        <h1 className="mt-1 text-3xl font-semibold text-[#1C1917]">Categories</h1>
      </header>
      <CategoryManager initialCategories={categories} />
    </main>
  );
}