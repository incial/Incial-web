"use client";

import { useEffect, useState } from "react";
import { SPLIT_SPEC, STACKED_SPEC, type StageSpec } from "./isoGeometry";

/** Below this width, or on a portrait screen, the text goes under the illustration. */
const STACKED_MAX_WIDTH = 899;
const PORTRAIT_RATIO = 1.1;

function shouldStack(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.innerWidth <= STACKED_MAX_WIDTH ||
    window.innerHeight > window.innerWidth * PORTRAIT_RATIO
  );
}

export function useStageLayout(): { stacked: boolean; spec: StageSpec } {
  const [stacked, setStacked] = useState(shouldStack);

  useEffect(() => {
    const update = () => setStacked(shouldStack());
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return { stacked, spec: stacked ? STACKED_SPEC : SPLIT_SPEC };
}
