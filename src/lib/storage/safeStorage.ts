/**
 * Accesso difensivo a localStorage (progetto_completo_sanup_v2.txt, sez. 32).
 *
 * Requisiti:
 * - non crashare mai se localStorage manca (SSR), e' pieno o disabilitato;
 * - non crashare se il valore salvato e' corrotto o di uno schema vecchio;
 * - restituire un fallback elegante invece di lanciare eccezioni.
 *
 * Ogni record salvato include una versione di schema, cosi' in futuro potremo
 * migrare i dati senza rompere quelli esistenti.
 */

const NAMESPACE = "sanup";

export const STORAGE_SCHEMA_VERSION = 1;

interface StoredEnvelope<T> {
  v: number;
  data: T;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function fullKey(key: string): string {
  return `${NAMESPACE}:${key}`;
}

export function readStorage<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(fullKey(key));
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw) as StoredEnvelope<T>;
    if (
      parsed === null ||
      typeof parsed !== "object" ||
      typeof parsed.v !== "number" ||
      !("data" in parsed)
    ) {
      // Formato inatteso o schema vecchio senza envelope: fallback sicuro.
      return fallback;
    }
    return parsed.data;
  } catch {
    // JSON corrotto o accesso negato: non crashare, usa il fallback.
    return fallback;
  }
}

export function writeStorage<T>(key: string, data: T): boolean {
  if (!isBrowser()) return false;
  try {
    const envelope: StoredEnvelope<T> = { v: STORAGE_SCHEMA_VERSION, data };
    window.localStorage.setItem(fullKey(key), JSON.stringify(envelope));
    return true;
  } catch {
    // Quota superata o storage non disponibile: fallisce in silenzio.
    return false;
  }
}

export function removeStorage(key: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(fullKey(key));
  } catch {
    // ignora
  }
}
