import "server-only";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { env } from "../env";

/**
 * Object storage. Keys starting with "public/" may be served to anyone via /media;
 * "private/" keys (NIC photos) are only readable through admin routes.
 * Swap LocalDiskStorage for an S3/R2 implementation in production.
 */
export interface Storage {
  put(key: string, data: Buffer, contentType: string): Promise<void>;
  get(key: string): Promise<{ data: Buffer; contentType: string } | null>;
  delete(key: string): Promise<void>;
}

const TYPES: Record<string, string> = { ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png" };

class LocalDiskStorage implements Storage {
  constructor(private root: string) {}

  private resolve(key: string) {
    const full = path.resolve(this.root, key);
    if (!full.startsWith(path.resolve(this.root) + path.sep)) throw new Error("Invalid storage key");
    return full;
  }

  async put(key: string, data: Buffer) {
    const full = this.resolve(key);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, data);
  }

  async get(key: string) {
    try {
      const data = await readFile(this.resolve(key));
      return { data, contentType: TYPES[path.extname(key)] ?? "application/octet-stream" };
    } catch {
      return null;
    }
  }

  async delete(key: string) {
    await rm(this.resolve(key), { force: true });
  }
}

export const storage: Storage = new LocalDiskStorage(env.storageDir);

