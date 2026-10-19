import { evidenceArtwork, evidenceImagePath } from '../cases/case001-artwork';
import { CompatibleImage } from './CompatibleImage';

export function EvidenceImage({ id, thumbnail = false, reveal = false }: { id: string; thumbnail?: boolean; reveal?: boolean }) {
  const artwork = evidenceArtwork[id];
  if (!artwork) return null;
  if (thumbnail) return <CompatibleImage className={`evidence-thumbnail ${artwork.monochrome ? 'cctv-monochrome' : ''}`} src={evidenceImagePath(id)} alt="" loading="lazy"/>;
  return <figure className={`evidence-illustration ${id === 'CCTV-BW' || id === 'BP-BLUE' ? 'footage-illustration' : ''} ${artwork.monochrome ? 'cctv-monochrome' : ''} ${reveal ? 'color-reveal' : ''}`}>
    <CompatibleImage src={evidenceImagePath(id)} alt={artwork.alt}/>
    {artwork.label && <figcaption>{artwork.label}</figcaption>}
  </figure>;
}
