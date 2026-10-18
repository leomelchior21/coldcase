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
- A Python or C# choice before entering the case, remembered with student progress.
- A five-screen illustrated introduction covering the story, evidence desk, a generic coding example, and the investigation sequence. **HOW TO PLAY** in the upper right reopens the guide without changing student work.
- CodeMirror editors with a dark navy background, yellow numbers/types, red variables, cyan calls/operators, and muted blue comments, matching the supplied reference. Per-step code, optional Case Notes, and progressive clues adapt to the chosen language.
  Step 1 includes the correct variables and output call with a blank result expression.
  Steps 2-8 provide glowing placeholder variable names, blank values and result,
  and the output call. Glowing value and calculation blanks accept a click or keyboard
  activation and disappear as students type; their labels never enter saved code.
  C# uses only `int` declarations.
- Bounded Python and C# classroom interpreters with expression parsing, dependency tracking, and semantic validation for every step.
- All digital evidence, interactive suspect records, and a final reconstruction.
- Automatic localStorage persistence and confirmed resets.
- A two-stage CCTV terminal with saved camera authentication and mechanical time wheels.
- Monochrome footage that restores its colors after students recover the color key.
- Password-gated Teacher Tools at `/teacher/case/001/print` offer an **A4 student register** with 30 fictional names, student numbers, and puzzle passwords, plus a **landscape A4 clue worksheet** with eight blank squares titled by step. Each has its own print button. Print a worksheet per team for notes and a register for Steps 7-8; the register is never added to the Evidence Desk. The classroom password is unchanged. This local client-side gate is not server authentication.
- Nine named suspects plus Brian, with three new generated portraits. Emily and Elena share similar hair, blue backpacks, B4 access, and Room 204; older student Oliver shares the backpack, access group, and room.
- A dimmed-screen discovery spotlight invites students to open each newly recovered clue.
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

The brief and first field-guide screen share a three-panel comic opening: Brian
at work, his empty seat, and the broken recording. Captions are readable HTML,
with the illustration stored locally. Suspect records and the final selection
show full 3:4 portraits without landscape cropping.

The five-screen field guide uses larger, bolder description text and a real
empty desk screenshot with arrows labeling the case file, code editor, and
evidence desk. Regenerate that screenshot with `node scripts/capture-guide.mjs`
while the local server runs on port 5176.

## Saved work

The existing localStorage key is retained. Current investigations save code,
results, evidence, selected suspect, all three CCTV authentication flags, the selected language, and tutorial completion. Existing Python drafts remain intact; choosing C# for an existing investigation preserves edited Python programs in Previous Notes. Resetting a case asks for a new language and shows the tutorial again.
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
case playthroughs in both Python and C#, first-time language selection, the five tutorial screens and replay, editor colors, the teacher password gate, saved progress, wrong deductions, hints, evidence, reset
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

The How to Play mission and ready screens continue the opening comic with
matching three-panel artwork. Case Notes share the editor color cues: red for
variable instructions and names, yellow for values, and cyan for operations and
output calls. These are visual annotations; saved code remains plain text.
