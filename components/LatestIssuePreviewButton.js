"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import FlipbookWrapper from "@/components/FlipbookWrapper";

function BookIcon() {
  return (
    <svg
      className="w-4 h-4 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

export default function LatestIssuePreviewButton({
  issue,
  publicationSlug,
  title,
  isSubscribed = false,
  previewLimit = 4,
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [open]);

  if (!issue?.pdfUrl) return null;

  const lightbox = (
    <div
      className="fixed inset-0 z-[9999] bg-black flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} preview`}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-black/80 backdrop-blur-sm">
        <p className="text-white text-sm sm:text-base font-medium truncate pr-4">
          {title} — {issue.title}
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex items-center justify-center w-9 h-9 rounded-full text-white hover:bg-white/10 transition shrink-0 cursor-pointer"
          title="Close preview"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <FlipbookWrapper
          pdfUrl={issue.pdfUrl}
          title={title}
          issueId={issue.id}
          isSubscribed={isSubscribed}
          previewLimit={previewLimit}
          publicationSlug={publicationSlug}
        />
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="
          flex items-center justify-center gap-[10px] w-full
          min-h-[44px] px-4 py-2.5 rounded-lg
          text-[15px] font-medium cursor-pointer
          border border-[#0B1830]/20 text-[#0B1830]
          hover:bg-[#0B1830] hover:text-white
          transition-all duration-200
        "
      >
        <BookIcon />
        View Latest Issue
      </button>

      {open && mounted && createPortal(lightbox, document.body)}
    </>
  );
}