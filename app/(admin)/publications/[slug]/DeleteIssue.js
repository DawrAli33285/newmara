"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteIssue({ issueId, issueTitle }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${issueTitle}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/issues/${issueId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      router.refresh();
    } catch (err) {
      alert("Failed to delete issue.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:underline text-xs disabled:opacity-50"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}