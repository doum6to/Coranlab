/**
 * Client-side image compressor used before admin uploads. Downscales to a max
 * dimension and re-encodes to WebP, so the ORIGINAL stored in Supabase is
 * already light — which is what speeds up next/image's first optimization pass
 * (and therefore the landing's LCP). No server dependency (no sharp).
 *
 * Safe by design: skips SVG/GIF (and anything non-raster), and returns the
 * untouched original on any failure or whenever compression wouldn't help.
 */
export async function compressImageFile(
  file: File,
  maxDim = 1400,
  quality = 0.82,
): Promise<File> {
  if (typeof document === "undefined") return file;
  if (
    !file.type.startsWith("image/") ||
    file.type === "image/svg+xml" ||
    file.type === "image/gif"
  ) {
    return file;
  }

  try {
    // Decode the image (createImageBitmap is fastest; fall back to <img>).
    let width = 0;
    let height = 0;
    let source: CanvasImageSource | null = null;
    let revoke: (() => void) | null = null;

    const bitmap = await createImageBitmap(file).catch(() => null);
    if (bitmap) {
      width = bitmap.width;
      height = bitmap.height;
      source = bitmap;
    } else {
      const url = URL.createObjectURL(file);
      revoke = () => URL.revokeObjectURL(url);
      const img = await new Promise<HTMLImageElement>((res, rej) => {
        const el = new Image();
        el.onload = () => res(el);
        el.onerror = rej;
        el.src = url;
      });
      width = img.naturalWidth;
      height = img.naturalHeight;
      source = img;
    }

    if (!width || !height || !source) {
      revoke?.();
      return file;
    }

    const scale = Math.min(1, maxDim / Math.max(width, height));
    const w = Math.round(width * scale);
    const h = Math.round(height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      revoke?.();
      return file;
    }
    ctx.drawImage(source, 0, 0, w, h);
    revoke?.();

    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob((b) => res(b), "image/webp", quality),
    );
    // Keep the original if WebP failed or didn't actually shrink the file.
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], name, { type: "image/webp" });
  } catch {
    return file;
  }
}
