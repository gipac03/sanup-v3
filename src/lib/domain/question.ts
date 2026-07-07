import type { SubjectId } from "./taxonomy";

/**
 * Schema di una domanda della banca SanUp.
 *
 * Struttura definita in progetto_completo_sanup_v2.txt (sez. 19-24) e vincolata
 * alla tassonomia del DM 806 (vedi taxonomy.ts).
 *
 * Ogni domanda e' un'unita' autonoma e serializzabile: questo permette, in
 * futuro, di spostarla identica da un modulo dati locale a un database remoto
 * senza cambiare ne' il quiz engine ne' la UI (vedi lib/data/repository.ts).
 */

export type OptionKey = "A" | "B" | "C" | "D" | "E";

export const OPTION_KEYS: OptionKey[] = ["A", "B", "C", "D", "E"];

export type Difficulty = "easy" | "medium" | "hard";

export type QuestionOptions = Record<OptionKey, string>;

/**
 * Dettagli didattici mostrati DOPO la risposta.
 * whyCorrect e wrongOptions sono obbligatori; il resto arricchisce il ripasso.
 */
export interface ExplanationDetails {
  whyCorrect: string;
  /** Per ogni opzione errata, perche' quella specifica opzione e' sbagliata. */
  wrongOptions: Partial<Record<OptionKey, string>>;
  testTrap?: string;
  memoryAnchor?: string;
  linkedReview?: string;
}

export interface Question {
  id: string;
  subject: SubjectId;
  chapter: string;
  topic: string;
  difficulty: Difficulty;
  question: string;
  options: QuestionOptions;
  correctOption: OptionKey;
  explanation: string;
  explanationDetails: ExplanationDetails;

  // Metadati di provenienza / qualita' (sez. 19).
  sourceType: "original";
  originalityStatus: "original";
  protectedSourceRisk: boolean;
  productionEligible: boolean;
}
