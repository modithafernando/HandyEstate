import "server-only";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { storage } from "./storage";

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export class ImageError extends Error {
  constructor(public code: "tooLarge" | "notImage") {
    super(code);
  }
}

async function toBuffer(file: File) {
  if (file.size > MAX_UPLOAD_BYTES) throw new ImageError("tooLarge");
  if (!file.type.startsWith("image/")) throw new ImageError("notImage");
  return Buffer.from(await file.arrayBuffer());
}

/**
 * Decode and re-encode every upload. This rejects non-images and strips EXIF
 * (including GPS) — sharp drops metadata unless asked to keep it.
 */
async function encode(input: Buffer, opts: { width: number; height: number; fit: "cover" | "inside" }) {
  try {
    return await sharp(input, { failOn: "error" })
      .rotate()
      .resize({ width: opts.width, height: opts.height, fit: opts.fit, withoutEnlargement: opts.fit === "inside" })
      .webp({ quality: 80 })
      .toBuffer({ resolveWithObject: true });
  } catch {
    throw new ImageError("notImage");
  }
}

export async function saveAvatar(file: File): Promise<string> {
  const buf = await toBuffer(file);
  const out = await encode(buf, { width: 320, height: 320, fit: "cover" });
  const key = `public/avatars/${randomUUID()}.webp`;
  await storage.put(key, out.data, "image/webp");
  return key;
}

export async function saveWorkPhoto(file: File) {
  const buf = await toBuffer(file);
  const [full, thumb] = await Promise.all([
    encode(buf, { width: 1600, height: 1600, fit: "inside" }),
    encode(buf, { width: 480, height: 480, fit: "cover" }),
  ]);
  const id = randomUUID();
  const key = `public/work/${id}.webp`;
  await Promise.all([storage.put(key, full.data, "image/webp"), storage.put(`public/work/${id}_t.webp`, thumb.data, "image/webp")]);
  return { key, width: full.info.width, height: full.info.height };
}

export const thumbKey = (key: string) => key.replace(/\.webp$/, "_t.webp");

export async function savePrivateDocument(file: File): Promise<string> {
  const buf = await toBuffer(file);
  const out = await encode(buf, { width: 1800, height: 1800, fit: "inside" });
  const key = `private/nic/${randomUUID()}.webp`;
  await storage.put(key, out.data, "image/webp");
  return key;
}
