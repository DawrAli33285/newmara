"use client";

import { useState } from "react";

export default function PublicationCoverPanel({ publication, style }) {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setPreviewOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setPreviewOpen(true);
          }
        }}
        aria-label={`Preview ${publication.title}`}
        className="group relative w-full overflow-hidden rounded-2xl border cursor-pointer focus:outline-none focus-visible:ring-2"
        style={{
          borderColor: "#D9E0E7",
          aspectRatio: "5 / 6.6",
          boxShadow: "0 20px 40px -24px rgba(8, 27, 49, 0.35)",
        }}
      >
        {publication.coverImageUrl ? (
          <img
            src={publication.coverImageUrl}
            alt={publication.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div
            className={`h-full w-full bg-gradient-to-br ${style.color} flex items-center justify-center`}
          >
            <span className="text-8xl">{style.emoji}</span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
      </div>

      <button
        type="button"
        onClick={() => setPreviewOpen(true)}
        className="mt-4 inline-flex items-center gap-2 text-sm font-medium transition hover:opacity-70"
        style={{ color: "#0B1830" }}
      >
        <EyeIcon />
        Click cover to preview
      </button>

      {previewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${publication.title} preview`}
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-xl overflow-hidden rounded-2xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              aria-label="Close preview"
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-lg font-medium shadow"
              style={{ color: "#0B1830" }}
            >
              ✕
            </button>
            {publication.coverImageUrl ? (
              <img
                src={publication.coverImageUrl}
                alt={publication.title}
                className="max-h-[90vh] w-full object-contain"
              />
            ) : (
              <div
                className={`bg-gradient-to-br ${style.color} flex h-[70vh] items-center justify-center`}
              >
                <span className="text-9xl">{style.emoji}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}