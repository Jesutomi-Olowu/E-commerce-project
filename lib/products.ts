// Public view of a product: never expose the private file key.
export function toPublic(p: any) {
  const { fileKey, ...rest } = p;
  return {
    ...rest,
    imageUrls: (p.imageKeys ?? []).map((k: string) => `${process.env.IMAGES_BASE_URL}/${k}`),
  };
}

export const CATEGORIES = ["Templates", "Typefaces", "Audio", "Guides", "Presets"] as const;
