"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Button, Spinner } from "@heroui/react";
import { Copy, ExternalLink, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmModal, EditDrawer } from "@/components/admin/ui";
import { folderLabel, formatSize, isVideo, type MediaFile } from "./useMediaLibrary";

interface MediaDetailsProps {
  file: MediaFile | null;
  onClose: () => void;
  onReplace: (file: MediaFile, replacement: File) => Promise<void>;
  onDelete: (file: MediaFile) => Promise<void>;
}

/** A side panel for one file: a big preview, its details, where it is used, and Replace / Delete. */
export default function MediaDetails({ file, onClose, onReplace, onDelete }: MediaDetailsProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"replace" | "delete" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const used = (file?.usedIn.length ?? 0) > 0;

  async function copyAddress() {
    if (!file) return;
    const absolute = new URL(file.url, window.location.origin).toString();
    try {
      await navigator.clipboard.writeText(absolute);
      toast.success("Address copied.");
    } catch {
      toast.error("Could not copy the address.");
    }
  }

  async function handleReplace(replacement: File | undefined) {
    if (!file || !replacement) return;
    setBusy("replace");
    try {
      await onReplace(file, replacement);
    } finally {
      setBusy(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete() {
    if (!file) return;
    setBusy("delete");
    try {
      await onDelete(file);
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <EditDrawer
        isOpen={file !== null}
        onOpenChange={(open) => !open && onClose()}
        title={file?.name ?? "File"}
        description={file ? folderLabel(file.folder) : undefined}
        footer={
          file ? (
            <Button variant="danger-soft" isDisabled={used || busy !== null} onPress={() => setConfirmDelete(true)}>
              {busy === "delete" ? <Spinner size="sm" color="current" /> : <Trash2 size={14} />}
              Delete
            </Button>
          ) : undefined
        }
      >
        {file && (
          <>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-separator bg-surface-secondary">
              {isVideo(file) ? (
                <video src={file.url} controls muted playsInline className="absolute inset-0 h-full w-full bg-black object-contain" />
              ) : (
                <Image src={file.url} alt={file.name} fill sizes="420px" className="object-contain p-3" />
              )}
            </div>

            <dl className="grid grid-cols-[6rem_1fr] gap-x-3 gap-y-2 text-sm">
              <dt className="text-muted">Folder</dt>
              <dd className="text-foreground">{folderLabel(file.folder)}</dd>
              <dt className="text-muted">Size</dt>
              <dd className="text-foreground">{formatSize(file.size)}</dd>
              <dt className="text-muted">Type</dt>
              <dd className="text-foreground">{file.contentType ?? "—"}</dd>
              <dt className="text-muted">Added</dt>
              <dd className="text-foreground">{file.lastModified ? new Date(file.lastModified).toLocaleString() : "—"}</dd>
            </dl>

            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onPress={copyAddress}>
                <Copy size={14} />
                Copy address
              </Button>
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm text-foreground hover:bg-default"
              >
                <ExternalLink size={14} />
                Open
              </a>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Used on the website</p>
              {used ? (
                <ul className="flex flex-col gap-1">
                  {file.usedIn.map((use) => (
                    <li key={use.label} className="rounded-lg bg-surface-secondary px-3 py-2 text-sm text-foreground">
                      {use.label}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">Not used anywhere. It is safe to delete.</p>
              )}
            </div>

            <div className="rounded-2xl border border-separator p-4">
              <p className="text-sm font-medium text-foreground">Replace this file</p>
              <p className="mt-1 text-xs text-muted">
                Upload a new version. {used ? "Every page using this file switches to the new one, and the old file is deleted." : "The old file is deleted."}
              </p>
              <Button size="sm" className="mt-3" isDisabled={busy !== null} onPress={() => inputRef.current?.click()}>
                {busy === "replace" ? <Spinner size="sm" color="current" /> : <RefreshCw size={14} />}
                {busy === "replace" ? "Replacing…" : "Upload a new version"}
              </Button>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept={isVideo(file) ? "video/mp4,video/webm" : "image/png,image/jpeg,image/webp,image/gif,image/avif,image/svg+xml"}
                onChange={(event) => handleReplace(event.target.files?.[0])}
              />
            </div>

            {used && <p className="text-xs text-muted">Files that are in use can&apos;t be deleted. Remove them from those pages first, or replace them.</p>}
          </>
        )}
      </EditDrawer>

      <ConfirmModal
        isOpen={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this file?"
        message={`“${file?.name ?? ""}” will be removed from the bucket for good. This can't be undone.`}
        onConfirm={handleDelete}
      />
    </>
  );
}
