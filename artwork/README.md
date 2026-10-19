# Case 001 artwork

Seventeen original illustrations were generated with the built-in image_gen tool:
seven fictional portraits and ten clue scenes. The cast is Brian, Emily, Tyler,
Luke, Anna, Noah, and Sophie. No API fallback was used.

- source/: original generated PNGs copied into the project.
- ../public/cases/case001/portraits/: optimized character WebP images.
- ../public/cases/case001/evidence/: optimized clue WebP images.
- prompts.json: exact successful prompts, references, original paths and destinations.
- clue-plan.json: original clue-art brief, with completion status.

Scene evidence uses generated imagery; password records use readable HTML.
The teacher handouts are the student register and blank clue worksheet, with no illustrations. Restored-color and final-reveal
images stay in the game. Suspect boards and profiles reuse the individual portraits. Evidence thumbnails
use the same assets. Exact names, IDs, times and table entries remain readable HTML.
The initial camera archive does not show the backpack. The hallway frame keeps
the second student's face hidden. The final equipment log uses Brian and Emily's
portraits as references to keep their faces consistent.

The timestamp illustration was corrected with the built-in image generator to
remove a clock displaying an unrelated time. The app uses
`../public/cases/case001/evidence/timeline-record-v2.webp`; the original is retained.
The edit prompt, reference and saved paths are in `timestamp-correction.json`.

Run node scripts/prepare-artwork.mjs to copy and optimize entries in prompts.json.
The script only encodes existing files, preserves original PNGs and skips existing
outputs. It makes no API calls.

Run `npm run images:compat` after changing any WebP artwork to regenerate its
JPEG and 400px `.thumb.jpg` preview. This scans all case folders, including
optional portrait/footage overrides, and also runs before every production
build. The UI requests JPEG first for iPad compatibility and uses small
previews on the evidence desk. Full JPEG and WebP provide alternate sources
if a thumbnail is unavailable. Failed full illustrations offer a retry button.

## Expanded suspect cast

The built-in image generator created Elena Brooks, Maya Chen, and Oliver Grant
in one reference-matched portrait sheet. The original is `source/new-suspects.png`;
optimized crops are `../public/cases/case001/portraits/elena.webp`, `maya.webp`,
and `oliver.webp`. Exact prompt and crop details: `new-suspects.json`.
The two new girls have a shoulder-length side-parted dark bob similar to Emily;
Oliver is an older student, age 18. No API fallback was used.

## Opening comic

`source/opening-comic.png` is the original three-panel comic generated with the
built-in image generator, using Brian and the Maker Lab as references. The local
WebP is `../public/cases/case001/evidence/opening-comic.webp`. The same component
renders it in the Case brief and the first How to Play screen, with HTML captions.
The exact prompt and reference paths are saved in `opening-comic.json`.

## Mission and ready comics

`source/mission-comic.png` and `source/ready-comic.png` extend the opening comic
into How to Play screens 02 and 05. Both were generated with the built-in image
generator, using `source/opening-comic.png` as a style reference. Optimized assets
are `../public/cases/case001/evidence/mission-comic.webp` and `ready-comic.webp`.
Exact prompts and paths are in `guide-comics.json`. Captions remain readable HTML;
the illustrated register contains no readable names or passwords.
