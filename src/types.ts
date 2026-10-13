export type Value = number | string;
export type StepDefinition = {
  id: number; shortLabel: string; title: string; narrative: string; question: string; objective: string;
  caseNote: string[]; starterCode?: string[]; requiredEvidence: string[]; requiredVariables: Record<string, Value>;
  expectedResult: Value; requiredResultDependencies: string[]; requiredOperations: string[];
  unlockEvidence: string[]; hints: string[]; stamp: string;
  resultLabel: string; resultDisplay: string; formula?: string;
};
export type EvidenceDocument = {
  id: string; type: 'brief' | 'suspects' | 'camera' | 'registry' | 'timeline' | 'footage' | 'directory' | 'access' | 'card' | 'profiles' | 'person' | 'equipment' | 'final';
  title: string; subtitle: string; content: string[]; headers?: string[]; rows?: string[][]; unlockedBy?: number; printable: boolean;
  highlightRow?: number;
};
export type SuspectDefinition = { id: string; name: string; backpack: string; card: string; room: number; color: string };
export type CaseDefinition = { id: string; title: string; tagline: string; steps: StepDefinition[]; documents: EvidenceDocument[]; finalDeduction: { person: string; account: string } };
export type CaseState = {
  version: 1; notesRevision?: number; caseId: string; opened: boolean; currentStep: number; visited: number[]; solved: number[];
  codes: Record<number, string>; evidence: string[]; hiddenNotes: number[]; hints: Record<number, number>;
  deduction: { person: string; account: string }; closed: boolean;
  caseRevision: 2;
  cameraCodeAccepted: boolean; timeAccepted: boolean; archive1220Unlocked: boolean;
  selectedSuspect: string;
  results: Record<number, Value>;
  previousWork?: { codes: Record<number, string>; solved: number[]; results: Record<number, Value>; closed: boolean };
};
