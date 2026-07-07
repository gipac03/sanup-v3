import type { Question } from "@/lib/domain/question";
import { biologyQuestions } from "./biology";
import { chemistryQuestions } from "./chemistry";
import { physicsQuestions } from "./physics";
import { mathQuestions } from "./math";
import { logicQuestions } from "./logic";
import { readingQuestions } from "./reading";

/**
 * Banca domande seed (Fase 0). Poche domande ma di qualita' reale, una per
 * verticale di flusso. La quantita' crescera' nelle fasi successive del piano
 * di scaling (progetto_completo_sanup_v2.txt, sez. 27).
 */
export const seedQuestions: Question[] = [
  ...biologyQuestions,
  ...chemistryQuestions,
  ...physicsQuestions,
  ...mathQuestions,
  ...logicQuestions,
  ...readingQuestions,
];
