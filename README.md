# COLD CASE

A complete, local-first classroom mystery for four students sharing an iPad.
Code. Investigate. Solve.

## Run locally

```sh
npm install
npm run dev -- --port 5176
```

Open **http://localhost:5176**. To play on an iPad connected to the same network,
use the network URL printed by Vite. Progress is saved separately in each browser
and device; no account or cloud service is used.

## Included

- A case archive, tactile investigation desk, and eight steps. Steps 4–8 unlock only after completing Steps 1–3 and answering both CCTV terminal prompts correctly.
- CodeMirror Python editor with per-step code, optional Case Notes, and progressive clues.
- A tokenizer, expression parser, evaluator, and semantic validation of the classroom Python subset.
- All digital evidence, interactive suspect records, and a final reconstruction.
- Automatic localStorage persistence and confirmed resets.
- A two-stage CCTV terminal with saved camera authentication and mechanical time wheels.
- Monochrome footage that restores its colors after students recover the color key.
- Optional A4 evidence pack at `/teacher/case/001/print`.
- Seventeen original generated illustrations: seven character portraits and ten clue scenes, plus local fonts and a tiny grain texture.

Future case folders are unavailable placeholders clearly marked **Coming soon**.

## Case 001 evidence chain

Camera log / backup log recovers Camera 280. The key checksum recovers Key 27.
The damaged timestamp becomes the actual last-seen time, 15:40. After those
three steps, students enter the camera code and physically set the terminal's
time wheels to open Archive 1220. The terminal allows them to consult records
without leaving the investigation.

Archive 1220 × color filter 2 restores the blue backpack. Key 27 × sector 8 −
correction 12 recovers Room 204. The access log connects 15:43 to Card B4, three
minutes after the sighting. Students choose a suspect from the detailed files
before coding the three matches. Only Emily matches all three. The final +68%
charge record reveals Brian and Emily preparing their Maker demonstration.

The original monochrome frame remains reopenable alongside the restored frame.
All 15 evidence documents are available digitally. The optional 16-page A4 pack
contains student worksheets with blank answer lines, an empty suspect comparison
table, and a detective-notes page. Recovered values, identifying color footage,
and the final reveal are not printed. Students consult the game to fill them in.
The original suspect board exposes only names and portraits.

## Saved work

The existing localStorage key is retained. Current investigations save code,
results, evidence, selected suspect, and all three CCTV authentication flags.
Earlier case revisions are preserved in **Previous Notes**, including student
programs and verified results. Their old completion flags do not unlock the new
evidence chain. Resetting the case clears the current investigation and its
previous-notes archive after confirmation.

## Checks

```sh
npm test
npm run build
npx playwright test
```

Browser tests expect the local server to be running on port 5176. They cover a full
case playthrough, saved progress, wrong deductions, hints, evidence, reset
confirmation, and the print pack in Chromium and WebKit at iPad landscape size.
Install test browsers with `npx playwright install chromium webkit` if necessary.

The interpreter supports numeric and string assignments, variable references,
comments, parentheses, unary signs, `+ - * /`, and `print(...)`. It deliberately
does not run arbitrary Python, imports, loops, functions, or external code. It
never uses JavaScript `eval` or a Python execution server.

## Project structure

- `src/cases/case001.ts`: story, step requirements, documents, and suspects.
- `src/engine/python/`: tokenizer, parser, evaluator, and validator.
- `src/engine/`: state transitions and versioned local storage.
- `src/components/`: terminal, evidence, navigation, artwork, and deduction.
- `src/pages/`: archive, investigation, and print views.
- `src/styles/app.css`: visual system, tablet layouts, and A4 print styles.
- `src/styles/cctv.css`: security terminal, mechanical selectors, and color reveal.
- `tests/` and `e2e/`: interpreter, validator, state, and browser tests.

The generic case types and engine separate content from execution. New case
definitions can use the same interpreter and UI components.

Generated app images live in `public/cases/case001/portraits/` and
`public/cases/case001/evidence/`. Original PNGs and exact generation prompts are
preserved in `artwork/`. See `artwork/README.md` for the asset workflow.
All images are local; the running app makes no image API calls.

Browser-based WebKit checks emulate an iPad viewport and touch input. Actual iPad
keyboard behavior should also be checked on hardware before a classroom rollout.
