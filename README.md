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

For classroom use, share the deployed site's **HTTPS** URL. The network URL
printed by the development server uses plain HTTP and can show a “Not Secure”
warning on iPads. A certificate/privacy warning on an HTTPS URL needs the exact
hostname and warning checked against the hosting certificate, device clock and
school network settings; changing image formats does not repair certificates.

## Included

- A case archive, tactile investigation desk, and eight steps. Step 4 unlocks after completing Steps 1–3 and answering both CCTV terminal prompts correctly. From Step 4 onward, each step must be solved to unlock the next.
- A Python or C# choice before entering the case, remembered with student progress.
- Selecting Python or C# opens the investigation immediately. The How to Play guide and pre-game tutorial have been removed.
- Fixed Python and C# code templates with a dark navy background, yellow values/types,
  red variables, cyan calls/operators, and muted blue Case Notes. All eight steps
  provide the variable names, assignment syntax and output call.
  Students fill the numeric values and write the complete result expression using
  the variables and required operators. Step 2 hides both checksum values behind
  fixed `?` marks, has no Case Note, and only asks students to write the result
  calculation. Its checksum values are supplied internally for validation. The surrounding code
  cannot be edited. Blank answers receive a clear prompt before validation runs.
  Values and written expressions persist across reloads, and compatible saved programs
  populate the new controls. Reset clears only the step's answers, keeping its template.
  Optional Case Notes and progressive clues adapt to the chosen language.
  The code panel scrolls independently with touch, trackpad, mouse or keyboard;
  Run, Clue and the step tabs remain outside its scrolling content.
- Bounded Python and C# classroom interpreters with expression parsing, dependency tracking, and semantic validation for every step.
- All digital evidence, interactive suspect records, and a final reconstruction.
- Automatic localStorage persistence and confirmed resets.
- A two-stage CCTV terminal with a numeric camera keypad, saved authentication, and mechanical time wheels with a quiet click on each adjustment.
- Monochrome footage that restores its colors after students recover the color key.
- Password-gated Teacher Tools at `/teacher/case/001/print` offer an **A4 student register** with 30 fictional names, student numbers, and puzzle passwords, plus a **landscape A4 clue worksheet** with eight blank squares titled by step. Each has its own print button. Print a worksheet per team for notes and a register for Steps 7-8; the register is never added to the Evidence Desk. The classroom password is unchanged. This local client-side gate is not server authentication.
- Nine named suspects plus Brian. Maya, Elena, and Emily share blue backpacks, B4 access, and Room 204. Students use the printed names, IDs, and passwords to verify this shortlist.
- A dimmed-screen discovery spotlight invites students to open each newly recovered clue. Completing Step 8 opens the final sign-in record directly, with a prominent **CHOOSE THE SUSPECT** button that stays visible below the clue.
- All nine suspects return in shuffled order for the final choice, with full portraits and names in a single wide grid. A wrong choice reveals a dark cinematic ending saying **BRIAN WAS NEVER FOUND**, with a fading hallway, missing poster, and an option to return to the evidence. Emily unlocks a joyful confetti celebration, animated case-solved checkmark, and three story beats revealing what actually happened. Both endings respect reduced motion, and the correct ending stays saved after reload.

Future case folders are unavailable placeholders clearly marked **Coming soon**.

## Case 001 evidence chain

Camera log / backup log recovers Camera 280. The key checksum recovers a vector key rack with 30 positions, one empty hook, and a worn label. Students identify the missing key from its neighbors.
The damaged timestamp becomes the actual last-seen time, 15:40. After those
three steps, the security terminal opens directly. Students enter the camera code
on its keypad and physically set the terminal's
time wheels to open Archive 1220. The terminal lets them consult recovered records. Step 3 uses the inspector's
statement that Brian left 20 minutes before 16:00; it no longer opens a separate
last-seen evidence card. The CCTV archive retains the recovered time for Step 6.

Archive 1220 x color filter **N# 2** restores the blue backpack. The original
monochrome frame explicitly displays the filter number and remains reopenable.
Step 4 directs students to the evidence for the color filter, without an explicit
assignment instruction on the frame. Step 5 describes the correction as the number
used as midday. Key 27 x sector 8 - correction 12 recovers Room 204. The access log connects
15:43 to shared access group B4, three minutes after the sighting.

Three suspects share the backpack, group, and room. In Step 7, students consult
the **printed** register and fill `suspect_01_ID`, `suspect_02_ID`, and
`suspect_03_ID` with Maya Chen (24013), Elena Brooks (24005), and Emily Carter
(24028), in any order. The calculation adds all three variables for **72046**.
Each ID must appear once; a different combination with the same total is rejected.

Step 8 calculates 864 / 12 = 72 to restore a damaged door-keypad scan. The final
record is an SVG lock with fingerprints only on **2, 7, and 4**, without a textual
password or initial. Students compare their three suspects' printed passwords;
only Emily's **72427** uses those digits exclusively. The green **CHOOSE THE
SUSPECT** button opens the shuffled photo grid. There is no clue-summary panel,
Emily evidence file, or digital student-register card.

