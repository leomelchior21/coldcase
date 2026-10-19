import { useState, type ImgHTMLAttributes } from 'react';

type Props = ImgHTMLAttributes<HTMLImageElement> & { thumbnail?: boolean };

/** Prefer JPEG without requiring an older iPad to fail a WebP request first. */
export function CompatibleImage(props: Props) {
  return <ImageAttempts key={`${props.src}:${!!props.thumbnail}`} {...props}/>;
}

function ImageAttempts({ src, thumbnail, onError, alt, ...props }: Props) {
  const [attempt, setAttempt] = useState(0);
  const [retry, setRetry] = useState(0);
  const jpeg = src?.replace(/\.webp(?=\?|$)/i, '.jpg');
  const candidates = [...new Set([
    ...(thumbnail && jpeg !== src ? [jpeg?.replace(/\.jpg(?=\?|$)/i, '.thumb.jpg')] : []),
    jpeg, src,
  ].filter((source): source is string => !!source))];
  const failed = attempt >= candidates.length;
  const source = candidates[attempt];
  const requestSource = source && retry ? `${source}${source.includes('?') ? '&' : '?'}retry=${retry}` : source;

  // Thumbnails sit inside clue buttons; keep their fallback non-interactive.
  if (failed && thumbnail) return <span className="image-load-error" role="img" aria-label="Preview unavailable. Open the clue to retry.">PREVIEW UNAVAILABLE</span>;
  if (failed) return <span className="image-load-error" role="status">
    <span>{alt || 'Image'} could not load.</span>
    <button type="button" onClick={() => { setRetry(Date.now()); setAttempt(0); }}>RETRY IMAGE</button>
  </span>;

  return <img {...props} alt={alt} src={requestSource} onError={event => {
    setAttempt(previous => previous + 1);
    if (attempt === candidates.length - 1) onError?.(event);
  }}/>;
}
