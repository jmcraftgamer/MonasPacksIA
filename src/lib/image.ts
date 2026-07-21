export function getImageUrl(imgUrl: string | undefined | null): string {
  if (!imgUrl) return "";
  if (imgUrl.startsWith("/api/") || imgUrl.startsWith("data:") || imgUrl.startsWith("blob:")) return imgUrl;
  return `/api/image?url=${encodeURIComponent(imgUrl)}`;
}