Choosing Emily reveals that Brian was safe: they moved to Room 204 to prepare
the Maker demonstration. A staff check at 15:50 confirmed both safe. Key 27 was
signed out for the equipment, and they forgot to update the Maker Lab schedule.
The reveal illustration and story appear only after the correct final choice.

The case brief contains a three-panel comic opening: Brian
at work, his empty seat, and the broken recording. Captions are readable HTML,
with the illustration stored locally. Suspect records and the final selection
show full 3:4 portraits without landscape cropping.

## Saved work

The existing localStorage key is retained. Current investigations save code,
results, evidence, selected suspect, all three CCTV authentication flags, the selected language. Existing Python drafts remain intact; choosing C# for an existing investigation preserves edited Python programs in Previous Notes. Resetting a case asks for a new language, then opens the desk directly.
The new deduction revision preserves Steps 1-6 and CCTV authentication from saved
investigations. It reopens Steps 7-8 with the ID and keypad puzzles and saves the
earlier password programs and results in Previous Notes.
Revision 3 starts the updated clue chain fresh. Earlier case revisions are preserved in **Previous Notes**, including student
programs and verified results. Their old completion flags do not unlock the new
evidence chain. Resetting the case clears the current investigation and its
previous-notes archive after confirmation.

## Checks

```sh
npm test
npm run build
npx playwright test
```

Browser tests expect the local server to be running on port 5176. They cover full
case playthroughs in both Python and C#, first-time language selection and direct game entry, editor colors, the teacher password gate, saved progress, wrong deductions, hints, evidence, reset
confirmation, and the single-page student register in Chromium and WebKit at iPad landscape size.
Install test browsers with `npx playwright install chromium webkit` if necessary.

The interpreter supports numeric and string assignments, variable references,
comments, parentheses, unary signs, `+ - * /`, and `print(...)`. It deliberately
does not run arbitrary Python, imports, loops, functions, or external code. It
never uses JavaScript `eval` or a Python execution server.

The C# terminal supports whole-number `int` declarations, reassignment,
arithmetic, parentheses, line/block comments, optional `using System;`, and
`Console.WriteLine(result);` (also `System.Console.WriteLine`). Semicolons and
declarations are required. Integer division truncates as in C#; all case
calculations divide evenly. `double`, `var`, classes, loops, methods, strings,
casts, and arbitrary .NET APIs are outside this classroom subset. Both
interpreters require the clue variables and calculation; hardcoded answers fail.

## Project structure

- `src/cases/case001.ts`: story, step requirements, documents, and suspects.
- `src/cases/student-register.ts`: 30 fictional student records rendered only in Teacher Tools.
- `src/engine/python/`: shared expressions, dependency traces, Python execution, and validation.
- `src/engine/csharp.ts`: numeric C# parsing, declarations, and type checks.
- `src/engine/language.ts`: language-specific starter programs and clue text.
- `src/engine/`: fixed-template answer serialization, state transitions and versioned local storage.
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

Case artwork loads as JPEG first, including full evidence, portraits, the case
brief and the ending, so older iPads do not need to request WebP to see images.
Clue previews use small 400px JPEGs and load without waiting for Safari's lazy
loading detection inside the scrolling desk. If a thumbnail is unavailable,
the full JPEG is used; WebP remains an alternate if the JPEG fails.
If downloads fail or stall, a compact JPEG included in the game bundle supplies the
actual photo without another network request. This covers every case photo,
including portraits, clues and the ending. The embedded copies are at most
640px wide; the normal full-resolution files remain the first choice. The pack
loads with the application so it is available as soon as the game opens. This
increases the initial application download by about 1 MB compressed. A three-second
limit also catches blocked requests that never dispatch a browser error event.
Only a failure to decode even that bundled copy shows **RETRY IMAGE** or a
portrait placeholder. Retrying does not clear student work. JPEGs, thumbnails
and `src/generated/case-images.json` are committed for local development and
refreshed by `npm run build`.
After replacing artwork, run `npm run images:compat` to refresh those copies.

Browser-based WebKit checks emulate an iPad viewport and touch input. Actual iPad
keyboard behavior should also be checked on hardware before a classroom rollout.
The game fits the visible screen with Safari's browser bars and safe-area
insets included. The header and all eight step tabs stay in place; the case
file, code editor and evidence files scroll independently. The compact evidence
drawer and dialogs use the same available screen height. Browser-bar changes,
window resizing and device rotation update the layout. The on-screen keyboard
overlays the fitted desk without shrinking the editor, header or step tabs.

Case Notes share the editor color cues: red for
variable instructions and names, yellow for values, and cyan for operations and
output calls. These are visual annotations; saved code remains plain text.
