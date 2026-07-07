import type { OptionKey, Question } from "@/lib/domain/question";

/** Numero di domande selezionabile in un quiz per materia (sez. 7). */
export type QuestionCount = 5 | 10 | 15 | 20 | "all";

export interface QuizConfig {
  count: QuestionCount;
}

export interface QuizAnswer {
  questionId: string;
  selected: OptionKey;
  correct: boolean;
}

export interface QuizResult {
  total: number;
  correctCount: number;
  accuracy: number; // 0..1
  answers: QuizAnswer[];
}

/** Mescola una copia dell'array (Fisher-Yates). Non muta l'input. */
export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Costruisce l'elenco di domande di un quiz a partire da un pool gia' filtrato
 * per materia. Estrae in ordine casuale il numero richiesto (o tutte).
 */
export function buildQuiz(pool: Question[], config: QuizConfig): Question[] {
  const shuffled = shuffle(pool);
  if (config.count === "all") return shuffled;
  return shuffled.slice(0, Math.min(config.count, shuffled.length));
}

export function isCorrect(question: Question, selected: OptionKey): boolean {
  return question.correctOption === selected;
}

export function scoreQuiz(answers: QuizAnswer[]): QuizResult {
  const total = answers.length;
  const correctCount = answers.filter((a) => a.correct).length;
  return {
    total,
    correctCount,
    accuracy: total === 0 ? 0 : correctCount / total,
    answers,
  };
}
