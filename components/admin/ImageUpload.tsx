"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import MediaPicker from "@/components/admin/media/MediaPicker";
import {
  UploadCloud,
  X,
  CheckCircle2,
  Images,
} from "lucide-react";

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  /** Storage folder relative to /incial-web, e.g. "images/about" or "clients" */
  folder?: string;
  /** `video` accepts MP4 or WebM (up to 50 MB) and previews it as a looping clip. */
  kind?: "image" | "video";
}

export default function ImageUpload({
  label,
  value,
  onChange,
  folder,
  kind = "image",
}: ImageUploadProps) {
  const isVideo = kind === "video";
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [justUploaded, setJustUploaded] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resolveDisplayUrl = (raw: string) => {
    if (!raw) return "";
    const trimmed = raw.trim();
    if (trimmed === "https://ik.imagekit.io/0bs3my2iz/incial-web/images/case1.webp") {
      return "/images/case1.webp";
    }
    if (trimmed === "https://ik.imagekit.io/0bs3my2iz/incial-web/images/case1.jpg") {
      return "/images/case1.jpg";
    }
    return trimmed;
  };

  const [previewSrc, setPreviewSrc] = useState(resolveDisplayUrl(value));
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    setPreviewSrc(resolveDisplayUrl(value));
    setPreviewError(false);
  }, [value]);

  const handleImageError = () => {
    if (previewSrc.includes("ik.imagekit.io") && previewSrc.includes("case1.")) {
      const ext = previewSrc.endsWith(".webp") ? "webp" : "jpg";
      setPreviewSrc(`/images/case1.${ext}`);
      return;
    }
    setPreviewError(true);
  };

  // Simulated smooth progress bar tick
  const startProgress = () => {
    setProgress(0);
    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          clearInterval(progressRef.current!);
          return 85;
        }
        return prev + Math.random() * 12;
      });
    }, 180);
  };

  const finishProgress = (success: boolean) => {
    if (progressRef.current) clearInterval(progressRef.current);
    if (success) {
      setProgress(100);
      setJustUploaded(true);
      setTimeout(() => setJustUploaded(false), 2000);
    } else {
      setProgress(0);
    }
  };

  const uploadFile = async (file: File) => {
    if (isVideo ? !/^video\/(mp4|webm)$/.test(file.type) : !file.type.startsWith("image/")) {
      setError(isVideo ? "Please select an MP4 or WebM video." : "Please select an image file.");
      return;
    }
    const maxBytes = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(isVideo ? "Video must be smaller than 50MB." : "Image must be smaller than 5MB.");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      startProgress();

      const formData = new FormData();
      formData.append("file", file);
      if (folder) formData.append("folder", folder);

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("admin_token") || ""
          : "";

      const headers: HeadersInit = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        headers,
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to upload image.");
      }

      const data = await res.json();
      finishProgress(true);
      onChange(data.url);
    } catch (err: unknown) {
      finishProgress(false);
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const clearImage = () => onChange("");

  return (
    <div className="space-y-1.5">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-semibold text-muted uppercase tracking-wider flex-1 truncate pr-2">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-accent transition-colors hover:bg-accent/10"
        >
          <Images size={12} />
          Choose from library
        </button>
      </div>
      <MediaPicker isOpen={pickerOpen} onOpenChange={setPickerOpen} onPick={(url) => onChange(url)} kind={kind} folder={folder} />

        <div
          className={`w-full bg-surface-secondary rounded-xl overflow-hidden border transition-all ${
            error
              ? "border-danger"
              : dragOver
                ? "border-accent"
                : "border-separator"
          }`}
        >
          {/* Uploading state */}
          {uploading ? (
            <div className="p-6 flex flex-col items-center justify-center gap-4">
              {/* Animated cloud with bounce */}
              <div className="relative flex items-center justify-center w-14 h-14">
                <div className="absolute inset-0 rounded-full bg-default animate-ping" />
                <div className="relative z-10 rounded-full bg-white/10 p-3">
                  <UploadCloud
                    size={24}
                    className="text-foreground animate-bounce"
                  />
                </div>
              </div>

              <div className="w-full max-w-[200px] flex flex-col items-center gap-1.5">
                <div className="w-full h-1 bg-default rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-muted">
                  Uploading... {Math.round(progress)}%
                </span>
              </div>
            </div>
          ) : justUploaded ? (
            /* Success flash */
            <div className="p-6 flex flex-col items-center justify-center gap-2">
              <CheckCircle2 size={32} className="text-green-400" />
              <span className="text-sm text-green-400 font-medium">
                Upload complete!
              </span>
            </div>
          ) : value ? (
            /* Preview state */
            <div className="relative group p-2">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-separator bg-background flex items-center justify-center">
                {isVideo && previewSrc ? (
                  <video
                    src={previewSrc}
                    muted
                    loop
                    playsInline
                    autoPlay
                    className="h-full w-full object-contain"
                  />
                ) : !previewError && previewSrc ? (
                  <Image
                    src={previewSrc}
                    alt="Preview"
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    quality={60}
                    className="object-contain object-center"
                    onError={handleImageError}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <span className="text-[#ff4444] text-xs font-semibold mb-1">
                      Image load error
                    </span>
                    <span className="text-muted text-[10px] max-w-[200px]">
                      The image could not be loaded. Upload it again.
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white/20 hover:bg-white/30 text-foreground p-2 rounded-full backdrop-blur-sm transition-colors"
                    title="Replace Image"
                  >
                    <UploadCloud size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={clearImage}
                    className="bg-red-500/80 hover:bg-red-500 text-foreground p-2 rounded-full backdrop-blur-sm transition-colors"
                    title="Remove Image"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-2 px-1">
                <span
                  className={`text-xs truncate block ${previewError ? 'text-[#ff4444]' : 'text-muted'}`}
                  title={value}
                >
                  {value}
                </span>
              </div>
            </div>
          ) : (
            /* Drop zone / idle */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-8 cursor-pointer group text-center select-none"
            >
              <div
                className={`mb-3 p-3 rounded-full transition-all duration-300 ${
                  dragOver
                    ? "bg-accent/20 scale-110"
                    : "bg-default group-hover:bg-accent/15 group-hover:scale-105"
                }`}
              >
                <UploadCloud
                  size={26}
                  className={`transition-colors duration-200 ${
                    dragOver
                      ? "text-foreground"
                      : "text-muted group-hover:text-foreground"
                  }`}
                />
              </div>
              <span className="text-sm font-medium text-muted group-hover:text-foreground transition-colors">
                {dragOver ? "Drop to upload" : "Click or drag & drop"}
              </span>
              <span className="text-xs text-muted mt-1">
                {isVideo ? "MP4 or WebM up to 50MB" : "JPG, PNG, GIF, WEBP up to 5MB"}
              </span>
            </div>
          )}
        </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={isVideo ? "video/mp4, video/webm" : "image/jpeg, image/png, image/webp, image/gif, image/avif"}
        className="hidden"
      />

      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}