const UPLOAD_SEGMENT = '/image/upload/';

// Returns a Cloudinary URL that serves the image at most `width` px wide, in the best format the browser
// supports (WebP/AVIF) at automatic quality. The originals are large PNGs (a couple of MB each), so
// requesting them as-is for a 300px card is by far the heaviest thing on the page.
// `c_limit` never upscales a smaller original. Anything that isn't a Cloudinary upload URL is returned as is.
export function cldImage(url: string, width: number): string {
  const i = url.indexOf(UPLOAD_SEGMENT);
  if (i === -1) return url;

  const head = url.slice(0, i + UPLOAD_SEGMENT.length);
  const rest = url.slice(i + UPLOAD_SEGMENT.length);

  // Some stored URLs already carry f_auto / q_auto as their own path segments; don't repeat them
  const auto = ['f_auto', 'q_auto'].filter((t) => !rest.includes(t));
  const transform = [...auto, 'c_limit', `w_${width}`].join(',');

  return `${head}${transform}/${rest}`;
}
