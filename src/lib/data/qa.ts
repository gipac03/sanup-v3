import { OPTION_KEYS, type Question } from "@/lib/domain/question";
import { isValidChapter } from "@/lib/domain/taxonomy";

/**
 * Question Quality Firewall (progetto_completo_sanup_v2.txt, sez. 20-24, 28).
 *
 * Controlli automatici sulla banca domande. Ogni funzione restituisce la lista
 * di problemi trovati (stringa vuota = tutto ok). Usato dai test di regressione
 * e, in prospettiva, dal QA report.
 */

const PLACEHOLDER_PATTERNS = [
  /risultato matematico [a-e]/i,
  /dettaglio corretto \d/i,
  /conclusione (compatibile|troppo forte) \d/i,
  /procedimento richiesto/i,
  /lorem ipsum/i,
  /placeholder/i,
];

export interface QaIssue {
  questionId: string;
  problem: string;
}

export function validateQuestion(q: Question): string[] {
  const problems: string[] = [];

  // Tassonomia: chapter deve appartenere alla materia (DM 806).
  if (!isValidChapter(q.subject, q.chapter)) {
    problems.push(`chapter "${q.chapter}" non valido per materia ${q.subject}`);
  }

  // Testo domanda non banale.
  if (q.question.trim().length < 15) {
    problems.push("testo domanda troppo corto");
  }

  // Tutte e 5 le opzioni presenti e non vuote.
  for (const key of OPTION_KEYS) {
    const opt = q.options[key];
    if (!opt || opt.trim().length === 0) {
      problems.push(`opzione ${key} vuota`);
    }
  }

  // Opzione corretta valida.
  if (!OPTION_KEYS.includes(q.correctOption)) {
    problems.push(`correctOption "${q.correctOption}" non valida`);
  }

  // Opzioni non duplicate tra loro (niente opzioni finte identiche).
  const values = OPTION_KEYS.map((k) => q.options[k].trim().toLowerCase());
  if (new Set(values).size !== values.length) {
    problems.push("opzioni duplicate tra loro");
  }

  // whyCorrect presente.
  if (!q.explanationDetails.whyCorrect?.trim()) {
    problems.push("whyCorrect mancante");
  }

  // wrongOptions: deve spiegare OGNI opzione errata (sez. 21).
  for (const key of OPTION_KEYS) {
    if (key === q.correctOption) continue;
    const reason = q.explanationDetails.wrongOptions[key];
    if (!reason || reason.trim().length < 10) {
      problems.push(`wrongOptions manca o troppo generica per l'opzione ${key}`);
    }
  }

  // Nessun pattern da placeholder in domanda/opzioni/spiegazioni.
  const haystack = [
    q.question,
    ...OPTION_KEYS.map((k) => q.options[k]),
    q.explanation,
    q.explanationDetails.whyCorrect,
    ...Object.values(q.explanationDetails.wrongOptions),
  ].join(" \n ");
  for (const pattern of PLACEHOLDER_PATTERNS) {
    if (pattern.test(haystack)) {
      problems.push(`pattern vietato rilevato: ${pattern}`);
    }
  }

  // Metadati di originalita' coerenti.
  if (q.protectedSourceRisk) {
    problems.push("protectedSourceRisk deve essere false");
  }
  if (!q.productionEligible) {
    problems.push("productionEligible deve essere true");
  }

  return problems;
}

/** Normalizza un testo per confronto di quasi-duplicati. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function findDuplicateIds(questions: Question[]): string[] {
  const seen = new Set<string>();
  const dups: string[] = [];
  for (const q of questions) {
    if (seen.has(q.id)) dups.push(q.id);
    seen.add(q.id);
  }
  return dups;
}

export function findDuplicateQuestions(questions: Question[]): [string, string][] {
  const dups: [string, string][] = [];
  for (let i = 0; i < questions.length; i++) {
    for (let j = i + 1; j < questions.length; j++) {
      if (normalize(questions[i].question) === normalize(questions[j].question)) {
        dups.push([questions[i].id, questions[j].id]);
      }
    }
  }
  return dups;
}

export function runQa(questions: Question[]): QaIssue[] {
  const issues: QaIssue[] = [];
  for (const q of questions) {
    for (const problem of validateQuestion(q)) {
      issues.push({ questionId: q.id, problem });
    }
  }
  for (const id of findDuplicateIds(questions)) {
    issues.push({ questionId: id, problem: "id duplicato" });
  }
  for (const [a, b] of findDuplicateQuestions(questions)) {
    issues.push({ questionId: `${a}/${b}`, problem: "domanda duplicata" });
  }
  return issues;
}
