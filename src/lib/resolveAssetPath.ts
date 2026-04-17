export function resolveAssetPath(path: string | undefined, base: string) {
  if (!path) return path;
  if (!base || base === "/") return path;
  if (path.startsWith(`${base}/`)) return path;
  return path.startsWith("/") ? `${base}${path}` : path;
}

export function resolveOgImageUrl(image: string | undefined, site?: string | URL) {
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;
  const normalizedImage = image.replace(/^\/+/, "");
  if (!site) return normalizedImage;
  const siteString = String(site);
  const normalizedSite = siteString.endsWith("/") ? siteString : `${siteString}/`;
  return new URL(normalizedImage, normalizedSite).href;
}
