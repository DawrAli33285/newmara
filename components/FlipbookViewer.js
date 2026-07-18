"use client";

import { useState, useRef, useEffect } from "react";
import HTMLFlipBook from "react-pageflip";

export default function FlipbookViewer({ pdfUrl, title, issueId }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState({
    current: 0,
    total: 0,
  });
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [dimensions, setDimensions] = useState({ width: 550, height: 778 });
  const [isMobile, setIsMobile] = useState(false);
  const [overlays, setOverlays] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null); 
  const [vimeoThumbnails, setVimeoThumbnails] = useState({});
  const flipBook = useRef(null);
  const containerRef = useRef(null);
  const pageViewTimeout = useRef(null);

  useEffect(() => {
    function computeSize() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isFs = !!document.fullscreenElement;
      const mobile = vw < 768;
      setIsMobile(mobile);

      const availWidth = vw - (mobile ? 12 : 24);
      const availHeight = isFs ? vh - 40 : vh - (mobile ? 100 : 130);

      const ratio = 1.414;

      let pageWidth = mobile ? availWidth : Math.min(availWidth / 2, 800);
      let pageHeight = pageWidth * ratio;

      if (pageHeight > availHeight) {
        pageHeight = availHeight;
        pageWidth = pageHeight / ratio;
      }

      pageWidth = Math.max(pageWidth, mobile ? 260 : 300);
      pageHeight = Math.max(pageHeight, mobile ? 368 : 424);

      setDimensions({
        width: Math.round(pageWidth),
        height: Math.round(pageHeight),
      });
    }

    computeSize();
    window.addEventListener("resize", computeSize);
    document.addEventListener("fullscreenchange", computeSize);
    return () => {
      window.removeEventListener("resize", computeSize);
      document.removeEventListener("fullscreenchange", computeSize);
    };
  }, []);

  useEffect(() => {
    async function loadPDF() {
      try {
        if (!pdfUrl) {
          setError("No PDF found for this issue.");
          setLoading(false);
          return;
        }
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const pdf = await pdfjsLib.getDocument({ url: pdfUrl }).promise;
        const numPages = pdf.numPages;
        setLoadingProgress({ current: 0, total: numPages });

        const collectedPages = [];

        const RENDER_SCALE = 2.5;

        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: RENDER_SCALE });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({
            canvasContext: canvas.getContext("2d"),
            viewport,
          }).promise;
          const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

          collectedPages.push(dataUrl);
          setLoadingProgress({ current: i, total: numPages });

          if (i === 1) {
            setLoading(false);
            if (issueId) {
              fetch("/api/views", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ issueId }),
              }).catch(() => {});

              fetch("/api/views/page", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ issueId, pageNumber: 1 }),
              }).catch(() => {});
            }
          }
        }

        setPages(collectedPages);
      } catch (err) {
        console.error("PDF load error:", err);
        setError("Failed to load publication. Please try again.");
        setLoading(false);
      }
    }
    loadPDF();
  }, [pdfUrl]);

  useEffect(() => {
    if (!issueId) return;
    fetch(`/api/issues/${issueId}/overlays`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setOverlays)
      .catch(() => setOverlays([]));
  }, [issueId]);

  useEffect(() => {
    const vimeoOverlays = overlays.filter(
      (o) => o.type === "video" && !o.thumbnail && /vimeo\.com/.test(o.url)
    );
    if (vimeoOverlays.length === 0) return;

    vimeoOverlays.forEach((o) => {
      fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(o.url)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.thumbnail_url) {
            setVimeoThumbnails((prev) => ({ ...prev, [o.url]: data.thumbnail_url }));
          }
        })
        .catch(() => {});
    });
  }, [overlays]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "ArrowLeft") {
        flipBook.current?.pageFlip().flipPrev();
      } else if (e.key === "ArrowRight") {
        flipBook.current?.pageFlip().flipNext();
      } else if (e.key === "+" || e.key === "=") {
        setZoom((z) => Math.min(z + 0.25, 3));
      } else if (e.key === "-" || e.key === "_") {
        setZoom((z) => Math.max(z - 0.25, 1));
      } else if (e.key === "Escape") {
        if (activeVideo) {
          setActiveVideo(null);
        } else if (isFullscreen) {
          document.exitFullscreen();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, activeVideo]);

  useEffect(() => {
    return () => {
      if (pageViewTimeout.current) clearTimeout(pageViewTimeout.current);
    };
  }, []);

  function handleFlip(e) {
    const newPage = e.data;
    setCurrentPage(newPage);

    if (!issueId) return;

    if (pageViewTimeout.current) clearTimeout(pageViewTimeout.current);
    pageViewTimeout.current = setTimeout(() => {
      fetch("/api/views/page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueId, pageNumber: newPage + 1 }),
      }).catch(() => {});
    }, 800);
  }

  function zoomIn() {
    setZoom((z) => Math.min(z + 0.25, 3));
  }
  function zoomOut() {
    setZoom((z) => Math.max(z - 0.25, 1));
  }
  function resetZoom() {
    setZoom(1);
  }
  const pinchState = useRef({ initialDistance: 0, initialZoom: 1 });

  function getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function handleTouchStart(e) {
    if (e.touches.length === 2) {
      pinchState.current.initialDistance = getTouchDistance(e.touches);
      pinchState.current.initialZoom = zoom;
    }
  }

  function handleTouchMove(e) {
    if (e.touches.length === 2 && pinchState.current.initialDistance > 0) {
      e.preventDefault();
      const dist = getTouchDistance(e.touches);
      const scale = dist / pinchState.current.initialDistance;
      const newZoom = Math.min(
        3,
        Math.max(1, pinchState.current.initialZoom * scale)
      );
      setZoom(newZoom);
    }
  }

  function handleTouchEnd(e) {
    if (e.touches.length < 2) {
      pinchState.current.initialDistance = 0;
    }
  }

  function getYouTubeId(url) {
    const m = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/
    );
    return m ? m[1] : null;
  }

  function getEmbedInfo(url) {
    const ytId = getYouTubeId(url);
    if (ytId)
      return {
        kind: "iframe",
        src: `https://www.youtube.com/embed/${ytId}?autoplay=1`,
      };

    const vimeo = url.match(/vimeo\.com\/(\d+)/);
    if (vimeo)
      return {
        kind: "iframe",
        src: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`,
      };

    if (/\.mp4($|\?)/.test(url)) return { kind: "video", src: url };

    return { kind: "iframe", src: url };
  }
  function getOverlayThumbnail(o) {
    if (o.thumbnail) return { type: "image", src: o.thumbnail };
    if (o.type !== "video") return null;

    const ytId = getYouTubeId(o.url);
    if (ytId) return { type: "image", src: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` };

    if (/vimeo\.com/.test(o.url)) {
      const src = vimeoThumbnails[o.url];
      return src ? { type: "image", src } : null;
    }

    if (/\.mp4($|\?)/.test(o.url)) return { type: "video", src: o.url };

    return null;
  }

  const totalPages = pages.length;

  if (loading && pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-500 text-sm">
          {loadingProgress.total > 0
            ? `Loading page ${loadingProgress.current} of ${loadingProgress.total}...`
            : "Loading publication..."}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex flex-col items-center ${
        isFullscreen ? "bg-gray-900" : ""
      }`}
      style={{
        minHeight: isFullscreen ? "100vh" : undefined,
        paddingBottom: "90px",
      }}
    >
      {loadingProgress.current < loadingProgress.total && (
        <div className="w-64 mt-4">
          <div className="bg-gray-200 rounded-full h-1">
            <div
              className="bg-blue-600 h-1 rounded-full transition-all duration-300"
              style={{
                width: `${
                  (loadingProgress.current / loadingProgress.total) * 100
                }%`,
              }}
            />
          </div>
          <p className="text-xs text-gray-400 text-center mt-1">
            Loading page {loadingProgress.current} of {loadingProgress.total}
          </p>
        </div>
      )}

      <div
        className="flex items-center justify-center w-full"
        style={{
          overflow: zoom > 1 ? "auto" : "visible",
          maxWidth: "100%",
          minHeight: isFullscreen ? "90vh" : "78vh",
          touchAction: "pan-x pan-y",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          style={{
            width: isMobile ? dimensions.width : dimensions.width * 2,
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
            transition: "transform 0.2s ease",
          }}
        >
          <HTMLFlipBook
            key={`${dimensions.width}x${dimensions.height}-${isMobile}`}
            ref={flipBook}
            width={dimensions.width}
            height={dimensions.height}
            size="fixed"
            usePortrait={isMobile}
            showCover={true}
            drawShadow={true}
            flippingTime={600}
            startPage={0}
            mobileScrollSupport={true}
            clickEventForward={true}
            useMouseEvents={true}
            onFlip={handleFlip}
            className="shadow-2xl"
          >
            {pages.map((src, i) => {
              const pageNum = i + 1;
              const pageOverlays = overlays.filter(
                (o) => o.pageNumber === pageNum
              );
              return (
                <div
                  key={i}
                  style={{
                    background: "#fff",
                    width: "100%",
                    height: "100%",
                    position: "relative",
                  }}
                >
                  <img
                    src={src}
                    alt={`Page ${pageNum}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                  {pageOverlays.map((o) => {
                    const thumb = getOverlayThumbnail(o);
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (o.type === "video") {
                            setActiveVideo({ pageNum, url: o.url });
                          } else {
                            window.open(o.url, "_blank", "noopener,noreferrer");
                          }
                        }}
                        title={
                          o.label ||
                          (o.type === "video" ? "Watch video" : "Open link")
                        }
                        className="group"
                        style={{
                          position: "absolute",
                          left: 0,
                          top: `${o.y * 100}%`,
                          width: "100%",
                          height:
                            o.type === "video"
                              ? `max(${o.height * 100}%, 300px)`
                              : `${o.height * 100}%`,
                          cursor: "pointer",
                          background: "transparent",
                          border: "none",
                          padding: 0,
                          zIndex: 5,
                          overflow: "hidden",
                          borderRadius: 4,
                        }}
                      >
                        {thumb &&
                          (thumb.type === "image" ? (
                            <img
                              src={thumb.src}
                              alt=""
                              style={{
                                position: "absolute",
                                inset: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                pointerEvents: "none",
                              }}
                            />
                          ) : (
                            <video
                              src={thumb.src}
                              muted
                              preload="metadata"
                              playsInline
                              style={{
                                position: "absolute",
                                inset: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                pointerEvents: "none",
                              }}
                            />
                          ))}
                        <span
                          className="absolute inset-0 rounded transition"
                          style={{
                            boxShadow:
                              o.type === "video"
                                ? "0 0 0 2px rgba(255,255,255,0.35), inset 0 0 40px rgba(0,0,0,0.15)"
                                : "0 0 0 2px rgba(37, 99, 235, 0.45)",
                            pointerEvents: "none",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow =
                              o.type === "video"
                                ? "0 0 0 3px rgba(255,255,255,0.7), inset 0 0 40px rgba(0,0,0,0.25)"
                                : "0 0 0 3px rgba(37, 99, 235, 0.85)";
                            if (!thumb) {
                              e.currentTarget.style.background =
                                "rgba(37, 99, 235, 0.1)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow =
                              o.type === "video"
                                ? "0 0 0 2px rgba(255,255,255,0.35), inset 0 0 40px rgba(0,0,0,0.15)"
                                : "0 0 0 2px rgba(37, 99, 235, 0.45)";
                            e.currentTarget.style.background = "transparent";
                          }}
                        />
                        {o.type === "video" && (
                          <span
                            className="absolute flex items-center justify-center rounded-full bg-white/90 shadow-md"
                            style={{
                              width: 36,
                              height: 36,
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              pointerEvents: "none",
                            }}
                          >
                            <span style={{ marginLeft: 2, fontSize: 14 }}>▶</span>
                          </span>
                        )}
                        {o.type !== "video" && (
                          <span
                            className="absolute flex items-center gap-1 bg-blue-600 text-white shadow-md"
                            style={{
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              padding: "3px 8px",
                              borderRadius: 999,
                              fontSize: 11,
                              fontWeight: 600,
                              pointerEvents: "none",
                              whiteSpace: "nowrap",
                            }}
                          >
                            🔗 {o.label || "Link"}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </HTMLFlipBook>
        </div>
      </div>

      {activeVideo && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 9999, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(2px)" }}
          onClick={() => setActiveVideo(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "min(92vw, 760px)",
              aspectRatio: "16 / 9",
              background: "#000",
              borderRadius: 14,
              overflow: "hidden",
              boxShadow: "0 24px 70px rgba(0,0,0,0.55)",
            }}
          >
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute flex items-center justify-center text-white hover:bg-black/80 transition"
              style={{
                top: 10,
                right: 10,
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "rgba(0,0,0,0.55)",
                zIndex: 2,
                border: "none",
                cursor: "pointer",
                fontSize: 16,
              }}
              title="Close"
            >
              ✕
            </button>
            {(() => {
              const embed = getEmbedInfo(activeVideo.url);
              return embed.kind === "video" ? (
                <video
                  src={embed.src}
                  controls
                  autoPlay
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <iframe
                  src={embed.src}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    border: 0,
                  }}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              );
            })()}
          </div>
        </div>
      )}

      <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 sm:gap-3 bg-white rounded-full shadow-xl px-3 sm:px-6 py-1.5 sm:py-2 border border-gray-100 max-w-[95vw] overflow-x-auto">
        <button
          onClick={() => flipBook.current?.pageFlip().flipPrev()}
          className="p-2 hover:bg-gray-100 rounded-full transition text-gray-700 text-xl shrink-0"
          title="Previous page"
        >
          ‹
        </button>
        <span className="text-xs sm:text-sm text-gray-600 min-w-[70px] sm:min-w-[100px] text-center font-medium shrink-0">
          {currentPage + 1} / {totalPages}
        </span>
        <button
          onClick={() => flipBook.current?.pageFlip().flipNext()}
          className="p-2 hover:bg-gray-100 rounded-full transition text-gray-700 text-xl shrink-0"
          title="Next page"
        >
          ›
        </button>
        <div className="w-px h-5 bg-gray-200 mx-1 shrink-0" />
        <button
          onClick={zoomOut}
          className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600 text-sm shrink-0 inline-flex"
          title="Zoom out"
          disabled={zoom <= 1}
        >
          −
        </button>
        <span className="text-xs text-gray-500 min-w-[36px] text-center shrink-0 inline-block">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={zoomIn}
          className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600 text-sm shrink-0 inline-flex"
          title="Zoom in"
          disabled={zoom >= 3}
        >
          +
        </button>
        {zoom !== 1 && (
          <button
            onClick={resetZoom}
            className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600 text-xs shrink-0 inline-flex"
            title="Reset zoom"
          >
            ⟲
          </button>
        )}
        <div className="w-px h-5 bg-gray-200 mx-1 shrink-0" />
        <button
          onClick={toggleFullscreen}
          className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600 text-sm shrink-0"
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? "✕" : "⛶"}
        </button>
      </div>
    </div>
  );
}
