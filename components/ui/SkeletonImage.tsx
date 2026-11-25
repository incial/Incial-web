"use client";

import { useCallback, useEffect, useState } from "react";
import Image, { type ImageProps } from "next/image";
import { fetchCachedImageUrl, getCachedImageUrlSync } from "@/lib/publicCache";
import SkeletonBlock from "./SkeletonBlock";

type LoadStatus = "loading" | "loaded" | "error";

interface SkeletonImageProps extends ImageProps {
  /** Extra classes for the skeleton block shown while the image loads. */
  skeletonClassName?: string;
}

function CachedImg({
  resolvedSrc,
  skeletonClassName,
  className,
  onLoad,
  onError,
  alt,
  ...props
}: Omit<SkeletonImageProps, "src"> & { resolvedSrc: ImageProps["src"] }) {
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
        src={resolvedSrc}
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

/**
 * An image that shows a pulsing skeleton until it has actually loaded, then fades in. The
 * parent must be `relative` so the skeleton can fill it. Same-origin images are resolved
 * through the browser Cache API and deduplicated in memory to prevent repeated requests.
 */
export default function SkeletonImage({
  src,
  skeletonClassName = "",
  className = "",
  onLoad,
  onError,
  alt,
  ...props
}: SkeletonImageProps) {
  const rawSrc = typeof src === "string" ? src : null;
  const syncSrc = rawSrc ? getCachedImageUrlSync(rawSrc) : null;
  const [resolved, setResolved] = useState<{ src: string; url: string } | null>(null);

  useEffect(() => {
    if (!rawSrc || syncSrc) return;
    let cancelled = false;
    fetchCachedImageUrl(rawSrc).then((url) => {
      if (!cancelled) setResolved({ src: rawSrc, url });
    });
    return () => {
      cancelled = true;
    };
  }, [rawSrc, syncSrc]);

  const effectiveSrc = rawSrc
    ? syncSrc ?? (resolved?.src === rawSrc ? resolved.url : null)
    : src;

  if (!effectiveSrc) {
    return <SkeletonBlock className={skeletonClassName} />;
  }

  const key = typeof effectiveSrc === "string" ? effectiveSrc : "static";
  return (
    <CachedImg
      key={key}
      resolvedSrc={effectiveSrc}
      skeletonClassName={skeletonClassName}
      className={className}
      onLoad={onLoad}
      onError={onError}
      alt={alt}
      {...props}
    />
  );
}
