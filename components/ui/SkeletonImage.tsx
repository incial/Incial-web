"use client";

import { useCallback, useState } from "react";
import Image, { type ImageProps } from "next/image";
import SkeletonBlock from "./SkeletonBlock";

type LoadStatus = "loading" | "loaded" | "error";

interface SkeletonImageProps extends ImageProps {
  /** Extra classes for the skeleton block shown while the image loads. */
  skeletonClassName?: string;
}

/**
 * An image that shows a pulsing skeleton until it has actually loaded, then fades in. The
 * parent must be `relative` so the skeleton can fill it.
 */
export default function SkeletonImage({
  skeletonClassName = "",
  className = "",
  onLoad,
  onError,
  alt,
  ...props
}: SkeletonImageProps) {
  const [status, setStatus] = useState<LoadStatus>("loading");

  // an image served from cache can finish before React sees its load event
  const attachRef = useCallback((img: HTMLImageElement | null) => {
    if (img && img.complete && img.naturalWidth > 0) setStatus("loaded");
  }, []);

  if (status === "error") {
    return (
      <span className="px-1 text-center text-[10px] leading-tight text-black/50">{alt}</span>
    );
  }

  return (
    <>
      {status === "loading" && (
        <SkeletonBlock className={skeletonClassName} />
      )}
      <Image
        {...props}
        ref={attachRef}
        alt={alt}
        className={`${className} transition-opacity duration-500 ${
          status === "loaded" ? "opacity-100" : "opacity-0"
        }`}
        onLoad={(event) => {
          setStatus("loaded");
          onLoad?.(event);
        }}
        onError={(event) => {
          setStatus("error");
          onError?.(event);
        }}
      />
    </>
  );
}
