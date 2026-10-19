import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react';
import embeddedImages from '../generated/case-images.json';

const bundledPhotos: Record<string, string> = embeddedImages;

type Props = ImgHTMLAttributes<HTMLImageElement> & { thumbnail?: boolean };

/** Prefer JPEG without requiring an older iPad to fail a WebP request first. */
export function CompatibleImage(props: Props) {
  return <ImageAttempts key={`${props.src}:${!!props.thumbnail}`} {...props}/>;
}

function ImageAttempts({ src, thumbnail, onError, onLoad, alt, ...props }: Props) {
  const [attempt, setAttempt] = useState(0);
  const [retry, setRetry] = useState(0);
  const loadedSource = useRef<string | undefined>(undefined);
  const jpeg = src?.replace(/\.webp(?=\?|$)/i, '.jpg');
  const bundled = src ? bundledPhotos[src.split(/[?#]/)[0]] : undefined;
  const candidates = [...new Set([
    ...(thumbnail && jpeg !== src ? [jpeg?.replace(/\.jpg(?=\?|$)/i, '.thumb.jpg')] : []),
    jpeg, src, bundled,
  ].filter((source): source is string => !!source))];
  const failed = attempt >= candidates.length;
  const source = candidates[attempt];
  const requestSource = source && retry && !source.startsWith('data:') ? `${source}${source.includes('?') ? '&' : '?'}retry=${retry}` : source;
  const bundledIndex = bundled ? candidates.indexOf(bundled) : -1;
  useEffect(() => {
    if (!requestSource || bundledIndex < 0 || attempt >= bundledIndex) return;
    // WebKit can silently block a request without dispatching an image error.
    const timer = setTimeout(() => {
      if (loadedSource.current !== requestSource) setAttempt(previous => previous === attempt ? bundledIndex : previous);
    }, 3000);
    return () => clearTimeout(timer);
  }, [requestSource, attempt, bundledIndex]);

  // Thumbnails sit inside clue buttons; keep their fallback non-interactive.
  if (failed && thumbnail) return <span className="image-load-error" role="img" aria-label="Preview unavailable. Open the clue to retry.">PREVIEW UNAVAILABLE</span>;
  if (failed) return <span className="image-load-error" role="status">
    <span>{alt || 'Image'} could not load.</span>
    <button type="button" onClick={() => { setRetry(Date.now()); setAttempt(0); }}>RETRY IMAGE</button>
  </span>;

  return <img key={requestSource} {...props} alt={alt} src={requestSource} onLoad={event => {
    loadedSource.current = requestSource;
    onLoad?.(event);
  }} onError={event => {
    setAttempt(previous => previous === attempt ? previous + 1 : previous);
    if (attempt === candidates.length - 1) onError?.(event);
  }}/>;
}
