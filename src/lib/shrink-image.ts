"use client";

/**
 * Downscale photos in the browser before upload — phone photos are 3–8 MB and
 * mobile data is expensive. The server re-encodes anyway; this just saves bandwidth.
 */
export async function shrinkImage(file: File, maxSide = 2000, quality = 0.85): Promise<File> {
  if (!file.type.startsWith("image/") || file.size < 400_000 || typeof createImageBitmap === "undefined") return file;
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", quality));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file; // unsupported format (e.g. HEIC on some browsers) — let the server handle it
  }
}

/** Replace every file under `field` in a FormData with a downscaled copy. */
export async function shrinkFormImages(fd: FormData, field: string, maxSide?: number) {
  const files = fd.getAll(field).filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return fd;
  const shrunk = await Promise.all(files.map((f) => shrinkImage(f, maxSide)));
  fd.delete(field);
  for (const f of shrunk) fd.append(field, f);
  return fd;
}
