import type { Question } from "@/lib/domain/question";
import type { QuestionRepository } from "@/lib/data/repository";
import { SUBJECTS, type SubjectId } from "@/lib/domain/taxonomy";
import { shuffle } from "./engine";

/**
 * Profilo della simulazione esame (sez. 9 + distribuzione sez. 26).
 *
 * I numeri sono proporzionali alla distribuzione target della banca e sono
 * configurabili in un unico punto. Se la banca non ha ancora abbastanza domande
 * di una materia, `buildExam` prende quante ne trova (cap automatico), cosi' la
 * simulazione funziona gia' adesso e si arricchisce da sola quando la banca
 * cresce.
 */
export interface ExamProfile {
  label: string;
  /** Durata in secondi. */
  durationSeconds: number;
  /** Numero di domande desiderato per materia. */
  perSubject: Record<SubjectId, number>;
}

export const EXAM_PROFILE: ExamProfile = {
  label: "Simulazione Professioni Sanitarie",
  durationSeconds: 50 * 60,
  perSubject: {
    biology: 15,
    chemistry: 11,
    logic: 9,
    reading_knowledge: 6,
    physics: 4,
    math: 5,
  },
};

export function examTargetTotal(profile: ExamProfile = EXAM_PROFILE): number {
  return SUBJECTS.reduce((sum, s) => sum + (profile.perSubject[s.id] ?? 0), 0);
}

/**
 * Compone l'elenco domande della simulazione: per ogni materia estrae fino al
 * numero previsto dal profilo, poi mescola l'ordine complessivo.
 */
export async function buildExam(
  repo: QuestionRepository,
  profile: ExamProfile = EXAM_PROFILE,
): Promise<Question[]> {
  const picked: Question[] = [];
  for (const subject of SUBJECTS) {
    const want = profile.perSubject[subject.id] ?? 0;
    if (want <= 0) continue;
    const pool = await repo.getBySubject(subject.id);
    picked.push(...shuffle(pool).slice(0, want));
  }
  return shuffle(picked);
}

/**
 * Quiz misto (sez. 8): stessa distribuzione dell'esame ma senza timer e con un
 * numero totale scelto dallo studente. Mantiene le proporzioni tra materie.
 */
export async function buildMixed(
  repo: QuestionRepository,
  total: number,
): Promise<Question[]> {
  const target = examTargetTotal();
  const picked: Question[] = [];
  for (const subject of SUBJECTS) {
    const want = EXAM_PROFILE.perSubject[subject.id] ?? 0;
    if (want <= 0) continue;
    const share = Math.max(1, Math.round((want / target) * total));
    const pool = await repo.getBySubject(subject.id);
    picked.push(...shuffle(pool).slice(0, share));
  }
  return shuffle(picked).slice(0, total);
}
