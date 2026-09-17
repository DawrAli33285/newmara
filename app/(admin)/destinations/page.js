"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

const LEVELS = ["region", "destination", "category"];

const LEVEL_LABELS = {
  region: "Region",
  destination: "Destination",
  category: "Category",
};

const LEVEL_STYLES = {
  region: "bg-[#eef2fb] text-[#3355a8]",
  destination: "bg-[#edf5df] text-[#527323]",
  category: "bg-amber-50 text-amber-600",
};

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}



function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg text-sm font-semibold text-white transition-all
            ${t.type === "success" ? "bg-[#527323]" : ""}
            ${t.type === "error"   ? "bg-red-600"   : ""}
            ${t.type === "info"    ? "bg-[#0b1830]" : ""}
          `}
        >
          {t.type === "success" && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 shrink-0">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          )}
          {t.type === "error" && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 shrink-0">
              <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
            </svg>
          )}
          {t.type === "info" && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 shrink-0">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
            </svg>
          )}

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



function NodeModal({ node, parent, publications, businesses, onClose, onSaved }) {
  const isEdit = Boolean(node);

  const impliedLevel = node
    ? node.level
    : parent
    ? LEVELS[LEVELS.indexOf(parent.level) + 1] || "category"
    : "region";

  const [form, setForm] = useState({
    name: node?.name || "",
    slug: node?.slug || "",
    publicationId: node?.publicationId || parent?.publicationId || "",
    mainSponsorId: node?.mainSponsorId || "",
  });
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === "name" && !slugTouched) {
        next.slug = slugify(value);
      }
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const url = isEdit
      ? `/api/admin/destinations/${node.id}`
      : "/api/admin/destinations";

    const body = {
      ...form,
      level: impliedLevel,
      parentId: node ? node.parentId : parent?.id || null,
    };

    const res = await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }

    onSaved(data.destination);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-[#0b1830]">
          {isEdit ? "Edit node" : parent ? `Add under "${parent.name}"` : "Add region"}
        </h3>
        

        {error && (
          <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {!parent && !isEdit && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Publication</label>
              <select
                value={form.publicationId}
                onChange={(e) => update("publicationId", e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#668b2f] focus:outline-none"
              >
                <option value="">Select publication…</option>
                {publications.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Name</label>
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder={
                impliedLevel === "region" ? "e.g. Dublin" :
                impliedLevel === "destination" ? "e.g. Airport Hotels" :
                "e.g. Restaurants"
              }
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#668b2f] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Slug</label>
           
            <input
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              update("slug", slugify(e.target.value));
            }}
            placeholder="auto-generated from name"
            required
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-mono focus:border-[#668b2f] focus:outline-none"
          />
        </div>

        {impliedLevel === "destination" && (
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Main sponsor</label>
            <select
              value={form.mainSponsorId}
              onChange={(e) => update("mainSponsorId", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#668b2f] focus:outline-none"
            >
              <option value="">No sponsor</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>{b.businessName}</option>
              ))}
            </select>
          </div>
        )}

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
              {saving ? "Saving…" : isEdit ? "Save changes" : "Add node"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



function TreeRow({ node, depth, expanded, onToggle, onAddChild, onEdit, onDelete }) {
  const hasChildren = node.children && node.children.length > 0;
  const isOpen = expanded.has(node.id);
  const canAddChild = node.level !== "category";

  return (
    <>
      <div
        className="flex items-center justify-between border-b border-gray-100 px-4 py-3 hover:bg-gray-50"
        style={{ paddingLeft: `${16 + depth * 24}px` }}
      >
        <div className="flex min-w-0 items-center gap-2">
          {hasChildren ? (
            <button
              onClick={() => onToggle(node.id)}
              className="grid h-5 w-5 shrink-0 place-items-center text-gray-400 hover:text-gray-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-90" : ""}`}
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          ) : (
            <span className="h-5 w-5 shrink-0" />
          )}

          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${LEVEL_STYLES[node.level]}`}
          >
            {LEVEL_LABELS[node.level]}
          </span>

          <p className="truncate text-sm font-semibold text-[#0b1830]">{node.name}</p>
          <code className="shrink-0 truncate rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-400">
            {node.slug}
          </code>

          {node.mainSponsor && (
            <span className="shrink-0 rounded-full bg-[#eef2fb] px-2 py-0.5 text-[10px] font-semibold text-[#3355a8]">
              ★ {node.mainSponsor.businessName}
            </span>
          )}

          {(node._count?.businessProfiles > 0 || node._count?.directoryListings > 0) && (
            <span className="shrink-0 text-[10px] text-gray-400">
              {(node._count?.businessProfiles || 0) + (node._count?.directoryListings || 0)} linked
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {canAddChild && (
            <button
              onClick={() => onAddChild(node)}
              title={`Add ${LEVEL_LABELS[LEVELS[LEVELS.indexOf(node.level) + 1]]}`}
              className="grid h-7 w-7 place-items-center rounded-lg bg-[#edf5df] text-[#527323] hover:bg-[#d6eabc]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          )}
          <button
            onClick={() => onEdit(node)}
            title="Edit"
            className="grid h-7 w-7 place-items-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
              <path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(node)}
            title="Delete"
            className="grid h-7 w-7 place-items-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6h16z" />
            </svg>
          </button>
        </div>
      </div>

      {hasChildren && isOpen &&
        node.children.map((child) => (
          <TreeRow
            key={child.id}
            node={child}
            depth={depth + 1}
            expanded={expanded}
            onToggle={onToggle}
            onAddChild={onAddChild}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
    </>
  );
}



export default function DestinationsPage() {
  const [destinations,      setDestinations]      = useState([]);
  const [publications,      setPublications]      = useState([]);
  const [businesses,        setBusinesses]        = useState([]);
  const [loading,           setLoading]           = useState(true);
  const [publicationFilter, setPublicationFilter] = useState("");
  const [expanded,          setExpanded]          = useState(new Set());

  const [modalState, setModalState] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const { toasts, addToast, removeToast } = useToast();
  const loadData = useCallback(async () => {
    setLoading(true);

    const params = new URLSearchParams();
    if (publicationFilter) params.set("publicationId", publicationFilter);
    params.set("page", page);
    params.set("pageSize", pageSize);

    const [destRes, pubsRes, bizRes] = await Promise.all([
      fetch(`/api/admin/destinations?${params.toString()}`),
      fetch("/api/admin/publications"),
      fetch("/api/admin/businesses"),
    ]);
    const destData = await destRes.json();
    const pubsData = await pubsRes.json();
    const bizData  = await bizRes.json();
    setDestinations(destData.destinations || []);
    setTotalPages(destData.totalPages || 1);
    setTotalCount(destData.totalCount || 0);
    setPublications(pubsData.publications || []);
    setBusinesses(bizData.businesses || []);
    setLoading(false);
  }, [publicationFilter, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [publicationFilter]);

  
  const tree = useMemo(() => {
    const byId = new Map(destinations.map((d) => [d.id, { ...d, children: [] }]));
    const roots = [];

    for (const node of byId.values()) {
      if (node.parentId && byId.has(node.parentId)) {
        byId.get(node.parentId).children.push(node);
      } else {
        roots.push(node);
      }
    }

    const sortByName = (a, b) => a.name.localeCompare(b.name);
    for (const node of byId.values()) node.children.sort(sortByName);
    roots.sort(sortByName);

    return roots;
  }, [destinations]);


  function toggle(id) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function expandAll() {
    setExpanded(new Set(destinations.map((d) => d.id)));
  }

  function collapseAll() {
    setExpanded(new Set());
  }

  async function handleDelete(node) {
    const childCount = destinations.filter((d) => d.parentId === node.id).length;
    const linkedCount = (node._count?.businessProfiles || 0) + (node._count?.directoryListings || 0);

    if (childCount > 0) {
      addToast(`Delete or move the ${childCount} node(s) under "${node.name}" first`, "error");
      return;
    }
    if (linkedCount > 0) {
      addToast(`"${node.name}" has ${linkedCount} linked business record(s) — unlink before deleting`, "error");
      return;
    }
    if (!confirm(`Delete "${node.name}"? This cannot be undone.`)) return;

    const res = await fetch(`/api/admin/destinations/${node.id}`, { method: "DELETE" });

    if (res.ok) {
      addToast(`"${node.name}" deleted`, "info");
    } else {
      addToast("Failed to delete node", "error");
    }

    loadData();
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] p-6 md:p-8">
      <div className="mx-auto max-w-6xl">

       
        <div className="mb-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#0b1830]">
                Destinations
              </h1>
              
            </div>

            {totalCount > 0 && (
              <button
                onClick={() => setModalState({})}
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-[#668b2f] px-5 text-sm font-bold text-white hover:bg-[#527323]"
              >
                + Add region
              </button>
            )}
          </div>
        </div>

    
        {totalCount > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <select
              value={publicationFilter}
              onChange={(e) => setPublicationFilter(e.target.value)}
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-[#668b2f] focus:outline-none"
            >
              <option value="">All publications</option>
              {publications.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>

            <div className="flex gap-2 text-xs font-semibold text-gray-500">
              <button onClick={expandAll} className="hover:text-[#527323]">Expand all</button>
              <span className="text-gray-300">·</span>
              <button onClick={collapseAll} className="hover:text-[#527323]">Collapse all</button>
            </div>
          </div>
        )}

{loading ? (
          <div className="grid place-items-center py-20">
            <p className="text-sm text-gray-400">Loading…</p>
          </div>
        ) : totalCount === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-gray-200 py-20">
            <p className="text-sm text-gray-400">No destinations yet.</p>
            <button
              onClick={() => setModalState({})}
              className="mt-4 rounded-xl bg-[#668b2f] px-4 py-2 text-sm font-bold text-white hover:bg-[#527323]"
            >
              Add your first region
            </button>
          </div>
        ) : tree.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-gray-200 py-20">
            <p className="text-sm text-gray-400">No destinations for this publication yet.</p>
          </div>
               ) : (
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  {tree.map((root) => (
                    <TreeRow
                      key={root.id}
                      node={root}
                      depth={0}
                      expanded={expanded}
                      onToggle={toggle}
                      onAddChild={(parent) => setModalState({ parent })}
                      onEdit={(node) => setModalState({ node })}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
      
              {!loading && tree.length > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Page {page} of {totalPages} · {totalCount} region{totalCount === 1 ? "" : "s"}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-[#0b1830] disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-[#0b1830] disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
      
            {modalState && (
        <NodeModal
          node={modalState.node}
          parent={modalState.parent}
          publications={publications}
          businesses={businesses}
          onClose={() => setModalState(null)}
          onSaved={(saved) => {
            const wasEdit = Boolean(modalState.node);
            setModalState(null);
            addToast(`"${saved.name}" ${wasEdit ? "updated" : "added"}`, "success");
            if (saved.parentId) setExpanded((prev) => new Set(prev).add(saved.parentId));
            loadData();
          }}
        />
      )}

  
      <Toast toasts={toasts} removeToast={removeToast} />
    </main>
  );
}