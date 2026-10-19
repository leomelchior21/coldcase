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
  provide the variable names, assignment syntax, calculation operands and output call.
  Students fill the numeric values and choose `+`, `-`, `*` or `/` from operator menus.
  Step 3 also provides a numeric field for the time multiplier. The surrounding code
  cannot be edited. Blank answers receive a clear prompt before validation runs.
  Answers and operator choices persist across reloads, and compatible saved programs
  populate the new controls. Reset clears only the step's answers, keeping its template.
  Optional Case Notes and progressive clues adapt to the chosen language.
  The code panel scrolls independently with touch, trackpad, mouse or keyboard;
  Run, Clue and the step tabs remain outside its scrolling content.
- Bounded Python and C# classroom interpreters with expression parsing, dependency tracking, and semantic validation for every step.
- All digital evidence, interactive suspect records, and a final reconstruction.
- Automatic localStorage persistence and confirmed resets.
- A two-stage CCTV terminal with saved camera authentication and mechanical time wheels.
- Monochrome footage that restores its colors after students recover the color key.
- Password-gated Teacher Tools at `/teacher/case/001/print` offer an **A4 student register** with 30 fictional names, student numbers, and puzzle passwords, plus a **landscape A4 clue worksheet** with eight blank squares titled by step. Each has its own print button. Print a worksheet per team for notes and a register for Steps 7-8; the register is never added to the Evidence Desk. The classroom password is unchanged. This local client-side gate is not server authentication.
- Nine named suspects plus Brian, with three new generated portraits. Emily and Elena share similar hair, blue backpacks, B4 access, and Room 204; older student Oliver shares the backpack, access group, and room.
- A dimmed-screen discovery spotlight invites students to open each newly recovered clue. Completing Step 8 opens the final sign-in record directly, with a prominent **CHOOSE THE SUSPECT** button that stays visible below the clue.
- All nine suspects return for the final choice. A wrong choice fades to an unresolved ending with a return to the levels; Emily unlocks the animated true story.

Future case folders are unavailable placeholders clearly marked **Coming soon**.

## Case 001 evidence chain

Camera log / backup log recovers Camera 280. The key checksum recovers Key 27.
The damaged timestamp becomes the actual last-seen time, 15:40. After those
three steps, students enter the camera code and physically set the terminal's
time wheels to open Archive 1220. The terminal lets them consult recovered records.

Archive 1220 x color filter **N# 2** restores the blue backpack. The original
monochrome frame explicitly displays the filter number and remains reopenable.
Key 27 x sector 8 - correction 12 recovers Room 204. The access log connects
15:43 to shared access group B4, three minutes after the sighting.

Three suspects share the backpack, group, and room. Step 7 calculates
900 - 473 = 427, the last three password digits. The **printed** register leaves
Emily Carter (72427) and Elena Brooks (39427) in consideration. Step 8 calculates
864 / 12 = 72 and restores only initial E. and the first two digits. Students
combine the clues and consult the printed list before choosing a suspect.
There is no Emily evidence file and no digital student-register card.

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
Failed full illustrations show a **RETRY IMAGE** button that requests a fresh
copy without clearing student progress. Portraits retain their illustrated
placeholder when neither format loads. JPEGs and thumbnails are committed for
local development and refreshed by `npm run build`.
After replacing artwork, run `npm run images:compat` to refresh those copies.

Browser-based WebKit checks emulate an iPad viewport and touch input. Actual iPad
keyboard behavior should also be checked on hardware before a classroom rollout.
The on-screen keyboard overlays the investigation desk without shrinking the
page, editor, header or step tabs. The layout still adapts to window resizing
and device rotation.

Case Notes share the editor color cues: red for
variable instructions and names, yellow for values, and cyan for operations and
output calls. These are visual annotations; saved code remains plain text.
