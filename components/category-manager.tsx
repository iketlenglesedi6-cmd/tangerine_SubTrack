"use client";

import { useState, type FormEvent } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { InlineFeedback } from "@/components/ui/inline-feedback";
import { SectionHeading } from "@/components/ui/section-heading";

type Category = {
  id: string;
  name: string;
};

export function CategoryManager({ categories: initialCategories }: { categories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [message, setMessage] = useState("");

  async function getError(response: Response) {
    const payload: unknown = await response.json().catch(() => null);
    if (
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "string"
    ) {
      return payload.error;
    }
    return "Something went wrong. Please try again.";
  }

  async function createCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newName.trim();
    if (!name) {
      setMessage("Enter a category name.");
      return;
    }

    setIsWorking(true);
    setMessage("");
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error(await getError(response));
      const category = (await response.json()) as Category;
      setCategories((current) =>
        [...current, category].sort((left, right) => left.name.localeCompare(right.name)),
      );
      setNewName("");
      setMessage("Category added.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to add category.");
    } finally {
      setIsWorking(false);
    }
  }

  async function saveRename(id: string) {
    const name = editingName.trim();
    if (!name) {
      setMessage("Enter a category name.");
      return;
    }

    setIsWorking(true);
    setMessage("");
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error(await getError(response));
      const updated = (await response.json()) as Category;
      setCategories((current) =>
        current
          .map((category) => (category.id === id ? updated : category))
          .sort((left, right) => left.name.localeCompare(right.name)),
      );
      setEditingId(null);
      setMessage("Category renamed.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to rename category.");
    } finally {
      setIsWorking(false);
    }
  }

  async function deleteCategory(category: Category) {
    if (!window.confirm(`Delete "${category.name}"?`)) return;

    setIsWorking(true);
    setMessage("");
    try {
      const response = await fetch(`/api/categories/${category.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await getError(response));
      setCategories((current) => current.filter((item) => item.id !== category.id));
      setMessage("Category deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete category.");
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <section
      aria-labelledby="category-heading"
      className="rounded-2xl border border-[#1C1917]/8 bg-white p-5"
    >
      <SectionHeading id="category-heading" title="Manage categories" variant="card" />
      <form
        onSubmit={createCategory}
        className="mt-4 flex flex-col gap-3 border-b border-[#1C1917]/10 pb-6 sm:flex-row"
      >
        <label className="sr-only" htmlFor="new-category">New category name</label>
        <input
          id="new-category"
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          maxLength={80}
          placeholder="Add a category"
          className="min-w-0 flex-1 rounded-lg border border-[#1C1917]/15 bg-white px-3 py-2 text-[#1C1917] outline-none focus:border-[#C2410C]"
        />
        <button
          type="submit"
          disabled={isWorking || !newName.trim()}
          className="rounded-lg bg-[#C2410C] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#9A3412] disabled:opacity-60"
        >
          Add category
        </button>
      </form>

      {categories.length === 0 ? (
        <EmptyState title="No categories yet" compact className="border-b border-[#1C1917]/10 text-sm text-[#57534E]" />
      ) : (
        <ul className="divide-y divide-[#1C1917]/10">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              {editingId === category.id ? (
                <form
                  className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void saveRename(category.id);
                  }}
                >
                  <label className="sr-only" htmlFor={`rename-${category.id}`}>
                    Rename {category.name}
                  </label>
                  <input
                    id={`rename-${category.id}`}
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    maxLength={80}
                    className="min-w-0 flex-1 rounded-lg border border-[#1C1917]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#C2410C]"
                  />
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={isWorking || !editingName.trim()}
                      className="text-sm font-medium text-[#1C1917] underline disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      disabled={isWorking}
                      className="text-sm text-[#57534E] underline disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p className="font-medium text-[#1C1917]">{category.name}</p>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      disabled={isWorking}
                      onClick={() => {
                        setEditingId(category.id);
                        setEditingName(category.name);
                        setMessage("");
                      }}
                      className="text-sm text-[#57534E] underline decoration-dotted underline-offset-4 hover:text-[#1C1917] disabled:opacity-50"
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      disabled={isWorking}
                      onClick={() => void deleteCategory(category)}
                      className="text-sm text-[#57534E] underline decoration-dotted underline-offset-4 hover:text-red-600 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <InlineFeedback message={message} className="min-h-6 pt-3 text-[#57534E]" />
    </section>
  );
}
