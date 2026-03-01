/**
 * CDN Image Loader for Next.js
 * Used when NEXT_PUBLIC_CDN_URL is set to serve optimized images via CDN
 */

/** @param {{ src: string, width: number, quality?: number }} params */
export default function cdnImageLoader({ src, width, quality }) {
  const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || '';

  // Already absolute URL
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return `${src}?w=${width}&q=${quality || 80}`;
  }

  // Relative path — prefix with CDN
  return `${cdnUrl}${src}?w=${width}&q=${quality || 80}&f=auto`;
}
