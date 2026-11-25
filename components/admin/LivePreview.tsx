"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Button, Spinner, ToggleButton, ToggleButtonGroup, Tooltip } from "@heroui/react";
import { ArrowLeftToLine, ArrowRightToLine, ExternalLink, GripVertical, Monitor, RefreshCw, Smartphone, X } from "lucide-react";

export type DockSide = "left" | "right";

interface LivePreviewProps {
  /** Path of the public page that matches what is being edited, e.g. "/products". */
  src: string;
  side: DockSide;
  onSideChange: (side: DockSide) => void;
  onClose: () => void;
}

type Device = "desktop" | "mobile";

/** The width the page is laid out at, before being scaled down to fit the panel. */
const VIRTUAL_WIDTH: Record<Device, number> = { desktop: 1280, mobile: 390 };
const MIN_WIDTH = 280;
const WIDTH_KEY = "admin_preview_width";
const DEFAULT_WIDTH = 400;

function maxWidth(): number {
  return Math.max(MIN_WIDTH, Math.round(window.innerWidth * 0.6));
}

/**
 * The real website, docked to one side of the admin and fixed in place so it is always in view.
 * Drag its inner edge to make it wider or narrower; drag its title bar across the screen to dock it to
 * the other side. It is the actual page in a frame (never a copy), and it reloads whenever you save.
 */
