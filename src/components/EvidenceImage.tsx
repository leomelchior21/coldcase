import { evidenceArtwork, evidenceImagePath } from '../cases/case001-artwork';

export function EvidenceImage({ id, thumbnail = false, reveal = false }: { id: string; thumbnail?: boolean; reveal?: boolean }) {
  const artwork = evidenceArtwork[id];
  if (!artwork) return null;
  if (thumbnail) return <img className={`evidence-thumbnail ${artwork.monochrome ? 'cctv-monochrome' : ''}`} src={evidenceImagePath(id)} alt="" loading="lazy"/>;
  return <figure className={`evidence-illustration ${id === 'CCTV-BW' || id === 'BP-BLUE' ? 'footage-illustration' : ''} ${artwork.monochrome ? 'cctv-monochrome' : ''} ${reveal ? 'color-reveal' : ''}`}>
    <img src={evidenceImagePath(id)} alt={artwork.alt}/>
    {artwork.label && <figcaption>{artwork.label}</figcaption>}
  </figure>;
}
