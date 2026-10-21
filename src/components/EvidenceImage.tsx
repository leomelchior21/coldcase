import { evidenceArtwork, evidenceImagePath } from '../cases/case001-artwork';
import { CompatibleImage } from './CompatibleImage';
import { KeyRack } from './KeyRack';

export function EvidenceImage({ id, thumbnail = false, reveal = false }: { id: string; thumbnail?: boolean; reveal?: boolean }) {
  if (id === 'K27') return <KeyRack thumbnail={thumbnail}/>;
  const artwork = evidenceArtwork[id];
  if (!artwork) return null;
  if (thumbnail) return <CompatibleImage className={`evidence-thumbnail ${artwork.monochrome ? 'cctv-monochrome' : ''}`} src={evidenceImagePath(id)} thumbnail alt="" decoding="async"/>;
  return <figure className={`evidence-illustration ${id === 'CCTV-BW' || id === 'BP-BLUE' ? 'footage-illustration' : ''} ${artwork.monochrome ? 'cctv-monochrome' : ''} ${reveal ? 'color-reveal' : ''}`}>
    <CompatibleImage src={evidenceImagePath(id)} alt={artwork.alt}/>
    {artwork.label && <figcaption>{artwork.label}</figcaption>}
  </figure>;
}
