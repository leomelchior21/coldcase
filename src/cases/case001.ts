import type { CaseDefinition, EvidenceDocument, StepDefinition, SuspectDefinition } from '../types';

export const suspects: SuspectDefinition[] = [
  { id: 'emily', name: 'Emily', backpack: 'Blue', card: 'B4', room: 204, color: '#426575' },
  { id: 'tyler', name: 'Tyler', backpack: 'Blue', card: 'C2', room: 204, color: '#687678' },
  { id: 'luke', name: 'Luke', backpack: 'Red', card: 'B4', room: 101, color: '#876159' },
  { id: 'anna', name: 'Anna', backpack: 'Green', card: 'A7', room: 204, color: '#657968' },
  { id: 'noah', name: 'Noah', backpack: 'Black', card: 'D1', room: 115, color: '#555a59' },
  { id: 'sophie', name: 'Sophie', backpack: 'Yellow', card: 'C2', room: 101, color: '#9d8858' },
];

export const documents: EvidenceDocument[] = [
  { id: 'BRIEF', type: 'brief', title: 'Case brief', subtitle: 'School incident report · 001', content: ['Brian was last seen near the Maker Lab. Now nobody knows where he is.', 'The room is empty. The schedule says he should be here.', 'Find the records. Follow the evidence. What really happened?'], printable: true },
  { id: 'BOARD', type: 'suspects', title: 'Suspect board', subtitle: 'Six people. One school.', content: ['These students were at school today. A name on this board does not mean someone did anything wrong.'], printable: true },
  { id: 'C280', type: 'camera', title: 'Security camera record', subtitle: 'Recovered security record', content: ['CAMERA CODE: 280', 'STATUS: ARCHIVE AVAILABLE', 'The footage is still locked. The security terminal also needs the last seen time.'], unlockedBy: 1, printable: true },
  { id: 'K27', type: 'registry', title: 'Missing key record', subtitle: 'Maker Lab · Inventory recovery', content: ['MISSING KEY: 27', 'This key was not returned.', 'ROOM: RECORD DAMAGED', 'Keep this key code. The room record can be recovered later.'], unlockedBy: 2, printable: true },
  { id: 'T1540', type: 'timeline', title: 'Last seen record', subtitle: 'Brian · Last confirmed sighting', content: ['BRIAN LAST SEEN: 15:40', 'LOCATION: MAKER LAB HALLWAY', 'The damaged timestamp has been recovered.'], unlockedBy: 3, printable: true },
  { id: 'A1220', type: 'camera', title: 'CCTV archive file', subtitle: 'Security terminal · Archive found', content: ['CCTV ARCHIVE FILE: 1220', 'CAMERA CODE: 280', 'LAST SEEN: 15:40', 'COLOR CHANNEL: CORRUPTED', 'Use this file number to restore the missing colors.'], printable: true },
  { id: 'CCTV-BW', type: 'footage', title: 'Original CCTV frame', subtitle: 'Camera 280 · 15:40 · Monochrome', content: ['Brian is in the hallway. Another student carries a backpack.', 'COLOR CHANNEL: CORRUPTED', 'The backpack color and the second student’s identity are not confirmed.'], printable: true },
  { id: 'BP-BLUE', type: 'footage', title: 'Restored CCTV frame', subtitle: 'Archive 1220 · Color channel restored', content: ['CCTV DETAIL: BLUE BACKPACK', 'The colors are back. The second student’s face is still hidden.', 'A backpack is a clue. It does not identify a person by itself.'], unlockedBy: 4, printable: true },
  { id: 'R204', type: 'directory', title: 'Room 204 record', subtitle: 'School facilities · Recovered key record', content: ['KEY: 27', 'ROOM: 204', 'LOCATION: STORAGE B', 'The missing key opens this room. Check its access log.'], unlockedBy: 5, printable: true },
  { id: 'ACCESS204', type: 'access', title: 'Room 204 access log', subtitle: 'Security system · Nearby access events', content: ['Find the first entry for Room 204 after Brian’s last sighting.', 'A card records access. It does not explain why someone entered.'], headers: ['CARD','TIME','ROOM'], rows: [['A7','15:21','204'],['C2','15:32','101'],['B4','15:43','204'],['D1','16:18','204']], highlightRow: 2, unlockedBy: 5, printable: true },
  { id: 'B4', type: 'card', title: 'Access card B4', subtitle: 'Verified access event', content: ['CARD: B4', 'TIME: 15:43', 'ROOM: 204', '3 MINUTES AFTER BRIAN’S LAST SIGHTING'], unlockedBy: 6, printable: true },
  { id: 'PROFILES', type: 'profiles', title: 'Detailed suspect files', subtitle: 'School records · Compare the clues', content: ['Compare the backpack, access card, and project room.', 'Inspect a file. Then choose the person whose clues you want to check.'], unlockedBy: 6, printable: true },
  { id: 'E01', type: 'person', title: 'Emily file', subtitle: 'Person of interest · Not a conclusion', content: ['BACKPACK: BLUE', 'ACCESS CARD: B4', 'PROJECT ROOM: 204', '3 / 3 CLUES MATCH', 'Emily matches the evidence. We still need to learn what happened.'], unlockedBy: 7, printable: true },
  { id: 'PREP', type: 'equipment', title: 'Room 204 project prep log', subtitle: 'Damaged equipment record', content: ['DEVICE BATTERY BEFORE: 8%', 'DEVICE BATTERY AFTER: 76%', 'OPERATOR: [CORRUPTED]', 'ASSISTANT: [CORRUPTED]', 'STATUS: [CORRUPTED]', 'Recover the charge change to restore the rest of this record.'], unlockedBy: 7, printable: true },
  { id: 'FINAL-01', type: 'final', title: 'Equipment log', subtitle: 'Room 204 · Maker project prep', content: ['DEVICE: ROBOTICS KIT', 'CHARGE ADDED: +68%', 'OPERATOR: BRIAN', 'ASSISTANT: EMILY', 'STATUS: PREPARING MAKER DEMONSTRATION', 'Schedule update: not submitted.'], unlockedBy: 8, printable: true },
];

