import { useState, type ImgHTMLAttributes } from 'react';

/** Keep the same layout while retrying WebP failures in older Safari as JPEG. */
export function CompatibleImage({ src, onError, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [failedWebp, setFailedWebp] = useState<string>();
  const fallback = src?.replace(/\.webp$/i, '.jpg');
  const canRetry = fallback !== src;
  return <img {...props} src={failedWebp === src && canRetry ? fallback : src} onError={event => {
    if (canRetry && failedWebp !== src) setFailedWebp(src);
    else onError?.(event);
  }}/>;
}
