"use client";

import { useState } from "react";

/**
 * Hero video for the landing, embedded for continuity with the ad creative.
 *
 * - A TikTok URL renders the official vertical embed (always 9:16).
 * - Any other URL (an uploaded .mp4 from the admin, or a direct file link) is
 *   played natively and ADAPTS to the file's real aspect ratio: a 16:9
 *   landscape video shows wide and uncropped, a 9:16 vertical one stays narrow.
 *   The ratio is read from the file's metadata (so no guessing / cropping).
 *
 * Performance: `preload="metadata"` fetches only the header (a few KB) to learn
 * the dimensions — never the whole file — and there's no autoplay, so the video
 * never competes with the hero's LCP or blocks the page.
 */
export function AdVideo({ url }: { url: string }) {
  const tiktokId = url.match(/tiktok\.com\/.*video\/(\d+)/)?.[1];
  const [ratio, setRatio] = useState<number | null>(null);

  if (tiktokId) {
    return (
      <iframe
        src={`https://www.tiktok.com/embed/v2/${tiktokId}`}
        title="Publicité Quranlab"
        loading="lazy"
        allow="encrypted-media"
        className="mx-auto aspect-[9/16] w-full max-w-[300px] rounded-3xl border border-neutral-200"
      />
    );
  }

  // Portrait videos stay narrow; landscape/square go wider. Until the metadata
  // loads we assume vertical (the common case for TikTok creatives).
  const isPortrait = ratio === null ? true : ratio < 1;
  const maxW = isPortrait ? 300 : 620;

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video
      src={url}
      controls
      playsInline
      preload="metadata"
      onLoadedMetadata={(e) => {
        const v = e.currentTarget;
        if (v.videoWidth && v.videoHeight) setRatio(v.videoWidth / v.videoHeight);
      }}
      style={{ maxWidth: maxW, aspectRatio: ratio ? String(ratio) : "9 / 16" }}
      className="mx-auto h-auto w-full rounded-3xl bg-black"
    />
  );
}
