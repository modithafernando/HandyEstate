/** Public URL for a stored object key (only "public/" keys are servable). */
export const mediaUrl = (key: string | null | undefined) => (key ? `/media/${key.replace(/^public\//, "")}` : null);
export const thumbUrl = (key: string) => mediaUrl(key.replace(/\.webp$/, "_t.webp"))!;