export default function LivePreview({ src, side, onSideChange, onClose }: LivePreviewProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [gesture, setGesture] = useState<"resize" | "dock" | null>(null);
  const [dropSide, setDropSide] = useState<DockSide | null>(null);
  const [device, setDevice] = useState<Device>("desktop");
  const [nonce, setNonce] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [box, setBox] = useState({ width: 0, height: 0 });

  // the remembered width is read after mounting, so the server and the first client render match
  useEffect(() => {
    try {
      const stored = Number(localStorage.getItem(WIDTH_KEY));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (Number.isFinite(stored) && stored >= MIN_WIDTH) setWidth(Math.min(stored, maxWidth()));
    } catch {
      // the default width stays
    }
  }, []);

  // reload after every save
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onSaved = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setLoaded(false);
        setNonce((n) => n + 1);
      }, 350);
    };
    window.addEventListener("admin:saved", onSaved);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("admin:saved", onSaved);
    };
  }, []);

  // the site's heavier pages can be slow to report that they have loaded, so the spinner never stays long
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 4500);
    return () => clearTimeout(timer);
  }, [src, device, nonce]);

  // keep the width within bounds when the browser window changes size
  useEffect(() => {
    const onResize = () => setWidth((current) => Math.min(current, maxWidth()));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // the page is laid out at its normal width and scaled down to whatever room the panel has
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => setBox({ width: stage.clientWidth, height: stage.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  /** Dragging the inner edge changes the width; the pointer's distance from the screen edge is the width. */
  function beginResize(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    event.preventDefault();
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    setGesture("resize");
    let latest = width;

    const onMove = (move: PointerEvent) => {
      const fromEdge = side === "right" ? window.innerWidth - move.clientX : move.clientX;
      latest = Math.min(Math.max(fromEdge, MIN_WIDTH), maxWidth());
      setWidth(latest);
    };
    const onUp = () => {
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerup", onUp);
      target.removeEventListener("pointercancel", onUp);
      setGesture(null);
      try {
        localStorage.setItem(WIDTH_KEY, String(Math.round(latest)));
      } catch {
        // the width just is not remembered
      }
    };
    target.addEventListener("pointermove", onMove);
    target.addEventListener("pointerup", onUp);
    target.addEventListener("pointercancel", onUp);
  }

  /** Dragging the title bar: let go on the other half of the screen and the panel docks there. */
  function beginDock(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    if ((event.target as HTMLElement).closest("button, a, [role=radio], [role=radiogroup]")) return;
    event.preventDefault();
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    setGesture("dock");
    let over: DockSide = side;

    const onMove = (move: PointerEvent) => {
      over = move.clientX < window.innerWidth / 2 ? "left" : "right";
      setDropSide(over);
    };
    const onUp = () => {
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerup", onUp);
      target.removeEventListener("pointercancel", onUp);
      setGesture(null);
      setDropSide(null);
      if (over !== side) onSideChange(over);
    };
    target.addEventListener("pointermove", onMove);
    target.addEventListener("pointerup", onUp);
    target.addEventListener("pointercancel", onUp);
  }

  const virtualWidth = VIRTUAL_WIDTH[device];
  const scale = box.width > 0 ? Math.min(1, box.width / virtualWidth) : 0.3;
  const virtualHeight = box.height > 0 ? box.height / scale : 800;
  const compact = width < 380;

  return (
    <aside
      aria-label="Live preview of the website"
      style={{ width }}
      className={`relative flex h-full shrink-0 flex-col bg-surface ${side === "right" ? "border-l" : "border-r"} border-separator`}
    >
      {/* the drag handle on the inner edge: wider or narrower */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize the preview"
        onPointerDown={beginResize}
        className={`group absolute inset-y-0 z-30 w-3 cursor-col-resize touch-none ${side === "right" ? "-left-1.5" : "-right-1.5"}`}
      >
        <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-transparent transition-colors group-hover:bg-accent group-active:bg-accent" />
        <span className="absolute left-1/2 top-1/2 flex h-10 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-default opacity-0 transition-opacity group-hover:opacity-100 group-active:bg-accent" />
      </div>

      {/* the title bar: drag it to the other half of the screen to dock there */}
      <div
        onPointerDown={beginDock}
        className="flex shrink-0 cursor-grab touch-none select-none items-center justify-between gap-2 border-b border-separator px-3 py-2.5 active:cursor-grabbing"
      >
        <div className="flex min-w-0 items-center gap-2">
          <GripVertical size={16} className="shrink-0 text-muted" aria-hidden />
          <span className="relative flex size-2 shrink-0">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          {!compact && <span className="truncate text-xs font-semibold uppercase tracking-wider text-muted">Live preview</span>}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <ToggleButtonGroup
            size="sm"
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={new Set([device])}
            onSelectionChange={(keys) => {
              const next = Array.from(keys)[0];
              if (next === "desktop" || next === "mobile") {
                setLoaded(false);
                setDevice(next);
              }
            }}
          >
            <ToggleButton isIconOnly aria-label="Desktop view" id="desktop">
              <Monitor size={14} />
            </ToggleButton>
            <ToggleButton isIconOnly aria-label="Phone view" id="mobile">
              <ToggleButtonGroup.Separator />
              <Smartphone size={14} />
            </ToggleButton>
          </ToggleButtonGroup>
          <Tooltip delay={300}>
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              aria-label="Reload preview"
              onPress={() => {
                setLoaded(false);
                setNonce((n) => n + 1);
              }}
            >
              <RefreshCw size={14} />
            </Button>
            <Tooltip.Content>Reload</Tooltip.Content>
          </Tooltip>
          <Tooltip delay={300}>
            <Button isIconOnly size="sm" variant="ghost" aria-label={`Dock to the ${side === "right" ? "left" : "right"}`} onPress={() => onSideChange(side === "right" ? "left" : "right")}>
              {side === "right" ? <ArrowLeftToLine size={14} /> : <ArrowRightToLine size={14} />}
            </Button>
            <Tooltip.Content>Dock to the {side === "right" ? "left" : "right"}</Tooltip.Content>
          </Tooltip>
          {!compact && (
            <Tooltip delay={300}>
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open the page in a new tab"
                className="inline-flex size-8 items-center justify-center rounded-lg text-foreground hover:bg-default"
              >
                <ExternalLink size={14} />
              </a>
              <Tooltip.Content>Open in new tab</Tooltip.Content>
            </Tooltip>
          )}
          <Button isIconOnly size="sm" variant="ghost" aria-label="Hide the preview" onPress={onClose}>
            <X size={14} />
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 p-3">
        <div ref={stageRef} className="relative h-full w-full overflow-hidden rounded-xl border border-separator bg-black">
          {!loaded && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
              <Spinner size="md" />
            </div>
          )}
          {/* while the panel is being resized the frame must not swallow the pointer */}
          {gesture && <div className="absolute inset-0 z-20" />}
          <iframe
            key={`${src}-${device}-${nonce}`}
            title="Live preview of the website"
            src={src}
            onLoad={() => setLoaded(true)}
            style={{ width: virtualWidth, height: virtualHeight, transform: `scale(${scale})`, transformOrigin: "top left", border: 0 }}
            className="absolute left-0 top-0 bg-white"
          />
        </div>
      </div>

      {/* while dragging the title bar, show which side it will dock to */}
      {gesture === "dock" && dropSide && (
        <div
          aria-hidden
          className={`pointer-events-none fixed inset-y-0 z-[60] w-1/2 border-2 border-dashed border-accent bg-accent/10 ${dropSide === "left" ? "left-0" : "right-0"}`}
        >
          <div className="flex h-full items-center justify-center text-sm font-medium text-accent">Dock to the {dropSide}</div>
        </div>
      )}
    </aside>
  );
}
