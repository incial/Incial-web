"use client";

import { useMemo, useRef, useState, type DragEvent } from "react";
import { Button, Chip, ListBox, SearchField, Select, Spinner, ToggleButton, ToggleButtonGroup } from "@heroui/react";
import { ImageOff, Info, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, LoadingState, PageHeader } from "@/components/admin/ui";
import MediaGrid from "@/components/admin/media/MediaGrid";
import MediaDetails from "@/components/admin/media/MediaDetails";
import { FOLDERS, folderLabel, formatSize, useMediaLibrary, type MediaFile } from "@/components/admin/media/useMediaLibrary";

type UseFilter = "all" | "used" | "unused";
const ALL = "__all__";

const LIST_POLICY = `{
  "Effect": "Allow",
  "Action": "s3:ListBucket",
  "Resource": "arn:aws:s3:::incial-portfolio-web",
  "Condition": { "StringLike": { "s3:prefix": ["incial-web/*"] } }
}`;

export default function MediaLibraryPage() {
  const { files, source, error, refresh, upload, replace, remove } = useMediaLibrary();
  const inputRef = useRef<HTMLInputElement>(null);
  const [folder, setFolder] = useState<string>(ALL);
  const [uploadFolder, setUploadFolder] = useState<string>("uploads");
  const [filter, setFilter] = useState<UseFilter>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<MediaFile | null>(null);
  const [uploading, setUploading] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const file of files ?? []) map.set(file.folder, (map.get(file.folder) ?? 0) + 1);
    return map;
  }, [files]);

  // folders that hold files, in the friendly order first, then any others
  const folderTabs = useMemo(() => {
    const known = FOLDERS.filter((entry) => counts.has(entry.id));
    const extra = [...counts.keys()].filter((id) => !FOLDERS.some((entry) => entry.id === id)).map((id) => ({ id, label: id }));
    return [...known, ...extra];
  }, [counts]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (files ?? []).filter((file) => {
      if (folder !== ALL && file.folder !== folder) return false;
      if (filter === "used" && file.usedIn.length === 0) return false;
      if (filter === "unused" && file.usedIn.length > 0) return false;
      if (!needle) return true;
      return file.name.toLowerCase().includes(needle) || file.usedIn.some((use) => use.label.toLowerCase().includes(needle));
    });
  }, [files, folder, filter, query]);

  if (files === null) return <LoadingState label="Loading the media library…" />;

  const destination = folder !== ALL ? folder : uploadFolder;
  const totalSize = files.reduce((sum, file) => sum + (file.size ?? 0), 0);
  const unusedCount = files.filter((file) => file.usedIn.length === 0).length;

  async function uploadFiles(list: FileList | File[]) {
    const batch = Array.from(list);
    if (batch.length === 0) return;
    setUploading((current) => [...current, ...batch.map((file) => file.name)]);
    let ok = 0;
    for (const file of batch) {
      try {
        await upload(file, destination);
        ok++;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : `Could not upload ${file.name}.`);
      } finally {
        setUploading((current) => current.filter((name, i) => !(name === file.name && i === current.indexOf(file.name))));
      }
    }
    if (ok > 0) {
      toast.success(`${ok} ${ok === 1 ? "file" : "files"} uploaded to ${folderLabel(destination)}.`);
      await refresh();
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleReplace(file: MediaFile, replacement: File) {
    try {
      const result = await replace(file.key, replacement);
      toast.success(result.pagesUpdated > 0 ? `Replaced. ${result.pagesUpdated} ${result.pagesUpdated === 1 ? "page was" : "pages were"} updated.` : "Replaced.");
      window.dispatchEvent(new CustomEvent("admin:saved", { detail: { section: "media" } }));
      setSelected(null);
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not replace the file.");
    }
  }

  async function handleDelete(file: MediaFile) {
    try {
      await remove(file.key);
      toast.success(`Deleted ${file.name}.`);
      setSelected(null);
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete the file.");
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length > 0) uploadFiles(event.dataTransfer.files);
  }

  return (
    <div
      onDragOver={(event) => {
        if (event.dataTransfer.types.includes("Files")) {
          event.preventDefault();
          setDragging(true);
        }
      }}
      onDragLeave={(event) => {
        if (event.currentTarget === event.target) setDragging(false);
      }}
      onDrop={onDrop}
      className="relative"
    >
      <PageHeader
        title="Media library"
        description={`${files.length} files · ${formatSize(totalSize)} · stored in Amazon S3`}
        secondary={
          folder === ALL ? (
            <Select selectedKey={uploadFolder} onSelectionChange={(key) => setUploadFolder(String(key))} aria-label="Upload into folder" className="w-44">
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {FOLDERS.map((entry) => (
                    <ListBox.Item key={entry.id} id={entry.id} textValue={entry.label}>
                      {entry.label}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          ) : undefined
        }
        primary={
          <Button onPress={() => inputRef.current?.click()} isDisabled={uploading.length > 0}>
            {uploading.length > 0 ? <Spinner size="sm" color="current" /> : <UploadCloud size={16} />}
            {uploading.length > 0 ? `Uploading ${uploading.length}…` : `Upload to ${folderLabel(destination)}`}
          </Button>
        }
      />
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif,image/svg+xml,video/mp4,video/webm"
        onChange={(event) => event.target.files && uploadFiles(event.target.files)}
      />

      {source === "index" && (
        <details className="mb-5 rounded-2xl border border-accent/30 bg-accent/5 px-4 py-3 text-sm">
          <summary className="flex cursor-pointer items-center gap-2 font-medium text-foreground">
            <Info size={15} className="text-accent" />
            Showing the files your website uses and everything uploaded here. Allow listing to see every file in the bucket.
          </summary>
          <div className="mt-3 text-muted">
            <p>
              In AWS → IAM → Users → <strong className="text-foreground">incial-s3-app</strong>, add this to its policy. The library switches over by itself.
            </p>
            <pre className="mt-2 overflow-x-auto rounded-xl bg-surface-secondary p-3 text-xs text-foreground">{LIST_POLICY}</pre>
          </div>
        </details>
      )}

      {error && (
        <div role="alert" className="mb-5 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {/* folders, filter and search */}
      <div className="mb-5 flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {[{ id: ALL, label: "All files" }, ...folderTabs].map((entry) => {
            const active = folder === entry.id;
            const count = entry.id === ALL ? files.length : (counts.get(entry.id) ?? 0);
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => setFolder(entry.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                  active ? "border-accent bg-accent text-accent-foreground" : "border-separator bg-surface text-foreground hover:border-accent/50"
                }`}
              >
                {entry.label}
                <span className={`rounded-full px-1.5 text-xs ${active ? "bg-black/15" : "bg-default text-muted"}`}>{count}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SearchField value={query} onChange={setQuery} aria-label="Search files" className="w-full max-w-sm">
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search by file name or page…" />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <ToggleButtonGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={new Set([filter])}
            onSelectionChange={(keys) => setFilter((Array.from(keys)[0] as UseFilter) ?? "all")}
            aria-label="Show"
          >
            <ToggleButton id="all">All</ToggleButton>
            <ToggleButton id="used">
              <ToggleButtonGroup.Separator />
              In use
            </ToggleButton>
            <ToggleButton id="unused">
              <ToggleButtonGroup.Separator />
              Unused
              {unusedCount > 0 && (
                <Chip size="sm" variant="soft" color="warning" className="ml-1.5">
                  {unusedCount}
                </Chip>
              )}
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState>
          <span className="flex flex-col items-center gap-2">
            <ImageOff size={22} />
            {files.length === 0 ? "No files yet. Drop files here or use Upload." : "No files match. Try another folder or search."}
          </span>
        </EmptyState>
      ) : (
        <MediaGrid files={visible} selectedKey={selected?.key} onSelect={setSelected} />
      )}

      <p className="mt-6 text-xs text-muted">
        Tip: drag files from your computer anywhere onto this page to upload them into {folderLabel(destination)}.
      </p>

      {dragging && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-accent bg-surface px-16 py-12 text-center shadow-2xl">
            <UploadCloud size={36} className="text-accent" />
            <p className="text-lg font-semibold text-foreground">Drop to upload</p>
            <p className="text-sm text-muted">into {folderLabel(destination)}</p>
          </div>
        </div>
      )}

      <MediaDetails file={selected} onClose={() => setSelected(null)} onReplace={handleReplace} onDelete={handleDelete} />
    </div>
  );
}
