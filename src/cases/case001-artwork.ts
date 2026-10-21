export const evidenceArtwork: Record<string, { file: string; alt: string; label?: string; monochrome?: boolean }> = {
  BRIEF: { file: 'opening-comic', alt: 'Comic story: Brian working on his robot, his empty Maker Lab seat, and a damaged security recording.' },
  C280: { file: 'camera-archive', alt: 'School security camera mounted in the hallway', label: 'CAMERA CODE 280' },
  A1220: { file: 'camera-archive', alt: 'School camera linked to the recovered archive', label: 'CCTV ARCHIVE FILE 1220' },
  'CCTV-BW': { file: 'hallway-footage', alt: 'Monochrome CCTV: Brian in a school hallway with another student carrying a backpack; its color and the student’s face cannot be identified', label: 'CAM 280 · 15:40 · COLOR FILTER N# 2', monochrome: true },
  'BP-BLUE': { file: 'hallway-footage', alt: 'Restored CCTV: Brian in a school hallway with another student wearing a blue backpack, whose face is hidden', label: 'ARCHIVE 1220 · COLOR RESTORED' },
  R204: { file: 'room-directory', alt: 'School corridor leading to the recovered room', label: 'ROOM 204 · STORAGE B' },
  ACCESS204: { file: 'room-access', alt: 'Electronic access reader beside a school door and an access ledger' },
  B4: { file: 'access-card', alt: 'Recovered school access card on a black lanyard', label: 'ACCESS CARD B4' },
};
export function evidenceImagePath(id: string) {
  const artwork = evidenceArtwork[id];
  return artwork ? '/cases/case001/evidence/' + artwork.file + '.webp' : undefined;
}

