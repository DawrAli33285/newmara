"use client";

import { useState, useEffect, useCallback } from "react";

function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg text-sm font-semibold text-white transition-all
            ${t.type === "success" ? "bg-[#527323]" : ""}
            ${t.type === "error"   ? "bg-red-600"   : ""}
          `}
        >
          <span>{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="ml-1 opacity-70 hover:opacity-100">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  function addToast(message, type = "success") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3500);
  }
  function removeToast(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }
  return { toasts, addToast, removeToast };
}

function CategoryModal({ category, onClose, onSaved }) {
  const isEdit = Boolean(category);
  const [name, setName] = useState(category?.name || "");
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const url = isEdit ? `/api/admin/categories/${category.id}` : "/api/admin/categories";
    const res = await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, isActive }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }

    onSaved(data.category);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-[#0b1830]">
          {isEdit ? "Edit category" : "Add category"}
        </h3>

        {error && (
          <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Food & Drink"
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#668b2f] focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            Active
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#668b2f] px-5 py-2 text-sm font-bold text-white hover:bg-[#527323] disabled:opacity-60"
            >
              {saving ? "Saving…" : isEdit ? "Save changes" : "Add category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);

  const { toasts, addToast, removeToast } = useToast();

  const loadCategories = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories(data.categories || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  async function deleteCategory(category) {
    if (!confirm(`Delete "${category.name}"? This cannot be undone.`)) return;

    const res = await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      addToast(`"${category.name}" deleted`, "success");
      loadCategories();
    } else {
      addToast(data.error || "Failed to delete category.", "error");
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#0b1830]">Categories</h1>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Business categories used across the directory and digital partners.
            </p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-[#668b2f] px-5 text-sm font-bold text-white hover:bg-[#527323]"
          >
            + Add category
          </button>
        </div>

        {loading ? (
          <div className="grid place-items-center py-20">
            <p className="text-sm text-gray-400">Loading…</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-gray-200 py-20">
            <p className="text-sm text-gray-400">No categories yet.</p>
            <button
              onClick={() => setCreateOpen(true)}
              className="mt-4 rounded-xl bg-[#668b2f] px-4 py-2 text-sm font-bold text-white hover:bg-[#527323]"
            >
              Add your first category
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 font-semibold text-[#0b1830]">{c.name}</td>
                    <td className="px-4 py-4 text-xs text-gray-500">{c.slug}</td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
                          c.isActive ? "bg-[#edf5df] text-[#527323]" : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {c.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditCategory(c)}
                          title="Edit"
                          className="grid h-8 w-8 place-items-center rounded-lg bg-[#edf5df] text-[#527323] hover:bg-[#d6eabc]"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                            <path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteCategory(c)}
                          title="Delete"
                          className="grid h-8 w-8 place-items-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6h16z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {createOpen && (
        <CategoryModal
          onClose={() => setCreateOpen(false)}
          onSaved={(newCategory) => {
            setCreateOpen(false);
            addToast(`"${newCategory.name}" added`, "success");
            loadCategories();
          }}
        />
      )}

      {editCategory && (
        <CategoryModal
          category={editCategory}
          onClose={() => setEditCategory(null)}
          onSaved={(updated) => {
            setEditCategory(null);
            addToast(`"${updated.name}" updated`, "success");
            loadCategories();
          }}
        />
      )}

      <Toast toasts={toasts} removeToast={removeToast} />
    </main>
  );
}