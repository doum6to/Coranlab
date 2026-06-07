/**
 * Helpers to render arbitrary video links. Pure functions — safe on both the
 * server and the client.
 */

/** True for YouTube / Vimeo links that must be shown in an <iframe>. */
export function isEmbedUrl(url: string): boolean {
  return /youtube\.com|youtu\.be|vimeo\.com/i.test(url);
}

/** Normalises a YouTube/Vimeo URL to its embeddable player URL. */
export function toEmbedSrc(url: string): string {
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return url;
}
