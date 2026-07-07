import type { Question } from "@/lib/domain/question";
import type { SubjectId } from "@/lib/domain/taxonomy";
import type { QuestionRepository } from "./repository";
import { seedQuestions } from "./seed";

/**
 * Repository usato dal client: carica la banca domande dal database tramite la
 * route API `/api/questions`, la memorizza in cache e ne deriva filtri/conteggi.
 *
 * Local-first e resiliente: se la fetch fallisce (offline, build statica senza
 * server) ricade sui moduli seed inclusi nel bundle, cosi' l'app funziona
 * comunque. Quando l'app sara' online, i dati arriveranno dal database remoto
 * senza modifiche a UI o quiz engine.
 */
export class ApiQuestionRepository implements QuestionRepository {
  private cache: Question[] | null = null;
  private inflight: Promise<Question[]> | null = null;

  async getAll(): Promise<Question[]> {
    if (this.cache) return this.cache;
    if (this.inflight) return this.inflight;

    this.inflight = this.load();
    try {
      this.cache = await this.inflight;
      return this.cache;
    } finally {
      this.inflight = null;
    }
  }

  private async load(): Promise<Question[]> {
    try {
      const res = await fetch("/api/questions");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { questions?: Question[] };
      if (!data.questions || data.questions.length === 0) {
        return seedQuestions;
      }
      return data.questions;
    } catch {
      // Fallback offline: banca inclusa nel bundle.
      return seedQuestions;
    }
  }

  async getBySubject(subject: SubjectId): Promise<Question[]> {
    const all = await this.getAll();
    return all.filter((q) => q.subject === subject);
  }

  async getById(id: string): Promise<Question | undefined> {
    const all = await this.getAll();
    return all.find((q) => q.id === id);
  }

  async countBySubject(): Promise<Record<SubjectId, number>> {
    const all = await this.getAll();
    const counts = {
      reading_knowledge: 0,
      logic: 0,
      biology: 0,
      chemistry: 0,
      math: 0,
      physics: 0,
    } as Record<SubjectId, number>;
    for (const q of all) counts[q.subject] += 1;
    return counts;
  }
}
