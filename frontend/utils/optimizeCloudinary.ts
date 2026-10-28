export function getOptimizedImageUrl(
  src: string | undefined,
  width?: number,
  height?: number
): string {
  if (!src) return "";
  if (!src.includes("res.cloudinary.com")) return src;

  const marker = "/image/upload/";
  if (!src.includes(marker)) return src;

  // Already fully transformed (has eco quality AND a width)
  if (/\/upload\/[^/]*q_auto:eco/.test(src) && /w_\d+/.test(src)) {
    return src;
  }

  const crop = width && height ? "c_fill" : width || height ? "c_limit" : "";

  const transformations = [
    "f_auto",
    "q_auto:eco",       // ← changed from q_auto
    "dpr_auto",         // ← added (retina support)
    width && `w_${width}`,
    height && `h_${height}`,
    crop,
  ]
    .filter(Boolean)
    .join(",");

  return src.replace(marker, `${marker}${transformations}/`);
}