import type {
  ExplanationDetails,
  OptionKey,
  Question,
  QuestionOptions,
} from "@/lib/domain/question";
import type { SubjectId } from "@/lib/domain/taxonomy";

/**
 * Conversione tra una domanda (oggetto Question) e la sua riga nel database.
 * Tenuta in un solo punto cosi' che schema e dominio restino allineati.
 */

export interface QuestionRow {
  id: string;
  subject: string;
  chapter: string;
  topic: string;
  difficulty: string;
  question: string;
  options: string; // JSON
  correct_option: string;
  explanation: string;
  explanation_details: string; // JSON
  source_type: string;
  originality_status: string;
  protected_source_risk: number;
  production_eligible: number;
}

export function questionToRow(q: Question): QuestionRow {
  return {
    id: q.id,
    subject: q.subject,
    chapter: q.chapter,
    topic: q.topic,
    difficulty: q.difficulty,
    question: q.question,
    options: JSON.stringify(q.options),
    correct_option: q.correctOption,
    explanation: q.explanation,
    explanation_details: JSON.stringify(q.explanationDetails),
    source_type: q.sourceType,
    originality_status: q.originalityStatus,
    protected_source_risk: q.protectedSourceRisk ? 1 : 0,
    production_eligible: q.productionEligible ? 1 : 0,
  };
}

export function rowToQuestion(row: QuestionRow): Question {
  return {
    id: row.id,
    subject: row.subject as SubjectId,
    chapter: row.chapter,
    topic: row.topic,
    difficulty: row.difficulty as Question["difficulty"],
    question: row.question,
    options: JSON.parse(row.options) as QuestionOptions,
    correctOption: row.correct_option as OptionKey,
    explanation: row.explanation,
    explanationDetails: JSON.parse(row.explanation_details) as ExplanationDetails,
    sourceType: "original",
    originalityStatus: "original",
    protectedSourceRisk: row.protected_source_risk === 1,
    productionEligible: row.production_eligible === 1,
  };
}