const steps: StepDefinition[] = [
  {
    id: 1, shortLabel: 'The camera', title: 'The camera code',
    narrative: 'The hallway footage still exists. But the security camera ID is corrupted.',
    question: 'Which camera recorded Brian?', objective: 'Recover the camera code.',
    caseNote: ['The security camera log is 257880.', 'The backup log is 921.', '', 'Create the variable camera_log.', 'Create the variable backup_log.', '', 'Divide camera_log by backup_log.', 'Store the answer in the variable result.', 'Use print(result).'],
    starterCode: ['camera_log = 257880', 'backup_log = 921', 'result =', 'print(result)'],
    requiredEvidence: [], requiredVariables: { camera_log: 257880, backup_log: 921 },
    expectedResult: 280, requiredResultDependencies: ['camera_log','backup_log'], requiredOperations: ['/'], formula: 'camera_log / backup_log',
    unlockEvidence: ['C280'], hints: ['Use the camera log and its backup to recover the ID.', 'Python uses / to divide.', 'result = camera_log / backup_log'],
    stamp: 'Camera recovered', resultLabel: 'CAMERA CODE', resultDisplay: '280',
  },
  {
    id: 2, shortLabel: 'Missing key', title: 'The missing key',
    narrative: 'One Maker Lab key was never returned.', question: 'Which key is missing?', objective: 'Recover the key record.',
    caseNote: ['The full key inventory checksum is 864.', 'The returned keys checksum is 837.', '', 'Create the variable inventory_checksum.', 'Create the variable returned_checksum.', '', 'Subtract returned_checksum from inventory_checksum.', 'Store the difference in the variable result.', 'Use print(result).'],
    starterCode: ['inventory_checksum =', 'returned_checksum =', 'result ='],
    requiredEvidence: [], requiredVariables: { inventory_checksum: 864, returned_checksum: 837 },
    expectedResult: 27, requiredResultDependencies: ['inventory_checksum','returned_checksum'], requiredOperations: ['-'], formula: 'inventory_checksum - returned_checksum',
    unlockEvidence: ['K27'], hints: ['The checksum is a total used to check the key records.', 'Subtract the returned checksum from the full checksum.', 'result = inventory_checksum - returned_checksum'],
    stamp: 'Key recovered', resultLabel: 'MISSING KEY', resultDisplay: '27',
  },
  {
    id: 3, shortLabel: 'Last seen', title: 'Last seen',
    narrative: 'The camera timestamp is damaged.', question: 'What time was Brian last seen?', objective: 'Recover the actual time.',
    caseNote: ['Brian was last seen during hour 15.', 'The minute was 40.', '', 'Create the variable hour.', 'Create the variable minutes.', '', 'Multiply hour by 100. Add minutes.', 'Store the answer in the variable result.', 'Use print(result).'],
    requiredEvidence: [], requiredVariables: { hour: 15, minutes: 40 },
    expectedResult: 1540, requiredResultDependencies: ['hour','minutes'], requiredOperations: ['*','+'], formula: 'hour * 100 + minutes',
    unlockEvidence: ['T1540'], hints: ['The recovered value will be displayed as a real time.', 'Multiply the hour by 100, then add the minutes.', 'result = hour * 100 + minutes'],
    stamp: 'Time recovered', resultLabel: 'BRIAN LAST SEEN', resultDisplay: '15:40',
  },
  {
    id: 4, shortLabel: 'The footage', title: 'Restore the footage',
    narrative: 'The right footage is open. But the color channel is damaged.',
    question: 'Can we recover the missing colors?', objective: 'Restore the color channel.',
    caseNote: ['The CCTV archive file is in your evidence.', 'The color filter value is 2.', '', 'Create the variable archive_file.', 'Set it to the recovered archive file number.', 'Create the variable color_filter.', 'Set it to the color filter value.', '', 'Multiply archive_file by color_filter.', 'Store the answer in the variable result.', 'Use print(result).'],
    requiredEvidence: ['A1220'], requiredVariables: { archive_file: 1220, color_filter: 2 },
    expectedResult: 2440, requiredResultDependencies: ['archive_file','color_filter'], requiredOperations: ['*'], formula: 'archive_file * color_filter',
    unlockEvidence: ['BP-BLUE'], hints: ['Recover the archive at the security terminal first.', 'Find the archive file number on your Evidence Desk.', 'result = archive_file * color_filter'],
    stamp: 'Color restored', resultLabel: 'COLOR CHANNEL KEY', resultDisplay: '2440',
  },
  {
    id: 5, shortLabel: 'The key', title: 'The key',
    narrative: 'We know which key disappeared.', question: 'Which room does Key 27 open?', objective: 'Decode the room.',
    caseNote: ['The missing key code is in your evidence.', 'The sector value is 8.', 'The correction value is 12.', '', 'Create the variable key_code.', 'Create the variable sector_value.', 'Create the variable correction.', '', 'Multiply key_code by sector_value.', 'Then subtract correction.', 'Store the answer in the variable result.', 'Use print(result).'],
    requiredEvidence: ['K27'], requiredVariables: { key_code: 27, sector_value: 8, correction: 12 },
    expectedResult: 204, requiredResultDependencies: ['key_code','sector_value','correction'], requiredOperations: ['*','-'], formula: 'key_code * sector_value - correction',
    unlockEvidence: ['R204','ACCESS204'], hints: ['Retrieve the missing key code from an earlier record.', 'Multiply first. Subtract the correction from that answer.', 'result = key_code * sector_value - correction'],
    stamp: 'Room found', resultLabel: 'ROOM FOUND', resultDisplay: '204',
  },
  {
    id: 6, shortLabel: 'The access', title: 'Three minutes later',
    narrative: 'Room 204 was opened shortly after Brian disappeared.', question: 'How long after Brian’s last sighting?', objective: 'Connect the access record.',
    caseNote: ['Check the Last Seen Record and the access log.', 'Find the first Room 204 entry after the sighting.', 'Use four-digit times without a colon.', '', 'Create the variable last_seen.', 'Create the variable room_opened.', '', 'Subtract last_seen from room_opened.', 'Store the difference in the variable result.', 'Use print(result).'],
    requiredEvidence: ['T1540','R204','ACCESS204'], requiredVariables: { last_seen: 1540, room_opened: 1543 },
    expectedResult: 3, requiredResultDependencies: ['last_seen','room_opened'], requiredOperations: ['-'], formula: 'room_opened - last_seen',
    unlockEvidence: ['B4','PROFILES'], hints: ['Use the first entry for this room after Brian’s sighting.', 'Both times are in the same hour. Subtract their four-digit values.', 'result = room_opened - last_seen'],
    stamp: 'Access verified', resultLabel: 'ROOM 204 OPENED', resultDisplay: '3 MINUTES LATER',
  },
  {
    id: 7, shortLabel: 'The match', title: 'Who matches?',
    narrative: 'Three clues point to the same person.', question: 'Who matches everything we found?', objective: 'Check the three clues.',
    caseNote: ['Inspect the Detailed Suspect Files.', 'Choose a person to check.', 'Use 1 for a match. Use 0 for no match.', '', 'Create the variable backpack_match.', 'Create the variable card_match.', 'Create the variable room_match.', '', 'Add the three match values.', 'Store the sum in the variable result.', 'Use print(result).'],
    requiredEvidence: ['BP-BLUE','B4','R204','PROFILES'], requiredVariables: { backpack_match: 1, card_match: 1, room_match: 1 },
    expectedResult: 3, requiredResultDependencies: ['backpack_match','card_match','room_match'], requiredOperations: ['+'], formula: 'backpack_match + card_match + room_match',
    unlockEvidence: ['E01','PREP'], hints: ['Compare all three clues with the detailed suspect records.', 'Inspect a file and choose that person before you check the matches.', 'result = backpack_match + card_match + room_match'],
    stamp: 'Person of interest', resultLabel: '3 / 3 CLUES MATCH', resultDisplay: 'EMILY',
  },
  {
    id: 8, shortLabel: 'The truth', title: 'The truth',
    narrative: 'The last record changes the story.', question: 'What was happening in Room 204?', objective: 'Restore the final record.',
    caseNote: ['Check the Room 204 Project Prep Log.', 'The device started at 8%. Later it had 76%.', '', 'Create the variable battery_before.', 'Create the variable battery_after.', '', 'Subtract battery_before from battery_after.', 'Store the charge added in the variable result.', 'Use print(result).'],
    requiredEvidence: ['PREP'], requiredVariables: { battery_before: 8, battery_after: 76 },
    expectedResult: 68, requiredResultDependencies: ['battery_before','battery_after'], requiredOperations: ['-'], formula: 'battery_after - battery_before',
    unlockEvidence: ['FINAL-01'], hints: ['Check the device’s charge before and after.', 'Subtract the starting charge from the final charge.', 'result = battery_after - battery_before'],
    stamp: 'Record restored', resultLabel: 'DEVICE CHARGE', resultDisplay: '+68%',
  },
];
export const case001: CaseDefinition = { id: '001', title: 'Who took Brian?', tagline: 'The records don’t agree. Find out what happened.', steps, documents, finalDeduction: { person: 'emily', account: 'prep' } };
export const initialCode = (step: StepDefinition) => (step.id === 8 ? '# FINAL CASE NOTE\n' : '# CASE NOTE\n') + step.caseNote.map(line => '# ' + line).join('\n') + '\n\n' + (step.starterCode ? step.starterCode.join('\n') + '\n' : '');
export function stepWithSuspect(step: StepDefinition, selected: string): StepDefinition {
  const person = suspects.find(s => s.id === selected);
  return step.id === 7 && person ? { ...step, caseNote: ['Check ' + person.name + '’s file.', ...step.caseNote.slice(2)] } : step;
}

