"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Category = { id: string; name: string };

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [message, setMessage] = useState("");
  const [isWorking, setIsWorking] = useState(false);

  async function send(url: string, method: "POST" | "PATCH" | "DELETE", name?: string) {
    setIsWorking(true);
    setMessage("");
    try {
      const response = await fetch(url, {
        method,
        ...(name ? {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        } : {}),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Unable to update categories.");
      setMessage("Categories updated.");
      setEditingId(null);
      setNewName("");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <section aria-labelledby="category-heading" className="rounded-2xl border border-[#1C1917]/8 bg-white p-5">
      <h2 id="category-heading" className="text-lg font-semibold text-[#1C1917]">Manage categories</h2>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (newName.trim()) void send("/api/categories", "POST", newName.trim());
        }}
      >
        <label className="sr-only" htmlFor="new-category">New category name</label>
        <input
          id="new-category"
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="Add a category"
          className="min-w-0 flex-1 rounded-lg border border-[#1C1917]/15 px-3 py-2 text-sm text-[#1C1917] outline-none focus:border-[#F97316]"
        />
        <button disabled={isWorking || !newName.trim()} className="rounded-lg bg-[#F97316] px-3 py-2 text-sm font-medium text-white disabled:opacity-50">
          Add
        </button>
      </form>

      {categories.length === 0 ? (
        <p className="mt-4 text-sm text-[#78716C]">No categories yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-[#1C1917]/8">
          {categories.map((category) => (
            <li key={category.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              {editingId === category.id ? (
                <form
                  className="flex min-w-0 flex-1 gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (editingName.trim()) void send(`/api/categories/${category.id}`, "PATCH", editingName.trim());
                  }}
                >
                  <label className="sr-only" htmlFor={`category-${category.id}`}>Rename {category.name}</label>
                  <input
                    id={`category-${category.id}`}
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    className="min-w-0 flex-1 rounded-lg border border-[#1C1917]/15 px-3 py-2 text-sm text-[#1C1917] outline-none focus:border-[#F97316]"
                  />
                  <button disabled={isWorking || !editingName.trim()} className="text-sm font-medium text-[#9A3412] disabled:opacity-50">Save</button>
                  <button type="button" onClick={() => setEditingId(null)} className="text-sm text-[#78716C]">Cancel</button>
                </form>
              ) : (
                <>
                  <span className="text-sm font-medium text-[#1C1917]">{category.name}</span>
                  <div className="flex gap-4">
                    <button
                      disabled={isWorking}
                      onClick={() => { setEditingId(category.id); setEditingName(category.name); }}
                      className="text-sm text-[#78716C] underline underline-offset-4 disabled:opacity-50"
                    >Edit</button>
                    <button
                      disabled={isWorking}
                      onClick={() => {
                        if (confirm(`Delete ${category.name}? Categories with subscriptions cannot be deleted.`)) {
                          void send(`/api/categories/${category.id}`, "DELETE");
                        }
                      }}
                      className="text-sm text-[#78716C] underline underline-offset-4 hover:text-red-700 disabled:opacity-50"
                    >Delete</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      {message ? <p role="status" className="mt-3 text-sm text-[#57534E]">{message}</p> : null}
    </section>
  );
}
