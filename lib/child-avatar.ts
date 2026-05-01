const CHILD_AVATAR_IMAGES = [
  "/images/tomo1.png",
  "/images/tomo2.png",
  "/images/tomo4.png",
  "/images/tomo5.png",
  "/images/tomo6.png",
] as const;

export function getChildAvatarSrc(seed: string) {
  if (!seed) return CHILD_AVATAR_IMAGES[0];

  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return CHILD_AVATAR_IMAGES[hash % CHILD_AVATAR_IMAGES.length];
}
