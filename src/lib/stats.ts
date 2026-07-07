import { SUBJECTS, type SubjectId } from "@/lib/domain/taxonomy";
import {
  getErrors,
  getSaved,
  getSessions,
  type SessionRecord,
} from "@/lib/storage/progressStore";

export interface OverviewStats {
  totalSessions: number;
  overallAccuracy: number | null; // 0..1, null se nessuna sessione
  openErrors: number;
  savedCount: number;
  weakestSubject: SubjectId | null;
  strongestSubject: SubjectId | null;
  lastSession: SessionRecord | null;
}

/** Aggrega lo stato locale in metriche pronte per Home e Progressi. */
export function computeOverview(): OverviewStats {
  const sessions = getSessions();
  const errors = getErrors();
  const saved = getSaved();

  const openErrors = errors.filter((e) => !e.resolved).length;

  const overallAccuracy =
    sessions.length === 0
      ? null
      : sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length;

  // Materia forte/debole: dagli errori aperti per materia.
  const errorsBySubject = new Map<SubjectId, number>();
  for (const e of errors) {
    if (e.resolved) continue;
    errorsBySubject.set(e.subject, (errorsBySubject.get(e.subject) ?? 0) + 1);
  }

  let weakestSubject: SubjectId | null = null;
  let strongestSubject: SubjectId | null = null;
  if (errorsBySubject.size > 0) {
    let maxErrors = -1;
    let minErrors = Infinity;
    for (const s of SUBJECTS) {
      const count = errorsBySubject.get(s.id) ?? 0;
      if (count > maxErrors) {
        maxErrors = count;
        weakestSubject = s.id;
      }
    }
    // La materia piu' forte tra quelle praticate (meno errori, > 0 praticata).
    for (const [subject, count] of errorsBySubject) {
      if (count < minErrors) {
        minErrors = count;
        strongestSubject = subject;
      }
    }
  }

  return {
    totalSessions: sessions.length,
    overallAccuracy,
    openErrors,
    savedCount: saved.length,
    weakestSubject,
    strongestSubject,
    lastSession: sessions.length > 0 ? sessions[sessions.length - 1] : null,
  };
}
