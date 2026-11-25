"use client";

import { useMemo, useState } from "react";
import { Button, Modal, SearchField, Spinner } from "@heroui/react";
import MediaGrid from "./MediaGrid";
import { FOLDERS, isVideo, useMediaLibrary, type MediaFile } from "./useMediaLibrary";

interface MediaPickerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the chosen file's address. */
  onPick: (url: string) => void;
  kind: "image" | "video";
  /** The upload field's folder: its files are shown first. */
  folder?: string;
}

const ALL = "__all__";

/** A window for choosing a file that is already in the media library, instead of uploading it again. */
export default function MediaPicker({ isOpen, onOpenChange, onPick, kind, folder }: MediaPickerProps) {
  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-4xl">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Choose from the media library</Modal.Heading>
            </Modal.Header>
            {/* mounted only while open, so the library is fetched when needed */}
            {isOpen && <PickerBody kind={kind} folder={folder} onPick={(url) => { onPick(url); onOpenChange(false); }} />}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

function PickerBody({ kind, folder, onPick }: { kind: "image" | "video"; folder?: string; onPick: (url: string) => void }) {
  const { files } = useMediaLibrary();
  const [query, setQuery] = useState("");
  const [shownFolder, setShownFolder] = useState<string>(folder && FOLDERS.some((entry) => entry.id === folder) ? folder : ALL);
  const [chosen, setChosen] = useState<MediaFile | null>(null);

  const matching = useMemo(() => (files ?? []).filter((file) => (kind === "video" ? isVideo(file) : !isVideo(file))), [files, kind]);
  const folders = useMemo(() => FOLDERS.filter((entry) => matching.some((file) => file.folder === entry.id)), [matching]);
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return matching.filter((file) => (shownFolder === ALL || file.folder === shownFolder) && (!needle || file.name.toLowerCase().includes(needle)));
  }, [matching, shownFolder, query]);

  return (
    <>
      <Modal.Body className="flex flex-col gap-4">
        {files === null ? (
          <div className="flex h-60 items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              {[{ id: ALL, label: "All" }, ...folders].map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setShownFolder(entry.id)}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    shownFolder === entry.id ? "border-accent bg-accent text-accent-foreground" : "border-separator text-foreground hover:border-accent/50"
                  }`}
                >
                  {entry.label}
                </button>
              ))}
              <SearchField value={query} onChange={setQuery} aria-label="Search files" className="ml-auto w-56">
                <SearchField.Group>
                  <SearchField.SearchIcon />
                  <SearchField.Input placeholder="Search…" />
                  <SearchField.ClearButton />
                </SearchField.Group>
              </SearchField>
            </div>
            <div className="max-h-[55vh] overflow-y-auto pr-1">
              {visible.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted">No {kind === "video" ? "videos" : "images"} here yet.</p>
              ) : (
                <MediaGrid compact files={visible} selectedKey={chosen?.key} onSelect={setChosen} />
              )}
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" slot="close">
          Cancel
        </Button>
        <Button isDisabled={!chosen} onPress={() => chosen && onPick(chosen.url)}>
          Use this {kind}
        </Button>
      </Modal.Footer>
    </>
  );
}
