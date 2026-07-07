import type { OptionKey } from "@/lib/domain/question";
import type { SubjectId } from "@/lib/domain/taxonomy";
import { readStorage, writeStorage } from "./safeStorage";

/**
 * Stato locale dello studente: errori da ripassare, domande salvate e sessioni
 * completate. E' l'unica fonte di verita' lato utente e viene serializzata in
 * localStorage tramite safeStorage (envelope versionato).
 *
 * Le pagine leggono/scrivono solo attraverso le funzioni esportate qui, cosi'
 * la forma dello stato resta un dettaglio interno.
 */

export interface ErrorEntry {
  questionId: string;
  subject: SubjectId;
  chapter: string;
  selected: OptionKey;
  timesWrong: number;
  lastWrongAt: number; // epoch ms
  resolved: boolean;
}

export interface SavedEntry {
  questionId: string;
  savedAt: number;
}

export interface SessionRecord {
  id: string;
  subject: SubjectId | "mixed";
  total: number;
  correctCount: number;
  accuracy: number;
  completedAt: number;
}

const ERRORS_KEY = "errors";
const SAVED_KEY = "saved";
const SESSIONS_KEY = "sessions";

// ---- Errori -------------------------------------------------------------

export function getErrors(): ErrorEntry[] {
  return readStorage<ErrorEntry[]>(ERRORS_KEY, []);
}

/**
 * Registra un errore. Se la domanda era gia' tra gli errori, aggiorna contatore
 * e timestamp invece di duplicare (sez. 10).
 */
export function recordError(entry: {
  questionId: string;
  subject: SubjectId;
  chapter: string;
  selected: OptionKey;
}): ErrorEntry[] {
  const errors = getErrors();
  const existing = errors.find((e) => e.questionId === entry.questionId);
  if (existing) {
    existing.timesWrong += 1;
    existing.lastWrongAt = Date.now();
    existing.selected = entry.selected;
    existing.resolved = false;
  } else {
    errors.push({
      ...entry,
      timesWrong: 1,
      lastWrongAt: Date.now(),
      resolved: false,
    });
  }
  writeStorage(ERRORS_KEY, errors);
  return errors;
}

export function setErrorResolved(questionId: string, resolved: boolean): ErrorEntry[] {
  const errors = getErrors();
  const entry = errors.find((e) => e.questionId === questionId);
  if (entry) entry.resolved = resolved;
  writeStorage(ERRORS_KEY, errors);
  return errors;
}

// ---- Salvate ------------------------------------------------------------

export function getSaved(): SavedEntry[] {
  return readStorage<SavedEntry[]>(SAVED_KEY, []);
}

export function isSaved(questionId: string): boolean {
  return getSaved().some((s) => s.questionId === questionId);
}

/** Aggiunge o rimuove una domanda dalle salvate. Restituisce il nuovo stato. */
export function toggleSaved(questionId: string): SavedEntry[] {
  const saved = getSaved();
  const idx = saved.findIndex((s) => s.questionId === questionId);
  if (idx >= 0) {
    saved.splice(idx, 1);
  } else {
    saved.push({ questionId, savedAt: Date.now() });
  }
  writeStorage(SAVED_KEY, saved);
  return saved;
}

// ---- Sessioni -----------------------------------------------------------

export function getSessions(): SessionRecord[] {
  return readStorage<SessionRecord[]>(SESSIONS_KEY, []);
}

export function recordSession(record: Omit<SessionRecord, "id" | "completedAt">): SessionRecord[] {
  const sessions = getSessions();
  sessions.push({
    ...record,
    id: `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    completedAt: Date.now(),
  });
  writeStorage(SESSIONS_KEY, sessions);
  return sessions;
}
